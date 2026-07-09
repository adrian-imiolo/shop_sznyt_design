/**
 * One-time setup for the DB-backed test suite (`npm run test:db`):
 * creates the test database if missing and applies migrations to it.
 */
import "dotenv/config";
import { spawnSync } from "node:child_process";
import pg from "pg";
import { resolveTestDatabaseUrl } from "./test-db-url.js";

const testUrl = resolveTestDatabaseUrl();
const url = new URL(testUrl);
const dbName = url.pathname.slice(1);

// CREATE DATABASE can't run inside the target DB — connect to the
// server's maintenance database instead.
const adminUrl = new URL(testUrl);
adminUrl.pathname = "/postgres";

const client = new pg.Client({ connectionString: adminUrl.toString() });
await client.connect();
try {
  await client.query(`CREATE DATABASE "${dbName}"`);
  console.log(`Created test database ${dbName}`);
} catch (err) {
  if (err.code !== "42P04") throw err; // 42P04 = already exists
  console.log(`Test database ${dbName} already exists`);
} finally {
  await client.end();
}

// prisma.config.ts reads DATABASE_URL; dotenv won't override a var that's
// already set, so this env override wins.
const result = spawnSync("npx", ["prisma", "migrate", "deploy"], {
  stdio: "inherit",
  shell: true,
  env: { ...process.env, DATABASE_URL: testUrl },
});
process.exit(result.status ?? 1);
