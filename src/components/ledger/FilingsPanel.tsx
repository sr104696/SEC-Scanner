"use client";

import { ExternalLink, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { FilingMeta } from "@/shared/sec-types";

type Props = {
  recent10K: FilingMeta[];
  recent8K: FilingMeta[];
  recentDEF14A: FilingMeta[];
};

function FilingList({
  title,
  filings,
  hint,
}: {
  title: string;
  filings: FilingMeta[];
  hint: string;
}) {
  return (
    <div className="space-y-2">
      <div>
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-primary">{title}</h3>
        <p className="text-[11px] text-muted-foreground">{hint}</p>
      </div>
      <ul className="space-y-1">
        {filings.length === 0 && (
          <li className="text-xs text-muted-foreground/60">No recent filings.</li>
        )}
        {filings.map((f) => (
          <li key={f.accession}>
            <a
              href={f.url}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-xs transition-colors hover:bg-muted/40"
            >
              <span className="flex min-w-0 items-center gap-2">
                <FileText className="size-3.5 shrink-0 text-muted-foreground" />
                <span className="font-mono text-foreground">{f.reportDate}</span>
                <Badge variant="outline" className="px-1 py-0 text-[10px] font-normal">
                  {f.form}
                </Badge>
              </span>
              <ExternalLink className="size-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function FilingsPanel({ recent10K, recent8K, recentDEF14A }: Props) {
  return (
    <Card className="p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-primary">
        Source Filings
      </h2>
      <div className="grid gap-6 md:grid-cols-3">
        <FilingList title="10-K" filings={recent10K} hint="Annual financials" />
        <FilingList
          title="8-K"
          filings={recent8K}
          hint="Material events: dividends declared, splits, ex-div dates"
        />
        <FilingList
          title="DEF 14A"
          filings={recentDEF14A}
          hint="Proxy statement: insider ownership %"
        />
      </div>
    </Card>
  );
}
