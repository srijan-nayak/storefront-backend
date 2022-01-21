import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";
import dotenv from "dotenv";
import { AuthorizationError, DBError } from "./errors";

dotenv.config();
const env = process.env;

export const dbErrorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  res.status(500).json(DBError.toString());
};

export const checkAuthorization = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authorizationHeader: string = req.headers.authorization as string;
    const token: string = authorizationHeader.split(" ")[1];
    verify(token, env["JWT_SECRET"] as string);
    next();
  } catch (error) {
    res.status(401);
    res.json(AuthorizationError.toString());
  }
};
