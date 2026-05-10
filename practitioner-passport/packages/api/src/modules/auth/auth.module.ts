import { postgresService } from "../../infrastructure/database/postgres.service";
import { config } from "../../shared/config/env";
import { MailService } from "../mail/mail.service";
import { AuthRepository } from "./auth.repository";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { createAuthRouter } from "./auth.routes";

const authRepository = new AuthRepository(postgresService);
const mailService = new MailService();
const authService = new AuthService(authRepository, mailService);
const authController = new AuthController(authService);
const router = createAuthRouter(authController, { allowSimpleAuth: config.allowSimpleAuth });

export const authModule = {
  basePath: "/bff/auth",
  router,
};
