import { Result } from "../result";
import {
  OrderFieldsIncorrectError,
  OrderNotFoundError,
  UserOrdersNotFoundError,
} from "../errors";
import UserStore, { User } from "./user";
import { PoolClient, QueryResult } from "pg";
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

  private static async storeOrder(userId: string): Promise<StoredOrder> {
    const insertOrderQueryResult: QueryResult<StoredOrder> = await pgPool.query(
      `insert into orders (user_id, completed)
       values ($1, false)
       returning *`,
      [userId]
    );
    const storedOrder: StoredOrder = insertOrderQueryResult.rows[0];
    return storedOrder;
  }

  private static async storeOrderProducts(
    orderId: number,
    productIds: number[],
    productQuantities: number[]
  ): Promise<StoredOrderProduct[]> {
    const storedOrderProducts: StoredOrderProduct[] = [];

    const client: PoolClient = await pgPool.connect();
    for (let i = 0; i < productIds.length; i++) {
      const insertOrderProductQueryResult: QueryResult<StoredOrderProduct> =
        await client.query(
          `insert into order_products
           values ($1, $2, $3)
           returning *`,
          [orderId, productIds[i], productQuantities[i]]
        );
      const storedOrderProduct = insertOrderProductQueryResult.rows[0];
      storedOrderProducts.push(storedOrderProduct);
    }
    client.release();

    return storedOrderProducts;
  }

  private static convertToOrder(
    storedOrder: StoredOrder,
    storedOrderProducts: StoredOrderProduct[]
  ): Order {
    const { id, user_id: userId, completed: isCompleted } = storedOrder;

    const productIds: number[] = [];
    const productQuantities: number[] = [];
    for (const storedOrderProduct of storedOrderProducts) {
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
