import { Router } from "express";
import { AuthController } from "./auth.controller";

export function createAuthRouter(authController: AuthController, options?: { allowSimpleAuth?: boolean }) {
  const router = Router();

  router.post("/signup-request", authController.signupRequest);
  router.get("/verify-signup", authController.verifySignup);
  router.post("/login", authController.login);

  if (options?.allowSimpleAuth) {
    router.post("/demo-session", authController.demoSession);
  }

  return router;
}
