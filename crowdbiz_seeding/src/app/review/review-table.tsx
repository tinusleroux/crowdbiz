"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import type { ReviewDecision } from "@/graph/apply-review";
import type { QueueRow } from "@/graph/review-queue";
import { reviewAffiliation } from "./actions";

const REVIEWER_KEY = "crowdbiz-reviewer";
const PAGE_SIZE = 50;

export type FunctionOption = {
  slug: string;
  label: string;
  scope: "in" | "out" | "unresolved";
};

type SortKey = "fullName" | "rawTitle" | "sameTitle" | "orgName";
type SortDir = "asc" | "desc";

export function ReviewTable({
  rows,
  functions,
  initialOrg,
}: {
  rows: QueueRow[];
  functions: FunctionOption[];
  initialOrg: string;
}) {
  const reviewerRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [org, setOrg] = useState(initialOrg);
  const [sortKey, setSortKey] = useState<SortKey>("sameTitle");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(0);
  const [pending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reviewed, setReviewed] = useState(0);

  useEffect(() => {
    const saved = sessionStorage.getItem(REVIEWER_KEY);
    if (saved && reviewerRef.current) reviewerRef.current.value = saved;
  }, []);

  const titleCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const row of rows) {
      counts.set(row.rawTitle, (counts.get(row.rawTitle) ?? 0) + 1);
    }
    return counts;
  }, [rows]);

  const orgs = useMemo(() => {
    const byId = new Map<string, string>();
    for (const row of rows) byId.set(row.orgId, row.orgName);
    return [...byId.entries()]
      .map(([orgId, name]) => ({ orgId, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = rows.filter((row) => {
      if (org && row.orgId !== org) return false;
      if (!q) return true;
      return (
        row.fullName.toLowerCase().includes(q) ||
        row.rawTitle.toLowerCase().includes(q) ||
        row.orgName.toLowerCase().includes(q) ||
        row.profileAbout?.toLowerCase().includes(q)
      );
    });

    const dir = sortDir === "asc" ? 1 : -1;
    return matches.sort((a, b) => {
      if (sortKey === "sameTitle") {
        const diff =
          (titleCounts.get(a.rawTitle) ?? 0) - (titleCounts.get(b.rawTitle) ?? 0);
        if (diff !== 0) return diff * dir;
        return (
          a.rawTitle.localeCompare(b.rawTitle) ||
          a.fullName.localeCompare(b.fullName)
        );
      }
      const value = a[sortKey].localeCompare(b[sortKey]) * dir;
      if (value !== 0) return value;
      return a.fullName.localeCompare(b.fullName);
    });
  }, [rows, org, query, sortKey, sortDir, titleCounts]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount - 1);
  const visible = filtered.slice(
    current * PAGE_SIZE,
    current * PAGE_SIZE + PAGE_SIZE,
  );

  function sortBy(key: SortKey) {
    if (key === sortKey) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir(key === "sameTitle" ? "desc" : "asc");
    }
    setPage(0);
  }

  function submit(
    row: QueueRow,
    decision: ReviewDecision,
    functionSlug?: string,
  ) {
    const reviewer = reviewerRef.current?.value.trim() ?? "";
    if (!reviewer) {
      setError("Enter your name before reviewing.");
      reviewerRef.current?.focus();
      return;
    }
    setError(null);
    setBusyId(row.affiliationId);
    startTransition(async () => {
      try {
        await reviewAffiliation({
          affiliationId: row.affiliationId,
          decision,
          functionSlug: functionSlug ?? null,
          reviewer,
        });
        setReviewed((n) => n + 1);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Review failed");
      } finally {
        setBusyId(null);
      }
    });
  }

  const inScope = functions.filter((fn) => fn.scope === "in");
  const outScope = functions.filter((fn) => fn.scope !== "in");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="text-xs text-zinc-600">
          Reviewer
          <input
            ref={reviewerRef}
            onChange={(e) => sessionStorage.setItem(REVIEWER_KEY, e.target.value)}
            placeholder="Your name"
            className="mt-1 block w-44 rounded border border-zinc-300 px-2 py-1.5 text-sm text-zinc-900"
          />
        </label>
        <label className="text-xs text-zinc-600">
          Search
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(0);
            }}
            placeholder="Name, title, org, or About"
            className="mt-1 block w-64 rounded border border-zinc-300 px-2 py-1.5 text-sm text-zinc-900"
          />
        </label>
        <label className="text-xs text-zinc-600">
          Organization
          <select
            value={org}
            onChange={(e) => {
              setOrg(e.target.value);
              setPage(0);
            }}
            className="mt-1 block rounded border border-zinc-300 px-2 py-1.5 text-sm text-zinc-900"
          >
            <option value="">All ({rows.length})</option>
            {orgs.map((o) => (
              <option key={o.orgId} value={o.orgId}>
                {o.name}
              </option>
            ))}
          </select>
        </label>
        {(query || org) && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setOrg("");
              setPage(0);
            }}
            className="text-xs text-zinc-600 underline"
          >
            Clear filters
          </button>
        )}
        <p className="ml-auto text-xs text-zinc-500">
          {filtered.length} shown · {rows.length} unreviewed
          {reviewed > 0 ? ` · ${reviewed} decided this session` : ""}
        </p>
      </div>

      {error && (
        <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="overflow-x-auto rounded border border-zinc-200 bg-white">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b bg-zinc-50 text-left text-zinc-600">
              <SortHeader
                label="Name"
                active={sortKey === "fullName"}
                dir={sortDir}
                onClick={() => sortBy("fullName")}
              />
              <SortHeader
                label="Title"
                active={sortKey === "rawTitle"}
                dir={sortDir}
                onClick={() => sortBy("rawTitle")}
              />
              <SortHeader
                label="Same title"
                active={sortKey === "sameTitle"}
                dir={sortDir}
                onClick={() => sortBy("sameTitle")}
                align="right"
              />
              <SortHeader
                label="Organization"
                active={sortKey === "orgName"}
                dir={sortDir}
                onClick={() => sortBy("orgName")}
              />
              <th className="px-3 py-2 font-medium">Profile</th>
              <th className="px-3 py-2 font-medium">About</th>
              <th className="px-3 py-2 font-medium">Classify as</th>
              <th className="px-3 py-2 font-medium">Not a function</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => {
              const busy = busyId === row.affiliationId && pending;
              const count = titleCounts.get(row.rawTitle) ?? 1;
              return (
                <tr
                  key={row.affiliationId}
                  className={`border-b border-zinc-100 align-middle ${
                    busy ? "opacity-40" : ""
                  }`}
                >
                  <td className="px-3 py-2">
                    <div className="font-medium">{row.fullName}</div>
                    {row.affiliationType !== "employed" && (
                      <div className="text-[11px] text-zinc-500">
                        {row.affiliationType}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2">{row.rawTitle}</td>
                  <td className="px-3 py-2 text-right">
                    {count > 1 ? (
                      <button
                        type="button"
                        onClick={() => {
                          setQuery(row.rawTitle);
                          setPage(0);
                        }}
                        className="text-zinc-600 underline"
                        title="Filter to this exact title"
                      >
                        {count}
                      </button>
                    ) : (
                      <span className="text-zinc-400">1</span>
                    )}
                  </td>
                  <td className="px-3 py-2">{row.orgName}</td>
                  <td className="px-3 py-2">
                    {row.publicProfileUrl ? (
                      <a
                        href={row.publicProfileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-zinc-600 underline"
                      >
                        LinkedIn
                      </a>
                    ) : (
                      <span className="text-zinc-400">—</span>
                    )}
                  </td>
                  <td className="max-w-xs px-3 py-2">
                    {row.profileAbout ? (
                      <details>
                        <summary className="cursor-pointer text-zinc-600 underline">
                          View
                        </summary>
                        <p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-zinc-600">
                          {row.profileAbout}
                        </p>
                      </details>
                    ) : (
                      <span className="text-zinc-400">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <select
                      value=""
                      disabled={busy}
                      onChange={(e) => {
                        if (e.target.value) submit(row, "classify", e.target.value);
                      }}
                      className="w-52 rounded border border-zinc-300 px-2 py-1.5 text-sm"
                    >
                      <option value="">Select function</option>
                      <optgroup label="On chart">
                        {inScope.map((fn) => (
                          <option key={fn.slug} value={fn.slug}>
                            {fn.label}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Off chart">
                        {outScope.map((fn) => (
                          <option key={fn.slug} value={fn.slug}>
                            {fn.label}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => submit(row, "remain_unknown")}
                      className="rounded border border-zinc-300 px-2 py-1.5 text-xs"
                    >
                      Remain unknown
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => submit(row, "ignore")}
                      className="ml-2 rounded border border-zinc-300 px-2 py-1.5 text-xs"
                    >
                      Ignore
                    </button>
                  </td>
                </tr>
              );
            })}
            {visible.length === 0 && (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-zinc-500">
                  Nothing matches these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pageCount > 1 && (
        <div className="flex items-center gap-3 text-sm">
          <button
            type="button"
            disabled={current === 0}
            onClick={() => setPage(current - 1)}
            className="rounded border border-zinc-300 px-2 py-1 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-zinc-500">
            Page {current + 1} of {pageCount}
          </span>
          <button
            type="button"
            disabled={current >= pageCount - 1}
            onClick={() => setPage(current + 1)}
            className="rounded border border-zinc-300 px-2 py-1 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

function SortHeader({
  label,
  active,
  dir,
  onClick,
  align = "left",
}: {
  label: string;
  active: boolean;
  dir: SortDir;
  onClick: () => void;
  align?: "left" | "right";
}) {
  return (
    <th className={`px-3 py-2 font-medium ${align === "right" ? "text-right" : ""}`}>
      <button type="button" onClick={onClick} className="hover:text-zinc-900">
        {label}
        <span className="ml-1 text-zinc-400">
          {active ? (dir === "asc" ? "▲" : "▼") : ""}
        </span>
      </button>
    </th>
  );
}
