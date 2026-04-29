// SEC EDGAR XBRL bucketing engine.
//
// Pure functions ported from the original Deno Edge Function in
// `filings-insightful-bot`, with the audit fixes applied:
//
//   - `bucketFlow` accepts `isPerShare` and skips Q4 = Annual − (Q1+Q2+Q3)
//     derivation for per-share concepts (EPS, dividends-per-share),
//     because share counts differ across quarters.
//   - Period sorting tie-breaker so an FY row precedes a co-dated Q4 row.
//   - `pickLatestQuarterlyDPS` exposed for `forwardAnnualDividendRate = 4×Q`.
//
// The HTTP entry point lives in `src/app/api/sec-financials/route.ts`.

import type { Period, SecResponse, SnapshotData, FilingMeta } from "@/shared/sec-types";

export type FactUnit = {
  end: string;
  start?: string;
  val: number;
  fy?: number;
  fp?: string;
  form?: string;
  filed?: string;
  accn?: string;
};

export type CompanyFacts = {
  cik: number;
  entityName: string;
  facts: {
    "us-gaap"?: Record<string, { units: Record<string, FactUnit[]> }>;
    dei?: Record<string, { units: Record<string, FactUnit[]> }>;
  };
};

type SubmissionsRecent = {
  accessionNumber: string[];
  filingDate: string[];
  reportDate: string[];
  form: string[];
};
type Submissions = { filings?: { recent?: SubmissionsRecent } };

// SEC EDGAR's fair-use policy asks for a User-Agent that identifies the
// caller and includes a contact email. We ship a sensible default so the
// app works out of the box; operators can override via the SEC_USER_AGENT
// env var if they want their own contact on record.
const DEFAULT_SEC_USER_AGENT = "Vybe Ledger App contact+vybe-ledger@vybe.app";

function getUserAgent(): string {
  const ua = process.env.SEC_USER_AGENT?.trim();
  if (ua && /.+@.+\..+/.test(ua)) return ua;
  return DEFAULT_SEC_USER_AGENT;
}

async function secFetch(url: string): Promise<Response> {
  return fetch(url, {
    headers: { "User-Agent": getUserAgent(), Accept: "application/json, text/html" },
  });
}

export async function resolveCik(
  ticker: string,
): Promise<{ cik: string; name: string } | null> {
  const res = await secFetch("https://www.sec.gov/files/company_tickers.json");
  if (!res.ok) return null;
  const ct = res.headers.get("content-type") ?? "";
  if (!ct.includes("json")) return null;
  const data = (await res.json()) as Record<
    string,
    { cik_str: number; ticker: string; title: string }
  >;
  const upper = ticker.toUpperCase();
  for (const k of Object.keys(data)) {
    const row = data[k];
    if (row && row.ticker === upper) {
      return {
        cik: String(row.cik_str).padStart(10, "0"),
        name: row.title,
      };
    }
  }
  return null;
}

// Merge units from ALL matching concept synonyms — filers sometimes switch
// tags between filings. Dedupe by (start|end), keeping the most recently
// filed value.
export function pickUnits(
  facts: CompanyFacts,
  conceptCandidates: string[],
  preferredUnits: string[],
): FactUnit[] {
  const ns = facts.facts["us-gaap"] ?? {};
  const dei = facts.facts.dei ?? {};
  const merged = new Map<string, FactUnit>();
  for (const c of conceptCandidates) {
    const node = ns[c] ?? dei[c];
    if (!node) continue;
    let unitArr: FactUnit[] | undefined;
    for (const u of preferredUnits) {
      if (node.units[u]) {
        unitArr = node.units[u];
        break;
      }
    }
    if (!unitArr) {
      const firstKey = Object.keys(node.units)[0];
      if (firstKey) unitArr = node.units[firstKey];
    }
    if (!unitArr) continue;
    for (const u of unitArr) {
      const key = `${u.start ?? ""}|${u.end}`;
      const prev = merged.get(key);
      if (!prev || (u.filed ?? "") > (prev.filed ?? "")) merged.set(key, u);
    }
  }
  return [...merged.values()];
}

