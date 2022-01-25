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
  static async index(): Promise<Product[]> {
    const queryResult: QueryResult<Product> = await pgPool.query(
      `select id, name, price::numeric::double precision, category
       from products`
    );
    const products: Product[] = queryResult.rows;
    return products;
  }

  static async show(productId: number): Promise<Result<Product>> {
    const queryResult: QueryResult<Product> = await pgPool.query(
      `select id, name, price::numeric::double precision, category
       from products
       where id = $1`,
      [productId]
    );

    const foundProduct = queryResult.rows[0];
    if (!foundProduct) {
      return { ok: false, data: ProductNotFoundError };
    }

    return { ok: true, data: foundProduct };
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
