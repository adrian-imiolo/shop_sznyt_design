import pg from "pg";
import { E2E_DATABASE_URL } from "./env";

/**
 * One-shot query against the e2e database. A fresh connection per call is
 * plenty for a handful of assertions and avoids pool lifecycle management
 * across Playwright workers.
 */
export async function queryE2e<Row>(text: string, params: unknown[] = []): Promise<Row[]> {
  const client = new pg.Client({ connectionString: E2E_DATABASE_URL });
  await client.connect();
  try {
    const result = await client.query(text, params);
    return result.rows as Row[];
  } finally {
    await client.end();
  }
}
