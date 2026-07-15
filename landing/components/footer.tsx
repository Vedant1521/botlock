import { Shield, Github } from "lucide-react";

const columns: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Product",
    links: [
      { label: "The Problem", href: "#problem" },
      { label: "How It Works", href: "#how-it-works" },
      { label: "SDKs", href: "#sdks" },
      { label: "Pricing", href: "#pricing" },
      { label: "FAQ", href: "#faq" },
    ],
  },
  {
    title: "Developers",
    links: [
      { label: "Publisher Docs", href: "/docs/publisher" },
      { label: "Agent Docs", href: "/docs/agent" },
      { label: "botlock-sdk (npm)", href: "https://www.npmjs.com/package/botlock-sdk" },
      {
        label: "botlock-agent-sdk (npm)",
        href: "https://www.npmjs.com/package/botlock-agent-sdk",
      },
      { label: "GitHub", href: "https://github.com/Vedant1521/botlock" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Contact Sales", href: "/contact" },
      { label: "Privacy", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-border bg-gray-50 dark:bg-surface">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent glow-accent-sm">
                <Shield className="h-5 w-5 text-black" strokeWidth={2.5} />
              </div>
              <span className="font-serif italic text-xl text-black dark:text-ink">
                Botlock
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm text-gray-600 dark:text-inkMuted leading-relaxed">
              The HTTP 402 payment layer for AI agents. Drop-in paywall for
              publishers, auto-pay SDK for agents, USDC micropayments on Solana.
            </p>
            <a
              href="https://github.com/Vedant1521/botlock"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 text-sm text-gray-500 dark:text-inkSubtle hover:text-accent transition-colors"
            >
              <Github className="h-4 w-4" /> github.com/Vedant1521/botlock
            </a>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-inkSubtle">
                {col.title}
              </h4>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target={
                        link.href.startsWith("http") ? "_blank" : undefined
                      }
                      rel={
                        link.href.startsWith("http")
                          ? "noopener noreferrer"
                          : undefined
                      }
                      className="text-sm text-gray-600 dark:text-inkMuted hover:text-accent transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-200 dark:border-border pt-8">
          <p className="text-xs text-gray-500 dark:text-inkSubtle">
            © 2026 Botlock. MIT license
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-inkSubtle">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono">Solana mainnet operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
