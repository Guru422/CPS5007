import crypto from "node:crypto";
import { PostgresService } from "../../infrastructure/database/postgres.service";
import { PendingSignupEntity, UserEntity } from "../../shared/types/auth.types";
import { IAuthRepository } from "./auth.repository.interface";

type UserRow = {
  id: string;
  full_name: string;
  email: string;
  role: "student" | "mentor" | "teacher";
  student_id: string | null;
  password_hash: string | null;
  verified_at: Date | string | null;
  created_at: Date | string;
};

type PendingSignupRow = {
  token: string;
  full_name: string;
  email: string;
  role: "student" | "mentor" | "teacher";
  student_id: string | null;
  password_hash: string;
  web_base_url: string | null;
  created_at: Date | string;
  expires_at: Date | string;
};

export class AuthRepository implements IAuthRepository {
  private db: PostgresService;

  constructor(db: PostgresService) {
    this.db = db;
  }

  private mapUser(row: UserRow): UserEntity {
    return {
      id: row.id,
      fullName: row.full_name,
      email: row.email,
      role: row.role,
      studentId: row.student_id || undefined,
      passwordHash: row.password_hash || undefined,
      verifiedAt: row.verified_at ? new Date(row.verified_at).toISOString() : undefined,
      createdAt: new Date(row.created_at).toISOString(),
    };
  }

  private mapPendingSignup(row: PendingSignupRow): PendingSignupEntity {
    return {
      token: row.token,
      fullName: row.full_name,
      email: row.email,
      role: row.role,
      studentId: row.student_id || undefined,
      passwordHash: row.password_hash,
      webBaseUrl: row.web_base_url || undefined,
      createdAt: new Date(row.created_at).toISOString(),
      expiresAt: new Date(row.expires_at).toISOString(),
    };
  }

  async findUserByEmail(email: string): Promise<UserEntity | null> {
    const { rows } = await this.db.query<UserRow>(
      `SELECT id, full_name, email, role, student_id, password_hash, verified_at, created_at
       FROM users
       WHERE email = $1
       LIMIT 1`,
      [email],
    );
    if (!rows[0]) {
      return null;
    }
    return this.mapUser(rows[0]);
  }

  async savePendingSignup(entry: PendingSignupEntity): Promise<void> {
    await this.db.query("DELETE FROM pending_signups WHERE email = $1", [entry.email]);
    await this.db.query(
      `INSERT INTO pending_signups (
        token, full_name, email, role, student_id, password_hash, web_base_url, created_at, expires_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::timestamptz, $9::timestamptz)`,
      [
        entry.token,
        entry.fullName,
        entry.email,
        entry.role,
        entry.studentId || null,
        entry.passwordHash || "",
        entry.webBaseUrl || null,
        entry.createdAt,
        entry.expiresAt,
      ],
    );
  }

  async saveOrUpdateUnverifiedUser(entry: PendingSignupEntity): Promise<void> {
    const existing = await this.findUserByEmail(entry.email);
    if (!existing) {
      await this.db.query(
        `INSERT INTO users (
          id, full_name, email, role, student_id, password_hash, verified_at, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, NULL, $7::timestamptz)`,
        [
          crypto.randomUUID(),
          entry.fullName,
          entry.email,
          entry.role,
          entry.studentId || null,
          entry.passwordHash || "",
          entry.createdAt,
        ],
      );
      return;
    }

    if (existing.verifiedAt) {
      return;
    }

    await this.db.query(
      `UPDATE users
       SET full_name = $2,
           role = $3,
           student_id = $4,
           password_hash = $5
       WHERE email = $1 AND verified_at IS NULL`,
      [entry.email, entry.fullName, entry.role, entry.studentId || null, entry.passwordHash || ""],
    );
  }

  async findPendingSignupByToken(token: string): Promise<PendingSignupEntity | null> {
    const { rows } = await this.db.query<PendingSignupRow>(
      `SELECT token, full_name, email, role, student_id, password_hash, web_base_url, created_at, expires_at
       FROM pending_signups
       WHERE token = $1
       LIMIT 1`,
      [token],
    );
    if (!rows[0]) {
      return null;
    }
    return this.mapPendingSignup(rows[0]);
  }

  async removePendingSignupByToken(token: string): Promise<void> {
    await this.db.query("DELETE FROM pending_signups WHERE token = $1", [token]);
  }

  async upsertDemoSessionUser(entry: {
    id: string;
    fullName: string;
    email: string;
    role: UserRow["role"];
    studentId: string | null;
    passwordHash: string;
  }): Promise<UserEntity> {
    const nowIso = new Date().toISOString();
    const { rows } = await this.db.query<UserRow>(
      `INSERT INTO users (id, full_name, email, role, student_id, password_hash, verified_at, created_at)
       VALUES ($1::uuid, $2, $3, $4, $5, $6, $7::timestamptz, $7::timestamptz)
       ON CONFLICT (id) DO UPDATE SET
         full_name = EXCLUDED.full_name,
         email = EXCLUDED.email,
         role = EXCLUDED.role,
         student_id = EXCLUDED.student_id,
         verified_at = COALESCE(users.verified_at, EXCLUDED.verified_at),
         password_hash = COALESCE(NULLIF(users.password_hash, ''), EXCLUDED.password_hash)
       RETURNING id, full_name, email, role, student_id, password_hash, verified_at, created_at`,
      [entry.id, entry.fullName, entry.email, entry.role, entry.studentId, entry.passwordHash, nowIso],
    );
    return this.mapUser(rows[0]);
  }

  async verifySignupByToken(token: string): Promise<PendingSignupEntity | null> {
    const pending = await this.findPendingSignupByToken(token);
    if (!pending) {
      return null;
    }

    const nowIso = new Date().toISOString();
    await this.db.query(
      `INSERT INTO users (
        id, full_name, email, role, student_id, password_hash, verified_at, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7::timestamptz, $8::timestamptz)
      ON CONFLICT (email) DO UPDATE
      SET full_name = EXCLUDED.full_name,
          role = EXCLUDED.role,
          student_id = EXCLUDED.student_id,
          password_hash = EXCLUDED.password_hash,
          verified_at = EXCLUDED.verified_at`,
      [
        crypto.randomUUID(),
        pending.fullName,
        pending.email,
        pending.role,
        pending.studentId || null,
        pending.passwordHash || "",
        nowIso,
        nowIso,
      ],
    );

    await this.removePendingSignupByToken(token);
    return pending;
  }
}
