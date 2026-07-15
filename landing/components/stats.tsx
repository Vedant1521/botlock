"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Zap, DollarSign, Bot, ShieldOff } from "lucide-react";

const STATS = [
  {
    value: "~400ms",
    label: "Payment verification",
    description: "From 402 challenge to content unlock",
    icon: Zap,
  },
  {
    value: "$0.001",
    label: "Floor price per crawl",
    description: "1,000 micro-USDC base rate",
    icon: DollarSign,
  },
  {
    value: "33",
    label: "Bot patterns detected",
    description: "GPTBot, ClaudeBot, PerplexityBot, and more",
    icon: Bot,
  },
  {
    value: "0%",
    label: "Platform fees",
    description: "USDC goes straight to your wallet",
    icon: ShieldOff,
  },
];

export function Stats() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="relative py-20 sm:py-24 border-t border-gray-200 dark:border-border">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="section-label">By the numbers</span>
          <h2 className="mt-4 font-serif text-3xl sm:text-4xl italic font-normal text-black dark:text-ink tracking-tight">
            What you get with Botlock?
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-gray-200 dark:bg-border rounded-2xl overflow-hidden border border-gray-200 dark:border-border">
          {STATS.map((stat, i) => {
            const cardRef = useRef(null);
            const cardInView = useInView(cardRef, { once: true, margin: "-40px" });
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                ref={cardRef}
                initial={{ opacity: 0, y: 20 }}
                animate={cardInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="group relative bg-white dark:bg-surface p-5 sm:p-8 sm:p-10 flex flex-col items-center text-center transition-colors hover:bg-gray-50 dark:hover:bg-raised"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 mb-5 transition-transform group-hover:scale-110">
                  <Icon className="h-5 w-5 text-accent" />
                </div>

                <div className="text-3xl sm:text-4xl sm:text-5xl font-bold text-black dark:text-ink tracking-tight tabular-nums">
                  {stat.value}
                </div>

                <div className="mt-3 text-sm font-medium text-black dark:text-ink">
                  {stat.label}
                </div>

                <div className="mt-1 text-xs text-gray-500 dark:text-inkSubtle leading-relaxed max-w-[200px]">
                  {stat.description}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
