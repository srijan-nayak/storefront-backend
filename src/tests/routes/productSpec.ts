import request, { Response } from "supertest";
import app from "../../index";
import { Product } from "../../models/product";
import {
  AuthorizationError,
  httpStatus,
  ProductFieldsIncorrectError,
  ProductNotFoundError,
} from "../../errors";
import { validToken } from "./userSpec";

describe("Product handler endpoint", (): void => {
  describe("GET /products", (): void => {
    it("should return a list of all products", async (): Promise<void> => {
      const response: Response = await request(app).get("/products");
      expect(response.status).toBe(200);
      const products: Product[] = response.body;
      expect(products.length).toBeGreaterThan(1);
      for (const product of products) {
        expect(typeof product.id).toBe("number");
        expect(typeof product.name).toBe("string");
        expect(typeof product.price).toBe("number");
        expect(typeof product.category).toBe("string");
      }
    });
  });

  describe("GET /products?category=<category>", (): void => {
    it("should return a list of products of given category", async (): Promise<void> => {
      const response: Response = await request(app)
        .get("/products")
        .query({ category: "Clothing" });
      expect(response.status).toBe(200);
      const products: Product[] = response.body;
      expect(products.length).toBeGreaterThan(1);
      for (const product of products) {
        expect(typeof product.id).toBe("number");
        expect(typeof product.name).toBe("string");
        expect(typeof product.price).toBe("number");
        expect(product.category).toBe("Clothing");
      }
    });
  });

  describe("GET /products?popular=true", (): void => {
    it("should return a list of 5 products", async (): Promise<void> => {
      const response: Response = await request(app)
        .get("/products")
        .query({ popular: true });
      expect(response.status).toBe(200);
      const products: Product[] = response.body;
      expect(products.length).toBe(5);
      for (const product of products) {
        expect(typeof product.id).toBe("number");
        expect(typeof product.name).toBe("string");
        expect(typeof product.price).toBe("number");
        expect(typeof product.category).toBe("string");
      }
    });
  });

  describe("GET /products/:productId", (): void => {
    it("should return details for existing product", async (): Promise<void> => {
      const response: Response = await request(app).get("/products/103");
      expect(response.status).toBe(200);
      const product: Product = response.body;
      expect(product.id).toBe(103);
      expect(product.name).toBe("Sleek Frozen Chair");
      expect(product.price).toBe(38.34);
      expect(product.category).toBe("Furniture");
    });

    it("should return error for non-existing product", async (): Promise<void> => {
      const response: Response = await request(app).get("/products/182");
      expect(response.status).toBe(httpStatus(ProductNotFoundError));
      expect(response.body).toBe(ProductNotFoundError.toString());
    });
  });

  describe("POST /products", (): void => {
    it("should return error without valid token", async (): Promise<void> => {
      const newProduct: Product = {
        name: "Fantastic Frozen Salad",
        price: 11.82,
        category: "Food",
      };
      const response: Response = await request(app)
        .post("/products")
        .send(newProduct);
      expect(response.status).toBe(httpStatus(AuthorizationError));
      expect(response.body).toBe(AuthorizationError.toString());
    });

    it("should return created product", async (): Promise<void> => {
      const newProduct: Product = {
        name: "Fantastic Frozen Salad",
        price: 11.82,
        category: "Food",
      };
      const response: Response = await request(app)
        .post("/products")
        .send(newProduct)
        .auth(validToken, { type: "bearer" });
      expect(response.status).toBe(200);
      const product: Product = response.body;
      expect(typeof product.id).toBe("number");
      expect(product.name).toBe(newProduct.name);
      expect(product.price).toBe(newProduct.price);
      expect(product.category).toBe(newProduct.category);
    });

    it("should return error for invalid product data", async (): Promise<void> => {
      const invalidProduct1: object = {
        price: 2321.32,
        category: "Furniture",
      };
      const response1: Response = await request(app)
        .post("/products")
        .send(invalidProduct1)
        .auth(validToken, { type: "bearer" });
      expect(response1.status).toBe(httpStatus(ProductFieldsIncorrectError));
      expect(response1.body).toBe(ProductFieldsIncorrectError.toString());

      const invalidProduct2: object = {
        name: "Invalid Product",
        price: -9382.21,
        category: "Invalid",
      };
      const response2: Response = await request(app)
        .post("/products")
        .send(invalidProduct2)
        .auth(validToken, { type: "bearer" });
      expect(response2.status).toBe(httpStatus(ProductFieldsIncorrectError));
      expect(response2.body).toBe(ProductFieldsIncorrectError.toString());
    });
  });
});
