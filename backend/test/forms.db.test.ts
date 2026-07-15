/**
 * Integration tests for the public form routes (issue #108): contact,
 * return (zwrot), and complaint (reklamacja). These are the only routes that
 * send mail on anonymous input, so the coverage centers on the guardrails —
 * field validation and the honeypot — plus the capture-mailer contract.
 */
import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { useAppHarness } from "./harness.ts";

const harness = useAppHarness({ env: { CONTACT_RECIPIENT: "sklep@test.local" } });

// contact messages aren't commerce state, so the shared truncate skips them
beforeEach(async () => {
  await harness.prisma.contactMessage.deleteMany();
});

const buildApp = () => harness.appAs();

describe("POST /contact", () => {
  const validBody = {
    name: "Jan Kowalski",
    email: "jan@example.com",
    message: "Czy rama 30×40 jest dostępna od ręki?",
  };

  it("rejects a submission with missing fields (400)", async () => {
    const { app, mailer } = buildApp();

    const res = await request(app).post("/contact").send({ name: "Jan" });

    expect(res.status).toBe(400);
    expect(mailer.sent).toHaveLength(0);
  });

  it("silently swallows honeypot submissions — no message stored, no email", async () => {
    const { app, mailer } = buildApp();

    const res = await request(app)
      .post("/contact")
      .send({ ...validBody, _hp: "bot-filled-this" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
    expect(mailer.sent).toHaveLength(0);
    expect(await harness.prisma.contactMessage.count()).toBe(0);
  });

  it("stores the message and notifies the shop with reply-to set to the sender", async () => {
    const { app, mailer } = buildApp();

    const res = await request(app).post("/contact").send(validBody);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject(validBody);

    expect(mailer.sent).toHaveLength(1);
    expect(mailer.sent[0].to).toBe("sklep@test.local");
    expect(mailer.sent[0].replyTo).toBe("jan@example.com");
    expect(mailer.sent[0].html).toContain(validBody.message);
  });
});

describe("POST /zwrot", () => {
  const validBody = {
    orderNumber: "17",
    name: "Jan Kowalski",
    email: "jan@example.com",
    reason: "Rama nie pasuje do wnętrza",
    bankAccount: "PL61109010140000071219812874",
  };

  it("rejects a submission with missing fields (400)", async () => {
    const { app, mailer } = buildApp();

    const res = await request(app)
      .post("/zwrot")
      .send({ ...validBody, bankAccount: undefined });

    expect(res.status).toBe(400);
    expect(mailer.sent).toHaveLength(0);
  });

  it("silently swallows honeypot submissions", async () => {
    const { app, mailer } = buildApp();

    const res = await request(app)
      .post("/zwrot")
      .send({ ...validBody, _hp: "bot" });

    expect(res.status).toBe(200);
    expect(mailer.sent).toHaveLength(0);
  });

  it("emails the return request to the shop", async () => {
    const { app, mailer } = buildApp();

    const res = await request(app).post("/zwrot").send(validBody);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });

    expect(mailer.sent).toHaveLength(1);
    expect(mailer.sent[0].to).toBe("sklep@test.local");
    expect(mailer.sent[0].replyTo).toBe("jan@example.com");
    expect(mailer.sent[0].html).toContain(validBody.bankAccount);
  });
});

describe("POST /reklamacja", () => {
  const validBody = {
    orderNumber: "17",
    name: "Jan Kowalski",
    email: "jan@example.com",
    description: "Pęknięty narożnik ramy po dostawie",
  };

  it("rejects a submission with missing fields (400)", async () => {
    const { app, mailer } = buildApp();

    const res = await request(app).post("/reklamacja").send({ name: "Jan" });

    expect(res.status).toBe(400);
    expect(mailer.sent).toHaveLength(0);
  });

  it("emails the complaint to the shop", async () => {
    const { app, mailer } = buildApp();

    const res = await request(app).post("/reklamacja").send(validBody);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });

    expect(mailer.sent).toHaveLength(1);
    expect(mailer.sent[0].to).toBe("sklep@test.local");
    expect(mailer.sent[0].html).toContain(validBody.description);
  });
});
