import { Result } from "../result";
import {
  CompleteOrderFieldsIncorrectError,
  OrderFieldsIncorrectError,
  OrderNotFoundError,
  UserActiveOrdersNotFoundError,
  UserCompletedOrdersNotFoundError,
  UserOrdersNotFountError,
} from "../errors";
import UserStore, { User } from "./user";
import { QueryResult } from "pg";
import pgPool from "../database";
import OrderProductStore, { OrderProduct } from "./order-product";

export enum OrderStatus {
  Active = "active",
  Completed = "completed",
}

export type CompleteOrder = {
  id?: number;
  productIds: number[];
  productQuantities: number[];
  userId: string;
  status: OrderStatus;
};

export type Order = {
  id?: number;
  user_id: string;
  completed: boolean;
};

class OrderStore {
  static async createCompleteOrder(
    completeOrder: CompleteOrder
  ): Promise<Result<CompleteOrder>> {
    if (!OrderStore.isCompleteOrder(completeOrder))
      return { ok: false, data: CompleteOrderFieldsIncorrectError };

    const { userId, status, productIds, productQuantities } = completeOrder;

    const order: Order = {
      user_id: userId,
      completed: status === OrderStatus.Completed,
    };
    const orderCreateResult: Result<Order> = await OrderStore.create(order);
    if (!orderCreateResult.ok) return orderCreateResult;
    const createdOrder: Order = orderCreateResult.data;

    const createdOrderProducts: OrderProduct[] = [];
    for (let i = 0; i < productIds.length; i++) {
      const orderProduct: OrderProduct = {
        order_id: createdOrder.id as number,
        product_id: productIds[i],
        quantity: productQuantities[i],
      };
      const orderProductCreateResult: Result<OrderProduct> =
        await OrderProductStore.create(orderProduct);
      if (!orderProductCreateResult.ok) {
        await OrderStore.delete(createdOrder.id as number);
        return orderProductCreateResult;
      }
      const createdOrderProduct: OrderProduct = orderProductCreateResult.data;
      createdOrderProducts.push(createdOrderProduct);
    }

    const createdCompletedOrder: CompleteOrder =
      OrderStore.convertToCompleteOrder(createdOrder, createdOrderProducts);
    return { ok: true, data: createdCompletedOrder };
  }

  static async showCompleteOrder(
    orderId: number
  ): Promise<Result<CompleteOrder>> {
    const showResult: Result<Order> = await OrderStore.show(orderId);
    if (!showResult.ok) return showResult;
    const order: Order = showResult.data;

    const orderProductsShowResult: Result<OrderProduct[]> =
      await OrderProductStore.show(order.id as number);
    if (!orderProductsShowResult.ok) return orderProductsShowResult;
    const orderProducts: OrderProduct[] = orderProductsShowResult.data;

    const completeOrder: CompleteOrder = OrderStore.convertToCompleteOrder(
      order,
      orderProducts
    );
    return { ok: true, data: completeOrder };
  }

  static async showUserCompleteOrders(
    userId: string,
    status?: OrderStatus
  ): Promise<Result<CompleteOrder[]>> {
    const userShowResult: Result<User> = await UserStore.show(userId);
    if (!userShowResult.ok) return userShowResult;

    const sql = OrderStore.isOrderStatus(status)
      ? "select * from orders where user_id = $1 and completed = $2"
      : "select * from orders where user_id = $1";
    const queryValues = OrderStore.isOrderStatus(status)
      ? [userId, status === OrderStatus.Completed]
      : [userId];

    const userOrdersQueryResult: QueryResult<Order> = await pgPool.query(
      sql,
      queryValues
    );
    const userOrders: Order[] = userOrdersQueryResult.rows;
    if (userOrders.length === 0) {
      if (status === OrderStatus.Active) {
        return { ok: false, data: UserActiveOrdersNotFoundError };
      } else if (status === OrderStatus.Completed) {
        return { ok: false, data: UserCompletedOrdersNotFoundError };
      } else {
        return { ok: false, data: UserOrdersNotFountError };
      }
    }

    const userCompleteOrders: CompleteOrder[] = [];
    for (const order of userOrders) {
      const showCompleteOrderResult: Result<CompleteOrder> =
        await OrderStore.showCompleteOrder(order.id as number);
      if (!showCompleteOrderResult.ok) return showCompleteOrderResult;
      const completeOrder: CompleteOrder = showCompleteOrderResult.data;
      userCompleteOrders.push(completeOrder);
    }

    return { ok: true, data: userCompleteOrders };
  }

