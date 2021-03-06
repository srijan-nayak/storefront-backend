import OrderProductStore, { OrderProduct } from "../../models/order-product";
import { Result } from "../../result";
import {
  OrderNotFoundError,
  OrderProductFieldsIncorrectError,
  ProductNotFoundError,
} from "../../errors";

describe("OrderProductStore", (): void => {
  describe("create method", (): void => {
    it("should return created order product", async (): Promise<void> => {
      const newOrderProduct: OrderProduct = {
        order_id: 203,
        product_id: 104,
        quantity: 1,
      };
      const createResult: Result<OrderProduct> = await OrderProductStore.create(
        newOrderProduct
      );
      expect(createResult.ok).toBe(true);
      const orderProduct: OrderProduct = createResult.data as OrderProduct;
      expect(orderProduct.order_id).toBe(newOrderProduct.order_id);
      expect(orderProduct.product_id).toBe(newOrderProduct.product_id);
      expect(orderProduct.quantity).toBe(newOrderProduct.quantity);
    });

    it("should return error for invalid order product data", async (): Promise<void> => {
      const invalidOrderProduct1: object = {
        order_id: 203,
        quantity: 1,
      };
      const createResult1: Result<OrderProduct> =
        await OrderProductStore.create(invalidOrderProduct1 as OrderProduct);
      expect(createResult1.ok).toBe(false);
      expect(createResult1.data).toBe(OrderProductFieldsIncorrectError);

      const invalidOrderProduct2: object = {
        order_id: 203,
        product_id: 101,
        quantity: -12,
      };
      const createResult2: Result<OrderProduct> =
        await OrderProductStore.create(invalidOrderProduct2 as OrderProduct);
      expect(createResult2.ok).toBe(false);
      expect(createResult2.data).toBe(OrderProductFieldsIncorrectError);
    });

    it("should return error for non-existing products", async (): Promise<void> => {
      const newOrderProduct: OrderProduct = {
        order_id: 203,
        product_id: 231,
        quantity: 3,
      };
      const createResult: Result<OrderProduct> = await OrderProductStore.create(
        newOrderProduct
      );
      expect(createResult.ok).toBe(false);
      expect(createResult.data).toBe(ProductNotFoundError);
    });
  });

  describe("show method", (): void => {
    it("should return list of order products for existing order", async (): Promise<void> => {
      const showResult: Result<OrderProduct[]> = await OrderProductStore.show(
        203
      );
      expect(showResult.ok).toBe(true);
      const orderProducts: OrderProduct[] = showResult.data as OrderProduct[];
      expect(orderProducts.length).toBeGreaterThan(1);
      for (const orderProduct of orderProducts) {
        expect(typeof orderProduct.order_id).toBe("number");
        expect(typeof orderProduct.product_id).toBe("number");
        expect(typeof orderProduct.quantity).toBe("number");
      }
    });

    it("should return error for non-existing order", async (): Promise<void> => {
      const showResult: Result<OrderProduct[]> = await OrderProductStore.show(
        621
      );
      expect(showResult.ok).toBe(false);
      expect(showResult.data).toBe(OrderNotFoundError);
    });
  });
});
