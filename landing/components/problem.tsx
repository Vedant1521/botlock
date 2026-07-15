"use client";

import { motion } from "framer-motion";
import { Bot, FileWarning, CircleDollarSign, type LucideIcon } from "lucide-react";

const problems: {
  icon: LucideIcon;
  title: string;
  description: string;
}[] = [
  {
    icon: Bot,
    title: "Bots scrape at scale",
    description:
      "AI crawlers hit your site thousands of times per second, vacuuming articles, docs, and data to train models you'll never profit from.",
  },
  {
    icon: FileWarning,
    title: "robots.txt is ignored",
    description:
      "Polite bots respect it. Profit-driven AI crawlers don't. A voluntary text file can't enforce anything against a determined scraper.",
  },
  {
    icon: CircleDollarSign,
    title: "Zero revenue to publishers",
    description:
      "Your content powers trillion-dollar models. You get traffic you didn't ask for, server bills you didn't budget for, and $0 in return.",
  },
];

export function Problem() {
  return (
    <section id="problem" className="relative py-24 sm:py-32 border-t border-gray-200 dark:border-border">
      <div className="mx-auto max-w-7xl px-6">
        {/* Heading — two-line bold statement */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl"
        >
          <span className="section-label">The Problem</span>
          <h2 className="mt-6 font-serif italic text-4xl sm:text-5xl lg:text-6xl text-black dark:text-ink leading-[1.05] text-balance">
            AI crawlers scrape billions of pages.
            <br />
            <span className="font-sans not-italic font-bold text-gray-400 dark:text-inkSubtle">Publishers get nothing.</span>
          </h2>
          <p className="mt-6 text-lg text-gray-600 dark:text-inkMuted max-w-2xl leading-relaxed">
            Your content trains trillion-dollar models. You get server bills, bandwidth costs, and zero revenue. robots.txt can&apos;t stop them — but the HTTP protocol can.
          </p>
          <p className="mt-4 text-lg text-gray-600 dark:text-inkMuted max-w-2xl leading-relaxed">
            <span className="font-semibold text-black dark:text-ink">Botlock changes the economics:</span> access requires payment, and payment is verified on-chain before a byte of content is served.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="mt-16 grid md:grid-cols-3 gap-5">
          {problems.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group relative rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-surface p-7 hover:border-gray-300 dark:hover:border-borderStrong transition-all hover:shadow-sm"
            >
              {/* Number badge */}
              <div className="absolute top-7 right-7 font-mono text-xs text-gray-300 dark:text-inkSubtle">
                0{i + 1}
              </div>

              {/* Icon */}
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent group-hover:bg-accent/15 transition-colors">
                <p.icon className="h-5 w-5" />
              </div>

              {/* Title */}
              <h3 className="mt-5 text-base font-semibold text-black dark:text-ink">
                {p.title}
              </h3>

              {/* Description */}
              <p className="mt-2.5 text-sm text-gray-600 dark:text-inkMuted leading-relaxed">
                {p.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
