import { NextFunction, Request, Response, Router } from "express";
import ProductStore, { Product } from "../models/product";
import { Result } from "../result";

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

productHandler.get(
  "/:id",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const productId: number = parseInt(req.params["id"]);
      const showResult: Result<Product> = await ProductStore.show(productId);
      if (!showResult.ok) {
        const error: Error = showResult.data;
        res.status(404).json(error.toString());
        return;
      }
      const product: Product = showResult.data;
      res.json(product);
    } catch (error) {
      next(error);
    }
  }
);

export default productHandler;
