import type { Metadata } from "next";
import { Inter, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Botlock — The payment layer AI agents can't bypass",
  description:
    "AI crawlers scrape your content and pay nothing. Botlock enforces payment at the protocol layer. Drop-in HTTP 402 paywall for publishers. Auto-pay SDK for AI agents. USDC micropayments on Solana.",
  keywords: [
    "AI paywall",
    "HTTP 402",
    "x402",
    "Solana",
    "USDC",
    "AI agent monetization",
    "web scraping monetization",
    "bot paywall",
  ],
  openGraph: {
    title: "Botlock — The payment layer AI agents can't bypass",
    description:
      "Drop-in HTTP 402 paywall for publishers. Auto-pay SDK for AI agents. USDC micropayments on Solana.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var saved = localStorage.getItem('theme');
                var dark = saved ? saved === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
                var root = document.documentElement;
                root.classList.toggle('dark', dark);
                root.classList.toggle('light', !dark);
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${instrument.variable} ${mono.variable} font-sans bg-base text-ink antialiased`}
        style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
      >
        {children}
      </body>
    </html>
  );
}
