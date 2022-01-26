import { NextFunction, Request, Response, Router } from "express";
import ProductStore, { Product } from "../models/product";

const productHandler: Router = Router();

productHandler.get(
  "/",
  async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const products: Product[] = await ProductStore.index();
      res.json(products);
    } catch (error) {
      next(error);
    }
  }
);

export default productHandler;
