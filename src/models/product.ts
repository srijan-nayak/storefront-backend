import { QueryResult } from "pg";
import pgPool from "../database";

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
}

export default ProductStore;
