import OrderStore, {
  CompleteOrder,
  Order,
  OrderStatus,
} from "../../models/order";
import { Result } from "../../result";
import {
  CompleteOrderIncorrectFieldsError,
  OrderFieldsIncorrectError,
  OrderNotFoundError,
  ProductNotFoundError,
  UserActiveOrdersNotFoundError,
  UserCompletedOrdersNotFoundError,
  UserNotFoundError,
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
      const invalidOrder1: object = {
        user_id: 12,
        completed: false,
      };
      const createResult1: Result<Order> = await OrderStore.create(
        invalidOrder1 as Order
      );
      expect(createResult1.ok).toBe(false);
      expect(createResult1.data).toBe(OrderFieldsIncorrectError);

      const invalidOrder2: object = {
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
      const newCompleteOrder: CompleteOrder = {
        productIds: [103, 105],
        productQuantities: [4, 2],
        userId: "april_serra",
        status: "active" as OrderStatus,
      };
      const createResult: Result<CompleteOrder> =
        await OrderStore.createCompleteOrder(newCompleteOrder);
      expect(createResult.ok).toBe(true);
      const order: CompleteOrder = createResult.data as CompleteOrder;
      expect(typeof order.id).toBe("number");
      expect(order.productIds).toEqual(newCompleteOrder.productIds);
      expect(order.productQuantities).toEqual(
        newCompleteOrder.productQuantities
      );
      expect(order.userId).toBe(newCompleteOrder.userId);
      expect(order.status).toBe(newCompleteOrder.status);
    });

    it("should return error for invalid order data", async (): Promise<void> => {
      const invalidOrder1: object = {
        productIds: 101,
        productQuantities: 4,
        userId: "antasia_marjory",
        status: "active",
      };
      const createResult1: Result<CompleteOrder> =
        await OrderStore.createCompleteOrder(invalidOrder1 as CompleteOrder);
      expect(createResult1.ok).toBe(false);
      expect(createResult1.data).toBe(CompleteOrderIncorrectFieldsError);

      const invalidOrder2: object = {
        productIds: [102, 105],
        productQuantities: [2, -1],
        userId: "antasia_marjory",
        status: "active",
      };
      const createResult2: Result<CompleteOrder> =
        await OrderStore.createCompleteOrder(invalidOrder2 as CompleteOrder);
      expect(createResult2.ok).toBe(false);
      expect(createResult2.data).toBe(CompleteOrderIncorrectFieldsError);

      const invalidOrder3: object = {
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
        status: "completed" as OrderStatus,
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
        status: "active" as OrderStatus,
      };
      const createResult: Result<CompleteOrder> =
        await OrderStore.createCompleteOrder(newOrder);
      expect(createResult.ok).toBe(false);
      expect(createResult.data).toBe(UserNotFoundError);
    });
  });

  describe("showCompleteOrder method", (): void => {
    it("should return complete details for existing order", async (): Promise<void> => {
      const showCompleteOrderResult: Result<CompleteOrder> =
        await OrderStore.showCompleteOrder(202);
      expect(showCompleteOrderResult.ok).toBe(true);
      const completeOrder: CompleteOrder =
        showCompleteOrderResult.data as CompleteOrder;
      const { id, productIds, productQuantities, userId, status } =
        completeOrder;
      expect(typeof id).toBe("number");
      expect(typeof userId).toBe("string");
      expect([OrderStatus.Active, OrderStatus.Completed]).toContain(status);

      expect(productIds.length).toBe(productQuantities.length);
      expect(productIds.length).toBeGreaterThan(1);
      for (let i = 0; i < productIds.length; i++) {
        expect(typeof productIds[i]).toBe("number");
        expect(typeof productQuantities[i]).toBe("number");
      }
    });

    it("should return error for non-exiting order", async (): Promise<void> => {
      const showCompleteOrderResult: Result<CompleteOrder> =
        await OrderStore.showCompleteOrder(873);
      expect(showCompleteOrderResult.ok).toBe(false);
      expect(showCompleteOrderResult.data).toBe(OrderNotFoundError);
    });
  });

  describe("showUserCompleteOrders method", (): void => {
    it("should return active complete orders", async (): Promise<void> => {
      const showUserCompleteOrdersResult: Result<CompleteOrder[]> =
        await OrderStore.showUserCompleteOrders(
          "april_serra",
          OrderStatus.Active
        );
      expect(showUserCompleteOrdersResult.ok).toBe(true);

      const completeOrders: CompleteOrder[] =
        showUserCompleteOrdersResult.data as CompleteOrder[];
      expect(completeOrders.length).toBeGreaterThan(1);
      for (const completeOrder of completeOrders) {
        const { id, productIds, productQuantities, userId, status } =
          completeOrder;
        expect(typeof id).toBe("number");
        expect(typeof userId).toBe("string");
        expect(status).toBe(OrderStatus.Active);

        expect(productIds.length).toBe(productQuantities.length);
        expect(productIds.length).toBeGreaterThan(1);
        for (let i = 0; i < productIds.length; i++) {
          expect(typeof productIds[i]).toBe("number");
          expect(typeof productQuantities[i]).toBe("number");
        }
      }
    });

    it("should return completed complete orders", async (): Promise<void> => {
      const showUserCompleteOrdersResult: Result<CompleteOrder[]> =
        await OrderStore.showUserCompleteOrders(
          "antasia_marjory",
          OrderStatus.Completed
        );
      expect(showUserCompleteOrdersResult.ok).toBe(true);

      const completeOrders: CompleteOrder[] =
        showUserCompleteOrdersResult.data as CompleteOrder[];
      expect(completeOrders.length).toBeGreaterThan(1);
      for (const completeOrder of completeOrders) {
        const { id, productIds, productQuantities, userId, status } =
          completeOrder;
        expect(typeof id).toBe("number");
        expect(typeof userId).toBe("string");
        expect(status).toBe(OrderStatus.Completed);

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
        await OrderStore.showUserCompleteOrders(
          "random_user",
          OrderStatus.Active
        );
      expect(showUserCompleteOrdersResult.ok).toBe(false);
      expect(showUserCompleteOrdersResult.data).toBe(UserNotFoundError);
    });

    it("should return error for user not having any active orders", async (): Promise<void> => {
      const showUserCompleteOrdersResult: Result<CompleteOrder[]> =
        await OrderStore.showUserCompleteOrders(
          "taysia_amylynn",
          OrderStatus.Active
        );
      expect(showUserCompleteOrdersResult.ok).toBe(false);
      expect(showUserCompleteOrdersResult.data).toBe(
        UserActiveOrdersNotFoundError
      );
    });

    it("should return error for user not having any complete orders", async (): Promise<void> => {
      const showUserCompleteOrdersResult: Result<CompleteOrder[]> =
        await OrderStore.showUserCompleteOrders(
          "taysia_amylynn",
          OrderStatus.Completed
        );
      expect(showUserCompleteOrdersResult.ok).toBe(false);
      expect(showUserCompleteOrdersResult.data).toBe(
        UserCompletedOrdersNotFoundError
      );
    });
  });
});
