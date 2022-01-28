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
  static async create(order: Order): Promise<Result<Order>> {
    const validateOrderResult: Result<Order> = await OrderStore.validateOrder(
      order
    );

    if (!validateOrderResult.ok) return validateOrderResult;

    const validOrder: Order = validateOrderResult.data;

    const storedOrder: StoredOrder = await OrderStore.storeOrder(
      validOrder.userId
    );
    const storedOrderProducts: StoredOrderProduct[] =
      await OrderStore.storeOrderProducts(
        storedOrder.id,
        validOrder.productIds,
        validOrder.productQuantities
      );

    const createdOrder: Order = OrderStore.convertToOrder(
      storedOrder,
      storedOrderProducts
    );
    return { ok: true, data: createdOrder };
  }

  private static async validateOrder(
    order: Order | unknown
  ): Promise<Result<Order>> {
    if (!OrderStore.isOrder(order)) {
      return { ok: false, data: OrderFieldsIncorrectError };
    }

    const { productIds, userId } = order;

    for (const productId of productIds) {
      const productShowResult: Result<Product> = await ProductStore.show(
        productId
      );
      if (!productShowResult.ok) return productShowResult;
    }

    const userShowResult: Result<User> = await UserStore.show(userId);
    if (!userShowResult.ok) return userShowResult;

    return { ok: true, data: order };
  }

  private static isOrder(object: unknown): object is Order {
    const id: unknown = (object as Order).id;
    const productIds: unknown = (object as Order).productIds;
    const productQuantities: unknown = (object as Order).productQuantities;
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
      storedOrderProducts.push(insertOrderProductQueryResult.rows[0]);
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
}

export default OrderStore;
