export type MappedRaw = {
  opaqueId: string;
  firstName: string | null;
  lastName: string | null;
  title: string | null;
  company: string | null;
  startYear: number | null;
  startMonth: number | null;
  memberUrl: string | null;
  datasetItemId: string | null;
};

function str(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

function num(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() && !Number.isNaN(Number(v))) {
    return Number(v);
  }
  return null;
}

function firstPos(item: Record<string, unknown>): Record<string, unknown> | null {
  const positions = item.currentPositions ?? item.positions ?? item.experience;
  if (Array.isArray(positions) && positions[0] && typeof positions[0] === "object") {
    return positions[0] as Record<string, unknown>;
  }
  if (item.currentPosition && typeof item.currentPosition === "object") {
    return item.currentPosition as Record<string, unknown>;
  }
  return null;
}

export function mapEmployeeItem(item: Record<string, unknown>): MappedRaw | null {
  const pos = firstPos(item);
  const startedOn =
    pos && typeof pos.startedOn === "object" && pos.startedOn
      ? (pos.startedOn as Record<string, unknown>)
      : null;

  const opaqueId =
    str(item.linkedinIdentifier) ??
    str(item.linkedinId) ??
    str(item.profileId) ??
    str(item.id) ??
    opaqueFromUrl(str(item.linkedinUrl) ?? str(item.url));

  if (!opaqueId) return null;

  const title =
    str(pos?.title) ??
    str(item.headline) ??
    str(item.jobTitle) ??
    str(item.title);

  const company =
    str(pos?.companyName) ??
    str(pos?.company) ??
    str(item.companyName) ??
    str(item.company);

  return {
    opaqueId: opaqueId.replace(/^urn:li:fsd_profile:/, ""),
    firstName: str(item.firstName) ?? str(item.givenName),
    lastName: str(item.lastName) ?? str(item.familyName),
    title,
    company,
    startYear: num(startedOn?.year) ?? num(pos?.startYear),
    startMonth: num(startedOn?.month) ?? num(pos?.startMonth),
    memberUrl: str(item.linkedinUrl) ?? str(item.url),
    datasetItemId: str(item.id) ?? opaqueId,
  };
}

function opaqueFromUrl(url: string | null): string | null {
  if (!url) return null;
  const m = url.match(/\/in\/(ACo[A-Za-z0-9_-]+)/i);
  return m?.[1] ?? null;
}

export function vanityFromProfileItem(item: Record<string, unknown>): {
  opaqueId: string | null;
  vanityUrl: string | null;
  profileAbout: string | null;
} {
  const originalQuery =
    item.originalQuery &&
    typeof item.originalQuery === "object" &&
    !Array.isArray(item.originalQuery)
      ? (item.originalQuery as Record<string, unknown>)
      : null;
  const publicId = str(item.publicIdentifier);
  const url = str(item.linkedinUrl) ?? str(item.url);
  const vanityUrl =
    url && !/\/in\/AC[ow]/i.test(url)
      ? url.split("?")[0] ?? url
      : publicId && !/^AC[ow]/i.test(publicId)
        ? `https://www.linkedin.com/in/${publicId}`
        : null;
  const opaqueId =
    str(originalQuery?.profileId) ??
    str(item.linkedinIdentifier) ??
    str(item.linkedinId) ??
    str(item.profileId) ??
    opaqueFromUrl(url);
  return { opaqueId, vanityUrl, profileAbout: str(item.about) };
}
