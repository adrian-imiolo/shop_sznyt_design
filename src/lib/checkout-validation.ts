import type { CourierAddress } from "../types";

export type AddressErrors = Partial<Record<keyof CourierAddress, string>>;

export function validateAddress(address: CourierAddress): AddressErrors {
  const errors: AddressErrors = {};
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address.email)) {
    errors.email = "Podaj poprawny adres e-mail";
  }
  if (!/^\d{2}-\d{3}$/.test(address.postalCode)) {
    errors.postalCode = "Kod pocztowy powinien mieć format XX-XXX";
  }
  if (!/^(\+48\s?)?(\d[\s-]?){9}$/.test(address.phone.replace(/\s|-/g, ""))) {
    errors.phone = "Podaj poprawny numer telefonu (9 cyfr)";
  }
  return errors;
}
