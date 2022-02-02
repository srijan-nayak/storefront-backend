import request, { Response } from "supertest";
import app from "../../index";
import { validToken } from "./userSpec";
import { CompleteOrder } from "../../models/order";
import { AuthorizationError, OrderNotFoundError } from "../../errors";

describe("Order handler endpoint", (): void => {
  describe("GET /order/:id", (): void => {
    it("should return error without valid token", async (): Promise<void> => {
      const response: Response = await request(app).get("/order/202");
      expect(response.status).toBe(401);
      expect(response.body).toBe(AuthorizationError.toString());
    });

    it("should return complete details for existing order", async (): Promise<void> => {
      const response: Response = await request(app)
        .get("/order/202")
        .auth(validToken, { type: "bearer" });
      expect(response.status).toBe(200);
      const completeOrder: CompleteOrder = response.body;
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
    });

    it("should return error for non-existing order", async (): Promise<void> => {
      const response: Response = await request(app)
        .get("/order/644")
        .auth(validToken, { type: "bearer" });
      expect(response.status).toBe(404);
      expect(response.body).toBe(OrderNotFoundError.toString());
    });
  });
});
