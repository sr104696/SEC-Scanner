# LEDGER APP RECONSTRUCTION PROMPT
## SEC EDGAR Financial Extractor - Complete Reproduction Guide

---

## PROJECT OVERVIEW

**App Name:** Ledger - SEC EDGAR Financial Extractor

**Purpose:** A Next.js web application that extracts financial data from SEC EDGAR filings (10-K, 10-Q, 8-K, DEF 14A) for US-listed companies. Users input a ticker symbol and year range to retrieve comprehensive financial metrics including profitability ratios, balance sheet data, cash flow statements, and historical period comparisons.

**Tech Stack:**
- Framework: Next.js 15.4.10 (App Router)
- Language: TypeScript 5.8.0
- UI Library: React 18.3.1 + shadcn/ui components
- Styling: Tailwind CSS 3.4.3
- Fonts: Inter (sans-serif), Geist Mono (monospace) via next/font/google
- HTTP Client: Axios 1.7.9 + SWR 2.3.3
- Icons: Lucide React 0.474.0
- Toast Notifications: Sonner 2.0.1
- Theme: next-themes 0.4.4 (dark/light mode support)

---

## STEP 1: PROJECT INITIALIZATION

### 1.1 Initialize Next.js Project

```bash
npx create-next-app@latest ledger --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
cd ledger
```

### 1.2 Install All Dependencies

Execute this exact command:

```bash
npm install @dnd-kit/core@6.1.0 @dnd-kit/sortable@8.0.0 @dnd-kit/utilities@3.2.2 @hookform/resolvers@4.1.3 @neondatabase/serverless@0.10.4 @prisma/client@5.14.0 @radix-ui/react-accordion@1.2.3 @radix-ui/react-alert-dialog@1.1.6 @radix-ui/react-aspect-ratio@1.1.2 @radix-ui/react-avatar@1.1.3 @radix-ui/react-checkbox@1.1.4 @radix-ui/react-collapsible@1.1.3 @radix-ui/react-context-menu@2.2.16 @radix-ui/react-dialog@1.1.15 @radix-ui/react-dropdown-menu@2.1.6 @radix-ui/react-hover-card@1.1.6 @radix-ui/react-label@2.1.8 @radix-ui/react-menubar@1.1.6 @radix-ui/react-navigation-menu@1.2.14 @radix-ui/react-popover@1.1.6 @radix-ui/react-progress@1.1.2 @radix-ui/react-radio-group@1.2.3 @radix-ui/react-scroll-area@1.2.3 @radix-ui/react-select@2.1.6 @radix-ui/react-separator@1.1.8 @radix-ui/react-slider@1.2.3 @radix-ui/react-slot@1.2.4 @radix-ui/react-switch@1.1.3 @radix-ui/react-tabs@1.1.3 @radix-ui/react-toggle@1.1.2 @radix-ui/react-toggle-group@1.1.2 @radix-ui/react-tooltip@1.1.8 @tailwindcss/typography@0.5.16 @tanstack/react-table@8.21.2 @tiptap/pm@3.3.1 @tiptap/react@3.3.1 @tiptap/starter-kit@3.3.1 @types/json-schema@7.0.15 @vybe-adk/dom-element-selector@0.1.1 axios@1.7.9 better-auth@1.3.26 class-variance-authority@0.7.1 clsx@2.1.1 cmdk@1.1.1 date-fns@3.6.0 embla-carousel-react@8.5.2 inngest@3.54.0 input-otp@1.4.2 lucide-react@0.474.0 next-themes@0.4.4 react-day-picker@8.10.1 react-hook-form@7.54.2 react-markdown@10.1.0 react-resizable-panels@2.1.7 recharts@2.15.1 sonner@2.0.1 swr@2.3.3 tailwind-merge@3.0.1 tailwindcss-animate@1.0.7 tiptap@1.32.2 vaul@1.1.2 zod@3.24.2
```

### 1.3 Install Dev Dependencies

