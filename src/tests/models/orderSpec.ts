import OrderStore, { Order } from "../../models/order";
import { Result } from "../../result";
import {
  OrderFieldsIncorrectError,
  ProductNotFoundError,
  UserNotFoundError,
} from "../../errors";

describe("OrderStore", (): void => {
  describe("create method", (): void => {
    it("should return created order", async (): Promise<void> => {
      const newOrder: Order = {
        productIds: [103, 105],
        productQuantities: [4, 2],
        userId: "april_serra",
      };
      const createResult: Result<Order> = await OrderStore.create(newOrder);
      expect(createResult.ok).toBe(true);
      const order: Order = createResult.data as Order;
      expect(typeof order.id).toBe("number");
      expect(order.productIds).toEqual(newOrder.productIds);
      expect(order.productQuantities).toEqual(newOrder.productQuantities);
      expect(order.userId).toBe("april_serra");
      expect(order.isCompleted).toBe(false);
    });

    it("should return error invalid order data", async (): Promise<void> => {
      const invalidOrder1: unknown = {
        productIds: 101,
        productQuantities: 4,
        userId: "antasia_marjory",
      };
      const createResult1: Result<Order> = await OrderStore.create(
        invalidOrder1
      );
      expect(createResult1.ok).toBe(false);
      expect(createResult1.data).toBe(OrderFieldsIncorrectError);

      const invalidOrder2: unknown = {
        productIds: [102, 105],
        productQuantities: [2, -1],
        userId: "antasia_marjory",
      };
      const createResult2: Result<Order> = await OrderStore.create(
        invalidOrder2
      );
      expect(createResult2.ok).toBe(false);
      expect(createResult2.data).toBe(OrderFieldsIncorrectError);

      const invalidOrder3: unknown = {
        productIds: [102, 105],
        productQuantities: [2, 1],
      };
      const createResult3: Result<Order> = await OrderStore.create(
        invalidOrder3
      );
      expect(createResult3.ok).toBe(false);
      expect(createResult3.data).toBe(OrderFieldsIncorrectError);
    });

    it("should return error for non-existing products", async (): Promise<void> => {
      const newOrder: Order = {
        productIds: [103, 185],
        productQuantities: [4, 2],
        userId: "april_serra",
      };
      const createResult: Result<Order> = await OrderStore.create(newOrder);
      expect(createResult.ok).toBe(false);
      expect(createResult.data).toBe(ProductNotFoundError);
    });

    it("it should return error for non-existing user", async (): Promise<void> => {
      const newOrder: Order = {
        productIds: [103, 105],
        productQuantities: [4, 2],
        userId: "random_user",
      };
      const createResult: Result<Order> = await OrderStore.create(newOrder);
      expect(createResult.ok).toBe(false);
      expect(createResult.data).toBe(UserNotFoundError);
    });
  });
});
