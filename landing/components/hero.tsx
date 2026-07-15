"use client";

import { useEffect, useState, useRef, type ReactNode } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Github, Zap, KeyRound, Scale, Terminal } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

type LineType = "cmd" | "status" | "json" | "comment" | "ok" | "gap";
type TerminalLine = { delay: number; text: string; type: LineType };

const TERMINAL_LINES: TerminalLine[] = [
  { delay: 0,    text: "$ curl -A 'GPTBot/1.0' https://yoursite.com/articles/ai-trends", type: "cmd" },
  { delay: 800,  text: "HTTP/1.1 402 Payment Required", type: "status" },
  { delay: 1000, text: "{", type: "json" },
  { delay: 1100, text: '  "scheme": "exact",', type: "json" },
  { delay: 1200, text: '  "payTo": "7xKpT...ATA",', type: "json" },
  { delay: 1300, text: '  "asset": "USDC on Solana",', type: "json" },
  { delay: 1400, text: '  "amountMicroUsdc": 17688,', type: "json" },
  { delay: 1500, text: '  "challenge": "tok_9fK2mN..."', type: "json" },
  { delay: 1600, text: "}", type: "json" },
  { delay: 2200, text: "", type: "gap" },
  { delay: 2300, text: "# Agent pays 0.018 USDC on-chain...", type: "comment" },
  { delay: 3100, text: "$ curl ... -H 'X-PAYMENT: <signed_tx>'", type: "cmd" },
  { delay: 3400, text: "HTTP/1.1 200 OK", type: "ok" },
  { delay: 3600, text: '{ "content": "...", "paywallPayment": { "signature": "3jK9...", "received": 17688 } }', type: "ok" },
];

function lineColor(type: LineType) {
  switch (type) {
    case "cmd":
      return "text-accent";
    case "status":
      return "text-amber-400 dark:text-amber-400";
    case "ok":
      return "text-emerald-400 dark:text-emerald-400";
    case "comment":
      return "text-gray-400 dark:text-inkSubtle italic";
    case "json":
      return "text-gray-600 dark:text-inkMuted";
    default:
      return "text-gray-600 dark:text-inkMuted";
  }
}

function TerminalDemo() {
  const [visibleLines, setVisibleLines] = useState<number[]>([]);
  const loopRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;

    function runSequence() {
      setVisibleLines([]);
      TERMINAL_LINES.forEach((line, i) => {
        loopRef.current = setTimeout(() => {
          if (!cancelled) setVisibleLines((prev) => [...prev, i]);
        }, line.delay);
      });

      const totalDuration = Math.max(...TERMINAL_LINES.map((l) => l.delay)) + 3500;
      loopRef.current = setTimeout(() => {
        if (!cancelled) runSequence();
      }, totalDuration);
    }

    runSequence();
    return () => {
      cancelled = true;
      if (loopRef.current) clearTimeout(loopRef.current);
    };
  }, []);

  return (
    <div className="relative">
      <div className="rounded-2xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-surface shadow-2xl overflow-hidden glow-accent w-full">
        {/* Title bar */}
        <div className="flex items-center gap-2 border-b border-gray-200 dark:border-border bg-gray-100 dark:bg-raised px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          <span className="ml-3 flex items-center gap-1.5 text-xs font-mono text-gray-500 dark:text-inkSubtle">
            <Terminal className="w-3 h-3" />
            botlock — agent access flow
          </span>
        </div>

        {/* Terminal body */}
        <div className="code-block p-3 sm:p-4 space-y-0.5 min-h-[300px] overflow-x-auto">
          {TERMINAL_LINES.map((line, i) => {
            if (line.type === "gap") {
              return visibleLines.includes(i) ? <div key={i} className="h-3" /> : null;
            }
            if (!visibleLines.includes(i)) return null;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15 }}
                className={`font-mono text-xs sm:text-sm break-all ${lineColor(line.type)}`}
              >
                {line.text}
              </motion.div>
            );
          })}
          {visibleLines.length < TERMINAL_LINES.length && (
            <div className="code-block text-accent">
              <span className="animate-cursor-blink">█</span>
            </div>
          )}
        </div>
      </div>

      {/* Floating badge */}
      <div className="absolute -bottom-4 right-0 sm:-right-4 bg-white dark:bg-surface border border-gray-200 dark:border-border rounded-lg px-3 py-2 shadow-lg">
        <div className="text-xs text-gray-500 dark:text-inkSubtle">settled on-chain</div>
        <div className="text-sm font-semibold text-emerald-500">+$0.018 USDC</div>
      </div>
    </div>
  );
}

function StatusItem({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <span className="font-mono">{label}</span>
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center pt-16 overflow-x-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 grid-bg pointer-events-none" />

      {/* Radial glow */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-[300px] h-[300px] sm:w-[450px] sm:h-[450px] lg:w-[600px] lg:h-[600px] rounded-full bg-gradient-radial from-accent/5 via-transparent to-transparent" />
      </div>

      {/* Bottom fade */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white dark:to-base pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 grid lg:grid-cols-2 gap-8 lg:gap-12 lg:gap-16 items-center py-12 sm:py-20 flex-1">
        {/* Left: Copy */}
        <div>
          <motion.div
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 dark:border-border bg-gray-50 dark:bg-surface px-3 py-1"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            <span className="section-label">Introducing Botlock</span>
          </motion.div>

          <motion.h1
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mt-6 font-serif italic text-3xl sm:text-4xl lg:text-5xl leading-[1.08] text-balance text-black dark:text-ink"
          >
            AI agents scrape your content.{" "}
            <span className="font-sans not-italic font-bold text-accent">Botlock makes them pay.</span>
          </motion.h1>

          <motion.p
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mt-6 max-w-xl text-base sm:text-lg text-gray-600 dark:text-inkMuted leading-relaxed"
          >
            Botlock is an HTTP 402 paywall for AI agents. A drop-in SDK for
            publishers and an auto-pay SDK for agents, settled in USDC
            micropayments on Solana. Bots can&apos;t bypass the protocol layer.
          </motion.p>

          <motion.div
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mt-8 flex flex-wrap gap-4"
          >
            <a
              href="/docs/publisher"
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-black hover:bg-accent-dark transition-colors glow-accent-sm"
            >
              Get Started <ArrowRight className="h-4 w-4" />
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
        </div>

        {/* Right: Terminal */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <TerminalDemo />
        </motion.div>
      </div>

      {/* Status bar */}
      <div className="relative border-t border-gray-200 dark:border-border bg-white/60 dark:bg-base/60 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-14 flex flex-wrap items-center justify-center sm:justify-between gap-3 sm:gap-6 text-xs text-gray-500 dark:text-inkSubtle">
          <StatusItem icon={<Zap className="h-3.5 w-3.5 text-accent" />} label="Solana devnet + mainnet" />
          <StatusItem icon={<KeyRound className="h-3.5 w-3.5 text-accent" />} label="No API key required" />
          <StatusItem icon={<Scale className="h-3.5 w-3.5 text-accent" />} label="MIT license" />
        </div>
      </div>
    </section>
  );
}
