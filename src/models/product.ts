import { QueryResult } from "pg";
import pgPool from "../database";
import { Result } from "../result";
import { ProductNotFoundError } from "../errors";

export type Product = {
  id?: number;
  name: string;
  price: number;
  category: string;
};

class ProductStore {
  /**
   * Gets a list of all products in the database.
   *
   * @returns list of all products in database
   */
  static async index(): Promise<Product[]> {
    const result: QueryResult<Product> = await pgPool.query(
      `select id, name, price::numeric::double precision, category
       from products`
    );
    return result.rows;
  }

  /**
   * Gets all product details for a given product id. Returns an error if
   * product with given ID doesn't exist.
   *
   * @param productId product ID of product whose details are to be shown
   * @returns result object containing either the product details or an error
   */
  static async show(productId: number): Promise<Result<Product>> {
    const result: QueryResult<Product> = await pgPool.query(
      `select id, name, price::numeric::double precision, category
       from products
       where id = $1`,
      [productId]
    );
    if (!result.rows[0]) {
      return { ok: false, data: ProductNotFoundError };
    }
    return { ok: true, data: result.rows[0] };
  }
}

export default ProductStore;
