import { Result } from "../result";
import ProductStore, { Product } from "./product";
import { OrderProductFieldsIncorrectError } from "../errors";
import { QueryResult } from "pg";
import pgPool from "../database";

export type OrderProduct = {
  order_id: number;
  product_id: number;
  quantity: number;
};

class OrderProductStore {
  static async create(
    orderProduct: OrderProduct
  ): Promise<Result<OrderProduct>> {
    const validateOrderProductResult: Result<OrderProduct> =
      await OrderProductStore.validateOrderProduct(orderProduct);
    if (!validateOrderProductResult.ok) return validateOrderProductResult;

    const validOrderProduct: OrderProduct = validateOrderProductResult.data;
    const { order_id, product_id, quantity } = validOrderProduct;

    const insertOrderProductQueryResult: QueryResult<OrderProduct> =
      await pgPool.query(
        `insert into order_products
         values ($1, $2, $3)
         returning *`,
        [order_id, product_id, quantity]
      );
    const createdOrderProduct: OrderProduct =
      insertOrderProductQueryResult.rows[0];

    return { ok: true, data: createdOrderProduct };
  }

  private static async validateOrderProduct(
    orderProduct: OrderProduct | unknown
  ): Promise<Result<OrderProduct>> {
    if (!OrderProductStore.isOrderProduct(orderProduct)) {
      return { ok: false, data: OrderProductFieldsIncorrectError };
    }

    const product_id: number = orderProduct.product_id;
    const productShowResult: Result<Product> = await ProductStore.show(
      product_id
    );

    if (!productShowResult.ok) return productShowResult;

    return { ok: true, data: orderProduct };
  }

  private static isOrderProduct(object: unknown): object is OrderProduct {
    const order_id: unknown = (object as OrderProduct).order_id;
    const product_id: unknown = (object as OrderProduct).product_id;
    const quantity: unknown = (object as OrderProduct).quantity;

    if (typeof order_id !== "number") return false;
    if (typeof product_id !== "number") return false;
    return !(typeof quantity !== "number" || quantity < 1);
  }
}

export default OrderProductStore;
