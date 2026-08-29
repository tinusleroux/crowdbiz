import { isForbiddenHeader } from "@/lib/sanitize";

const UNIVERSAL = ["claim_id", "source_url", "source_type", "observed_at"] as const;

const ORG_REQUIRED = ["org_ref", "name", "org_type", ...UNIVERSAL] as const;
const PERSON_REQUIRED = ["person_ref", "full_name", ...UNIVERSAL] as const;
const AFF_REQUIRED = [
  "person_ref",
  "org_ref",
  "raw_title",
  "affiliation_type",
  "as_of",
  ...UNIVERSAL,
] as const;

const FORBIDDEN_SEMANTIC = ["function", "seniority"];

/** claim-schema.md. An unlisted value silently loses its weight at resolve. */
const SOURCE_TYPES = new Set([
  "staff_directory",
  "press_release",
  "org_website",
  "filing",
  "manual_research",
  "profile_self_report",
  "user_correction",
  "self_assertion",
  "identity_assertion",
  "other",
]);

const AFFILIATION_TYPES = new Set([
  "employed",
  "contracted",
  "advising",
  "board",
  "ownership",
  "other",
]);

const ISO_DATE = /^\d{4}-\d{2}-\d{2}(T[\d:.]+(Z|[+-]\d{2}:?\d{2}))?$/;

export type ParsedCsv = { headers: string[]; rows: Record<string, string>[] };

export function parseCsv(text: string): ParsedCsv {
  const records = parseRecords(text);
  if (records.length === 0) return { headers: [], rows: [] };
  const headers = records[0] ?? [];
  const rows = records.slice(1).map((cells) => {
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = cells[i] ?? "";
    });
    return row;
  });
  return { headers, rows };
}

function parseRecords(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cell += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(cell);
      cell = "";
    } else if (c === "\n") {
      if (cell.endsWith("\r")) cell = cell.slice(0, -1);
      row.push(cell);
      cell = "";
      if (row.some((x) => x.length) || rows.length === 0) rows.push(row);
      row = [];
    } else {
      cell += c;
    }
  }
  if (cell.length || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

export function validateBatchFiles(files: {
  organizations: string;
  persons: string;
  affiliations: string;
}): string[] {
  const errors: string[] = [];
  const orgs = parseCsv(files.organizations);
  const persons = parseCsv(files.persons);
  const affs = parseCsv(files.affiliations);

  for (const [label, parsed] of [
    ["organizations.csv", orgs],
    ["persons.csv", persons],
    ["affiliations.csv", affs],
  ] as const) {
    for (const h of parsed.headers) {
      if (isForbiddenHeader(h) || FORBIDDEN_SEMANTIC.includes(h.toLowerCase())) {
        errors.push(`${label}: forbidden header "${h}"`);
      }
    }
  }

  requireCols("organizations.csv", orgs, ORG_REQUIRED, errors);
  requireCols("persons.csv", persons, PERSON_REQUIRED, errors);
  requireCols("affiliations.csv", affs, AFF_REQUIRED, errors);

  const seenClaimIds = new Map<string, string>();

  for (const [label, parsed] of [
    ["organizations.csv", orgs],
    ["persons.csv", persons],
    ["affiliations.csv", affs],
  ] as const) {
    parsed.rows.forEach((row, i) => {
      const at = `${label} row ${i + 2}`;
      if (row.source_type && !SOURCE_TYPES.has(row.source_type)) {
        errors.push(`${at}: unknown source_type "${row.source_type}"`);
      }
      if (row.observed_at && !ISO_DATE.test(row.observed_at)) {
        errors.push(`${at}: observed_at must be ISO-8601`);
      }
      const claimId = row.claim_id?.trim();
      if (claimId) {
        const prior = seenClaimIds.get(claimId);
        if (prior) {
          errors.push(`${at}: claim_id already used by ${prior}`);
        } else {
          seenClaimIds.set(claimId, at);
        }
      }
    });
  }

  const orgRefs = new Set(orgs.rows.map((r) => r.org_ref));
  const personRefs = new Set(persons.rows.map((r) => r.person_ref));

  for (const [i, row] of affs.rows.entries()) {
    if (row.affiliation_type && !AFFILIATION_TYPES.has(row.affiliation_type)) {
      errors.push(
        `affiliations.csv row ${i + 2}: unknown affiliation_type "${row.affiliation_type}"`,
      );
    }
    if (row.as_of && !ISO_DATE.test(row.as_of)) {
      errors.push(`affiliations.csv row ${i + 2}: as_of must be ISO-8601`);
    }
    if (row.org_ref && !orgRefs.has(row.org_ref)) {
      errors.push(`affiliations.csv row ${i + 2}: unknown org_ref`);
    }
    if (row.person_ref && !personRefs.has(row.person_ref)) {
      errors.push(`affiliations.csv row ${i + 2}: unknown person_ref`);
    }
    if (row.end_date) {
      errors.push(
        `affiliations.csv row ${i + 2}: end_date must be omitted for current roles`,
      );
    }
  }

  return errors;
}

function requireCols(
  file: string,
  parsed: ParsedCsv,
  required: readonly string[],
  errors: string[],
) {
  for (const col of required) {
    if (!parsed.headers.includes(col)) {
      errors.push(`${file}: missing required column ${col}`);
      continue;
    }
    parsed.rows.forEach((row, i) => {
      if (!row[col]?.trim()) {
        errors.push(`${file} row ${i + 2}: empty ${col}`);
      }
    });
  }
}
