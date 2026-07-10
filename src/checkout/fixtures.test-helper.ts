// Shared test fixtures — the canonical valid draft inputs the checkout
// contract tests build on. Not shipped: only imported from *.test.ts.
import type { CourierAddress, PaczkomatPoint } from "./types";

export const VALID_ADDRESS: CourierAddress = {
  firstName: "Jan",
  lastName: "Kowalski",
  email: "jan@example.com",
  street: "Prosta 1",
  postalCode: "70-123",
  city: "Szczecin",
  phone: "501234567",
};

export const PACZKOMAT_POINT: PaczkomatPoint = {
  code: "SZC01M",
  name: "ul. Paczkowa 5",
  city: "Police",
};