  static async create(order: Order): Promise<Result<Order>> {
    const validateOrderResult: Result<Order> = await OrderStore.validateOrder(
      order
    );
    if (!validateOrderResult.ok) return validateOrderResult;

    const validOrder: Order = validateOrderResult.data;
    const { user_id, completed } = validOrder;

    const queryResult: QueryResult<Order> = await pgPool.query(
      `insert into orders (user_id, completed)
       values ($1, $2)
       returning *`,
      [user_id, completed]
    );
    const createdOrder: Order = queryResult.rows[0];

    return { ok: true, data: createdOrder };
  }

  static async show(orderId: number): Promise<Result<Order>> {
    const queryResult: QueryResult<Order> = await pgPool.query(
      `select *
       from orders
       where id = $1`,
      [orderId]
    );

    const foundOrder: Order | undefined = queryResult.rows[0];
    if (!foundOrder) return { ok: false, data: OrderNotFoundError };

    return { ok: true, data: foundOrder };
  }

  static async delete(orderId: number): Promise<Result<Order>> {
    const showResult: Result<Order> = await OrderStore.show(orderId);
    if (!showResult.ok) return showResult;

    const queryResult: QueryResult<Order> = await pgPool.query(
      `delete
       from orders
       where id = $1
       returning *`,
      [orderId]
    );

    const deletedOrder: Order = queryResult.rows[0];
    return { ok: true, data: deletedOrder };
  }

  private static async validateOrder(
    order: Order | unknown
  ): Promise<Result<Order>> {
    if (!OrderStore.isOrder(order)) {
      return { ok: false, data: OrderFieldsIncorrectError };
    }

    const userShowResult: Result<User> = await UserStore.show(order.user_id);
    if (!userShowResult.ok) return userShowResult;

    return { ok: true, data: order };
  }

  private static isOrder(object: unknown): object is Order {
    const id: unknown = (object as Order).id;
    const user_id: unknown = (object as Order).user_id;
    const completed: unknown = (object as Order).completed;

    if (id !== undefined && typeof id !== "number") return false;
    if (typeof user_id !== "string" || user_id === "") return false;
    return !(typeof completed !== "boolean");
  }

  private static isCompleteOrder(object: unknown): object is CompleteOrder {
    const id: unknown = (object as CompleteOrder).id;
    const productIds: unknown = (object as CompleteOrder).productIds;
    const productQuantities: unknown = (object as CompleteOrder)
      .productQuantities;
    const userId: unknown = (object as CompleteOrder).userId;
    const status: unknown = (object as CompleteOrder).status;

    if (id !== undefined && typeof id !== "number") return false;

    if (!Array.isArray(productIds)) return false;
    if (!Array.isArray(productQuantities)) return false;
    if (productIds.length !== productQuantities.length) return false;
    if (productIds.length < 1) return false;
    for (let i = 0; i < productIds.length; i++) {
      if (typeof productIds[i] !== "number") return false;
      if (typeof productQuantities[i] !== "number" || productQuantities[i] < 1)
        return false;
    }

    if (typeof userId !== "string" || userId === "") return false;
    return status === OrderStatus.Active || status === OrderStatus.Completed;
  }

  private static isOrderStatus(object: unknown): object is OrderStatus {
    return object === OrderStatus.Active || object === OrderStatus.Completed;
  }

  private static convertToCompleteOrder(
    order: Order,
    orderProducts: OrderProduct[]
  ): CompleteOrder {
    const { id, user_id: userId, completed } = order;

    const productIds: number[] = [];
    const productQuantities: number[] = [];
    for (const { product_id, quantity } of orderProducts) {
      productIds.push(product_id);
      productQuantities.push(quantity);
    }

    const status: OrderStatus = completed
      ? OrderStatus.Completed
      : OrderStatus.Active;

    return { id, productIds, productQuantities, userId, status };
  }
}

export default OrderStore;
