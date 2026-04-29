"use client";

import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  onSubmit: (params: { ticker: string; startYear: number; endYear: number }) => void;
  loading: boolean;
};

export function TickerForm({ onSubmit, loading }: Props) {
  const currentYear = new Date().getFullYear();
  const [ticker, setTicker] = useState("AAPL");
  const [startYear, setStartYear] = useState(currentYear - 5);
  const [endYear, setEndYear] = useState(currentYear);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const t = ticker.trim().toUpperCase();
        if (!t) {
          toast.error("Enter a ticker symbol.");
          return;
        }
        if (!Number.isFinite(startYear) || !Number.isFinite(endYear)) {
          toast.error("Year inputs must be valid numbers.");
          return;
        }
        if (startYear > endYear) {
          toast.error("Start year must be before or equal to end year.");
          return;
        }
        onSubmit({ ticker: t, startYear, endYear });
      }}
      className="grid items-end gap-3 md:grid-cols-[1.4fr_1fr_1fr_auto]"
    >
      <div className="space-y-1.5">
        <Label htmlFor="ticker" className="text-xs uppercase tracking-wider text-muted-foreground">
          Ticker
        </Label>
        <Input
          id="ticker"
          value={ticker}
          onChange={(e) => setTicker(e.target.value.toUpperCase())}
          placeholder="AAPL"
          className="font-mono text-lg uppercase tracking-wider"
          maxLength={10}
          autoComplete="off"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="start" className="text-xs uppercase tracking-wider text-muted-foreground">
          From year
        </Label>
        <Input
          id="start"
          type="number"
          min={1995}
          max={currentYear}
          value={startYear}
          onChange={(e) => setStartYear(Number(e.target.value))}
          className="font-mono"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="end" className="text-xs uppercase tracking-wider text-muted-foreground">
          To year
        </Label>
        <Input
          id="end"
          type="number"
          min={1995}
          max={currentYear}
          value={endYear}
          onChange={(e) => setEndYear(Number(e.target.value))}
          className="font-mono"
        />
      </div>
      <Button type="submit" disabled={loading} size="lg">
        {loading ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Fetching
          </>
        ) : (
          <>
            <Search className="mr-2 size-4" />
            Extract
          </>
        )}
      </Button>
    </form>
  );
}
