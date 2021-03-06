import { Request, Response, NextFunction } from "express";
import Client from "../models/Client";
import User from "../models/User";

export default {
  async authorize(req: Request, res: Response, next: NextFunction) {
    try {
      const { code } = req.body;

      const _code = code.split(".")[0];

      const client = await Client.findByCode(_code);
      if (!client) return res.sendStatus(404);

      if (client.verify(code)) {
        req.websocket
          .to(client.id)
          .emit("permission", req.user.issueAuthorizationToken());

        return res.sendStatus(204);
      } else throw new Error("!code");
    } catch (e) {
      return next(e);
    }
  },
  async token(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.is("urlencoded")) throw new Error("!urlencoded");

      const { email, password, grant_type } = req.body;

      if (!email) throw new Error("!email");
      if (!password) throw new Error("!password");
      if (grant_type !== "password") throw new Error("!grant_type");

      const user = await User.findByEmail(email);
      if (!user) throw new Error("!email");

      if (!user.comparePassword(password)) throw new Error("!auth");
      const response = user.issueAccessToken();
      return res.status(201).send(response);
    } catch (e) {
      return next(e);
    }
  },
};
