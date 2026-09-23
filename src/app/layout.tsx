import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteHeader } from "@/components/site-header";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Walkthrough OS — turn any goal into a full strategic walkthrough",
  description:
    "A thinking instrument that converts a plan, idea, or problem into a nine-part Full Walkthrough, plus a forge for upgrading prompts for Cursor, Claude, GPT, and Grok.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-border/60 py-6">
            <div className="mx-auto w-full max-w-6xl px-4 text-xs text-muted-foreground sm:px-6">
              Walkthrough OS runs entirely in your browser. Missions are stored in localStorage — nothing
              leaves this machine.
            </div>
          </footer>
          <Toaster position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
