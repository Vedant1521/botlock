"use client";

import { motion } from "framer-motion";
import { Link2, Globe, Coins, RefreshCw } from "lucide-react";

const REASONS = [
  {
    icon: Link2,
    q: "Why not just use a payment processor?",
    a: "Credit card processors take 2.9% + $0.30 — more than the payment itself at micropayment scale. USDC on Solana settles in ~0.4s with sub-cent fees. The economics only work on-chain.",
  },
  {
    icon: Globe,
    q: "Why Solana specifically?",
    a: "~400ms finality, $0.00025 average transaction fee, a mature USDC SPL token with a Circle-issued devnet faucet. Ethereum L1 fees alone would exceed the payment value.",
  },
  {
    icon: Coins,
    q: "Why USDC and not native SOL?",
    a: "USDC is price-stable. Pricing content at $0.001 means $0.001 — not 0.0000065 SOL today, something different tomorrow. Publishers set prices in dollars, not volatile tokens.",
  },
  {
    icon: RefreshCw,
    q: "What stops someone from building a centralized version?",
    a: "Nothing. But on-chain verification means Botlock's server doesn't need to trust the agent — or be trusted by the agent. The Solana RPC is the neutral arbiter. No payment processor account to ban you.",
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
          <span className="section-label">Why Blockchain</span>
          <h2 className="mt-4 font-serif text-3xl sm:text-4xl lg:text-5xl leading-tight text-black dark:text-ink text-balance">
            The honest answer to the obvious question
          </h2>
          <p className="mt-4 text-base sm:text-lg text-gray-600 dark:text-inkMuted">
            Micropayments require settlement infrastructure with near-zero fees and
            sub-second finality. Existing payment rails weren&apos;t built for $0.001
            transactions. That&apos;s the entire reason blockchain is here — not ideology,
            just math.
          </p>
        </motion.div>

        <div className="mt-14 grid sm:grid-cols-2 gap-5">
          {REASONS.map(({ icon: Icon, q, a }, i) => (
            <motion.div
              key={q}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: (i % 2) * 0.1 }}
              className="rounded-2xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-surface p-6"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-raised border border-gray-200 dark:border-border text-accent">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-black dark:text-ink">{q}</h3>
                  <p className="mt-2 text-sm text-gray-600 dark:text-inkMuted leading-relaxed">
                    {a}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Comparison table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5 }}
          className="mt-14 rounded-2xl border border-gray-200 dark:border-border overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-border bg-gray-100 dark:bg-raised">
                  <th className="text-left px-5 py-3.5 text-gray-500 dark:text-inkSubtle font-medium">
                    Settlement method
                  </th>
                  <th className="text-center px-5 py-3.5 text-gray-500 dark:text-inkSubtle font-medium">
                    Cost per $0.001 tx
                  </th>
                  <th className="text-center px-5 py-3.5 text-gray-500 dark:text-inkSubtle font-medium">
                    Finality
                  </th>
                  <th className="text-center px-5 py-3.5 text-gray-500 dark:text-inkSubtle font-medium">
                    Viable?
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-border">
                <tr className="bg-gray-50 dark:bg-surface">
                  <td className="px-5 py-3.5 text-gray-600 dark:text-inkMuted">
                    Stripe / card
                  </td>
                  <td className="px-5 py-3.5 text-center text-danger font-mono">
                    $0.30+
                  </td>
                  <td className="px-5 py-3.5 text-center text-gray-600 dark:text-inkMuted">
                    1–3 days
                  </td>
                  <td className="px-5 py-3.5 text-center text-danger">✗</td>
                </tr>
                <tr className="bg-gray-50 dark:bg-surface">
                  <td className="px-5 py-3.5 text-gray-600 dark:text-inkMuted">
                    Ethereum L1
                  </td>
                  <td className="px-5 py-3.5 text-center text-danger font-mono">
                    $0.50–$5+
                  </td>
                  <td className="px-5 py-3.5 text-center text-gray-600 dark:text-inkMuted">
                    ~12s
                  </td>
                  <td className="px-5 py-3.5 text-center text-danger">✗</td>
                </tr>
                <tr className="bg-gray-50 dark:bg-surface">
                  <td className="px-5 py-3.5 text-gray-600 dark:text-inkMuted">
                    Ethereum L2 (Arbitrum)
                  </td>
                  <td className="px-5 py-3.5 text-center text-yellow-500 font-mono">
                    ~$0.01
                  </td>
                  <td className="px-5 py-3.5 text-center text-gray-600 dark:text-inkMuted">
                    ~2s
                  </td>
                  <td className="px-5 py-3.5 text-center text-yellow-500">~</td>
                </tr>
                <tr className="bg-gray-100 dark:bg-raised">
                  <td className="px-5 py-3.5 text-black dark:text-ink font-medium">
                    Solana USDC ← Botlock
                  </td>
                  <td className="px-5 py-3.5 text-center text-success font-mono">
                    &lt;$0.001
                  </td>
                  <td className="px-5 py-3.5 text-center text-success">~400ms</td>
                  <td className="px-5 py-3.5 text-center text-success">✓</td>
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