```bash
npm install -D @playwright/test@1.52.0 @testing-library/dom@10.4.1 @testing-library/jest-dom@6.8.0 @testing-library/react@16.3.0 @types/eslint@8.56.10 @types/jest@30.0.0 @types/node@20.14.10 @types/react@18.3.3 @types/react-dom@18.3.0 @typescript-eslint/eslint-plugin@8.45.0 @typescript-eslint/parser@8.45.0 @vybe-adk/swc-dom-source@0.1.1 eslint@8.57.0 eslint-config-next@15.0.1 jest@30.1.3 jest-environment-jsdom@30.1.2 postcss@8.4.39 prettier@3.3.2 prettier-plugin-tailwindcss@0.6.5 prisma@5.14.0 ts-jest@29.4.1 ts-node@10.9.2 typescript@5.8.0
```

---

## STEP 2: CONFIGURATION FILES

### 2.1 Create `tsconfig.json`

Replace entire contents with:

```json
{
  "compilerOptions": {
    "esModuleInterop": true,
    "skipLibCheck": true,
    "target": "es2022",
    "allowJs": true,
    "resolveJsonModule": true,
    "moduleDetection": "force",
    "isolatedModules": true,
    "strict": false,
    "strictNullChecks": false,
    "noUncheckedIndexedAccess": false,
    "checkJs": true,
    "noImplicitAny": false,
    "lib": ["dom", "dom.iterable", "ES2022"],
    "noEmit": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "preserve",
    "plugins": [{ "name": "next" }],
    "incremental": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": [".eslintrc.cjs", "next-env.d.ts", "**/*.ts", "**/*.tsx", "**/*.cjs", "**/*.js", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### 2.2 Create `tailwind.config.ts`

Replace entire contents with:

```typescript
import typography from "@tailwindcss/typography";
import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  darkMode: ["class"],
  content: ["./src/**/*.tsx"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
        mono: ["var(--font-mono)", ...fontFamily.mono],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      container: {
        center: true,
        padding: "1rem",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), typography],
} satisfies Config;
```

### 2.3 Create `next.config.js`

Replace entire contents with:

```javascript
const isDev = process.env.NODE_ENV === "development";

