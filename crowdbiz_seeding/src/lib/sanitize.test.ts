import { describe, expect, it } from "vitest";
import {
  isForbiddenHeader,
  payloadContainsForbiddenKeys,
  sanitizePayload,
} from "./sanitize";

describe("sanitizePayload", () => {
  it("deletes email, phone, address, dob, pictureUrl, and any *email* keys", () => {
    const out = sanitizePayload({
      firstName: "Pat",
      email: "x@y.com",
      workEmail: "z@y.com",
      phone: "555",
      address: "1 Main",
      dateOfBirth: "1990-01-01",
      pictureUrl: "https://example/pic",
      nested: { emails: ["a@b.c"], title: "Director" },
    });
    expect(out).toEqual({
      firstName: "Pat",
      nested: { title: "Director" },
    });
    expect(payloadContainsForbiddenKeys(out)).toBe(false);
  });

  it("flags forbidden CSV headers", () => {
    expect(isForbiddenHeader("email")).toBe(true);
    expect(isForbiddenHeader("Email Address")).toBe(true);
    expect(isForbiddenHeader("raw_title")).toBe(false);
  });
});
