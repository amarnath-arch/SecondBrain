import type { Request, Response, NextFunction } from "express";
import z from "zod";
import { ResponseStatus } from "../routes/statusCodes.js";

export function loginValidation(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const bodySchema = z.object({
    username: z.string().min(3).max(10),
    password: z
      .string()
      .min(8)
      .max(20)
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character"
      ),
  });

  const parsedBody = bodySchema?.safeParse(req.body);

  if (!parsedBody.success) {
    res.status(ResponseStatus.InputError).json({
      error: "Input Validation Error",
    });
  } else {
    next();
  }
}
