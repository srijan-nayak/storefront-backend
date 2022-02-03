import { NextFunction, Request, Response, Router } from "express";
import UserStore, { User } from "../models/user";
import { Result } from "../result";
import { checkAuthorization } from "../middleware";
import { httpStatus } from "../errors";
import { userOrderHandler } from "./order";

const userHandler: Router = Router();

userHandler.use("/:userId/orders", userOrderHandler);

userHandler.get(
  "/",
  checkAuthorization,
  async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const users: User[] = await UserStore.index();
      res.json(users);
    } catch (error) {
      next(error);
    }
  }
);

userHandler.get(
  "/:userId",
  checkAuthorization,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId: string = req.params.userId;
      const showResult: Result<User> = await UserStore.show(userId);
      if (!showResult.ok) {
        const error: Error = showResult.data;
        res.status(httpStatus(error)).json(error.toString());
        return;
      }
      const user: User = showResult.data;
      res.json(user);
    } catch (error) {
      next(error);
    }
  }
);

userHandler.post(
  "/",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const newUser: User = req.body;
      const createResult: Result<User> = await UserStore.create(newUser);
      if (!createResult.ok) {
        const error: Error = createResult.data;
        res.status(httpStatus(error)).json(error.toString());
        return;
      }
      const createdUser: User = createResult.data;
      res.json(createdUser);
    } catch (error) {
      next(error);
    }
  }
);

userHandler.post(
  "/authenticate",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId: string = req.body.id;
      const password: string = req.body.password;
      const authenticateResult: Result<string> = await UserStore.authenticate(
        userId,
        password
      );
      if (!authenticateResult.ok) {
        const error: Error = authenticateResult.data;
        res.status(httpStatus(error)).json(error.toString());
        return;
      }
      const jwt: string = authenticateResult.data;
      res.json(jwt);
    } catch (error) {
      next(error);
    }
  }
);

export default userHandler;
