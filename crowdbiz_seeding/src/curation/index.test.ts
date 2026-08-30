import { describe, expect, it } from "vitest";
import {
  curateTitle,
  formatStartDate,
  stripCredentialsFromName,
} from "./index";

const ORG = "Green Bay Packers";

describe("stripCredentialsFromName", () => {
  it("strips MBA/CPA and keeps Jr", () => {
    expect(stripCredentialsFromName("Kristen", "Shand, MBA")).toBe(
      "Kristen Shand",
    );
    expect(stripCredentialsFromName("Joshua", "Pearce, CPA")).toBe(
      "Joshua Pearce",
    );
    expect(stripCredentialsFromName("Derrick", "Coleman Jr")).toBe(
      "Derrick Coleman Jr",
    );
  });
});

describe("formatStartDate", () => {
  it("keeps source precision", () => {
    expect(formatStartDate(2019, null)).toBe("2019");
    expect(formatStartDate(2019, 3)).toBe("2019-03");
    expect(formatStartDate(null, 3)).toBeNull();
  });
});

describe("Packers title fixtures", () => {
  const dropAssoc = [
    "SHARE HOLDER",
    "Minority Share Holder",
    "Shareholder",
    "Minority Owener",
    "Season Ticket Holder",
  ];
  const dropOnField = [
    "Assistant Director of Pro Scouting",
    "College Scout - NFS",
    "SW Area Scout",
    "West Coast Scout",
    "Scouting Coordinator",
    "Safeties Coach",
    "Assistant Equipment Manager",
    "Asst Equipment Manager",
    "Equipment assistant",
    "Team Physician",
    "Director of Performance Nutrition",
    "Director of Performance Psychology & Team Behavioral Health Clinician",
    "DIRECTOR OF FOOTBALL OPERATIONS",
    "Coaching Operations Coordinator",
    "Senior Executive/Director of Pro Personnel",
    "Director of Football Administration/Player Finance",
    "Director of Football Logistics / Team Travel",
    "Professional Athlete",
    "Professional Baseball Player",
    "Assistant General Manager",
    "Assistant to the General Manager",
    "Physical Therapist",
    "NFL Cheerleader",
    "Atlanta Falcons Cheerleader",
    "NHL Goaltender",
    "Hockey Analyst",
  ];
  const keepGrey = [
    "Assiatant Director of Players Engagement",
    "Director of Player Engagement",
    "Director of Community Outreach & Player/Alumni Relations",
    "Football Outreach Coordinator",
    "Football Outreach Manager",
    "Community Outreach Manager",
    "Executive Coach & Leadership Consultant",
  ];
  const keepBusiness = [
    "Director of IT",
    "Accounting Manager",
    "Vice President of Communications",
    "Ticket office coordinator",
    "Vice President of Football Communications",
    "Social Media Coordinator",
  ];
  const dropBroadcast = [
    "Camera Operator",
    "Stage Manager",
    "Director, Broadcast",
    "Vice President, Broadcast",
    "Director of Live Production and Broadcast",
    "Director, Video Production",
    "EVS Replay Operator",
    "Radio Play-by-Play Announcer",
    "Technical Director",
    "Gameday Technical Director",
    "Production Runner",
    "Broadcaster",
  ];
  const dropNotTitle = ["Student", "", "Green Bay Packers"];

  for (const t of dropAssoc) {
    it(`drops association: ${t || "(empty)"}`, () => {
      const r = curateTitle(t, ORG, ORG);
      expect(r.keep).toBe(false);
      if (!r.keep) expect(r.dropReason).toBe("association");
    });
  }

  for (const t of dropOnField) {
    it(`drops on-field: ${t}`, () => {
      const r = curateTitle(t, ORG, ORG);
      expect(r.keep).toBe(false);
      if (!r.keep) expect(r.dropReason).toBe("on_field");
    });
  }

  for (const t of keepGrey) {
    it(`keeps grey: ${t}`, () => {
      expect(curateTitle(t, ORG, ORG).keep).toBe(true);
    });
  }

  for (const t of keepBusiness) {
    it(`keeps business: ${t}`, () => {
      expect(curateTitle(t, ORG, ORG).keep).toBe(true);
    });
  }

  for (const t of dropBroadcast) {
    it(`drops broadcast: ${t}`, () => {
      const r = curateTitle(t, ORG, ORG);
      expect(r.keep).toBe(false);
      if (!r.keep) expect(r.dropReason).toBe("broadcast");
    });
  }

  for (const t of dropNotTitle) {
    it(`drops non-title: ${JSON.stringify(t)}`, () => {
      const r = curateTitle(t, ORG, ORG);
      expect(r.keep).toBe(false);
      if (!r.keep) expect(r.dropReason).toBe("not_a_title");
    });
  }
});