/** @type {import("next").NextConfig} */
const config = {
  images: {
    domains: ["vybe.build", "i.ibb.co", "cdn.brandfetch.io"],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  devIndicators: false,
  ...(isDev && {
    experimental: {
      swcPlugins: [["@vybe-adk/swc-dom-source", { attr: "data-source", exclude: ["components/ui"] }]],
    },
  }),
  webpack: (webpackConfig, { dev }) => {
    if (!dev) {
      webpackConfig.cache = Object.freeze({
        type: "filesystem",
        maxMemoryGenerations: 1,
        maxAge: 1000 * 60 * 60 * 24,
      });
    }
    return webpackConfig;
  },
};

export default config;
```

### 2.4 Create `postcss.config.js`

```javascript
export default {
  plugins: {
    tailwindcss: {},
  },
};
```

### 2.5 Create `prettier.config.js`

```javascript
export default {
  semi: true,
  singleQuote: false,
  tabWidth: 2,
  trailingComma: "all",
  printWidth: 100,
  plugins: ["prettier-plugin-tailwindcss"],
};
```

### 2.6 Create `components.json` (shadcn configuration)

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/styles/globals.css",
    "baseColor": "zinc",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/client-lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```

### 2.7 Update `package.json` scripts

Ensure these scripts exist:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "test": "jest --passWithNoTests"
  }
}
```

---

## STEP 3: GLOBAL STYLES AND FONTS

### 3.1 Create `src/styles/globals.css`

Create directory `src/styles/` then create file with exact contents:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 0 0% 0%;
    --card: 0 0% 100%;
    --card-foreground: 0 0% 0%;
    --popover: 0 0% 100%;
    --popover-foreground: 0 0% 0%;
    --primary: 253 88% 59%;
    --primary-foreground: 0 0% 100%;
    --secondary: 240 5% 92%;
    --secondary-foreground: 0 0% 0%;
    --muted: 240 5% 92%;
    --muted-foreground: 241 7% 30%;
    --accent: 240 5% 92%;
    --accent-foreground: 253 88% 59%;
    --destructive: 345.32 100% 56%;
    --destructive-foreground: 0 0% 100%;
    --border: 0 0% 85%;
    --input: 240 4% 81%;
    --ring: 253 88% 59%;
    --radius: 0.75rem;
    --chart-1: 12 76% 61%;
    --chart-2: 173 58% 39%;
    --chart-3: 197 37% 24%;
    --chart-4: 43 74% 66%;
    --chart-5: 27 87% 67%;
    --sidebar-background: 0 0% 100%;
    --sidebar-foreground: 0 0% 0%;
    --sidebar-primary: 253 88% 59%;
    --sidebar-primary-foreground: 0 0% 100%;
    --sidebar-accent: 240 5% 92%;
    --sidebar-accent-foreground: 253 88% 59%;
    --sidebar-border: 0 0% 85%;
    --sidebar-ring: 253 88% 59%;
  }

  .dark {
    --background: 0 0% 0%;
    --foreground: 240 5% 92%;
    --card: 0 0% 6%;
    --card-foreground: 240 5% 92%;
    --popover: 0 0% 6%;
    --popover-foreground: 240 5% 92%;
    --primary: 253 88% 59%;
    --primary-foreground: 0 0% 100%;
    --secondary: 0 0% 12%;
    --secondary-foreground: 240 5% 92%;
    --muted: 0 0% 12%;
    --muted-foreground: 240 4% 81%;
    --accent: 0 0% 12%;
    --accent-foreground: 253 88% 59%;
    --destructive: 338.93 90% 29%;
    --destructive-foreground: 240 5% 92%;
    --border: 0 0% 12%;
    --input: 0 0% 12%;
    --ring: 253 88% 59%;
    --chart-1: 220 70% 50%;
    --chart-2: 160 60% 45%;
    --chart-3: 30 80% 55%;
    --chart-4: 280 65% 60%;
    --chart-5: 340 75% 55%;
    --sidebar-background: 0 0% 0%;
    --sidebar-foreground: 240 5% 92%;
    --sidebar-primary: 253 88% 59%;
    --sidebar-primary-foreground: 0 0% 100%;
    --sidebar-accent: 0 0% 12%;
    --sidebar-accent-foreground: 253 88% 59%;
    --sidebar-border: 0 0% 12%;
    --sidebar-ring: 253 88% 59%;
  }
}

@layer base {
  * {
    @apply border-border;
  }

  html {
    text-rendering: optimizeLegibility;
  }

  body {
    @apply bg-background text-foreground leading-relaxed;
  }

  h1,
  h2,
  h3 {
    @apply text-balance;
  }
}
```

---

## STEP 4: CORE UTILITY FILES

### 4.1 Create `src/client-lib/utils.ts`

```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### 4.2 Create `src/config/nav-links.ts`

```typescript
import { Home, type LucideIcon } from "lucide-react";

export type NavLink = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const NAV_LINKS: NavLink[] = [{ label: "Home", href: "/", icon: Home }];
```

---

## STEP 5: SHARED TYPES AND FORMATTERS

### 5.1 Create `src/shared/sec-types.ts`

This file defines all data structures shared between server and client:

```typescript
// Shared types & formatters for the SEC EDGAR Ledger feature.
// Used by both the API route (server) and the React UI (client).

export type SnapshotData = {
  ticker: string;
  entityName: string;
  cik: string;
  latestEnd: string | null;
  fiscalYear: number | null;
  fiscalYearEnd: string | null;
  mostRecentQuarterEnd: string | null;
  
  profitMargin: number | null;
  operatingMargin: number | null;
  returnOnAssets: number | null;
  returnOnEquity: number | null;
  
  revenueTTM: number | null;
  revenuePerShareTTM: number | null;
  quarterlyRevenueGrowthYoY: number | null;
  grossProfitTTM: number | null;
  ebitdaTTM: number | null;
  netIncomeToCommonTTM: number | null;
  dilutedEPSTTM: number | null;
  quarterlyEarningsGrowthYoY: number | null;
  
  totalCashMRQ: number | null;
  totalCashPerShareMRQ: number | null;
  totalDebtMRQ: number | null;
  totalDebtToEquityMRQ: number | null;
  currentRatioMRQ: number | null;
  bookValuePerShareMRQ: number | null;
  
  operatingCashFlowTTM: number | null;
  leveredFreeCashFlowTTM: number | null;
  
  sharesOutstanding: number | null;
  
  forwardAnnualDividendRate: number | null;
  trailingAnnualDividendRate: number | null;
  payoutRatio: number | null;
};

