"use client";

import { Fragment } from "react";
import { Download } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fmtMoney, fmtPct, fmtNum, type Period } from "@/shared/sec-types";

type Row = {
  key: string;
  label: string;
  format: "money" | "pct" | "num";
};

const SECTIONS: { title: string; rows: Row[] }[] = [
  {
    title: "Income Statement",
    rows: [
      { key: "Revenue", label: "Revenue", format: "money" },
      { key: "GrossProfit", label: "Gross Profit", format: "money" },
      { key: "OperatingIncome", label: "Operating Income", format: "money" },
      { key: "EBITDA", label: "EBITDA (approx.)", format: "money" },
      { key: "NetIncome", label: "Net Income", format: "money" },
      { key: "EPSDiluted", label: "Diluted EPS", format: "num" },
    ],
  },
  {
    title: "Cash Flow",
    rows: [
      { key: "OpCashFlow", label: "Operating Cash Flow", format: "money" },
      { key: "CapEx", label: "CapEx", format: "money" },
      { key: "FreeCashFlow", label: "Free Cash Flow", format: "money" },
      { key: "DividendsPaid", label: "Dividends Paid", format: "money" },
    ],
  },
  {
    title: "Balance Sheet",
    rows: [
      { key: "Cash", label: "Cash & Equivalents", format: "money" },
      { key: "CurrentAssets", label: "Current Assets", format: "money" },
      { key: "CurrentLiabilities", label: "Current Liabilities", format: "money" },
      { key: "TotalAssets", label: "Total Assets", format: "money" },
      { key: "TotalEquity", label: "Total Equity", format: "money" },
      { key: "LongTermDebt", label: "Long-Term Debt", format: "money" },
      { key: "TotalDebt", label: "Total Debt", format: "money" },
      { key: "SharesOutstanding", label: "Shares Outstanding", format: "money" },
    ],
  },
  {
    title: "Margins",
    rows: [
      { key: "GrossMargin", label: "Gross Margin", format: "pct" },
      { key: "OperatingMargin", label: "Operating Margin", format: "pct" },
      { key: "NetMargin", label: "Net Margin", format: "pct" },
    ],
  },
];

function fmt(v: number | null | undefined, kind: Row["format"]) {
  if (v === null || v === undefined) return "—";
  if (kind === "pct") return fmtPct(v);
  if (kind === "num") return fmtNum(v);
  return fmtMoney(v);
}

// RFC-4180-correct CSV escape. Quotes any cell containing commas, quotes,
// CR or LF; doubles embedded quotes.
export function csvEscape(c: unknown): string {
  const s = c === null || c === undefined ? "" : String(c);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function downloadCsv(periods: Period[], ticker: string) {
  const headers = ["Section", "Metric", ...periods.map((p) => p.label)];
  const lines: string[] = [headers.map(csvEscape).join(",")];
  for (const s of SECTIONS) {
    for (const r of s.rows) {
      const row = [
        s.title,
        r.label,
        ...periods.map((p) => {
          const v = p.values[r.key];
          if (v === null || v === undefined) return "";
          if (r.format === "pct") return (v * 100).toFixed(4);
          return String(v);
        }),
      ];
      lines.push(row.map(csvEscape).join(","));
    }
  }
  const blob = new Blob([lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  // No trailing newline in filename — silent corruption on Windows otherwise.
  a.download = `${ticker}_ledger.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Defer revoke so throttled hardware has time to resolve the download.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function HistoryTable({ periods, ticker }: { periods: Period[]; ticker: string }) {
  if (periods.length === 0) {
    return (
      <Card className="p-6 text-sm text-muted-foreground">
        No filings found in this year range.
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b bg-muted/30 p-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-primary">
            Historical Periods
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {periods.length} filing{periods.length !== 1 ? "s" : ""} · 10-K (FY) and 10-Q
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => downloadCsv(periods, ticker)}>
          <Download className="mr-2 size-4" />
          Export CSV
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full font-mono text-sm">
          <thead className="sticky top-0 bg-muted/40">
            <tr>
              <th className="sticky left-0 z-10 min-w-[200px] bg-muted/60 px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground backdrop-blur">
                Metric
              </th>
              {periods.map((p) => (
                <th
                  key={p.key}
                  className="whitespace-nowrap px-3 py-2.5 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
                >
                  <div className="text-foreground">{p.label}</div>
                  <div className="mt-0.5 text-[10px] normal-case text-muted-foreground/70">
                    {p.end} · {p.form || "—"}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SECTIONS.map((s, si) => (
              <Fragment key={`sec-${si}`}>
                <tr className="bg-muted/20">
                  <td
                    colSpan={periods.length + 1}
                    className="sticky left-0 bg-muted/40 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-primary"
                  >
                    {s.title}
                  </td>
                </tr>
                {s.rows.map((r, ri) => (
                  <tr
                    key={`${si}-${ri}`}
                    className="border-t border-border/40 transition-colors hover:bg-muted/20"
                  >
                    <td className="sticky left-0 whitespace-nowrap bg-card px-4 py-2 text-foreground">
                      {r.label}
                    </td>
                    {periods.map((p) => {
                      const v = p.values[r.key];
                      const isNeg = typeof v === "number" && v < 0;
                      return (
                        <td
                          key={p.key}
                          className={`whitespace-nowrap px-3 py-2 text-right ${
                            v === null || v === undefined
                              ? "text-muted-foreground/50"
                              : isNeg
                                ? "text-rose-600 dark:text-rose-400"
                                : "text-foreground"
                          }`}
                        >
                          {fmt(v, r.format)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
