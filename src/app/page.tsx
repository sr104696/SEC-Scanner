"use client";

import { useState } from "react";
import { LineChart, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { TickerForm } from "@/components/ledger/TickerForm";
import { SnapshotCard } from "@/components/ledger/SnapshotCard";
import { HistoryTable } from "@/components/ledger/HistoryTable";
import { FilingsPanel } from "@/components/ledger/FilingsPanel";
import { extractSecFinancials } from "@/client-lib/api-client";
import type { SecResponse } from "@/shared/sec-types";

export default function HomePage() {
  const [data, setData] = useState<SecResponse | null>(null);
  const [ticker, setTicker] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onExtract = async (params: { ticker: string; startYear: number; endYear: number }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await extractSecFinancials(params);
      setData(res);
      setTicker(params.ticker);
      toast.success(`Loaded ${res.snapshot.entityName}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load data";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-gradient-to-b from-muted/40 to-transparent">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="mb-2 flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-md bg-primary">
              <LineChart className="size-5 text-primary-foreground" />
            </div>
            <h1 className="font-mono text-2xl font-bold tracking-tight">Ledger</h1>
            <span className="rounded-full border px-2 py-0.5 text-xs uppercase tracking-[0.2em] text-muted-foreground">
              SEC EDGAR
            </span>
          </div>
          <p className="max-w-prose text-pretty text-sm text-muted-foreground">
            Pull every <span className="text-foreground">10-K, 10-Q, 8-K and DEF 14A</span>{" "}
            filing for a US-listed company between a year range. Extracts core financials,
            profitability, balance sheet and cash flow metrics from XBRL company facts.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-6 py-8">
        <Card className="p-5">
          <TickerForm onSubmit={onExtract} loading={loading} />
        </Card>

        {error && (
          <Card className="flex items-start gap-3 border-destructive/40 bg-destructive/10 p-4 text-sm">
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
            <div>
              <div className="font-semibold text-destructive">Extraction failed</div>
              <div className="text-muted-foreground">{error}</div>
            </div>
          </Card>
        )}

        {!data && !loading && !error && (
          <Card className="border-dashed bg-card/40 p-10 text-center">
            <p className="text-sm text-muted-foreground">
              Enter a ticker (e.g. <span className="font-mono text-primary">AAPL</span>,{" "}
              <span className="font-mono text-primary">MSFT</span>,{" "}
              <span className="font-mono text-primary">NVDA</span>) and a year range to extract
              its SEC filings.
            </p>
          </Card>
        )}

        {data && (
          <>
            <SnapshotCard snapshot={data.snapshot} />
            <HistoryTable periods={data.periods} ticker={ticker} />
            <FilingsPanel
              recent10K={data.filings.recent10K}
              recent8K={data.filings.recent8K}
              recentDEF14A={data.filings.recentDEF14A}
            />
            <p className="pb-4 text-center text-[11px] text-muted-foreground/70">
              Data sourced from SEC EDGAR (data.sec.gov XBRL company facts). Some figures
              (insider %, ex-dividend dates, split factors) live in 8-K / DEF 14A narrative
              text — direct filing links are provided above.
            </p>
          </>
        )}
      </main>
    </div>
  );
}
