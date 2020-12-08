import { validate } from "uuid";

import { Request, Response, NextFunction } from "express";
import User from "../models/User";

export default {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, avatar, password } = req.body;

      const user = new User(name, email, password, avatar);
      await user.save();

      return res.status(201).send(user.toString());
    } catch (e) {
      return next(e);
    }
  },
  async googleCreate(req: Request, res: Response, next: NextFunction) {
    try {

    } catch (e) {
      return next(e);
    }
  },
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.params;

      const user = await User.findByEmail(email);
      if (!user) throw new Error("user not found");

      await User.findByIdAndDelete(user.id);

      return res.sendStatus(204);
    } catch (e) {
      return next(e);
    }
  },
  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.params;

      const user = await User.findByEmail(email);
      if (!user) throw new Error("user not found");

      return res.status(200).send(user.toObject());
    } catch (e) {
      return next(e);
    }
  },
  async getWithAuthToken(req: Request, res: Response, next: NextFunction) {
    try {
    if(!req.is("urlencoded")) throw new Error("not urlencoded");

      const { token } = req.body;

    if(!token) throw new Error("token not informed");

      const user = await User.findByJwt(token);

      return res.status(200).send(user.toObject());
    } catch (e) {
      return next(e);
    }
  },
};
