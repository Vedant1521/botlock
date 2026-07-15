"use client";

import { motion } from "framer-motion";
import { Gauge, Coins, Wallet, TrendingUp, type LucideIcon } from "lucide-react";

const reasons: {
  icon: LucideIcon;
  title: string;
  stat?: string;
  description: string;
}[] = [
  {
    icon: Gauge,
    title: "Speed",
    stat: "~400ms",
    description:
      "Solana finality lands in under half a second. Agents get their content back before the LLM finishes thinking about the next token.",
  },
  {
    icon: Coins,
    title: "Cost",
    stat: "~$0.0001",
    description:
      "A fraction of a cent per transaction. Micropayments finally make sense when the network fee is smaller than the payment itself.",
  },
  {
    icon: Wallet,
    title: "Direct-to-wallet",
    description:
      "No intermediary custody. USDC lands in your wallet the moment the transaction confirms — you hold the keys, always.",
  },
  {
    icon: TrendingUp,
    title: "Stable pricing",
    stat: "USDC = $1",
    description:
      "Charge $0.01 and receive $0.01. No volatility, no currency hedging, no surprise price swings between request and settlement.",
  },
];

export function WhyBlockchain() {
  return (
    <section
      id="why-blockchain"
      className="relative py-24 sm:py-32 border-t border-gray-200 dark:border-border"
    >
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl"
        >
          <span className="section-label">Why Solana</span>
          <h2 className="mt-4 font-serif text-3xl sm:text-4xl lg:text-5xl leading-tight text-black dark:text-ink text-balance">
            Why Solana and USDC?
          </h2>
          <p className="mt-4 text-gray-600 dark:text-inkMuted">
            Micropayments need a chain that&apos;s fast and cheap enough to move
            cents without eating them in fees. Solana + USDC is that chain.
          </p>
        </motion.div>

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {reasons.map((r, i) => (
            <motion.div
              key={r.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: (i % 4) * 0.08 }}
              className="rounded-2xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-surface p-6"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 dark:bg-raised border border-gray-200 dark:border-border text-accent">
                <r.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-black dark:text-ink">
                {r.title}
              </h3>
              {r.stat && (
                <p className="mt-1 font-mono text-2xl text-accent">{r.stat}</p>
              )}
              <p className="mt-2 text-sm text-gray-600 dark:text-inkMuted leading-relaxed">
                {r.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
