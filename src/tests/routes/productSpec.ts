import request, { Response } from "supertest";
import app from "../../index";
import { Product } from "../../models/product";
import {
  AuthorizationError,
  ProductFieldsIncorrectError,
  ProductNotFoundError,
} from "../../errors";
import { validToken } from "./userSpec";

describe("Product handler endpoint", (): void => {
  describe("GET /product", (): void => {
    it("should return a list of all products", async (): Promise<void> => {
      const response: Response = await request(app).get("/product");
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

  describe("GET /product/:id", (): void => {
    it("should return details for existing product", async (): Promise<void> => {
      const response: Response = await request(app).get("/product/103");
      expect(response.status).toBe(200);
      const product: Product = response.body;
      expect(product.id).toBe(103);
      expect(product.name).toBe("Sleek Frozen Chair");
      expect(product.price).toBe(38.34);
      expect(product.category).toBe("Furniture");
    });

    it("should return error for non-existing product", async (): Promise<void> => {
      const response: Response = await request(app).get("/product/182");
      expect(response.status).toBe(404);
      expect(response.body).toBe(ProductNotFoundError.toString());
    });
  });

  describe("POST /product", (): void => {
    it("should return error without valid token", async (): Promise<void> => {
      const newProduct: Product = {
        name: "Fantastic Frozen Salad",
        price: 11.82,
        category: "Food",
      };
      const response: Response = await request(app)
        .post("/product")
        .send(newProduct);
      expect(response.status).toBe(401);
      expect(response.body).toBe(AuthorizationError.toString());
    });

    it("should return created product", async (): Promise<void> => {
      const newProduct: Product = {
        name: "Fantastic Frozen Salad",
        price: 11.82,
        category: "Food",
      };
      const response: Response = await request(app)
        .post("/product")
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
      const invalidProduct1: Product = {
        price: 2321.32,
        category: "Furniture",
      } as Product;
      const response1: Response = await request(app)
        .post("/product")
        .send(invalidProduct1)
        .auth(validToken, { type: "bearer" });
      expect(response1.status).toBe(422);
      expect(response1.body).toBe(ProductFieldsIncorrectError.toString());

      const invalidProduct2: Product = {
        name: "Invalid Product",
        price: -9382.21,
        category: "Invalid",
      };
      const response2: Response = await request(app)
        .post("/product")
        .send(invalidProduct2)
        .auth(validToken, { type: "bearer" });
      expect(response2.status).toBe(422);
      expect(response2.body).toBe(ProductFieldsIncorrectError.toString());
    });
  });
});