// Concept dictionaries — multiple synonyms because tags vary by filer.
export const CONCEPTS: Record<string, string[]> = {
  Revenue: [
    "RevenueFromContractWithCustomerExcludingAssessedTax",
    "Revenues",
    "RevenueFromContractWithCustomerIncludingAssessedTax",
    "SalesRevenueNet",
    "SalesRevenueGoodsNet",
  ],
  CostOfRevenue: [
    "CostOfRevenue",
    "CostOfGoodsAndServicesSold",
    "CostOfGoodsSold",
    "CostOfServices",
  ],
  GrossProfit: ["GrossProfit"],
  OperatingIncome: ["OperatingIncomeLoss"],
  NetIncome: ["NetIncomeLoss", "ProfitLoss"],
  NetIncomeToCommon: ["NetIncomeLossAvailableToCommonStockholdersBasic", "NetIncomeLoss"],
  EPSDiluted: ["EarningsPerShareDiluted"],
  EPSBasic: ["EarningsPerShareBasic"],
  OpCashFlow: [
    "NetCashProvidedByUsedInOperatingActivities",
    "NetCashProvidedByUsedInOperatingActivitiesContinuingOperations",
  ],
  CapEx: ["PaymentsToAcquirePropertyPlantAndEquipment", "PaymentsToAcquireProductiveAssets"],
  DepreciationAmortization: [
    "DepreciationDepletionAndAmortization",
    "DepreciationAndAmortization",
    "Depreciation",
  ],
  InterestExpense: ["InterestExpense"],
  IncomeTax: ["IncomeTaxExpenseBenefit"],
  Cash: [
    "CashAndCashEquivalentsAtCarryingValue",
    "CashCashEquivalentsRestrictedCashAndRestrictedCashEquivalents",
  ],
  ShortTermInvestments: ["ShortTermInvestments", "MarketableSecuritiesCurrent"],
  LongTermDebt: ["LongTermDebtNoncurrent", "LongTermDebt"],
  ShortTermDebt: ["LongTermDebtCurrent", "ShortTermBorrowings", "DebtCurrent"],
  TotalAssets: ["Assets"],
  TotalEquity: [
    "StockholdersEquity",
    "StockholdersEquityIncludingPortionAttributableToNoncontrollingInterest",
  ],
  CurrentAssets: ["AssetsCurrent"],
  CurrentLiabilities: ["LiabilitiesCurrent"],
  SharesOutstanding: ["CommonStockSharesOutstanding", "EntityCommonStockSharesOutstanding"],
  WeightedAvgDilutedShares: ["WeightedAverageNumberOfDilutedSharesOutstanding"],
  DividendsPerShare: [
    "CommonStockDividendsPerShareDeclared",
    "CommonStockDividendsPerShareCashPaid",
  ],
  DividendsPaid: ["PaymentsOfDividends", "PaymentsOfDividendsCommonStock"],
};

// ---- period classification ------------------------------------------------

type PeriodKind = "annual" | "quarterly" | "instant";

export function durationDays(start?: string, end?: string): number | null {
  if (!start || !end) return null;
  return Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86400000);
}

export function classify(u: FactUnit): { kind: PeriodKind; days: number | null } {
  if (!u.start) return { kind: "instant", days: null };
  const d = durationDays(u.start, u.end);
  if (d === null) return { kind: "annual", days: null };
  if (d >= 350 && d <= 380) return { kind: "annual", days: d };
  if (d >= 80 && d <= 100) return { kind: "quarterly", days: d };
  return { kind: "annual", days: d }; // YTD; will be filtered out
}

export function quarterLabelForEnd(end: string): { fy: number; fp: string; label: string } {
  const d = new Date(end);
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth() + 1;
  let q: 1 | 2 | 3 | 4 = 1;
  if (m <= 3) q = 1;
  else if (m <= 6) q = 2;
  else if (m <= 9) q = 3;
  else q = 4;
  return { fy: y, fp: `Q${q}`, label: `Q${q} ${y}` };
}

