import dns from "node:dns";
import net from "node:net";
import { parseIntoClientConfig } from "pg-connection-string";
import { Pool, PoolConfig, QueryResult, QueryResultRow } from "pg";

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('student', 'mentor', 'teacher')),
  student_id TEXT,
  password_hash TEXT,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS pending_signups (
  token TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'mentor', 'teacher')),
  student_id TEXT,
  password_hash TEXT NOT NULL,
  web_base_url TEXT,
  created_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS student_competencies (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  attributes JSONB NOT NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS student_qualifications (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  organisation TEXT NOT NULL,
  year TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS student_development_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill TEXT NOT NULL,
  description TEXT NOT NULL,
  development_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS student_placements (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  organisation TEXT NOT NULL,
  location TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Internship', 'Part Time', 'Full Time', 'Work Experience')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Pending', 'Approved', 'Rejected')),
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS student_ai_cv_generations (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_role TEXT NOT NULL,
  tone TEXT NOT NULL CHECK (tone IN ('Professional', 'Academic', 'Creative')),
  include_qualifications BOOLEAN NOT NULL DEFAULT TRUE,
  include_development BOOLEAN NOT NULL DEFAULT TRUE,
  include_placements BOOLEAN NOT NULL DEFAULT TRUE,
  cv_preview JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_conversations (
  id BIGSERIAL PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New conversation',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id BIGSERIAL PRIMARY KEY,
  conversation_id BIGINT NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pending_signups_email ON pending_signups(email);
CREATE INDEX IF NOT EXISTS idx_pending_signups_expires_at ON pending_signups(expires_at);
CREATE INDEX IF NOT EXISTS idx_student_competencies_user_id ON student_competencies(user_id);
CREATE INDEX IF NOT EXISTS idx_student_qualifications_user_id ON student_qualifications(user_id);
CREATE INDEX IF NOT EXISTS idx_student_development_logs_user_id ON student_development_logs(user_id);
ALTER TABLE student_development_logs ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'Technical';
CREATE INDEX IF NOT EXISTS idx_student_placements_user_id ON student_placements(user_id);
CREATE INDEX IF NOT EXISTS idx_student_ai_cv_generations_user_id ON student_ai_cv_generations(user_id);
ALTER TABLE student_ai_cv_generations ADD COLUMN IF NOT EXISTS submitted_to_teacher BOOLEAN NOT NULL DEFAULT FALSE;
CREATE INDEX IF NOT EXISTS idx_chat_conversations_student ON chat_conversations(student_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_teacher ON chat_conversations(teacher_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON chat_messages(sender_id);
ALTER TABLE users ALTER COLUMN verified_at DROP NOT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE pending_signups ADD COLUMN IF NOT EXISTS password_hash TEXT;
`;

function isLocalConnection(connectionString: string, host: string): boolean {
  const lower = connectionString.toLowerCase();
  return (
    host === "localhost" ||
    host === "::1" ||
    net.isIPv4(host) ||
    lower.includes("localhost") ||
    lower.includes("127.0.0.1") ||
    lower.includes("sslmode=disable")
  );
}

/** Prefer direct A-record lookup; `dns.lookup(..., family: 4)` can still yield IPv6 on some stacks. */
async function resolveIpv4Literal(dnsName: string): Promise<string | null> {
  const host = dnsName.trim();
  if (!host || host.startsWith("/") || net.isIPv4(host)) {
    return net.isIPv4(host) ? host : null;
  }
  try {
    const addrs = await dns.promises.resolve4(host);
    for (const a of addrs) {
      if (net.isIPv4(a)) return a;
    }
  } catch {
    // No A records or NXDOMAIN — try lookup next
  }
  try {
    const { address } = await dns.promises.lookup(host, { family: 4 });
    return net.isIPv4(address) ? address : null;
  } catch {
    return null;
  }
}

function attachIpv4Socket(
  poolConfig: PoolConfig,
  originalDnsName: string,
  ipv4: string,
): PoolConfig {
  const baseSsl = poolConfig.ssl;
  const ssl: NonNullable<PoolConfig["ssl"]> =
    typeof baseSsl === "object" && baseSsl !== null
      ? { ...baseSsl, servername: originalDnsName }
      : { rejectUnauthorized: false as const, servername: originalDnsName };
  return { ...poolConfig, host: ipv4, ssl };
}

/** Supavisor shared pooler hostnames already expose IPv4; connecting by resolved IP can break TLS/SNI or pooler routing. */
function isSupabaseSharedPoolerHost(hostname: string): boolean {
  return hostname.includes("pooler.supabase.com");
}

/** Resolve DB hostname to IPv4 literal so `pg` connects by IP (avoids Node choosing an unreachable IPv6). */
async function buildPoolConfig(connectionString: string): Promise<PoolConfig> {
  const parsed = parseIntoClientConfig(connectionString) as PoolConfig;
  const host = parsed.host ?? "";
  let poolConfig: PoolConfig = { ...parsed };

  if (isLocalConnection(connectionString, host)) {
    return poolConfig;
  }

  poolConfig = {
    ...poolConfig,
    ssl: (() => {
      if (parsed.ssl === true) {
        return { rejectUnauthorized: false as const };
      }
      if (typeof parsed.ssl === "object" && parsed.ssl !== null) {
        return { ...parsed.ssl, rejectUnauthorized: false as const };
      }
      return { rejectUnauthorized: false as const };
    })(),
  };

  if (process.env.DATABASE_FORCE_IPV4 === "0") {
    return poolConfig;
  }

  // Do not rewrite pooler hosts to raw IPv4 — keep hostname for correct pooler behaviour.
  if (isSupabaseSharedPoolerHost(host)) {
    return poolConfig;
  }

  const manualIpv4 = process.env.DATABASE_HOST_IPV4?.trim();
  if (host && manualIpv4 && net.isIPv4(manualIpv4)) {
    return attachIpv4Socket(poolConfig, host, manualIpv4);
  }

  if (host && !net.isIPv4(host) && !host.startsWith("/")) {
    const ipv4 = await resolveIpv4Literal(host);
    if (ipv4) {
      poolConfig = attachIpv4Socket(poolConfig, host, ipv4);
    } else {
      console.warn(
        `[DATABASE] No IPv4 (A record) for "${host}" — connections may use IPv6 and hit ENETUNREACH on IPv4-only networks.\n` +
          `Prefer Supabase → Database → Transaction pooler URI (*.pooler.supabase.com:6543), not direct db.*:5432, unless you use IPv6 or dedicated IPv4.`,
      );
    }
  }

  return poolConfig;
}

export class PostgresService {
  private pool: Pool | null = null;

  async initialize(connectionString: string): Promise<void> {
    if (!connectionString) {
      throw new Error("DATABASE_URL is required.");
    }
    if (this.pool) {
      return;
    }
    const poolConfig = await buildPoolConfig(connectionString);
    this.pool = new Pool(poolConfig);
  }

  private requirePool(): Pool {
    if (!this.pool) {
      throw new Error("PostgresService.initialize() must be called before use.");
    }
    return this.pool;
  }

  async query<T extends QueryResultRow = QueryResultRow>(
    text: string,
    params: unknown[] = [],
  ): Promise<QueryResult<T>> {
    return this.requirePool().query<T>(text, params);
  }

  async initSchema(): Promise<void> {
    await this.query(SCHEMA_SQL);
  }

  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
  }
}

export const postgresService = new PostgresService();
