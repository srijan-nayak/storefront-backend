import { NextFunction, Request, Response, Router } from "express";
import ProductStore, { Product } from "../models/product";
import { Result } from "../result";
import { checkAuthorization } from "../middleware";
import { httpStatus } from "../errors";

const productHandler: Router = Router();

productHandler.get(
  "/",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      let products: Product[];
      if (req.query.popular === "true") {
        products = await ProductStore.showPopularProducts();
      } else {
        products = await ProductStore.index();
      }
      res.json(products);
    } catch (error) {
      next(error);
    }
  }
);

productHandler.get(
  "/:productId",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const productId: number = parseInt(req.params.productId);
      const showResult: Result<Product> = await ProductStore.show(productId);
      if (!showResult.ok) {
        const error: Error = showResult.data;
        res.status(httpStatus(error)).json(error.toString());
        return;
      }
      const product: Product = showResult.data;
      res.json(product);
    } catch (error) {
      next(error);
    }
  }
);

productHandler.post(
  "/",
  checkAuthorization,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const newProduct: Product = req.body;
      const createResult: Result<Product> = await ProductStore.create(
        newProduct
      );
      if (!createResult.ok) {
        const error: Error = createResult.data;
        res.status(httpStatus(error)).json(error.toString());
        return;
      }
      const createdProduct: Product = createResult.data;
      res.json(createdProduct);
    } catch (error) {
      next(error);
    }
  }
);

export default productHandler;
