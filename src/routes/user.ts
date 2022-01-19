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

userHandler.post(
  "/",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const newUser: User = req.body as User;
      const createResult: Result<User> = await UserStore.create(newUser);
      if (!createResult.ok) {
        const error: Error = createResult.data;
        if (error.message === UserStore.errorMessages.UserAlreadyExists) {
          res.status(409).json(error.toString());
        } else {
          res.status(422).json(error.toString());
        }
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
        if (error.message === UserStore.errorMessages.UserNotFound) {
          res.status(404);
        } else {
          res.status(401);
        }
        res.json(error.toString());
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
