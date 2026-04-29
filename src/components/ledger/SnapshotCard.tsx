"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fmtMoney, fmtPct, fmtNum, fmtShares, type SnapshotData } from "@/shared/sec-types";

type Row = {
  label: string;
  value: string;
  // `pct` is set ONLY for signed delta-style metrics. Values like
  // payout ratio (always positive) intentionally omit it so they render
  // neutral instead of being flagged "good" by trend coloring.
  pct?: number | null;
};

type Section = {
  title: string;
  rows: Row[];
};

function trend(v: number | null | undefined) {
  const cls = "size-3";
  if (v === null || v === undefined || !isFinite(v))
    return <Minus className={`${cls} text-muted-foreground`} />;
  if (v > 0) return <TrendingUp className={`${cls} text-emerald-600 dark:text-emerald-400`} />;
  if (v < 0) return <TrendingDown className={`${cls} text-rose-600 dark:text-rose-400`} />;
  return <Minus className={`${cls} text-muted-foreground`} />;
}

function valueClass(pct: number | null | undefined): string {
  if (pct === null || pct === undefined) return "";
  if (pct > 0) return "text-emerald-600 dark:text-emerald-400";
  if (pct < 0) return "text-rose-600 dark:text-rose-400";
  return "";
}

export function SnapshotCard({ snapshot }: { snapshot: SnapshotData }) {
  const sections: Section[] = [
    {
      title: "Financial Highlights",
      rows: [
        { label: "Fiscal Year", value: snapshot.fiscalYear ? String(snapshot.fiscalYear) : "—" },
        { label: "Fiscal Year Ends", value: snapshot.fiscalYearEnd ?? "—" },
        { label: "Most Recent Quarter (mrq)", value: snapshot.mostRecentQuarterEnd ?? "—" },
      ],
    },
    {
      title: "Profitability",
      rows: [
        { label: "Profit Margin", value: fmtPct(snapshot.profitMargin), pct: snapshot.profitMargin },
        {
          label: "Operating Margin (ttm)",
          value: fmtPct(snapshot.operatingMargin),
          pct: snapshot.operatingMargin,
        },
      ],
    },
    {
      title: "Management Effectiveness",
      rows: [
        {
          label: "Return on Assets (ttm)",
          value: fmtPct(snapshot.returnOnAssets),
          pct: snapshot.returnOnAssets,
        },
        {
          label: "Return on Equity (ttm)",
          value: fmtPct(snapshot.returnOnEquity),
          pct: snapshot.returnOnEquity,
        },
      ],
    },
    {
      title: "Income Statement",
      rows: [
        { label: "Revenue (ttm)", value: fmtMoney(snapshot.revenueTTM) },
        { label: "Revenue Per Share (ttm)", value: fmtNum(snapshot.revenuePerShareTTM) },
        {
          label: "Quarterly Revenue Growth (yoy)",
          value: fmtPct(snapshot.quarterlyRevenueGrowthYoY),
          pct: snapshot.quarterlyRevenueGrowthYoY,
        },
        { label: "Gross Profit (ttm)", value: fmtMoney(snapshot.grossProfitTTM) },
        { label: "EBITDA", value: fmtMoney(snapshot.ebitdaTTM) },
        { label: "Net Income Avi to Common (ttm)", value: fmtMoney(snapshot.netIncomeToCommonTTM) },
        { label: "Diluted EPS (ttm)", value: fmtNum(snapshot.dilutedEPSTTM) },
        {
          label: "Quarterly Earnings Growth (yoy)",
          value: fmtPct(snapshot.quarterlyEarningsGrowthYoY),
          pct: snapshot.quarterlyEarningsGrowthYoY,
        },
      ],
    },
    {
      title: "Balance Sheet",
      rows: [
        { label: "Total Cash (mrq)", value: fmtMoney(snapshot.totalCashMRQ) },
        { label: "Total Cash Per Share (mrq)", value: fmtNum(snapshot.totalCashPerShareMRQ) },
        { label: "Total Debt (mrq)", value: fmtMoney(snapshot.totalDebtMRQ) },
        { label: "Total Debt/Equity (mrq)", value: fmtNum(snapshot.totalDebtToEquityMRQ) },
        { label: "Current Ratio (mrq)", value: fmtNum(snapshot.currentRatioMRQ) },
        { label: "Book Value Per Share (mrq)", value: fmtNum(snapshot.bookValuePerShareMRQ) },
      ],
    },
    {
      title: "Cash Flow Statement",
      rows: [
        { label: "Operating Cash Flow (ttm)", value: fmtMoney(snapshot.operatingCashFlowTTM) },
        { label: "Levered Free Cash Flow (ttm)", value: fmtMoney(snapshot.leveredFreeCashFlowTTM) },
      ],
    },
    {
      title: "Share Statistics",
      rows: [
        { label: "Shares Outstanding", value: fmtShares(snapshot.sharesOutstanding) },
        { label: "% Held by Insiders", value: "See DEF 14A" },
      ],
    },
    {
      title: "Dividends & Splits",
      rows: [
        { label: "Forward Annual Dividend Rate", value: fmtNum(snapshot.forwardAnnualDividendRate) },
        { label: "Trailing Annual Dividend Rate", value: fmtNum(snapshot.trailingAnnualDividendRate) },
        // Payout ratio renders neutral — see Row.pct comment above.
        { label: "Payout Ratio", value: fmtPct(snapshot.payoutRatio) },
        { label: "Dividend Date", value: "See 8-K filings" },
        { label: "Ex-Dividend Date", value: "See 8-K filings" },
        { label: "Last Split Factor", value: "See 8-K filings" },
        { label: "Last Split Date", value: "See 8-K filings" },
      ],
    },
  ];

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b bg-muted/40 p-6">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="font-mono text-3xl font-bold tracking-tight text-primary">
              {snapshot.ticker}
            </h2>
            <Badge variant="outline" className="font-normal text-muted-foreground">
              CIK {parseInt(snapshot.cik, 10)}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{snapshot.entityName}</p>
        </div>
        <div className="text-right">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">As of</div>
          <div className="font-mono text-foreground">{snapshot.latestEnd ?? "—"}</div>
        </div>
      </div>

      <div className="grid gap-px bg-border md:grid-cols-2 lg:grid-cols-4">
        {sections.map((s) => (
          <div key={s.title} className="space-y-2 bg-card p-4">
            <h3 className="border-b border-border/60 pb-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
              {s.title}
            </h3>
            <dl className="space-y-1.5">
              {s.rows.map((r) => (
                <div key={r.label} className="flex items-baseline justify-between gap-3 text-sm">
                  <dt className="truncate text-muted-foreground">{r.label}</dt>
                  <dd className="flex shrink-0 items-center gap-1 font-mono text-foreground">
                    {"pct" in r && r.pct !== undefined ? trend(r.pct) : null}
                    <span className={"pct" in r ? valueClass(r.pct) : ""}>{r.value}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </Card>
  );
}
