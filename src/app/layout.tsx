import "globals.css";

import { type Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import { lazy } from "react";
import { Sidebar } from "@/components/Sidebar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { NAV_LINKS } from "@/config/nav-links";

const ElementSelector = lazy(() =>
  process.env.NODE_ENV === "development"
    ? import("@/components/ElementSelector")
    : Promise.resolve({ default: () => null }),
);

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const appName = process.env.NEXT_PUBLIC_APP_NAME || "Internal App";

export const metadata: Metadata = {
  title: appName,
  description: `${appName} - Created with Vybe`,
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
          {NAV_LINKS.length >= 2 ? (
            <SidebarProvider>
              <Sidebar />
              <SidebarInset>
                <main className="flex-1 p-4">{children}</main>
              </SidebarInset>
            </SidebarProvider>
          ) : (
            <main className="flex-1 p-4">{children}</main>
          )}
          <Toaster richColors />
          <ElementSelector />
        </ThemeProvider>
      </body>
    </html>
  );
}
