import crypto from "node:crypto";
import { compare, hash } from "bcryptjs";
import { config } from "../../shared/config/env";
import { ROLES } from "../../shared/constants/auth.constants";
import { HttpError } from "../../shared/errors/http.error";
import { AuthenticatedUserPayload, PendingSignupEntity, Role, UserEntity } from "../../shared/types/auth.types";
import { normalizeEmail } from "../../shared/utils/string.util";
import { MailService } from "../mail/mail.service";
import { IAuthRepository } from "./auth.repository.interface";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type SignupRequestPayload = {
  fullName?: unknown;
  email?: unknown;
  role?: unknown;
  studentId?: unknown;
  password?: unknown;
  confirmPassword?: unknown;
  webBaseUrl?: unknown;
};

type LoginPayload = {
  email?: unknown;
  password?: unknown;
};

type SignupResult = {
  message: string;
  previewUrl: string | false | null;
};

export class AuthService {
  private authRepository: IAuthRepository;
  private mailService: MailService;
  private demoAuthHash: Promise<string> | null = null;

  constructor(authRepository: IAuthRepository, mailService: MailService) {
    this.authRepository = authRepository;
    this.mailService = mailService;
  }

  private getDemoAuthHash(): Promise<string> {
    if (!this.demoAuthHash) {
      this.demoAuthHash = hash("pp-demo-session-not-for-production", 8);
    }
    return this.demoAuthHash;
  }

  private validateSignupPayload(payload: SignupRequestPayload) {
    const fullName = String(payload?.fullName || "").trim();
    const email = normalizeEmail(payload?.email);
    const role = String(payload?.role || "").trim() as Role;
    const studentId = String(payload?.studentId || "").trim();
    const password = String(payload?.password || "");
    const confirmPassword = String(payload?.confirmPassword || "");
    const webBaseUrl = String(payload?.webBaseUrl || "").trim();

    if (!fullName || !email || !ROLES.has(role)) {
      throw new HttpError(400, "fullName, email and valid role are required.");
    }
    if (role === "student" && !studentId) {
      throw new HttpError(400, "studentId is required for student role.");
    }
    if (!password || !confirmPassword) {
      throw new HttpError(400, "password and confirmPassword are required.");
    }
    if (password !== confirmPassword) {
      throw new HttpError(400, "password and confirmPassword must match.");
    }
    const passwordPolicy = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!passwordPolicy.test(password)) {
      throw new HttpError(
        400,
        "Password must be at least 8 characters and include one uppercase letter, one number, and one special character.",
      );
    }

    return { fullName, email, role, studentId, password, webBaseUrl };
  }

  private buildUserPayload(user: UserEntity): AuthenticatedUserPayload {
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      studentId: user.studentId || "",
      isAuthenticated: true,
    };
  }

  async requestSignupVerification(payload: SignupRequestPayload): Promise<SignupResult> {
    const { fullName, email, role, studentId, password, webBaseUrl } = this.validateSignupPayload(payload);

    const existingUser = await this.authRepository.findUserByEmail(email);
    if (existingUser?.verifiedAt) {
      throw new HttpError(409, "An account with this email already exists.");
    }

    const token = crypto.randomBytes(32).toString("hex");
    const now = Date.now();
    const expiresAt = new Date(now + 24 * 60 * 60 * 1000).toISOString();

    const passwordHash = await hash(password, 12);
    const pendingSignup: PendingSignupEntity = {
      token,
      fullName,
      email,
      role,
      studentId,
      passwordHash,
      webBaseUrl,
      createdAt: new Date(now).toISOString(),
      expiresAt,
    };
    await this.authRepository.saveOrUpdateUnverifiedUser(pendingSignup);
    await this.authRepository.savePendingSignup(pendingSignup);

    const verifyUrl = `${config.apiBaseUrl}/bff/auth/verify-signup?token=${encodeURIComponent(token)}`;
    const { previewUrl } = await this.mailService.sendSignupVerification({
      fullName,
      email,
      verifyUrl,
    });

    return {
      message: "Verification email sent. Please check your inbox.",
      previewUrl,
    };
  }

  async verifySignup(token: string): Promise<PendingSignupEntity> {
    if (!token) {
      throw new HttpError(400, "Invalid verification link.");
    }

    const pending = await this.authRepository.findPendingSignupByToken(token);
    if (!pending) {
      throw new HttpError(400, "Verification link is invalid or already used.");
    }

    if (new Date(pending.expiresAt).getTime() < Date.now()) {
      await this.authRepository.removePendingSignupByToken(token);
      throw new HttpError(400, "Verification link has expired.");
    }

    const verifiedEntry = await this.authRepository.verifySignupByToken(token);
    if (!verifiedEntry) {
      throw new HttpError(400, "Verification link is invalid or already used.");
    }

    return verifiedEntry;
  }

  /**
   * Upserts a verified user row so client-generated UUIDs (demo / simplified UI) can call student APIs.
   * Only exposed when ALLOW_SIMPLE_AUTH=true.
   */
  async demoSession(payload: Record<string, unknown>): Promise<{ user: AuthenticatedUserPayload }> {
    const id = String(payload?.id || "").trim();
    if (!UUID_RE.test(id)) {
      throw new HttpError(400, "Valid id (UUID) is required.");
    }
    const fullName = String(payload?.fullName || "").trim();
    const role = String(payload?.role || "").trim() as Role;
    if (!fullName || !ROLES.has(role)) {
      throw new HttpError(400, "fullName and valid role are required.");
    }
    const studentId = String(payload?.studentId || "").trim();
    let email = normalizeEmail(payload?.email);
    if (!email) {
      email = `${id.replace(/-/g, "")}@demo-session.practitioner-passport.local`;
    }
    const passwordHash = await this.getDemoAuthHash();
    const user = await this.authRepository.upsertDemoSessionUser({
      id,
      fullName,
      email,
      role,
      studentId: role === "student" ? studentId || null : null,
      passwordHash,
    });
    return { user: this.buildUserPayload(user) };
  }

  async login(payload: LoginPayload): Promise<{ user: AuthenticatedUserPayload }> {
    const email = normalizeEmail(payload?.email);
    const password = String(payload?.password || "");
    if (!email) {
      throw new HttpError(400, "Email is required.");
    }
    if (!password) {
      throw new HttpError(400, "Password is required.");
    }

    const user = await this.authRepository.findUserByEmail(email);
    if (!user?.verifiedAt || !user.passwordHash) {
      throw new HttpError(404, "No verified account found. Please sign up and verify your email first.");
    }
    const isMatch = await compare(password, user.passwordHash);
    if (!isMatch) {
      throw new HttpError(401, "Invalid email or password.");
    }

    return { user: this.buildUserPayload(user) };
  }
}
