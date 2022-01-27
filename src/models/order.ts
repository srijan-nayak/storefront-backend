import { Result } from "../result";
import { OrderFieldsIncorrectError } from "../errors";
import ProductStore, { Product } from "./product";
import UserStore, { User } from "./user";
import { PoolClient, QueryResult } from "pg";
import pgPool from "../database";

export type Order = {
  id?: number;
  productIds: number[];
  productQuantities: number[];
  userId: string;
  isCompleted?: boolean;
};

export type StoredOrder = {
  id: number;
  user_id: string;
  completed: boolean;
};

export type StoredOrderProduct = {
  order_id: number;
  product_id: number;
  quantity: number;
};

class OrderStore {
  static async create(order: unknown): Promise<Result<Order>> {
    if (!OrderStore.isValidOrder(order)) {
      return { ok: false, data: OrderFieldsIncorrectError };
    }

    const { productIds, productQuantities, userId } = order;

    for (const productId of productIds) {
      const productShowResult: Result<Product> = await ProductStore.show(
        productId
      );
      if (!productShowResult.ok)
        return { ok: false, data: productShowResult.data };
    }

    const userShowResult: Result<User> = await UserStore.show(userId);
    if (!userShowResult.ok) return { ok: false, data: userShowResult.data };

    const client: PoolClient = await pgPool.connect();
    const createOrderQueryResult: QueryResult<StoredOrder> = await client.query(
      `insert into orders (user_id, completed)
       values ($1, false)
       returning *`,
      [userId]
    );
    const createdStoredOrder: StoredOrder = createOrderQueryResult.rows[0];
    const createdStoredOrderProducts: StoredOrderProduct[] = [];
    for (let i = 0; i < productIds.length; i++) {
      const createOrderProductQueryResult: QueryResult<StoredOrderProduct> =
        await client.query(
          `insert into order_products
           values ($1, $2, $3)
           returning *`,
          [createdStoredOrder.id, productIds[i], productQuantities[i]]
        );
      createdStoredOrderProducts.push(createOrderProductQueryResult.rows[0]);
    }
    client.release();

    const createdOrder: Order = OrderStore.convertToOrder(
      createdStoredOrder,
      createdStoredOrderProducts
    );
    return { ok: true, data: createdOrder };
  }

  private static isValidOrder(object: unknown): object is Order {
    const id: unknown = (object as Order).id;
    const productIds: unknown[] = (object as Order).productIds;
    const productQuantities: unknown[] = (object as Order).productQuantities;
    const userId: unknown = (object as Order).userId;
    const isCompleted: unknown = (object as Order).isCompleted;

    if (id !== undefined && typeof id !== "number") return false;
    if (isCompleted !== undefined && typeof isCompleted !== "boolean")
      return false;

    if (
      !Array.isArray(productIds) ||
      !Array.isArray(productQuantities) ||
      userId === undefined
    )
      return false;

    for (const productId of productIds)
      if (typeof productId !== "number") return false;
    for (const productQuantity of productQuantities)
      if (typeof productQuantity !== "number" || productQuantity < 0)
        return false;

    if (productIds.length !== productQuantities.length) return false;

    return !(typeof userId !== "string" || userId === "");
  }

  private static convertToOrder(
    storedOrder: StoredOrder,
    storedOrderProducts: StoredOrderProduct[]
  ): Order {
    return {
      id: storedOrder.id,
      productIds: storedOrderProducts.map(
        (storedOrderProduct: StoredOrderProduct): number =>
          storedOrderProduct.product_id
      ),
      productQuantities: storedOrderProducts.map(
        (storedOrderProduct: StoredOrderProduct): number =>
          storedOrderProduct.quantity
      ),
      userId: storedOrder.user_id,
      isCompleted: storedOrder.completed,
    };
  }
}

export default OrderStore;
