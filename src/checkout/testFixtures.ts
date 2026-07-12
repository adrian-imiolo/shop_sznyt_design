import type { CourierAddress, PaczkomatPoint } from "./types";

/** Shared across the module's tests so the fixture can't drift per file. */
export const validAddress: CourierAddress = {
  firstName: "Jan",
  lastName: "Kowalski",
  email: "jan@example.com",
  street: "Prosta 1",
  postalCode: "70-123",
  city: "Szczecin",
  phone: "501234567",
};

export const paczkomatPoint: PaczkomatPoint = {
  code: "KRA010",
  name: "Wielicka 28",
  city: "Kraków",
};
