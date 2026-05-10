import dns from "node:dns";
import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

// Prefer IPv4 when resolving DATABASE_URL hostnames (many networks have no IPv6 route; pg would then fail with ENETUNREACH).
dns.setDefaultResultOrder("ipv4first");

/** Prefer cwd (when running `npm run dev` from packages/api), then monorepo root path. */
const envCandidates = [
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), "packages/api/.env"),
  path.resolve(__dirname, "../../../.env"),
];
for (const envPath of envCandidates) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    break;
  }
}

const port = Number(process.env.PORT || 4000);

export const config = {
  port,
  apiBaseUrl: process.env.API_BASE_URL || `http://localhost:${port}`,
  webBaseUrl: process.env.WEB_BASE_URL || "http://localhost:5173",
  /** When true, exposes POST /bff/auth/demo-session to upsert a verified user by client id (local/demo only). */
  allowSimpleAuth: process.env.ALLOW_SIMPLE_AUTH === "true",
  databaseUrl: process.env.DATABASE_URL || "",
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  geminiModel: process.env.GEMINI_MODEL || "gemini-2.0-flash",
  mailFrom: process.env.MAIL_FROM || "Practitioner Passport <no-reply@practitioner-passport.local>",
  smtpHost: process.env.SMTP_HOST,
  smtpPort: Number(process.env.SMTP_PORT || 0),
  smtpUser: process.env.SMTP_USER,
  smtpPass: process.env.SMTP_PASS,
};
