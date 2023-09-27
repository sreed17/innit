import { Response, Request, NextFunction } from "express";
import { log } from "../models/transactions";
import { StatusCodes, getReasonPhrase } from "http-status-codes";

export class CustomError extends Error {
  statusCode: number = 500;
  constructor(message: string, statusCode: number = 500) {
    super(`[${getReasonPhrase(statusCode)}]:${message}`);
    if (statusCode) this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function customErrorHandler(
  err: Error | CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  let statusCode: number = 500;
  if (err instanceof CustomError) statusCode = err.statusCode;
  if (statusCode >= 500 && statusCode < 600) {
    // Server Error
    log(statusCode, err.message, JSON.stringify(err))
      .then(() => {
        res.status(statusCode).json({ message: err.message });
      })
      .catch();
  } else {
    // Client Error
    res.status(statusCode).json({ message: err.message });
  }
}

// Default handler function that respond with json
export function rh(func: (req: Request) => any) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = func(req);
      const isPromise =
        typeof result.then === "function" && typeof result.catch === "function";
      if (isPromise) {
        result
          .then(
            ({
              statusCode,
              payload,
            }: {
              statusCode?: number;
              payload: any;
            }) => {
              res.status(statusCode ?? StatusCodes.OK).json(payload);
            }
          )
          .catch((err: any) => next(err));
      } else {
        const statusCode = result.statusCode ?? StatusCodes.OK;
        res.status(statusCode).json(result);
      }
    } catch (err) {
      next(err);
    }
  };
}
