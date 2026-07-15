"use client";

import { motion } from "framer-motion";
import {
  Shield,
  ArrowRight,
  Github,
  Scale,
  KeyRound,
  Wallet,
  type LucideIcon,
} from "lucide-react";

const badges: { icon: LucideIcon; label: string }[] = [
  { icon: Scale, label: "MIT license" },
  { icon: KeyRound, label: "No API key" },
  { icon: Wallet, label: "Direct to wallet" },
];

export function FinalCTA() {
  return (
    <section
      id="get-started"
      className="relative py-24 sm:py-32 border-t border-gray-200 dark:border-border overflow-hidden"
    >
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[400px] w-[600px] rounded-full bg-accent/10 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex justify-center"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent glow-accent">
            <Shield className="h-8 w-8 text-black" strokeWidth={2.5} />
          </div>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-8 font-serif text-3xl sm:text-4xl lg:text-5xl leading-tight text-black dark:text-ink text-balance"
        >
          The payment layer agents can&apos;t bypass.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-5 text-lg text-gray-600 dark:text-inkMuted max-w-xl mx-auto"
        >
          Start charging AI agents for your content in minutes. Open source, MIT
          licensed, and you keep every cent.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 flex flex-wrap justify-center gap-4"
        >
          <a
            href="/docs/publisher"
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-black hover:bg-accent-dark transition-colors glow-accent-sm"
          >
            Get Started <ArrowRight className="h-4 w-4" />
          </a>
          <a
            href="https://botlock-production.up.railway.app/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 dark:border-border bg-white dark:bg-surface px-6 py-3 text-sm font-semibold text-black dark:text-ink hover:border-gray-300 dark:hover:border-borderStrong transition-colors"
          >
            Open Dashboard <ArrowRight className="h-4 w-4" />
          </a>
          <a
            href="https://github.com/Vedant1521/botlock"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 dark:border-border bg-white dark:bg-surface px-6 py-3 text-sm font-semibold text-black dark:text-ink hover:border-gray-300 dark:hover:border-borderStrong transition-colors"
          >
            <Github className="h-4 w-4" /> View on GitHub
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-gray-500 dark:text-inkSubtle"
        >
          {badges.map((b) => (
            <div key={b.label} className="flex items-center gap-2">
              <b.icon className="h-3.5 w-3.5 text-accent" />
              <span className="font-mono">{b.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
