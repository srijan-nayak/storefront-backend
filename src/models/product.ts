import { QueryResult } from "pg";
import pgPool from "../database";
import { Result } from "../result";
import { ProductFieldsIncorrectError, ProductNotFoundError } from "../errors";

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

  /**
   * Create and insert a new product into the database. Throws an error if a
   * product to be created has invalid fields.
   *
   * @param product new product to be created
   * @returns result object containing created product or an error
   */
  static async create(product: Product): Promise<Result<Product>> {
    if (!ProductStore.isValidProduct(product)) {
      return {
        ok: false,
        data: ProductFieldsIncorrectError,
      };
    }
    const { name, price, category } = product;
    const result: QueryResult<Product> = await pgPool.query(
      `insert into products (name, price, category)
       values ($1, $2, $3)
       returning id, name, price::numeric::double precision, category`,
      [name, price, category]
    );
    return { ok: true, data: result.rows[0] };
  }

  /**
   * Check if the given object has the shape of a product and fields are valid.
   *
   * @param object any object
   * @returns boolean value indicating if the given object is a valid product
   */
  private static isValidProduct(object: unknown): boolean {
    return (
      (object as Product).name !== undefined &&
      (object as Product).name !== "" &&
      (object as Product).price !== undefined &&
      (object as Product).price > 0 &&
      (object as Product).category !== undefined &&
      (object as Product).category !== ""
    );
  }
}

export default ProductStore;