export function annualLabelForEnd(end: string): { fy: number; fp: string; label: string } {
  const y = new Date(end).getUTCFullYear();
  return { fy: y, fp: "FY", label: `FY${y}` };
}

// Bucket a *flow* concept (revenue, net income, etc.) into per-quarter and
// per-year maps, picking latest-filed value per period.
//
// `isPerShare` short-circuits the Q4 = Annual − Q1−Q2−Q3 derivation, which
// is mathematically wrong for per-share series (EPS, DPS).
export function bucketFlow(
  units: FactUnit[],
  isPerShare = false,
): { quarterly: Map<string, FactUnit>; annual: Map<string, FactUnit> } {
  const quarterly = new Map<string, FactUnit>();
  const annual = new Map<string, FactUnit>();

  for (const u of units) {
    if (!u.start) continue;
    const c = classify(u);
    if (c.kind === "quarterly") {
      const { fy, fp } = quarterLabelForEnd(u.end);
      const key = `${fy}-${fp}`;
      const prev = quarterly.get(key);
      if (!prev || (u.filed ?? "") > (prev.filed ?? "")) quarterly.set(key, u);
    } else if (c.kind === "annual" && c.days !== null && c.days >= 350 && c.days <= 380) {
      const { fy } = annualLabelForEnd(u.end);
      const key = `${fy}`;
      const prev = annual.get(key);
      if (!prev || (u.filed ?? "") > (prev.filed ?? "")) annual.set(key, u);
    }
  }

  if (!isPerShare) {
    for (const [yKey, ann] of annual) {
      const fy = Number(yKey);
      const q4Key = `${fy}-Q4`;
      if (quarterly.has(q4Key)) continue;
      const q1 = quarterly.get(`${fy}-Q1`);
      const q2 = quarterly.get(`${fy}-Q2`);
      const q3 = quarterly.get(`${fy}-Q3`);
      if (q1 && q2 && q3) {
        quarterly.set(q4Key, {
          end: ann.end,
          start: q3.end,
          val: ann.val - q1.val - q2.val - q3.val,
          form: ann.form,
          filed: ann.filed,
        });
      }
    }
  }

  return { quarterly, annual };
}

export function bucketInstant(units: FactUnit[]): {
  quarterly: Map<string, FactUnit>;
  annual: Map<string, FactUnit>;
} {
  const quarterly = new Map<string, FactUnit>();
  const annual = new Map<string, FactUnit>();
  for (const u of units) {
    if (u.start) continue;
    const d = new Date(u.end);
    const m = d.getUTCMonth() + 1;
    const day = d.getUTCDate();
    const isQuarterEnd =
      (m === 3 && day >= 28) ||
      (m === 6 && day === 30) ||
      (m === 9 && day === 30) ||
      (m === 12 && day === 31);
    if (!isQuarterEnd) continue;
    const { fy, fp } = quarterLabelForEnd(u.end);
    const qKey = `${fy}-${fp}`;
    const qPrev = quarterly.get(qKey);
    if (!qPrev || (u.filed ?? "") > (qPrev.filed ?? "")) quarterly.set(qKey, u);
    if (fp === "Q4") {
      const yKey = `${fy}`;
      const yPrev = annual.get(yKey);
      if (!yPrev || (u.filed ?? "") > (yPrev.filed ?? "")) annual.set(yKey, u);
    }
  }
  return { quarterly, annual };
}

const FLOW_CONCEPTS = new Set([
  "Revenue",
  "CostOfRevenue",
  "GrossProfit",
  "OperatingIncome",
  "NetIncome",
  "NetIncomeToCommon",
  "OpCashFlow",
  "CapEx",
  "DepreciationAmortization",
  "InterestExpense",
  "IncomeTax",
  "DividendsPaid",
  "DividendsPerShare",
  "EPSDiluted",
  "EPSBasic",
]);

