import http from "http";
import { createApp } from "./app";
import { config } from "./shared/config/env";
import { postgresService } from "./infrastructure/database/postgres.service";
import { initSocket } from "./infrastructure/socket/socket.service";

async function bootstrap() {
  await postgresService.initialize(config.databaseUrl);
  await postgresService.initSchema();

  const app = createApp();
  const server = http.createServer(app);
  initSocket(server);

  server.listen(config.port, () => {
    console.log(`API running at ${config.apiBaseUrl}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start API", error);
  const msg = String((error as Error)?.message || error);
  if (msg.includes("tenant/user postgres.") && msg.includes("not found")) {
    console.error(
      "\nDatabase connection rejected (often Supabase): the project ref in DATABASE_URL is invalid or the project was removed/paused.\n" +
        "Fix: open Supabase → Project Settings → Database → copy a fresh connection URI into packages/api/.env as DATABASE_URL,\n" +
        "or use local Postgres, e.g. DATABASE_URL=postgresql://postgres:postgres@localhost:5432/practitioner_passport\n",
    );
  }
  if (msg.includes("ENETUNREACH") && (msg.includes(":") || /240[0-9a-f:]{4,}/i.test(msg))) {
    console.error(
      "\nConnecting over IPv6 failed (ENETUNREACH). Supabase `db.<ref>.supabase.co` (direct, port 5432) often has IPv6-only DNS.\n" +
        "Fix (recommended): Supabase Dashboard → Project Settings → Database → copy the Transaction pooler URI (host like `*.pooler.supabase.com`, port 6543) into DATABASE_URL.\n" +
        "Alternatively: Dedicated IPv4 add-on, working IPv6 on this network, or local Postgres.\n",
    );
  }
  if (msg.includes("password authentication failed")) {
    console.error(
      "\nPostgreSQL rejected the password (28P01). Update DATABASE_URL in packages/api/.env:\n" +
        "• Use the database password from Supabase → Project Settings → Database (reset if unsure).\n" +
        "• Pool user looks like postgres.<project_ref>; encode any @ in the password as %40.\n",
    );
  }
  process.exit(1);
});
