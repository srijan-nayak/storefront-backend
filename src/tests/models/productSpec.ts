import ProductStore, { Product } from "../../models/product";

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
});
