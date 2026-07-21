/**
 * Boot-time environment invariants (issues #113, #143).
 *
 * Every rule here guards a half-configured state that fails silently at
 * runtime: the shop keeps answering 200 while payments or customer messages
 * go nowhere. Better to refuse to boot and name the missing variable.
 *
 * Absent optional services are fine — with no Stripe key and no SMTP host the
 * app runs in demo mode, where nothing is charged and nothing is mailed.
 */

type Env = Record<string, string | undefined>;

interface EnvInvariant {
  /** Only checked when this variable is set — it's what turns the service on. */
  enabledBy: string;
  requires: string[];
  /** Why a missing variable is silently destructive, not merely absent. */
  consequence: string;
}

const INVARIANTS: EnvInvariant[] = [
  {
    enabledBy: "STRIPE_SECRET_KEY",
    requires: ["STRIPE_WEBHOOK_SECRET", "FRONTEND_URL"],
    consequence:
      "payments would succeed while orders are never recorded, and checkout would 500",
  },
  {
    enabledBy: "SMTP_HOST",
    requires: ["CONTACT_RECIPIENT"],
    consequence:
      "contact, return (zwrot) and complaint (reklamacja) submissions would report success to the customer while the notification is rejected for having no recipient",
  },
];

/**
 * @returns one message per broken invariant — empty means safe to boot.
 */
export function findBootEnvErrors(env: Env): string[] {
  return INVARIANTS.flatMap(function checkInvariant({ enabledBy, requires, consequence }) {
    if (!env[enabledBy]) return [];
    const missing = requires.filter((name) => !env[name]);
    if (missing.length === 0) return [];
    const subject = `${missing.join(" and ")} ${missing.length > 1 ? "are" : "is"}`;
    return [`${subject} required when ${enabledBy} is set — otherwise ${consequence}.`];
  });
}
