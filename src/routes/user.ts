import { Request, Response, Router } from "express";
import UserStore from "../models/user";
import { DBError } from "../database";

const userHandler: Router = Router();

userHandler.get("/", async (_req: Request, res: Response): Promise<void> => {
  try {
    res.json(await UserStore.index());
  } catch (error) {
    res.status(500).json(DBError.toString());
  }
});

userHandler.get("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    res.json(await UserStore.show(req.params["id"]));
  } catch (error) {
    const errorMessage: string = (error as Error).message;
    switch (errorMessage) {
      case UserStore.errorMessages.UserNotFound:
        res.status(404).json((error as Error).toString());
        break;
      default:
        res.status(500).json(DBError.toString());
    }
  }
});

export default userHandler;
