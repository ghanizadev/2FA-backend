import { Request, Response, NextFunction } from "express";

export default (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (process.env.NODE_ENV === "development") console.error(error);

  switch (error.message) {
    case "!email":
      return res
        .status(400)
        .send({ error: "invalid_request", message: "email not informed" });
    case "!password":
      return res
        .status(400)
        .send({ error: "invalid_request", message: "password not informed" });
    case "!grant_type":
      return res
        .status(400)
        .send({ error: "invalid_request", message: "password not informed" });
    case "!urlencoded":
      return res
        .status(400)
        .send({ error: "invalid_request", message: "this request must be url encoded" });
    case "!code":
      return res
        .status(401)
        .send({ error: "unauthorized", message: "invalid code" });
    case "!auth":
      return res
        .status(401)
        .send({
          error: "not_authorized",
          message: "check your credentials and try again later",
        });
    default:
      return res
        .status(500)
        .send({ error: "internal_error", message: error.message });
  }
};
