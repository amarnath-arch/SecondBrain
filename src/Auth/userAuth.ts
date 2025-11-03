import type { Request, Response, NextFunction } from "express";
import { ResponseStatus } from "../routes/statusCodes.js";
import jwt from "jsonwebtoken";

export function userAuth(req: Request, res: Response, next: NextFunction) {
  let token;
  try {
    token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res
        .status(ResponseStatus.AuthorizationError)
        .json({ error: "No token provided" });
    }

    const user = jwt.verify(token ?? "", process.env.USER_JWT_SECRET ?? "");

    // @ts-ignore
    req.userId = user.userId;
    next();
  } catch (err) {
    res.status(ResponseStatus.ServerError).json({
      error: "Error fetching token",
    });
  }
}
