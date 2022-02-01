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

  static async create(product: Product): Promise<Result<Product>> {
    if (!ProductStore.isProduct(product))
      return { ok: false, data: ProductFieldsIncorrectError };

    const { name, price, category } = product;
    const queryResult: QueryResult<Product> = await pgPool.query(
      `insert into products (name, price, category)
       values ($1, $2, $3)
       returning id, name, price::numeric::double precision, category`,
      [name, price, category]
    );

    const createdProduct: Product = queryResult.rows[0];
    return { ok: true, data: createdProduct };
  }

  private static isProduct(object: unknown): object is Product {
    const id: unknown = (object as Product).id;
    const name: unknown = (object as Product).name;
    const price: unknown = (object as Product).price;
    const category: unknown = (object as Product).category;

    if (id !== undefined && typeof id !== "number") return false;
    if (typeof name !== "string" || name === "") return false;
    if (typeof price !== "number" || price < 1) return false;
    return !(typeof category !== "string" || category === "");
  }
}

export default ProductStore;
