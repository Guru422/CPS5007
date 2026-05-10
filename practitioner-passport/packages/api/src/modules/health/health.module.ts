import { HealthController } from "./health.controller";
import { createHealthRouter } from "./health.routes";

const healthController = new HealthController();
const router = createHealthRouter(healthController);

export const healthModule = {
  basePath: "/health",
  router,
};
