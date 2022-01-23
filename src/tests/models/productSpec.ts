import ProductStore, { Product } from "../../models/product";
import { Result } from "../../result";
import { ProductNotFoundError } from "../../errors";

describe("ProductStore", (): void => {
  describe("index method", (): void => {
    it("should return a list of all products", async (): Promise<void> => {
      const result: Product[] = await ProductStore.index();
      expect(result.length).toBeGreaterThan(1);
      for (const product of result) {
        expect(typeof product.id).toBe("number");
        expect(typeof product.name).toBe("string");
        expect(typeof product.price).toBe("number");
        expect(typeof product.category).toBe("string");
      }
    });
  });

  describe("show method", (): void => {
    it("should return details for existing product", async (): Promise<void> => {
      const showResult: Result<Product> = await ProductStore.show(4);
      expect(showResult.ok).toBe(true);
      const product: Product = showResult.data as Product;
      expect(product.id).toBe(4);
      expect(product.name).toBe("Rustic Steel Hat");
      expect(product.price).toBe(20.13);
      expect(product.category).toBe("Clothing");
    });

    it("should return error for non-existing product", async (): Promise<void> => {
      const showResult: Result<Product> = await ProductStore.show(232);
      expect(showResult.ok).toBe(false);
      expect(showResult.data).toBe(ProductNotFoundError);
    });
  });
});
