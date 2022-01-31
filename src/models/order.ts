import { Result } from "../result";
import {
  CompleteOrderIncorrectFieldsError,
  OrderFieldsIncorrectError,
  OrderNotFoundError,
  UserOrdersNotFoundError,
} from "../errors";
import UserStore, { User } from "./user";
import { QueryResult } from "pg";
import pgPool from "../database";
import OrderProductStore, { OrderProduct } from "./order-product";

export type CompleteOrder = {
  id?: number;
  productIds: number[];
  productQuantities: number[];
  userId: string;
  isCompleted: boolean;
};

export type Order = {
  id?: number;
  user_id: string;
  completed: boolean;
};

class OrderStore {
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

  static async createCompleteOrder(
    completeOrder: CompleteOrder
  ): Promise<Result<CompleteOrder>> {
    if (!OrderStore.isCompleteOrder(completeOrder))
      return { ok: false, data: CompleteOrderIncorrectFieldsError };

    const { userId, isCompleted, productIds, productQuantities } =
      completeOrder;

    const order: Order = { user_id: userId, completed: isCompleted };
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

  static async showUserOrders(userId: string): Promise<Result<Order[]>> {
    const userStoredOrdersGetResult: Result<StoredOrder[]> =
      await OrderStore.getUserStoredOrders(userId);
    if (!userStoredOrdersGetResult.ok) return userStoredOrdersGetResult;
    const storedOrders: StoredOrder[] = userStoredOrdersGetResult.data;

    const orders: Order[] = await OrderStore.getUserOrders(storedOrders);

    return { ok: true, data: orders };
  }

  static async show(orderId: number): Promise<Result<Order>> {
    const queryResult: QueryResult<Order> = await pgPool.query(
      `select *
       from orders
       where id = $1`,
      [orderId]
    );

    const foundOrder: Order = queryResult.rows[0];
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

    const userId: string = order.user_id;
    const userShowResult: Result<User> = await UserStore.show(userId);
    if (!userShowResult.ok) return userShowResult;

    return { ok: true, data: order };
  }

  private static isOrder(object: unknown): object is Order {
    const id: unknown = (object as Order).id;
    const user_id: unknown = (object as Order).user_id;
    const completed: unknown = (object as Order).completed;

    if (id !== undefined && typeof id !== "number") return false;
    if (typeof user_id !== "string") return false;
    return typeof completed === "boolean";
  }

  private static isCompleteOrder(object: unknown): object is CompleteOrder {
    const id: unknown = (object as CompleteOrder).id;
    const productIds: unknown = (object as CompleteOrder).productIds;
    const productQuantities: unknown = (object as CompleteOrder)
      .productQuantities;
    const userId: unknown = (object as CompleteOrder).userId;
    const isCompleted: unknown = (object as CompleteOrder).isCompleted;

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

    if (typeof userId !== "string") return false;
    return typeof isCompleted === "boolean";
  }

  private static convertToCompleteOrder(
    order: Order,
    orderProducts: OrderProduct[]
  ): CompleteOrder {
    const { id, user_id: userId, completed: isCompleted } = order;

    const productIds: number[] = [];
    const productQuantities: number[] = [];
    for (const storedOrderProduct of orderProducts) {
      productIds.push(storedOrderProduct.product_id);
      productQuantities.push(storedOrderProduct.quantity);
    }

    return {
      id,
      productIds,
      productQuantities,
      userId,
      isCompleted,
    };
  }

  private static async getUserStoredOrders(
    userId: string
  ): Promise<Result<StoredOrder[]>> {
    const showUserResult: Result<User> = await UserStore.show(userId);
    if (!showUserResult.ok) return showUserResult;

    const selectOrdersQueryResult: QueryResult<StoredOrder> =
      await pgPool.query(
        `select *
         from orders
         where user_id = $1`,
        [userId]
      );
    if (selectOrdersQueryResult.rows.length === 0) {
      return { ok: false, data: UserOrdersNotFoundError };
    }

    const storedOrders: StoredOrder[] = selectOrdersQueryResult.rows;
    return { ok: true, data: storedOrders };
  }

  private static async getUserOrders(storedOrders: StoredOrder[]) {
    const orders: Order[] = [];

    for (const storedOrder of storedOrders) {
      const selectOrderProductsQueryResult: QueryResult<StoredOrderProduct> =
        await pgPool.query(
          `select *
           from order_products
           where order_id = $1`,
          [storedOrder.id]
        );
      const storedOrderProducts: StoredOrderProduct[] =
        selectOrderProductsQueryResult.rows;

      const order: Order = OrderStore.convertToOrder(
        storedOrder,
        storedOrderProducts
      );
      orders.push(order);
    }

    return orders;
  }
}

export default OrderStore;
