/**
 * Required-field contracts for the public forms (contact, return, complaint).
 * Single-sourced here so the backend guard and the frontend submit body cannot
 * drift (issue #133): the backend rejects a submission missing any listed
 * field with a 400; the frontend types its request body from the same list.
 */
export const CONTACT_FORM_FIELDS = ["name", "email", "message"] as const;

export const RETURN_FORM_FIELDS = [
  "orderNumber",
  "name",
  "email",
  "reason",
  "bankAccount",
] as const;

export const COMPLAINT_FORM_FIELDS = [
  "orderNumber",
  "name",
  "email",
  "description",
] as const;

export type ContactFormBody = Record<(typeof CONTACT_FORM_FIELDS)[number], string>;
export type ReturnFormBody = Record<(typeof RETURN_FORM_FIELDS)[number], string>;
export type ComplaintFormBody = Record<(typeof COMPLAINT_FORM_FIELDS)[number], string>;
