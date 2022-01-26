import request, { Response } from "supertest";
import app from "../../index";
import { Product } from "../../models/product";

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
});
