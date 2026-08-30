import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

export type FunctionVocab = {
  slug: string;
  label: string;
  scope: "in" | "out" | "unresolved";
};

export type SeniorityBand = {
  slug: string;
  label: string;
  rank: number | null;
  typical: string;
};

export type SeniorityVocab = {
  bands: SeniorityBand[];
  modifiers: {
    senior: { terms: string[]; delta: number };
    junior: { terms: string[]; delta: number };
  };
};

export type Vocab = {
  functions: FunctionVocab[];
  seniority: SeniorityVocab;
};

function ontologyDir(): string {
  const fromHere = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../../../ontology",
  );
  if (existsSync(path.join(fromHere, "functions.v2.yaml"))) return fromHere;
  const fromCwd = path.resolve(process.cwd(), "../ontology");
  if (existsSync(path.join(fromCwd, "functions.v2.yaml"))) return fromCwd;
  throw new Error("Cannot find ontology/functions.v2.yaml");
}

let cached: Vocab | undefined;

export function loadVocab(): Vocab {
  if (cached) return cached;
  const dir = ontologyDir();
  const fn = parse(readFileSync(path.join(dir, "functions.v2.yaml"), "utf8")) as {
    functions: FunctionVocab[];
  };
  const sn = parse(readFileSync(path.join(dir, "seniority.v1.yaml"), "utf8")) as {
    bands: SeniorityBand[];
    modifiers: SeniorityVocab["modifiers"];
  };
  cached = { functions: fn.functions, seniority: sn };
  return cached;
}

/** Test-only: drop cached YAML after swapping files is not needed in MVP. */
export function resetVocabCache(): void {
  cached = undefined;
}
