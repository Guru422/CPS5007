import { Request, Response, NextFunction } from "express";
import { config } from "../../shared/config/env";
import { HttpError } from "../../shared/errors/http.error";
import { AuthService } from "./auth.service";

export class AuthController {
  private authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  signupRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.authService.requestSignupVerification(req.body);
      return res.json(result);
    } catch (error) {
      return next(error);
    }
  };

  verifySignup = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = String(req.query?.token || "");
      const entry = await this.authService.verifySignup(token);
      const targetWebBase =
        entry.webBaseUrl && /^https?:\/\//.test(entry.webBaseUrl) ? entry.webBaseUrl : config.webBaseUrl;
      const redirectUrl = `${targetWebBase}/login?verified=1&email=${encodeURIComponent(entry.email)}`;
      return res.redirect(302, redirectUrl);
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).send(error.message);
      }
      return next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.authService.login(req.body);
      return res.json(result);
    } catch (error) {
      return next(error);
    }
  };

  demoSession = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.authService.demoSession(req.body);
      return res.json(result);
    } catch (error) {
      return next(error);
    }
  };
}