export type Period = {
  key: string;
  label: string;
  fy: number;
  fp: string; // FY | Q1 | Q2 | Q3 | Q4
  end: string;
  start: string | null;
  form: string;
  values: Record<string, number | null>;
};

export type FilingMeta = {
  form: string;
  filed: string;
  reportDate: string;
  accession: string;
  url: string;
};

export type SecResponse = {
  snapshot: SnapshotData;
  periods: Period[];
  filings: {
    recent10K: FilingMeta[];
    recent8K: FilingMeta[];
    recentDEF14A: FilingMeta[];
  };
};

export type SecRequest = {
  ticker: string;
  startYear: number;
  endYear: number;
};

// ---- formatters ----------------------------------------------------------

export function fmtMoney(v: number | null | undefined, opts?: { compact?: boolean }): string {
  if (v === null || v === undefined || !isFinite(v)) return "—";
  const compact = opts?.compact ?? true;
  const abs = Math.abs(v);
  if (compact) {
    if (abs >= 1e12) return `${(v / 1e12).toFixed(2)}T`;
    if (abs >= 1e9) return `${(v / 1e9).toFixed(2)}B`;
    if (abs >= 1e6) return `${(v / 1e6).toFixed(2)}M`;
    if (abs >= 1e3) return `${(v / 1e3).toFixed(2)}K`;
  }
  return v.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export function fmtPct(v: number | null | undefined, digits = 2): string {
  if (v === null || v === undefined || !isFinite(v)) return "—";
  return `${(v * 100).toFixed(digits)}%`;
}

export function fmtNum(v: number | null | undefined, digits = 2): string {
  if (v === null || v === undefined || !isFinite(v)) return "—";
  return v.toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function fmtShares(v: number | null | undefined): string {
  return fmtMoney(v, { compact: true });
}
```

---

## STEP 6: SERVER-SIDE SEC DATA EXTRACTION ENGINE

### 6.1 Create `src/server-lib/sec/sec-financials.ts`

This is the core XBRL bucketing engine (680 lines). Create the file with these sections:

**Section 1: Imports and Type Definitions (lines 1-42)**

```typescript
// SEC EDGAR XBRL bucketing engine.
// Pure functions ported from the original Deno Edge Function.

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
```

**Section 2: SEC Fetch Helper Functions (lines 43-84)**

```typescript
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
```

**Section 3: Unit Picking Function (lines 85-119)**

```typescript
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
```

**Section 4: Concept Dictionaries (lines 120-175)**

```typescript
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
```

**Section 5: Period Classification Functions (lines 176-291)**

```typescript
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
  return { kind: "annual", days: d };
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
```

**Section 6: Concept Sets and Safe Division (lines 292-340)**

```typescript
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

export class SecError extends Error {
  status: number;
  constructor(msg: string, status: number) {
    super(msg);
    this.status = status;
  }
}
```

**Section 7: Main Extractor Function (lines 341-680)**

This section is too long to include fully here. The function `extractFinancials`:
1. Validates ticker and year range inputs
2. Resolves CIK from ticker
3. Fetches company facts and submissions from SEC
4. Buckets all financial concepts into quarterly/annual maps
5. Builds period table with all metrics
6. Calculates derived values (FreeCashFlow, EBITDA, margins)
7. Computes TTM (trailing twelve months) values
8. Computes MRQ (most recent quarter) values
9. Calculates YoY growth rates
10. Builds snapshot with all ratios
11. Formats filing URLs
12. Returns complete SecResponse

Copy the full implementation from the original file at `src/server-lib/sec/sec-financials.ts` lines 341-680.

---

## STEP 7: API ROUTE HANDLER

### 7.1 Create `src/app/api/sec-financials/route.ts`

```typescript
import { NextResponse } from "next/server";
import { extractFinancials, SecError } from "@/server-lib/sec/sec-financials";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const b = (body ?? {}) as { ticker?: unknown; startYear?: unknown; endYear?: unknown };
  const ticker = String(b.ticker ?? "").trim();
  const currentYear = new Date().getFullYear();
  const startYear = Number(b.startYear ?? currentYear - 5);
  const endYear = Number(b.endYear ?? currentYear);

  try {
    const result = await extractFinancials({ ticker, startYear, endYear });
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof SecError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[sec-financials] error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
```

---

## STEP 8: CLIENT-LIB API CLIENT

### 8.1 Create `src/client-lib/api-client.ts`

```typescript
import axios from "axios";
import useSWR, { mutate } from "swr";
import type { SecRequest, SecResponse } from "@/shared/sec-types";

export const apiClient = axios.create({
  baseURL: "/api",
});

const fetcher = <T>(url: string) => apiClient.get<T>(url).then((res) => res.data);

export async function extractSecFinancials(params: SecRequest): Promise<SecResponse> {
  try {
    const { data } = await apiClient.post<SecResponse>("/sec-financials", params);
    return data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const apiMsg = (err.response?.data as { error?: string } | undefined)?.error;
      throw new Error(apiMsg ?? err.message);
    }
    throw err;
  }
}

export { useSWR, mutate, fetcher };
```

---

## STEP 9: UI COMPONENT LIBRARY (SHADCN)

Install shadcn/ui components using CLI or create manually:

```bash
npx shadcn@latest init -d
npx shadcn@latest add button card input label badge table sonner
```

Or create these essential files manually:

### 9.1 `src/components/ui/button.tsx`

```typescript
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/client-lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
```

### 9.2 `src/components/ui/input.tsx`

```typescript
import * as React from "react";
import { cn } from "@/client-lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
```

### 9.3 `src/components/ui/card.tsx`

```typescript
import * as React from "react";
import { cn } from "@/client-lib/utils";

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)} {...props} />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  ),
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("text-2xl font-semibold leading-none tracking-tight", className)} {...props} />
  ),
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  ),
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />,
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  ),
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
```

### 9.4 `src/components/ui/badge.tsx`

```typescript
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/client-lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
```

### 9.5 `src/components/ui/label.tsx`

```typescript
"use client";

