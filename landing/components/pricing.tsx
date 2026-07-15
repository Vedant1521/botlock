"use client";

import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";

const plans: {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  href?: string;
  highlight: boolean;
}[] = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Everything you need to start charging agents on devnet.",
    features: [
      "1 site",
      "Up to 1,000 agent requests / mo",
      "Solana devnet",
      "botlock-sdk + botlock-agent-sdk",
      "Community support",
    ],
    cta: "Start free",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$49",
    period: "/mo",
    description:
      "Mainnet payments, analytics, and higher limits for production sites.",
    features: [
      "Up to 10 sites",
      "100,000 agent requests / mo",
      "Solana mainnet",
      "SIWS analytics dashboard",
      "Custom pricing per route",
      "Priority support",
    ],
    cta: "Get started",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description:
      "Dedicated infrastructure and support for high-volume publishers.",
    features: [
      "Unlimited sites",
      "Unlimited requests",
      "Dedicated facilitator node",
      "SLA + on-call support",
      "Custom chain integrations",
      "On-prem deployment",
    ],
    cta: "Contact Sales",
    href: "/contact",
    highlight: false,
  },
];

export function Pricing() {
  return (
    <section
      id="pricing"
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
          <span className="section-label">Pricing</span>
          <h2 className="mt-4 font-serif text-3xl sm:text-4xl lg:text-5xl leading-tight text-black dark:text-ink text-balance">
            You keep every cent of payments received
          </h2>
          <p className="mt-4 text-gray-600 dark:text-inkMuted">
            Botlock never takes a cut of agent payments — 100% of USDC lands in
            your wallet. Pricing covers the hosted facilitator, analytics, and
            support.
          </p>
        </motion.div>

        <div className="mt-14 grid md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative flex flex-col rounded-2xl border p-8 ${
                plan.highlight
                  ? "border-accent bg-gray-50 dark:bg-surface glow-accent-sm"
                  : "border-gray-200 dark:border-border bg-gray-50 dark:bg-surface"
              }`}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-8 rounded-full bg-accent px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-black">
                  Popular
                </span>
              )}
              <h3 className="text-lg font-semibold text-black dark:text-ink">
                {plan.name}
              </h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="font-serif text-4xl text-black dark:text-ink">
                  {plan.price}
                </span>
                {plan.period && (
                  <span className="text-sm text-gray-500 dark:text-inkSubtle">
                    {plan.period}
                  </span>
                )}
              </div>
              <p className="mt-3 text-sm text-gray-600 dark:text-inkMuted leading-relaxed">
                {plan.description}
              </p>

              <ul className="mt-6 space-y-3 flex-1">
                {plan.features.map((f) => (
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
                href={plan.href || "/docs/publisher"}
                className={`mt-8 inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors ${
                  plan.highlight
                    ? "bg-accent text-black hover:bg-accent-dark"
                    : "border border-gray-200 dark:border-border text-black dark:text-ink hover:border-gray-300 dark:hover:border-borderStrong"
                }`}
              >
                {plan.cta} <ArrowRight className="h-4 w-4" />
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
