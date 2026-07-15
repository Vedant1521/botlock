"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Server, Bot, Check, Copy, Package, type LucideIcon } from "lucide-react";

const sdks: {
  icon: LucideIcon;
  name: string;
  side: string;
  install: string;
  description: string;
  features: string[];
}[] = [
  {
    icon: Server,
    name: "botlock-sdk",
    side: "Publisher SDK",
    install: "npm install botlock-sdk",
    description:
      "Drop-in HTTP 402 paywall for any Node.js server. Detects bots locally, issues payment challenges, and verifies on-chain settlements.",
    features: [
      "Zero runtime dependencies",
      "Local bot detection — no network call for human visitors",
      "HTTP 402 x402 envelopes with signed per-request challenges",
      "On-chain USDC verification, replay-protected via Supabase",
      "Adapters: Express, Next.js App Router, Fastify, Cloudflare Workers",
      "Optional analytics dashboard via Sign-In With Solana",
      "No API key, no signup, no custodian — wallet-only",
      "Configurable pricing per route",
    ],
  },
  {
    icon: Bot,
    name: "botlock-agent-sdk",
    side: "Agent SDK",
    install: "npm install botlock-agent-sdk",
    description:
      "Auto-pay wrapper around fetch() for AI agents. Intercepts 402 challenges, pays USDC on Solana, and retries the original request automatically.",
    features: [
      "Drop-in fetch() — 402s handled automatically and transparently",
      "Hard caps: maxAmountMicroUsdc and maxTotalMicroUsdc per session",
      "Signer helpers: keypair file, raw array, base58 secret, custom HSM/KMS",
      "LangChain tool via paywallFetchTool(client) — OpenAI-compatible",
      "Coalesces concurrent requests — never pays twice for the same nonce",
      "Typed errors: PaymentRefusedError, BudgetExceededError, OnChainError",
    ],
  },
];

export function SDKs() {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <section
      id="sdks"
      className="relative py-24 sm:py-32 border-t border-gray-200 dark:border-border"
    >
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <span className="section-label">SDKs</span>
          <h2 className="mt-4 font-serif italic text-3xl sm:text-4xl lg:text-5xl leading-tight text-black dark:text-ink text-balance">
            Two SDKs. Two sides of the paywall.
          </h2>
        </motion.div>

        <div className="mt-14 grid md:grid-cols-2 gap-6">
          {sdks.map((sdk, i) => (
            <motion.div
              key={sdk.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex flex-col rounded-2xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-surface p-8"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 dark:bg-raised border border-gray-200 dark:border-border text-accent">
                  <sdk.icon className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-xs font-mono text-gray-500 dark:text-inkSubtle">
                    {sdk.side}
                  </span>
                  <h3 className="font-mono text-lg font-semibold text-black dark:text-ink">
                    {sdk.name}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => copy(sdk.install)}
                className="mt-6 flex items-center justify-between rounded-lg border border-gray-200 dark:border-border bg-gray-100 dark:bg-raised px-4 py-3 group hover:border-gray-300 dark:hover:border-borderStrong transition-colors"
              >
                <code className="font-mono text-sm text-black dark:text-ink">
                  $ {sdk.install}
                </code>
                {copied === sdk.install ? (
                  <Check className="h-4 w-4 text-accent" />
                ) : (
                  <Copy className="h-4 w-4 text-gray-400 dark:text-inkSubtle group-hover:text-black dark:group-hover:text-ink" />
                )}
              </button>

              <p className="mt-6 text-sm text-gray-600 dark:text-inkMuted leading-relaxed">
                {sdk.description}
              </p>

              <ul className="mt-6 space-y-3 flex-1">
                {sdk.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-3 text-sm text-black dark:text-ink"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <a
                href={`https://www.npmjs.com/package/${sdk.name}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-black hover:bg-accent-dark transition-colors"
              >
                <Package className="h-4 w-4" /> npm install
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
