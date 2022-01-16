import { Request, Response, Router } from "express";
import UserStore from "../models/user";

const userHandlers: Router = Router();

userHandlers.get("/", async (_req: Request, res: Response): Promise<void> => {
  try {
    res.json(await UserStore.index());
  } catch (error) {
    res.status(500).json(error);
  }
});

export default userHandlers;
