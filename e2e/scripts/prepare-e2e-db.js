/**
 * Reset the dedicated e2e database before the backend boots: create it if
 * missing, apply migrations, wipe order/contact data, reseed products.
 * Chained ahead of the server in the Playwright webServer command (servers
 * start before globalSetup, so the reset can't live there).
 *
 * Runs with cwd = backend/ and DATABASE_URL already pointing at the e2e
 * database (both set by playwright.config.ts).
 */
import { spawnSync } from "node:child_process";
import pg from "pg";

const e2eUrl = process.env.DATABASE_URL;
if (!e2eUrl || !new URL(e2eUrl).pathname.endsWith("_e2e")) {
  console.error(
    `Refusing to reset: DATABASE_URL must name a database ending in "_e2e" (got ${e2eUrl ? new URL(e2eUrl).pathname : "nothing"}).`,
  );
  process.exit(1);
}

const dbName = new URL(e2eUrl).pathname.slice(1);

// CREATE DATABASE can't run inside the target DB — connect to the
// server's maintenance database instead.
const adminUrl = new URL(e2eUrl);
adminUrl.pathname = "/postgres";

const admin = new pg.Client({ connectionString: adminUrl.toString() });
await admin.connect();
try {
  await admin.query(`CREATE DATABASE "${dbName}"`);
  console.log(`[e2e] Created database ${dbName}`);
} catch (err) {
  if (err.code !== "42P04") throw err; // 42P04 = already exists
} finally {
  await admin.end();
}

function run(command, args) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: true,
    env: { ...process.env, DATABASE_URL: e2eUrl },
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

run("npx", ["prisma", "migrate", "deploy"]);

// Seed only resets products — clear the order side too, so per-run
// assertions like "stock went from 10 to 9" and "one order exists" hold.
const db = new pg.Client({ connectionString: e2eUrl });
await db.connect();
try {
  await db.query('TRUNCATE "OrderItem", "Order", "ContactMessage" RESTART IDENTITY CASCADE');
} finally {
  await db.end();
}

run("npx", ["tsx", "seed.js"]);

console.log(`[e2e] Database ${dbName} reset and seeded`);
