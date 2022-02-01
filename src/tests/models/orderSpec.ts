import OrderStore, { CompleteOrder, Order } from "../../models/order";
import { Result } from "../../result";
import {
  CompleteOrderIncorrectFieldsError,
  OrderFieldsIncorrectError,
  OrderNotFoundError,
  ProductNotFoundError,
  UserNotFoundError,
  UserOrdersNotFoundError,
} from "../../errors";

describe("OrderStore", (): void => {
  describe("create method", (): void => {
    it("should return created order", async (): Promise<void> => {
      const newOrder: Order = {
        user_id: "april_serra",
        completed: false,
      };
      const createResult: Result<Order> = await OrderStore.create(newOrder);
      expect(createResult.ok).toBe(true);
      const order: Order = createResult.data as Order;
      expect(typeof order.id).toBe("number");
      expect(order.user_id).toBe(newOrder.user_id);
      expect(order.completed).toBe(newOrder.completed);
    });

    it("should return error for invalid order data", async (): Promise<void> => {
      const invalidOrder1: unknown = {
        user_id: 12,
        completed: false,
      };
      const createResult1: Result<Order> = await OrderStore.create(
        invalidOrder1 as Order
      );
      expect(createResult1.ok).toBe(false);
      expect(createResult1.data).toBe(OrderFieldsIncorrectError);

      const invalidOrder2: unknown = {
        completed: false,
      };
      const createResult2: Result<Order> = await OrderStore.create(
        invalidOrder2 as Order
      );
      expect(createResult2.ok).toBe(false);
      expect(createResult2.data).toBe(OrderFieldsIncorrectError);
    });

    it("should return error for non-existing user", async (): Promise<void> => {
      const newOrder: Order = {
        user_id: "random_user",
        completed: false,
      };
      const createResult: Result<Order> = await OrderStore.create(newOrder);
      expect(createResult.ok).toBe(false);
      expect(createResult.data).toBe(UserNotFoundError);
    });
  });

  describe("show method", (): void => {
    it("should return details for existing order", async (): Promise<void> => {
      const showResult: Result<Order> = await OrderStore.show(202);
      expect(showResult.ok).toBe(true);
      const order: Order = showResult.data as Order;
      expect(order.id).toBe(202);
      expect(order.user_id).toBe("antasia_marjory");
      expect(order.completed).toBe(false);
    });

    it("should return error for non-existing order", async (): Promise<void> => {
      const showResult: Result<Order> = await OrderStore.show(412);
      expect(showResult.ok).toBe(false);
      expect(showResult.data).toBe(OrderNotFoundError);
    });
  });

  describe("delete method", (): void => {
    it("should delete existing order", async (): Promise<void> => {
      const deleteResult: Result<Order> = await OrderStore.delete(202);
      const showResult: Result<Order> = await OrderStore.show(202);

      expect(deleteResult.ok).toBe(true);
      const order: Order = deleteResult.data as Order;
      expect(order.id).toBe(202);
      expect(order.user_id).toBe("antasia_marjory");
      expect(order.completed).toBe(false);

      expect(showResult.ok).toBe(false);
      expect(showResult.data).toBe(OrderNotFoundError);
    });

    it("should return error for non-existing order", async (): Promise<void> => {
      const deleteResult: Result<Order> = await OrderStore.delete(412);
      expect(deleteResult.ok).toBe(false);
      expect(deleteResult.data).toBe(OrderNotFoundError);
    });
  });

  describe("createCompleteOrder method", (): void => {
    it("should return created complete order", async (): Promise<void> => {
      const newCompletedOrder: CompleteOrder = {
        productIds: [103, 105],
        productQuantities: [4, 2],
        userId: "april_serra",
        isCompleted: false,
      };
      const createResult: Result<CompleteOrder> =
        await OrderStore.createCompleteOrder(newCompletedOrder);
      expect(createResult.ok).toBe(true);
      const order: CompleteOrder = createResult.data as CompleteOrder;
      expect(typeof order.id).toBe("number");
      expect(order.productIds).toEqual(newCompletedOrder.productIds);
      expect(order.productQuantities).toEqual(
        newCompletedOrder.productQuantities
      );
      expect(order.userId).toBe("april_serra");
      expect(order.isCompleted).toBe(false);
    });

    it("should return error for invalid order data", async (): Promise<void> => {
      const invalidOrder1: unknown = {
        productIds: 101,
        productQuantities: 4,
        userId: "antasia_marjory",
        isCompleted: false,
      };
      const createResult1: Result<CompleteOrder> =
        await OrderStore.createCompleteOrder(invalidOrder1 as CompleteOrder);
      expect(createResult1.ok).toBe(false);
      expect(createResult1.data).toBe(CompleteOrderIncorrectFieldsError);

      const invalidOrder2: unknown = {
        productIds: [102, 105],
        productQuantities: [2, -1],
        userId: "antasia_marjory",
        isCompleted: false,
      };
      const createResult2: Result<CompleteOrder> =
        await OrderStore.createCompleteOrder(invalidOrder2 as CompleteOrder);
      expect(createResult2.ok).toBe(false);
      expect(createResult2.data).toBe(CompleteOrderIncorrectFieldsError);

      const invalidOrder3: unknown = {
        productIds: [102, 105],
        productQuantities: [2, 1],
      };
      const createResult3: Result<CompleteOrder> =
        await OrderStore.createCompleteOrder(invalidOrder3 as CompleteOrder);
      expect(createResult3.ok).toBe(false);
      expect(createResult3.data).toBe(CompleteOrderIncorrectFieldsError);
    });

    it("should return error for non-existing products", async (): Promise<void> => {
      const newOrder: CompleteOrder = {
        productIds: [103, 185],
        productQuantities: [4, 2],
        userId: "april_serra",
        isCompleted: true,
      };
      const createResult: Result<CompleteOrder> =
        await OrderStore.createCompleteOrder(newOrder);
      expect(createResult.ok).toBe(false);
      expect(createResult.data).toBe(ProductNotFoundError);
    });

    it("should return error for non-existing user", async (): Promise<void> => {
      const newOrder: CompleteOrder = {
        productIds: [103, 105],
        productQuantities: [4, 2],
        userId: "random_user",
        isCompleted: false,
      };
      const createResult: Result<CompleteOrder> =
        await OrderStore.createCompleteOrder(newOrder);
      expect(createResult.ok).toBe(false);
      expect(createResult.data).toBe(UserNotFoundError);
    });
  });

  describe("showUserCompleteOrders method", (): void => {
    it("should return complete orders", async (): Promise<void> => {
      const showUserCompleteOrdersResult: Result<CompleteOrder[]> =
        await OrderStore.showUserCompleteOrders("april_serra");
      expect(showUserCompleteOrdersResult.ok).toBe(true);

      const completeOrders: CompleteOrder[] =
        showUserCompleteOrdersResult.data as CompleteOrder[];
      expect(completeOrders.length).toBeGreaterThan(1);
      for (const completeOrder of completeOrders) {
        const { id, productIds, productQuantities, userId, isCompleted } =
          completeOrder;
        expect(typeof id).toBe("number");
        expect(typeof userId).toBe("string");
        expect(typeof isCompleted).toBe("boolean");

        expect(productIds.length).toBe(productQuantities.length);
        expect(productIds.length).toBeGreaterThan(1);
        for (let i = 0; i < productIds.length; i++) {
          expect(typeof productIds[i]).toBe("number");
          expect(typeof productQuantities[i]).toBe("number");
        }
      }
    });

    it("should return error for non-existing user", async (): Promise<void> => {
      const showUserCompleteOrdersResult: Result<CompleteOrder[]> =
        await OrderStore.showUserCompleteOrders("random_user");
      expect(showUserCompleteOrdersResult.ok).toBe(false);
      expect(showUserCompleteOrdersResult.data).toBe(UserNotFoundError);
    });

    it("should return error for user not having any orders", async (): Promise<void> => {
      const showUserCompleteOrdersResult: Result<CompleteOrder[]> =
        await OrderStore.showUserCompleteOrders("taysia_amylynn");
      expect(showUserCompleteOrdersResult.ok).toBe(false);
      expect(showUserCompleteOrdersResult.data).toBe(UserOrdersNotFoundError);
    });
  });
});
