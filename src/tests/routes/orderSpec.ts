import request, { Response } from "supertest";
import app from "../../index";
import { validToken } from "./userSpec";
import { CompleteOrder, OrderStatus } from "../../models/order";
import {
  AuthorizationError,
  CompleteOrderFieldsIncorrectError,
  httpStatus,
  OrderNotFoundError,
  ProductNotFoundError,
  UserActiveOrdersNotFoundError,
  UserCompletedOrdersNotFoundError,
  UserNotFoundError,
  UserOrdersNotFountError,
} from "../../errors";

describe("Order handler endpoint", (): void => {
  describe("GET /orders/:orderId", (): void => {
    it("should return error without valid token", async (): Promise<void> => {
      const response: Response = await request(app).get("/orders/202");
      expect(response.status).toBe(httpStatus(AuthorizationError));
      expect(response.body).toBe(AuthorizationError.toString());
    });

    it("should return complete details for existing order", async (): Promise<void> => {
      const response: Response = await request(app)
        .get("/orders/202")
        .auth(validToken, { type: "bearer" });
      expect(response.status).toBe(200);
      const completeOrder: CompleteOrder = response.body;
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

    it("should return error for non-existing order", async (): Promise<void> => {
      const response: Response = await request(app)
        .get("/orders/644")
        .auth(validToken, { type: "bearer" });
      expect(response.status).toBe(httpStatus(OrderNotFoundError));
      expect(response.body).toBe(OrderNotFoundError.toString());
    });
  });

  describe("POST /orders", (): void => {
    it("should return error without valid token", async (): Promise<void> => {
      const newCompleteOrder: CompleteOrder = {
        productIds: [102, 103, 105],
        productQuantities: [4, 2, 2],
        userId: "taysia_amylynn",
        status: "active" as OrderStatus,
      };
      const response: Response = await request(app)
        .post("/orders")
        .send(newCompleteOrder);
      expect(response.status).toBe(httpStatus(AuthorizationError));
      expect(response.body).toBe(AuthorizationError.toString());
    });

    it("should return created complete order", async (): Promise<void> => {
      const newCompleteOrder: CompleteOrder = {
        productIds: [102, 103, 105],
        productQuantities: [4, 2, 2],
        userId: "taysia_amylynn",
        status: "active" as OrderStatus,
      };
      const response: Response = await request(app)
        .post("/orders")
        .send(newCompleteOrder)
        .auth(validToken, { type: "bearer" });
      expect(response.status).toBe(200);
      const order: CompleteOrder = response.body;
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
      const response1: Response = await request(app)
        .post("/orders")
        .send(invalidOrder1)
        .auth(validToken, { type: "bearer" });
      expect(response1.status).toBe(
        httpStatus(CompleteOrderFieldsIncorrectError)
      );
      expect(response1.body).toBe(CompleteOrderFieldsIncorrectError.toString());

      const invalidOrder2: object = {
        productIds: [102, 105],
        productQuantities: [2, -1],
        userId: "antasia_marjory",
        status: "active",
      };
      const response2: Response = await request(app)
        .post("/orders")
        .send(invalidOrder2)
        .auth(validToken, { type: "bearer" });
      expect(response2.status).toBe(
        httpStatus(CompleteOrderFieldsIncorrectError)
      );
      expect(response2.body).toBe(CompleteOrderFieldsIncorrectError.toString());

      const invalidOrder3: object = {
        productIds: [102, 105],
        productQuantities: [2, 1],
      };
      const response3: Response = await request(app)
        .post("/orders")
        .send(invalidOrder3)
        .auth(validToken, { type: "bearer" });
      expect(response3.status).toBe(
        httpStatus(CompleteOrderFieldsIncorrectError)
      );
      expect(response3.body).toBe(CompleteOrderFieldsIncorrectError.toString());
    });

    it("should return error for non-existing products", async (): Promise<void> => {
      const newOrder: CompleteOrder = {
        productIds: [103, 185],
        productQuantities: [4, 2],
        userId: "april_serra",
        status: "completed" as OrderStatus,
      };
      const response: Response = await request(app)
        .post("/orders")
        .send(newOrder)
        .auth(validToken, { type: "bearer" });
      expect(response.status).toBe(httpStatus(ProductNotFoundError));
      expect(response.body).toBe(ProductNotFoundError.toString());
    });

    it("should return error for non-existing user", async (): Promise<void> => {
      const newOrder: CompleteOrder = {
        productIds: [103, 105],
        productQuantities: [4, 2],
        userId: "random_user",
        status: "active" as OrderStatus,
      };
      const response: Response = await request(app)
        .post("/orders")
        .send(newOrder)
        .auth(validToken, { type: "bearer" });
      expect(response.status).toBe(httpStatus(UserNotFoundError));
      expect(response.body).toBe(UserNotFoundError.toString());
    });
  });
});

describe("User orders handler endpoint", (): void => {
  describe("GET /users/:userId/orders", (): void => {
    it("should return error without valid token", async (): Promise<void> => {
      const response: Response = await request(app).get(
        "/users/antasia_marjory/orders"
      );
      expect(response.status).toBe(httpStatus(AuthorizationError));
      expect(response.body).toBe(AuthorizationError.toString());
    });

    it("should return list of all complete orders", async (): Promise<void> => {
      const response: Response = await request(app)
        .get("/users/antasia_marjory/orders")
        .auth(validToken, { type: "bearer" });
      expect(response.status).toBe(200);
      const completeOrders: CompleteOrder[] = response.body;
      expect(completeOrders.length).toBeGreaterThan(1);
      for (const completeOrder of completeOrders) {
        const { id, productIds, productQuantities, userId, status } =
          completeOrder;
        expect(typeof id).toBe("number");
        expect(userId).toBe("antasia_marjory");
        expect([OrderStatus.Active, OrderStatus.Completed]).toContain(status);

        expect(productIds.length).toBe(productQuantities.length);
        expect(productIds.length).toBeGreaterThan(1);
        for (let i = 0; i < productIds.length; i++) {
          expect(typeof productIds[i]).toBe("number");
          expect(typeof productQuantities[i]).toBe("number");
        }
      }
    });

    it("should return error for non-existing user", async (): Promise<void> => {
      const response: Response = await request(app)
        .get("/users/random_user/orders")
        .auth(validToken, { type: "bearer" });
      expect(response.status).toBe(httpStatus(UserNotFoundError));
      expect(response.body).toBe(UserNotFoundError.toString());
    });

    it("should return error for user not having any orders", async (): Promise<void> => {
      const response: Response = await request(app)
        .get("/users/taysia_amylynn/orders")
        .auth(validToken, { type: "bearer" });
      expect(response.status).toBe(httpStatus(UserOrdersNotFountError));
      expect(response.body).toBe(UserOrdersNotFountError.toString());
    });
  });

  describe("GET /users/:userId/orders?status=active", (): void => {
    it("should return error without valid token", async (): Promise<void> => {
      const response: Response = await request(app)
        .get("/users/antasia_marjory/orders")
        .query({ status: OrderStatus.Active });
      expect(response.status).toBe(httpStatus(AuthorizationError));
      expect(response.body).toBe(AuthorizationError.toString());
    });

    it("should return list of all active complete orders", async (): Promise<void> => {
      const response: Response = await request(app)
        .get("/users/antasia_marjory/orders")
        .query({ status: OrderStatus.Active })
        .auth(validToken, { type: "bearer" });
      expect(response.status).toBe(200);
      const completeOrders: CompleteOrder[] = response.body;
      expect(completeOrders.length).toBeGreaterThan(1);
      for (const completeOrder of completeOrders) {
        const { id, productIds, productQuantities, userId, status } =
          completeOrder;
        expect(typeof id).toBe("number");
        expect(userId).toBe("antasia_marjory");
        expect(status).toBe(OrderStatus.Active);

        expect(productIds.length).toBe(productQuantities.length);
        expect(productIds.length).toBeGreaterThan(1);
        for (let i = 0; i < productIds.length; i++) {
          expect(typeof productIds[i]).toBe("number");
          expect(typeof productQuantities[i]).toBe("number");
        }
      }
    });

    it("should return error for non-existing user", async (): Promise<void> => {
      const response: Response = await request(app)
        .get("/users/random_user/orders")
        .query({ status: OrderStatus.Active })
        .auth(validToken, { type: "bearer" });
      expect(response.status).toBe(httpStatus(UserNotFoundError));
      expect(response.body).toBe(UserNotFoundError.toString());
    });

    it("should return error for user not having any active orders", async (): Promise<void> => {
      const response: Response = await request(app)
        .get("/users/taysia_amylynn/orders")
        .query({ status: OrderStatus.Active })
        .auth(validToken, { type: "bearer" });
      expect(response.status).toBe(httpStatus(UserActiveOrdersNotFoundError));
      expect(response.body).toBe(UserActiveOrdersNotFoundError.toString());
    });
  });

  describe("GET /users/:userId/orders?status=completed", (): void => {
    it("should return error without valid token", async (): Promise<void> => {
      const response: Response = await request(app)
        .get("/users/antasia_marjory/orders")
        .query({ status: OrderStatus.Completed });
      expect(response.status).toBe(httpStatus(AuthorizationError));
      expect(response.body).toBe(AuthorizationError.toString());
    });

    it("should return list of all completed complete orders", async (): Promise<void> => {
      const response: Response = await request(app)
        .get("/users/antasia_marjory/orders")
        .query({ status: OrderStatus.Completed })
        .auth(validToken, { type: "bearer" });
      expect(response.status).toBe(200);
      const completeOrders: CompleteOrder[] = response.body;
      expect(completeOrders.length).toBeGreaterThan(1);
      for (const completeOrder of completeOrders) {
        const { id, productIds, productQuantities, userId, status } =
          completeOrder;
        expect(typeof id).toBe("number");
        expect(userId).toBe("antasia_marjory");
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
      const response: Response = await request(app)
        .get("/users/random_user/orders")
        .query({ status: OrderStatus.Completed })
        .auth(validToken, { type: "bearer" });
      expect(response.status).toBe(httpStatus(UserNotFoundError));
      expect(response.body).toBe(UserNotFoundError.toString());
    });

    it("should return error for user not having any completed orders", async (): Promise<void> => {
      const response: Response = await request(app)
        .get("/users/taysia_amylynn/orders")
        .query({ status: OrderStatus.Completed })
        .auth(validToken, { type: "bearer" });
      expect(response.status).toBe(
        httpStatus(UserCompletedOrdersNotFoundError)
      );
      expect(response.body).toBe(UserCompletedOrdersNotFoundError.toString());
    });
  });
});
