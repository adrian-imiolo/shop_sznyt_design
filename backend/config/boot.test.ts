/**
 * Integration coverage for the boot guard (issue #143): the pure invariant
 * table is unit-tested in bootEnv.test.ts, so what's left is the wiring —
 * that a broken invariant actually kills the process and prints something the
 * operator can act on, and that demo mode still comes up.
 *
 * The child inherits the developer's .env, so every variable this test cares
 * about is passed explicitly. Empty string counts as unset for both dotenv
 * (it won't overwrite a defined key) and the guard itself.
 */
import { describe, it, expect } from "vitest";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const backendDir = fileURLToPath(new URL("..", import.meta.url));
// Run tsx's CLI on this Node directly: going through `npx` needs a shell, and
// a shell on Windows swallows the kill signal, orphaning the server.
const tsxCli = createRequire(import.meta.url).resolve("tsx/cli");

interface BootResult {
  exitCode: number | null;
  output: string;
}

/**
 * Boots index.js, and resolves once it either exits or prints its ready
 * banner — a booting server never exits on its own, so it's killed instead.
 */
function boot(env: Record<string, string>, readyMarker = "Backend on"): Promise<BootResult> {
  return new Promise(function runBoot(resolve, reject) {
    const child = spawn(process.execPath, [tsxCli, "index.js"], {
      cwd: backendDir,
      env: { ...process.env, ...env },
    });

    let output = "";
    function collect(chunk: Buffer) {
      output += chunk.toString();
      // A server that came up never exits — take the banner as the result.
      if (output.includes(readyMarker)) {
        child.kill();
        resolve({ exitCode: null, output });
      }
    }

    child.stdout.on("data", collect);
    child.stderr.on("data", collect);
    child.on("error", reject);
    child.on("close", (exitCode) => resolve({ exitCode, output }));
  });
}

// tsx cold-starts, so give each boot room on a slow machine.
const BOOT_TIMEOUT_MS = 60_000;

describe("backend boot", () => {
  it(
    "refuses to start when SMTP is configured without a recipient",
    async () => {
      const { exitCode, output } = await boot({
        SMTP_HOST: "smtp.example.com",
        CONTACT_RECIPIENT: "",
        STRIPE_SECRET_KEY: "",
        PORT: "0",
      });

      expect(exitCode).toBe(1);
      expect(output).toContain("FATAL");
      expect(output).toContain("CONTACT_RECIPIENT");
      expect(output).not.toContain("Backend on");
    },
    BOOT_TIMEOUT_MS,
  );

  it(
    "starts in demo mode with no SMTP host and no recipient",
    async () => {
      const { output } = await boot({
        SMTP_HOST: "",
        CONTACT_RECIPIENT: "",
        STRIPE_SECRET_KEY: "",
        PORT: "0",
      });

      expect(output).toContain("[DEMO MODE]");
      expect(output).not.toContain("FATAL");
    },
    BOOT_TIMEOUT_MS,
  );
});
