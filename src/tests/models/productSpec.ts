import ProductStore, { Product } from "../../models/product";
import { Result } from "../../result";
import {
  ProductFieldsIncorrectError,
  ProductNotFoundError,
} from "../../errors";

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
      const showResult: Result<Product> = await ProductStore.show(104);
      expect(showResult.ok).toBe(true);
      const product: Product = showResult.data as Product;
      expect(product.id).toBe(104);
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

  describe("create method", (): void => {
    it("should return created product", async (): Promise<void> => {
      const newProduct: Product = {
        name: "Sleek Steel Gloves",
        price: 25.94,
        category: "Clothing",
      };
      const createResult: Result<Product> = await ProductStore.create(
        newProduct
      );
      expect(createResult.ok).toBe(true);
      const product: Product = createResult.data as Product;
      expect(typeof product.id).toBe("number");
      expect(product.name).toBe(newProduct.name);
      expect(product.price).toBe(newProduct.price);
      expect(product.category).toBe(newProduct.category);
    });

    it("should return error for invalid product data", async (): Promise<void> => {
      const invalidProduct1: Product = {
        name: "Invalid Product",
        price: 999.99,
      } as Product;
      const createResult1: Result<Product> = await ProductStore.create(
        invalidProduct1
      );
      expect(createResult1.ok).toBe(false);
      expect(createResult1.data).toBe(ProductFieldsIncorrectError);

      const invalidProduct2: Product = {
        name: "Invalid Product",
        price: -241.23,
        category: "Invalid",
      };
      const createResult2: Result<Product> = await ProductStore.create(
        invalidProduct2
      );
      expect(createResult2.ok).toBe(false);
      expect(createResult2.data).toBe(ProductFieldsIncorrectError);
    });
  });
});