import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/client-lib/utils";

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
);

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root ref={ref} className={cn(labelVariants(), className)} {...props} />
));
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
```

### 9.6 `src/components/ui/sonner.tsx`

```typescript
"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
```

### 9.7 `src/components/ui/sidebar.tsx`

Create the full sidebar component with SidebarProvider, Sidebar, SidebarContent, SidebarGroup, SidebarMenu, etc.

### 9.8 `src/components/ui/table.tsx`

```typescript
import * as React from "react";
import { cn } from "@/client-lib/utils";

const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <div className="relative w-full overflow-auto">
      <table ref={ref} className={cn("w-full caption-bottom text-sm", className)} {...props} />
    </div>
  ),
);
Table.displayName = "Table";

const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
  ),
);
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tbody ref={ref} className={cn("[&_tr:last-child]:border-0", className)} {...props} />
  ),
);
TableBody.displayName = "TableBody";

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr ref={ref} className={cn("border-b transition-colors hover:bg-muted/50", className)} {...props} />
  ),
);
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <th ref={ref} className={cn("h-12 px-4 text-left align-middle font-medium text-muted-foreground", className)} {...props} />
  ),
);
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <td ref={ref} className={cn("p-4 align-middle", className)} {...props} />
  ),
);
TableCell.displayName = "TableCell";

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };
```

---

## STEP 10: THEME PROVIDER

### 10.1 Create `src/components/ThemeProvider.tsx`

```typescript
"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import * as React from "react";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
```

### 10.2 Create `src/components/ThemeToggle.tsx`

```typescript
"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import * as React from "react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
```

---

## STEP 11: DOMAIN-SPECIFIC UI COMPONENTS

### 11.1 Create `src/components/ledger/TickerForm.tsx`

```typescript
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
```

### 11.2 Create `src/components/ledger/SnapshotCard.tsx`

```typescript
"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fmtMoney, fmtPct, fmtNum, fmtShares, type SnapshotData } from "@/shared/sec-types";

