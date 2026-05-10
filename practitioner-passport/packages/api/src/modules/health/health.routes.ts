import { Router } from "express";
import { HealthController } from "./health.controller";

export function createHealthRouter(healthController: HealthController) {
  const router = Router();
  router.get("/", healthController.getHealth);
  return router;
}
