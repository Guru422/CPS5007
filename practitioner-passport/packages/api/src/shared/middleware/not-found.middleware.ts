import { RequestHandler } from "express";

export const notFoundHandler: RequestHandler = (_req, res) => {
  return res.status(404).json({ error: "Route not found." });
};
