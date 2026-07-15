/**
 * Shared supertest harness for the DB-backed suite (issue #115). One call
 * per test file replaces the copy-pasted beforeAll/afterAll/beforeEach +
 * buildApp block: it owns the Prisma client lifecycle, resets commerce
 * state between cases, and builds apps with the standard fakes injected.
 */
import { beforeAll, afterAll, beforeEach } from "vitest";
import type { PrismaClient } from "../generated/prisma/client.js";
import { createTestPrisma, truncateCommerceTables } from "./db.ts";
import { createApp } from "../app.js";
import { fakeAuth, fakeStripe, captureMailer, type FakeAuthOptions } from "./fakes.ts";

export interface HarnessOptions {
  /** process.env entries the routes under test read (set in beforeAll). */
  env?: Record<string, string>;
}

export interface AppOverrides {
  /** Replace the default fakeStripe() — e.g. real signature verification, or null for demo mode. */
  stripe?: object | null;
}

export function useAppHarness({ env = {} }: HarnessOptions = {}) {
  let prisma: PrismaClient;

  beforeAll(() => {
    Object.assign(process.env, env);
    prisma = createTestPrisma();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await truncateCommerceTables(prisma);
  });

  /** App impersonating `auth` (default anonymous), with a fresh capture mailer. */
  function appAs(auth: FakeAuthOptions = {}, overrides: AppOverrides = {}) {
    const mailer = captureMailer();
    const app = createApp({
      auth: fakeAuth(auth),
      stripe: overrides.stripe === undefined ? fakeStripe() : overrides.stripe,
      mailer,
      prisma,
    });
    return { app, mailer };
  }

  return {
    // prisma exists only after beforeAll — a getter keeps call sites plain
    // (`harness.prisma`) without capturing the pre-init value.
    get prisma() {
      return prisma;
    },
    appAs,
  };
}
