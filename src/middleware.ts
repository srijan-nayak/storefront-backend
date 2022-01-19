import { NextFunction, Request, Response } from "express";
import { DBError } from "./database";

export const dbErrorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) => {
  res.status(500).json(DBError.toString());
};
