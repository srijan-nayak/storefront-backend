import { NextFunction, Request, Response, Router } from "express";
import UserStore, { User } from "../models/user";
import { Result } from "../result";

const userHandler: Router = Router();

userHandler.get(
  "/",
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
  "/:id",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId: string = req.params["id"];
      const showResult: Result<User> = await UserStore.show(userId);
      if (!showResult.ok) {
        const error: Error = showResult.data;
        res.status(404).json(error.toString());
        return;
      }
      const user: User = showResult.data;
      res.json(user);
    } catch (error) {
      next(error);
    }
  }
);

export default userHandler;
