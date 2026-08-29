export const FORBIDDEN_HEADER_NAMES = [
  "email",
  "emails",
  "e-mail",
  "phone",
  "telephone",
  "mobile",
  "address",
  "street",
  "dob",
  "date_of_birth",
  "dateofbirth",
  "ssn",
] as const;

const KEY_DROP =
  /^(email|e-?mail|emails|phone|telephone|mobile|cell|address|street|streetAddress|personalAddress|dob|dateOfBirth|date_of_birth|birthDate|ssn|pictureUrl|profilePicture)$/i;

function keyLooksLikeEmail(key: string): boolean {
  return /email/i.test(key);
}

export function isForbiddenHeader(name: string): boolean {
  const n = name.trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (FORBIDDEN_HEADER_NAMES.includes(n as (typeof FORBIDDEN_HEADER_NAMES)[number])) {
    return true;
  }
  return /email/i.test(name);
}

export function sanitizePayload(input: unknown): Record<string, unknown> {
  const cleaned = strip(input);
  if (cleaned && typeof cleaned === "object" && !Array.isArray(cleaned)) {
    return cleaned as Record<string, unknown>;
  }
  return {};
}

function strip(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(strip);
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (KEY_DROP.test(k) || keyLooksLikeEmail(k)) continue;
      out[k] = strip(v);
    }
    return out;
  }
  return value;
}

export function payloadContainsForbiddenKeys(payload: unknown): boolean {
  return walkKeys(payload).some((k) => KEY_DROP.test(k) || keyLooksLikeEmail(k));
}

function walkKeys(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(walkKeys);
  if (value && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).flatMap(([k, v]) => [
      k,
      ...walkKeys(v),
    ]);
  }
  return [];
}
