import { ErrorRequestHandler } from "express";
import { HttpError } from "../errors/http.error";

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof HttpError) {
    return res.status(error.statusCode).json({ error: error.message });
  }

  console.error("Unhandled error", error);
  return res.status(500).json({ error: "Internal server error." });
};
