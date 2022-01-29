import OrderStore, { Order } from "../../models/order";
import { Result } from "../../result";
import {
  OrderFieldsIncorrectError,
  ProductNotFoundError,
  UserNotFoundError,
  UserOrdersNotFoundError,
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
        invalidOrder1 as Order
      );
      expect(createResult1.ok).toBe(false);
      expect(createResult1.data).toBe(OrderFieldsIncorrectError);

      const invalidOrder2: unknown = {
        productIds: [102, 105],
        productQuantities: [2, -1],
        userId: "antasia_marjory",
      };
      const createResult2: Result<Order> = await OrderStore.create(
        invalidOrder2 as Order
      );
      expect(createResult2.ok).toBe(false);
      expect(createResult2.data).toBe(OrderFieldsIncorrectError);

      const invalidOrder3: unknown = {
        productIds: [102, 105],
        productQuantities: [2, 1],
      };
      const createResult3: Result<Order> = await OrderStore.create(
        invalidOrder3 as Order
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

  describe("getUserOrders method", (): void => {
    it("should return a list of all orders for given user ID", async (): Promise<void> => {
      const showUserOrdersResult: Result<Order[]> =
        await OrderStore.showUserOrders("april_serra");

      expect(showUserOrdersResult.ok).toBe(true);
      const orders: Order[] = showUserOrdersResult.data as Order[];
      expect(orders.length).toBeGreaterThan(1);

      for (const order of orders) {
        const { id, productIds, productQuantities, userId, isCompleted } =
          order;
        expect(typeof id).toBe("number");
        expect(userId).toBe("april_serra");
        expect(typeof isCompleted).toBe("boolean");

        expect(productIds.length === productQuantities.length).toBe(true);
        expect(productIds.length).toBeGreaterThan(1);
        for (let i = 0; i < productIds.length; i++) {
          expect(typeof productIds[i]).toBe("number");
          expect(typeof productQuantities[i]).toBe("number");
        }
      }
    });

    it("should return error for non-existing user", async (): Promise<void> => {
      const showUserOrdersResult: Result<Order[]> =
        await OrderStore.showUserOrders("random_user");
      expect(showUserOrdersResult.ok).toBe(false);
      expect(showUserOrdersResult.data).toBe(UserNotFoundError);
    });

    it("should return error if user has no orders", async (): Promise<void> => {
      const showUserOrdersResult: Result<Order[]> =
        await OrderStore.showUserOrders("taysia_amylynn");
      expect(showUserOrdersResult.ok).toBe(false);
      expect(showUserOrdersResult.data).toBe(UserOrdersNotFoundError);
    });
  });
});