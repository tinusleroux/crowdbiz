import { describe, expect, it } from "vitest";
import { interpretAffiliation, interpretTitle } from "./interpret";
import { loadVocab } from "./vocab";

const vocab = loadVocab();
const KRAKEN = "Seattle Kraken";

describe("interpretTitle seniority (YAML examples)", () => {
  const cases: [string, string][] = [
    ["Chief Financial Officer", "chief"],
    ["Vice President of Communications", "vice_president"],
    ["General Counsel", "senior_leader"],
    ["Director of Retail", "leader"],
    ["Assistant Director of Communications", "associate_leader"],
    ["Associate General Counsel", "leader"],
    ["Accounting Manager", "manager"],
    ["Assistant Accounting Manager", "senior_contributor"],
    ["Senior Premium Seating Coordinator", "senior_contributor"],
    ["Premium Seating Coordinator", "contributor"],
    ["Tundraline Performer", "support"],
    ["Corporate Partnerships", "unknown"],
  ];
  for (const [title, band] of cases) {
    it(`${title} → ${band}`, () => {
      expect(interpretTitle(title, vocab).seniority).toBe(band);
    });
  }

  it("does not treat President of <domain> as chief", () => {
    expect(interpretTitle("President of Ticketing", vocab).seniority).not.toBe(
      "chief",
    );
  });

  it("does not promote Executive Assistant via an executive modifier", () => {
    expect(interpretTitle("Executive Assistant", vocab).seniority).toBe("support");
  });
});

describe("interpretTitle function", () => {
  it("sends club Account Executive to partnerships", () => {
    expect(interpretTitle("Account Executive", vocab).function).toBe(
      "partnerships",
    );
  });

  it("sends Account Manager to client_success", () => {
    expect(interpretTitle("Account Manager", vocab).function).toBe(
      "client_success",
    );
  });

  it("does not dump Executive Assistant into function executive", () => {
    expect(interpretTitle("Executive Assistant", vocab).function).not.toBe(
      "executive",
    );
  });

  it("keeps on_field off the chart", () => {
    const hit = interpretTitle("Head Coach", vocab);
    expect(hit.function).toBe("on_field");
    expect(hit.inChart).toBe(false);
  });

  it("leaves Director of Operations visible as unknown", () => {
    const hit = interpretTitle("Director of Operations", vocab);
    expect(hit.function).toBe("unknown");
    expect(hit.inChart).toBe(true);
    expect(hit.seniority).toBe("leader");
  });
});

describe("abbreviated rank markers", () => {
  const cases: [string, string][] = [
    ["VP of Ticket Operations", "vice_president"],
    ["SVP, People & Culture", "vice_president"],
    ["EVP, Business Operations", "vice_president"],
    ["Sr. Account Executive, Membership Sales", "senior_contributor"],
  ];
  for (const [title, band] of cases) {
    it(`${title} → ${band}`, () => {
      expect(interpretTitle(title, vocab).seniority).toBe(band);
    });
  }
});

describe("function matching against real club titles", () => {
  const cases: [string, string][] = [
    ["VP of Ticket Operations", "ticketing"],
    ["Director, Ticket Distribution", "ticketing"],
    ["Account Executive, Group Sales", "ticketing"],
    ["Account Executive, Membership Service", "ticketing"],
    ["Director, Partnership Marketing", "partnerships"],
    ["Director, Payroll", "finance"],
    ["Director of FP&A", "finance"],
    ["IT Systems Administrator", "technology"],
    ["Senior Software Engineer", "technology"],
    ["Senior Data Scientist", "analytics"],
    ["Director of Security", "venue_operations"],
    ["Director, Video Production", "content_media"],
    ["Director, Digital & Social Media", "content_media"],
    ["Executive Assistant", "administration"],
    ["SVP, People & Culture", "people"],
    ["Chief Commercial Officer", "partnerships"],
    ["Chief Operating Officer", "executive"],
  ];
  for (const [title, slug] of cases) {
    it(`${title} → ${slug}`, () => {
      expect(interpretAffiliation({ rawTitle: title, orgName: KRAKEN }, vocab).function).toBe(
        slug,
      );
    });
  }

  it("hides on-field work in any sport", () => {
    for (const title of ["NHL Goaltender", "Hockey Analyst", "Head Coach"]) {
      const hit = interpretAffiliation({ rawTitle: title, orgName: KRAKEN }, vocab);
      expect(hit.function).toBe("on_field");
      expect(hit.inChart).toBe(false);
    }
  });
});

describe("venue and affiliate clauses do not decide function", () => {
  it("ignores the venue name in VP, Business Operations, Kraken Community Iceplex", () => {
    const hit = interpretAffiliation(
      { rawTitle: "VP, Business Operations, Kraken Community Iceplex", orgName: KRAKEN },
      vocab,
    );
    expect(hit.function).toBe("administration");
  });

  it("ignores an at-clause naming the club and the arena", () => {
    const hit = interpretAffiliation(
      {
        rawTitle:
          "Archtics Director, Ticket Operations at Seattle Kraken and Climate Pledge Arena",
        orgName: KRAKEN,
      },
      vocab,
    );
    expect(hit.function).toBe("ticketing");
  });
});

describe("only employed affiliations reach the chart", () => {
  it("keeps board and ownership seats off the chart", () => {
    for (const type of ["board", "ownership", "advising"]) {
      const hit = interpretAffiliation(
        { rawTitle: "Board Member", affiliationType: type, orgName: KRAKEN },
        vocab,
      );
      expect(hit.inChart).toBe(false);
    }
  });
});

describe("ownership function", () => {
  it("classifies Owner and Board Member as ownership and keeps them off-chart", () => {
    for (const title of ["Owner", "Co-Owner", "Part Owner", "Board Member"]) {
      const hit = interpretTitle(title, vocab);
      expect(hit.function).toBe("ownership");
      expect(hit.inChart).toBe(false);
    }
  });

  it("does not steal Product Owner from product", () => {
    expect(interpretTitle("Product Owner", vocab).function).toBe("product");
  });

  it("does not dump advisory boards into ownership from the word board", () => {
    expect(interpretTitle("Board of Advisors - Phoenix Suns Charities", vocab).function).not.toBe(
      "ownership",
    );
  });
});
