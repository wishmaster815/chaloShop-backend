import { Request, Response, NextFunction } from "express";
import errorHandler from "../utils/err-utility-class.js";
import { ControllerType } from "../types/types.js";

export const errorMiddleWare = (
  err: errorHandler,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // the below code means (err.message = err.message || "")
  err.message ||= "Internal server error";
  err.statusCode ||= 500;

  if(err.name === "CastError") err.message = "Invlaid ID!";

  return res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};

// export const TryCatch = () => () => {}; // this is returning a function
export const TryCatch =
  (func: ControllerType) =>
  (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(func(req, res, next)).catch(next);
  };