const PER_SHARE_FLOWS = new Set(["EPSDiluted", "EPSBasic", "DividendsPerShare"]);

const INSTANT_CONCEPTS = new Set([
  "Cash",
  "ShortTermInvestments",
  "LongTermDebt",
  "ShortTermDebt",
  "TotalAssets",
  "TotalEquity",
  "CurrentAssets",
  "CurrentLiabilities",
  "SharesOutstanding",
]);

export function safeDiv(a: number | null, b: number | null | undefined): number | null {
  if (a === null || b === null || b === undefined || !isFinite(a) || !isFinite(b) || b === 0) {
    return null;
  }
  return a / b;
}

// ---- main extractor -------------------------------------------------------

export class SecError extends Error {
  status: number;
  constructor(msg: string, status: number) {
    super(msg);
    this.status = status;
  }
}

export async function extractFinancials(req: {
  ticker: string;
  startYear: number;
  endYear: number;
}): Promise<SecResponse> {
  const ticker = req.ticker.trim().toUpperCase();
  if (!ticker || ticker.length > 10) {
    throw new SecError("Invalid ticker", 400);
  }
  if (!Number.isFinite(req.startYear) || !Number.isFinite(req.endYear)) {
    throw new SecError("Invalid year range", 400);
  }
  if (req.startYear > req.endYear) {
    throw new SecError("Start year must be before or equal to end year.", 400);
  }

  const resolved = await resolveCik(ticker);
  if (!resolved) {
    throw new SecError(`Ticker not found in SEC EDGAR: ${ticker}`, 404);
  }

  const [factsRes, subsRes] = await Promise.all([
    secFetch(`https://data.sec.gov/api/xbrl/companyfacts/CIK${resolved.cik}.json`),
    secFetch(`https://data.sec.gov/submissions/CIK${resolved.cik}.json`),
  ]);

  if (!factsRes.ok) {
    throw new SecError(`SEC company-facts fetch failed (${factsRes.status})`, 502);
  }
  // Defend against SEC returning an HTML throttling page — JSON.parse would
  // surface a confusing "Unexpected token <" error otherwise.
  const ct = factsRes.headers.get("content-type") ?? "";
  if (!ct.includes("json")) {
    throw new SecError(
      "SEC returned non-JSON (likely throttled). Set SEC_USER_AGENT secret with a real contact email and retry.",
      502,
    );
  }

  const facts = (await factsRes.json()) as CompanyFacts;
  const subs = (subsRes.ok ? ((await subsRes.json()) as Submissions) : null) as Submissions | null;

  const series: Record<string, FactUnit[]> = {};
  for (const [key, concepts] of Object.entries(CONCEPTS)) {
    series[key] = pickUnits(facts, concepts, ["USD", "USD/shares", "shares", "pure"]);
  }

  const flowBuckets: Record<
    string,
    { quarterly: Map<string, FactUnit>; annual: Map<string, FactUnit> }
  > = {};
  const instantBuckets: Record<
    string,
    { quarterly: Map<string, FactUnit>; annual: Map<string, FactUnit> }
  > = {};

  for (const k of Object.keys(CONCEPTS)) {
    const arr = series[k] ?? [];
    if (FLOW_CONCEPTS.has(k)) {
      flowBuckets[k] = bucketFlow(arr, PER_SHARE_FLOWS.has(k));
    } else if (INSTANT_CONCEPTS.has(k)) {
      instantBuckets[k] = bucketInstant(arr);
    }
  }

  // Build period table -----------------------------------------------------
  const allPeriodKeys = new Set<string>();
  for (const k of Object.keys(flowBuckets)) {
    flowBuckets[k]?.quarterly.forEach((_, kk) => allPeriodKeys.add(`Q:${kk}`));
    flowBuckets[k]?.annual.forEach((_, kk) => allPeriodKeys.add(`A:${kk}`));
  }
  for (const k of Object.keys(instantBuckets)) {
    instantBuckets[k]?.quarterly.forEach((_, kk) => allPeriodKeys.add(`Q:${kk}`));
    instantBuckets[k]?.annual.forEach((_, kk) => allPeriodKeys.add(`A:${kk}`));
  }

  const periods: Period[] = [];
  for (const pk of allPeriodKeys) {
    const isAnnual = pk.startsWith("A:");
    const rest = pk.slice(2);
    const fy = Number(isAnnual ? rest : (rest.split("-")[0] ?? ""));
    if (!Number.isFinite(fy) || fy < req.startYear || fy > req.endYear) continue;

    const fp = isAnnual ? "FY" : (rest.split("-")[1] ?? "Q1");
    const label = isAnnual ? `FY${fy}` : `${fp} ${fy}`;

    let end = "";
    let start: string | null = null;
    let form = "";

    const probeFlow = flowBuckets["Revenue"] ?? flowBuckets["NetIncome"];
    if (probeFlow) {
      const u = isAnnual ? probeFlow.annual.get(rest) : probeFlow.quarterly.get(rest);
      if (u) {
        end = u.end;
        start = u.start ?? null;
        form = u.form ?? "";
      }
    }
    if (!end) {
      const bs = instantBuckets["TotalAssets"];
      if (bs) {
        const u = isAnnual ? bs.annual.get(rest) : bs.quarterly.get(rest);
        if (u) {
          end = u.end;
          form = u.form ?? "";
        }
      }
    }

    const values: Record<string, number | null> = {};
    for (const k of Object.keys(CONCEPTS)) {
      const bucket = FLOW_CONCEPTS.has(k) ? flowBuckets[k] : instantBuckets[k];
      if (!bucket) {
        values[k] = null;
        continue;
      }
      const u = isAnnual ? bucket.annual.get(rest) : bucket.quarterly.get(rest);
      values[k] = u?.val ?? null;
    }

    // Derived
    values["FreeCashFlow"] =
      values["OpCashFlow"] !== null && values["CapEx"] !== null
        ? values["OpCashFlow"]! - values["CapEx"]!
        : null;
    if (
      values["GrossProfit"] === null &&
      values["Revenue"] !== null &&
      values["CostOfRevenue"] !== null
    ) {
      values["GrossProfit"] = values["Revenue"]! - values["CostOfRevenue"]!;
    }
    values["EBITDA"] =
      values["OperatingIncome"] !== null && values["DepreciationAmortization"] !== null
        ? values["OperatingIncome"]! + values["DepreciationAmortization"]!
        : values["OperatingIncome"];
    values["TotalDebt"] =
      values["LongTermDebt"] !== null || values["ShortTermDebt"] !== null
        ? (values["LongTermDebt"] ?? 0) + (values["ShortTermDebt"] ?? 0)
        : null;
    values["GrossMargin"] = safeDiv(values["GrossProfit"], values["Revenue"]);
    values["OperatingMargin"] = safeDiv(values["OperatingIncome"], values["Revenue"]);
    values["NetMargin"] = safeDiv(values["NetIncome"], values["Revenue"]);

    periods.push({
      key: pk,
      label,
      fy,
      fp,
      end: end || `${fy}-12-31`,
      start,
      form,
      values,
    });
  }

  // Sort newest-first; on equal end-date, FY rank precedes Q4.
  const fpRank = (fp: string) => (fp === "FY" ? 0 : 1);
  periods.sort((a, b) => {
    if (a.end !== b.end) return b.end.localeCompare(a.end);
    return fpRank(a.fp) - fpRank(b.fp);
  });

  // Snapshot ---------------------------------------------------------------
  const latestAnnual = periods.find((p) => p.fp === "FY");
  const latestQuarter = periods.find((p) => p.fp !== "FY");
  const latestEnd = latestQuarter?.end ?? latestAnnual?.end ?? null;

  const ttm = (conceptKey: string): number | null => {
    const bucket = flowBuckets[conceptKey];
    if (!bucket) return null;
    const sortedQ = [...bucket.quarterly.entries()].sort((a, b) =>
      a[1].end < b[1].end ? 1 : -1,
    );
    if (sortedQ.length === 0) {
      const sortedA = [...bucket.annual.entries()].sort((a, b) =>
        a[1].end < b[1].end ? 1 : -1,
      );
      return sortedA[0]?.[1].val ?? null;
    }
    if (sortedQ.length < 4) {
      const sortedA = [...bucket.annual.entries()].sort((a, b) =>
        a[1].end < b[1].end ? 1 : -1,
      );
      return sortedA[0]?.[1].val ?? null;
    }
    return sortedQ.slice(0, 4).reduce((s, [, u]) => s + u.val, 0);
  };

  const pit = (conceptKey: string): number | null => {
    const bucket = instantBuckets[conceptKey];
    if (!bucket) return null;
    const merged = [...bucket.quarterly.values(), ...bucket.annual.values()].sort((a, b) =>
      a.end < b.end ? 1 : -1,
    );
    return merged[0]?.val ?? null;
  };

  const revenueTTM = ttm("Revenue");
  const cogsTTM = ttm("CostOfRevenue");
  let grossProfitTTM = ttm("GrossProfit");
  if (grossProfitTTM === null && revenueTTM !== null && cogsTTM !== null) {
    grossProfitTTM = revenueTTM - cogsTTM;
  }
  const opIncomeTTM = ttm("OperatingIncome");
  const netIncomeTTM = ttm("NetIncome");
  const netIncomeToCommonTTM = ttm("NetIncomeToCommon") ?? netIncomeTTM;
  const epsDilutedTTM = ttm("EPSDiluted");
  const ocfTTM = ttm("OpCashFlow");
  const capExTTM = ttm("CapEx");
  const daTTM = ttm("DepreciationAmortization");
  const dividendsPaidTTM = ttm("DividendsPaid");

  const cashMRQ = pit("Cash");
  const stInvMRQ = pit("ShortTermInvestments");
  const totalCashMRQ =
    cashMRQ !== null || stInvMRQ !== null ? (cashMRQ ?? 0) + (stInvMRQ ?? 0) : null;
  const ltDebt = pit("LongTermDebt");
  const stDebt = pit("ShortTermDebt");
  const totalDebtMRQ = ltDebt !== null || stDebt !== null ? (ltDebt ?? 0) + (stDebt ?? 0) : null;
  const totalAssetsMRQ = pit("TotalAssets");
  const totalEquityMRQ = pit("TotalEquity");
  const currentAssetsMRQ = pit("CurrentAssets");
  const currentLiabMRQ = pit("CurrentLiabilities");
  const sharesOutstanding = pit("SharesOutstanding");
  const dividendPerShareTTM = ttm("DividendsPerShare");

  const ebitdaTTM =
    opIncomeTTM !== null && daTTM !== null ? opIncomeTTM + daTTM : opIncomeTTM;

  const quarterlyYoY = (conceptKey: string): number | null => {
    const bucket = flowBuckets[conceptKey];
    if (!bucket) return null;
    const sortedQ = [...bucket.quarterly.values()].sort((a, b) => (a.end < b.end ? 1 : -1));
    const latest = sortedQ[0];
    if (!latest) return null;
    const targetEnd = new Date(latest.end);
    targetEnd.setUTCFullYear(targetEnd.getUTCFullYear() - 1);
    const prev = sortedQ.find(
      (u) => Math.abs(new Date(u.end).getTime() - targetEnd.getTime()) < 20 * 86400000,
    );
    if (!prev || prev.val === 0) return null;
    return (latest.val - prev.val) / prev.val;
  };

  const revQYoY = quarterlyYoY("Revenue");
  const niQYoY = quarterlyYoY("NetIncome");

  // Forward dividend rate — annualize the most-recent quarterly DPS instead
  // of mislabeling the trailing TTM sum as forward.
  // (Heuristic: 4 × latest quarterly. Off for irregular/semi-annual payers.)
  const forwardAnnualDividendRate = (() => {
    const dpsBucket = flowBuckets["DividendsPerShare"];
    if (!dpsBucket) return null;
    const latestQ = [...dpsBucket.quarterly.values()].sort((a, b) =>
      a.end < b.end ? 1 : -1,
    )[0];
    return latestQ ? latestQ.val * 4 : null;
  })();

  // Submissions -----------------------------------------------------------
  const filings: FilingMeta[] = [];
  if (subs?.filings?.recent) {
    const r = subs.filings.recent;
    const n = r.accessionNumber.length;
    for (let i = 0; i < n; i++) {
      const form = r.form[i] ?? "";
      if (!["10-K", "10-Q", "8-K", "DEF 14A"].includes(form)) continue;
      const filed = r.filingDate[i] ?? "";
      const reportDate = r.reportDate[i] || filed;
      const acc = r.accessionNumber[i] ?? "";
      const accNoDash = acc.replace(/-/g, "");
      const cikInt = parseInt(resolved.cik, 10);
      filings.push({
        form,
        filed,
        reportDate,
        accession: acc,
        url: `https://www.sec.gov/Archives/edgar/data/${cikInt}/${accNoDash}/${acc}-index.htm`,
      });
    }
  }
  const recent10K = filings.filter((f) => f.form === "10-K").slice(0, 5);
  const recent8K = filings.filter((f) => f.form === "8-K").slice(0, 10);
  const recentDEF14A = filings.filter((f) => f.form === "DEF 14A").slice(0, 3);

  const mostRecent10K = recent10K[0];
  const fiscalYearEnd = mostRecent10K?.reportDate ?? null;
  const fiscalYear = fiscalYearEnd ? Number(fiscalYearEnd.slice(0, 4)) : null;

  const snapshot: SnapshotData = {
    ticker,
    entityName: resolved.name,
    cik: resolved.cik,
    latestEnd,
    fiscalYear,
    fiscalYearEnd,
    mostRecentQuarterEnd: latestQuarter?.end ?? null,

    profitMargin: safeDiv(netIncomeTTM, revenueTTM),
    operatingMargin: safeDiv(opIncomeTTM, revenueTTM),
    returnOnAssets: safeDiv(netIncomeTTM, totalAssetsMRQ),
    returnOnEquity: safeDiv(netIncomeToCommonTTM, totalEquityMRQ),

    revenueTTM,
    revenuePerShareTTM: safeDiv(revenueTTM, sharesOutstanding),
    quarterlyRevenueGrowthYoY: revQYoY,
    grossProfitTTM,
    ebitdaTTM,
    netIncomeToCommonTTM,
    dilutedEPSTTM: epsDilutedTTM,
    quarterlyEarningsGrowthYoY: niQYoY,

    totalCashMRQ,
    totalCashPerShareMRQ: safeDiv(totalCashMRQ, sharesOutstanding),
    totalDebtMRQ,
    totalDebtToEquityMRQ:
      totalDebtMRQ !== null && totalEquityMRQ ? totalDebtMRQ / totalEquityMRQ : null,
    currentRatioMRQ: safeDiv(currentAssetsMRQ, currentLiabMRQ),
    bookValuePerShareMRQ: safeDiv(totalEquityMRQ, sharesOutstanding),

    operatingCashFlowTTM: ocfTTM,
    leveredFreeCashFlowTTM:
      ocfTTM !== null && capExTTM !== null ? ocfTTM - capExTTM : null,

    sharesOutstanding,

    forwardAnnualDividendRate,
    trailingAnnualDividendRate: dividendPerShareTTM,
    payoutRatio: safeDiv(dividendsPaidTTM, netIncomeTTM),
  };

  return {
    snapshot,
    periods,
    filings: { recent10K, recent8K, recentDEF14A },
  };
}
