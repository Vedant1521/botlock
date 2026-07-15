"use client";

import { motion } from "framer-motion";
import {
  Radar,
  RotateCcw,
  Wallet,
  Gauge,
  Boxes,
  BarChart3,
  type LucideIcon,
} from "lucide-react";

const features: {
  icon: LucideIcon;
  title: string;
  description: string;
}[] = [
  {
    icon: Radar,
    title: "Multi-signal bot detection",
    description:
      "Heuristics across headers, TLS fingerprints, request patterns, and behavioral timing catch crawlers that spoof user agents.",
  },
  {
    icon: RotateCcw,
    title: "Replay protection",
    description:
      "Every payment is bound to a single request signature. A settled transaction can't be replayed to unlock other content.",
  },
  {
    icon: Wallet,
    title: "Wallet-native",
    description:
      "Payments go straight to your Solana wallet. No custody, no payout schedule, no platform taking a cut of your revenue.",
  },
  {
    icon: Gauge,
    title: "Zero latency for humans",
    description:
      "Bot detection runs in microseconds. Real visitors never see a 402 — only flagged agents hit the payment challenge.",
  },
  {
    icon: Boxes,
    title: "Framework adapters",
    description:
      "First-class adapters for Express, Next.js, Hono, and Fastify. Drop Botlock into your existing stack in one import.",
  },
  {
    icon: BarChart3,
    title: "SIWS analytics",
    description:
      "Dashboard for Sign-In-With-Solana sessions, payment volume, top paying agents, and revenue per route in real time.",
  },
];

export function Features() {
  return (
    <section
      id="features"
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
          <span className="section-label">Features</span>
          <h2 className="mt-4 font-serif italic text-3xl sm:text-4xl lg:text-5xl leading-tight text-black dark:text-ink text-balance">
            Built for production from day one
          </h2>
        </motion.div>

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.1 }}
              className="group rounded-2xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-surface p-6 hover:border-gray-300 dark:hover:border-borderStrong transition-colors"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 dark:bg-raised border border-gray-200 dark:border-border text-accent group-hover:bg-accent/10 transition-colors">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-black dark:text-ink">
                {f.title}
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-inkMuted leading-relaxed">
                {f.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
