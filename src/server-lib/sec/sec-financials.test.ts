import {
  bucketFlow,
  classify,
  durationDays,
  pickUnits,
  quarterLabelForEnd,
  safeDiv,
  type CompanyFacts,
  type FactUnit,
} from "./sec-financials";

describe("durationDays / classify", () => {
  test("instant fact has no start", () => {
    expect(classify({ end: "2024-12-31", val: 1 } as FactUnit)).toEqual({
      kind: "instant",
      days: null,
    });
  });

  test("90-day fact classifies as quarterly", () => {
    const u: FactUnit = { start: "2024-01-01", end: "2024-03-31", val: 1 };
    expect(classify(u).kind).toBe("quarterly");
  });

  test("365-day fact classifies as annual", () => {
    const u: FactUnit = { start: "2024-01-01", end: "2024-12-31", val: 1 };
    expect(classify(u).kind).toBe("annual");
  });

  test("YTD-style 180 days falls into the bucketed-but-filtered annual bin", () => {
    const u: FactUnit = { start: "2024-01-01", end: "2024-06-30", val: 1 };
    const c = classify(u);
    expect(c.kind).toBe("annual");
    // Days outside [350,380] — bucketFlow should NOT add it to the annual map.
    expect(c.days).toBeGreaterThan(100);
    expect(c.days).toBeLessThan(350);
  });

  test("durationDays handles missing input", () => {
    expect(durationDays(undefined, "2024-01-01")).toBeNull();
    expect(durationDays("2024-01-01", undefined)).toBeNull();
  });
});

describe("quarterLabelForEnd", () => {
  test("Mar 31 → Q1", () => {
    expect(quarterLabelForEnd("2024-03-31").fp).toBe("Q1");
  });
  test("Jun 30 → Q2", () => {
    expect(quarterLabelForEnd("2024-06-30").fp).toBe("Q2");
  });
  test("Sep 30 → Q3", () => {
    expect(quarterLabelForEnd("2024-09-30").fp).toBe("Q3");
  });
  test("Dec 31 → Q4", () => {
    expect(quarterLabelForEnd("2024-12-31").fp).toBe("Q4");
  });
});

describe("bucketFlow Q4 derivation", () => {
  // Three quarterlies + one annual; missing Q4. For non-per-share flows
  // the engine should derive Q4 = Annual − (Q1+Q2+Q3).
  const quarters: FactUnit[] = [
    { start: "2024-01-01", end: "2024-03-31", val: 100, filed: "2024-04-30" },
    { start: "2024-04-01", end: "2024-06-30", val: 110, filed: "2024-07-30" },
    { start: "2024-07-01", end: "2024-09-30", val: 120, filed: "2024-10-30" },
  ];
  const annual: FactUnit = {
    start: "2024-01-01",
    end: "2024-12-31",
    val: 500,
    filed: "2025-02-15",
  };

  test("derives Q4 for non-per-share flows", () => {
    const { quarterly } = bucketFlow([...quarters, annual], false);
    const q4 = quarterly.get("2024-Q4");
    expect(q4).toBeDefined();
    expect(q4!.val).toBe(500 - 100 - 110 - 120);
  });

  test("does NOT derive Q4 for per-share flows (e.g. EPS)", () => {
    // Per-share: Q1 1.0, Q2 1.1, Q3 1.2, Annual 5.0 — naive subtraction would
    // yield 1.7 EPS, which is bogus because share count differs each quarter.
    const epsQ: FactUnit[] = [
      { start: "2024-01-01", end: "2024-03-31", val: 1.0, filed: "2024-04-30" },
      { start: "2024-04-01", end: "2024-06-30", val: 1.1, filed: "2024-07-30" },
      { start: "2024-07-01", end: "2024-09-30", val: 1.2, filed: "2024-10-30" },
    ];
    const epsA: FactUnit = {
      start: "2024-01-01",
      end: "2024-12-31",
      val: 5.0,
      filed: "2025-02-15",
    };
    const { quarterly } = bucketFlow([...epsQ, epsA], true);
    expect(quarterly.has("2024-Q4")).toBe(false);
  });

  test("does not overwrite an explicit Q4", () => {
    const explicitQ4: FactUnit = {
      start: "2024-10-01",
      end: "2024-12-31",
      val: 999,
      filed: "2025-02-15",
    };
    const { quarterly } = bucketFlow([...quarters, annual, explicitQ4], false);
    expect(quarterly.get("2024-Q4")?.val).toBe(999);
  });

  test("picks the most recently filed value when duplicates exist", () => {
    const u1: FactUnit = {
      start: "2024-01-01",
      end: "2024-03-31",
      val: 100,
      filed: "2024-04-30",
    };
    const u2: FactUnit = {
      start: "2024-01-01",
      end: "2024-03-31",
      val: 105,
      filed: "2024-08-15",
    };
    const { quarterly } = bucketFlow([u1, u2], false);
    expect(quarterly.get("2024-Q1")?.val).toBe(105);
  });
});

describe("pickUnits", () => {
  test("merges synonyms and prefers preferred unit", () => {
    const facts: CompanyFacts = {
      cik: 1,
      entityName: "X",
      facts: {
        "us-gaap": {
          Revenues: {
            units: {
              USD: [{ end: "2024-03-31", start: "2024-01-01", val: 100, filed: "2024-04-01" }],
            },
          },
          RevenueFromContractWithCustomerExcludingAssessedTax: {
            units: {
              USD: [{ end: "2024-06-30", start: "2024-04-01", val: 200, filed: "2024-07-01" }],
            },
          },
        },
      },
    };
    const arr = pickUnits(
      facts,
      ["RevenueFromContractWithCustomerExcludingAssessedTax", "Revenues"],
      ["USD"],
    );
    expect(arr).toHaveLength(2);
  });
});

describe("safeDiv", () => {
  test.each([
    [1, 0, null],
    [1, null, null],
    [null, 1, null],
    [Infinity, 1, null],
    [10, 2, 5],
  ])("safeDiv(%p, %p) === %p", (a, b, expected) => {
    expect(safeDiv(a as number | null, b as number | null)).toBe(expected);
  });
});
