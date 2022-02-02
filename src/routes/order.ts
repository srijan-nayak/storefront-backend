import { NextFunction, Request, Response, Router } from "express";
import { checkAuthorization } from "../middleware";
import { Result } from "../result";
import OrderStore, { CompleteOrder } from "../models/order";
import { httpStatus } from "../errors";

const orderHandler: Router = Router();

orderHandler.get(
  "/:id",
  checkAuthorization,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orderId: number = parseInt(req.params["id"]);
      const showCompleteOrderResult: Result<CompleteOrder> =
        await OrderStore.showCompleteOrder(orderId);
      if (!showCompleteOrderResult.ok) {
        const error: Error = showCompleteOrderResult.data;
        res.status(httpStatus(error)).json(error.toString());
        return;
      }
      const completeOrder: CompleteOrder = showCompleteOrderResult.data;
      res.json(completeOrder);
    } catch (error) {
      next(error);
    }
  }
);

export default orderHandler;
