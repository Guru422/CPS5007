import express from "express";
import cors from "cors";
import { config } from "./shared/config/env";
import { healthModule } from "./modules/health/health.module";
import { authModule } from "./modules/auth/auth.module";
import { studentModule } from "./modules/student/student.module";
import { notFoundHandler } from "./shared/middleware/not-found.middleware";
import { errorHandler } from "./shared/middleware/error.middleware";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: [config.webBaseUrl, "http://localhost:5173"],
      credentials: false,
    }),
  );
  app.use(express.json());

  app.use(healthModule.basePath, healthModule.router);

  app.use(authModule.basePath, authModule.router);
  app.use("/auth", authModule.router);
  app.use(studentModule.basePath, studentModule.router);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