type Row = {
  label: string;
  value: string;
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
```

### 11.3 Create `src/components/ledger/HistoryTable.tsx`

```typescript
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

export function csvEscape(c: unknown): string {
  const s = c === null || c === undefined ? "" : String(s);
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
  a.download = `${ticker}_ledger.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
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
```

### 11.4 Create `src/components/ledger/FilingsPanel.tsx`

```typescript
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
```

---

## STEP 12: LAYOUT AND MAIN PAGE

### 12.1 Create `src/app/layout.tsx`

```typescript
import "globals.css";

import { type Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import { lazy } from "react";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const appName = process.env.NEXT_PUBLIC_APP_NAME || "Ledger";

export const metadata: Metadata = {
  title: appName,
  description: `${appName} - SEC EDGAR Financial Extractor`,
  icons: "https://vybe.build/vybe-icon.svg",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${geistMono.variable} font-sans antialiased`}
    >
      <body className="min-h-screen">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <main className="flex-1 p-4">{children}</main>
          <Toaster richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### 12.2 Create `src/app/page.tsx`

```typescript
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
```

---

## STEP 13: UNIT TESTS

### 13.1 Create `src/server-lib/sec/sec-financials.test.ts`

Copy the test file from the original repo containing tests for:
- `durationDays` and `classify` functions
- `quarterLabelForEnd` function
- `bucketFlow` Q4 derivation logic
- `pickUnits` synonym merging
- `safeDiv` edge cases

---

## STEP 14: ENVIRONMENT VARIABLES

Create `.env.local` with:

```bash
# Optional: Override SEC User-Agent (must include email for SEC compliance)
SEC_USER_AGENT="Your App Name your-email@example.com"

# App name for metadata
NEXT_PUBLIC_APP_NAME="Ledger"
```

---

## STEP 15: RUN THE APPLICATION

```bash
# Development
npm run dev

# Production build
npm run build
npm start

# Type checking
npm run typecheck

# Run tests
npm test
```

Open http://localhost:3000 to access the application.

---

## VERIFICATION CHECKLIST

After completing all steps, verify:

1. ✅ All dependencies installed without errors
2. ✅ TypeScript compiles with no errors (`npm run typecheck`)
3. ✅ Application builds successfully (`npm run build`)
4. ✅ Home page loads with TickerForm visible
5. ✅ Entering "AAPL" and clicking "Extract" returns financial data
6. ✅ SnapshotCard displays company info and metrics
7. ✅ HistoryTable shows historical periods with correct formatting
8. ✅ FilingsPanel shows links to SEC filings
9. ✅ CSV export downloads correctly formatted file
10. ✅ Dark/light theme toggle works
11. ✅ Unit tests pass (`npm test`)

---

## CRITICAL IMPLEMENTATION NOTES

1. **SEC User-Agent**: The default User-Agent includes a contact email. If you modify it, ensure it contains an email address per SEC EDGAR fair-use policy.

2. **Q4 Derivation**: For flow concepts (Revenue, Net Income, etc.), Q4 is calculated as `Annual - (Q1 + Q2 + Q3)` when not explicitly reported. This is SKIPPED for per-share flows (EPS, DividendsPerShare) because share counts vary by quarter.

3. **Period Sorting**: Results are sorted newest-first. When end dates match, FY rows precede Q4 rows.

4. **Forward Dividend Rate**: Calculated as `4 × most recent quarterly DPS`, not as TTM sum.

5. **CSV Escaping**: Uses RFC-4180 standard - quotes cells containing commas/quotes/newlines, doubles embedded quotes.

6. **TTM Calculation**: Uses last 4 quarters if available, otherwise falls back to most recent annual.

7. **Error Handling**: Invalid tickers return 404, invalid year ranges return 400, SEC fetch failures return 502.

---

## TROUBLESHOOTING

**Issue**: "Ticker not found"
- Verify ticker is valid US-listed company
- Check SEC EDGAR accessibility

**Issue**: "SEC returned non-JSON"
- SEC may be rate-limiting; wait and retry
- Ensure SEC_USER_AGENT has valid email format

**Issue**: Missing Q4 data
- Some companies don't report Q4 explicitly; it's derived from Annual - (Q1+Q2+Q3)
- Per-share metrics won't have derived Q4 (by design)

**Issue**: Build fails with module errors
- Run `npm install` to ensure all dependencies
- Clear `.next` cache and retry

---

END OF PROMPT
