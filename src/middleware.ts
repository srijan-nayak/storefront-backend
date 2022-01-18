import { NextFunction, Request, Response } from "express";
import { DBError } from "./database";

export const dbErrorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.log("stuff");
  res.status(500).json(DBError.toString());
};
