import { NextFunction, Request, Response, Router } from "express";
import { checkAuthorization } from "../middleware";
import { Result } from "../result";
import OrderStore, { CompleteOrder } from "../models/order";
import { httpStatus } from "../errors";

const orderHandler: Router = Router();

orderHandler.get(
  "/:orderId",
  checkAuthorization,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orderId: number = parseInt(req.params.orderId);
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

orderHandler.post(
  "/",
  checkAuthorization,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const newCompleteOrder: CompleteOrder = req.body;
      const createCompleteOrderResult: Result<CompleteOrder> =
        await OrderStore.createCompleteOrder(newCompleteOrder);
      if (!createCompleteOrderResult.ok) {
        const error: Error = createCompleteOrderResult.data;
        res.status(httpStatus(error)).json(error.toString());
        return;
      }
      const createdCompleteOrder: CompleteOrder =
        createCompleteOrderResult.data;
      res.json(createdCompleteOrder);
    } catch (error) {
      next(error);
    }
  }
);

export default orderHandler;
