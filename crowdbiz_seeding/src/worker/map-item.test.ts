import { describe, expect, it } from "vitest";
import { vanityFromProfileItem } from "./map-item";

describe("vanityFromProfileItem", () => {
  it("joins Harvest results through originalQuery.profileId", () => {
    expect(
      vanityFromProfileItem({
        id: "ACoAAADifferent",
        publicIdentifier: "samnewton31",
        linkedinUrl: "https://www.linkedin.com/in/samnewton31?trk=profile",
        originalQuery: { profileId: "ACwAAAInputId" },
      }),
    ).toEqual({
      opaqueId: "ACwAAAInputId",
      vanityUrl: "https://www.linkedin.com/in/samnewton31",
    });
  });

  it("does not mistake opaque IDs for vanity slugs", () => {
    expect(
      vanityFromProfileItem({
        publicIdentifier: "ACwAAAInputId",
        linkedinUrl: "https://www.linkedin.com/in/ACwAAAInputId",
        originalQuery: { profileId: "ACwAAAInputId" },
      }),
    ).toEqual({
      opaqueId: "ACwAAAInputId",
      vanityUrl: null,
    });
  });
});
