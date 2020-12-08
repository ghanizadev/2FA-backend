import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";

export default async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.header("authorization")) throw new Error("missing_auth");

    const { authorization } = req.headers;
    if (!authorization.startsWith("Bearer ")) throw new Error("no token");

    const access_token = authorization.split("Bearer ")[1];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const load: any = jwt.verify(
      access_token as string,
      process.env.ACCESS_KEY
    );

    const user = await User.findByEmail(load.email);
    if (!user) throw new Error("unauthorized");

    req.user = user;

    return next();
  } catch (e) {
    return next(e);
  }
};
