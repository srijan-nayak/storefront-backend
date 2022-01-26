import request, { Response } from "supertest";
import app from "../../index";
import { Product } from "../../models/product";
import { ProductNotFoundError } from "../../errors";

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
});
