"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";

const faqs: { q: string; a: string }[] = [
  {
    q: "Can agents just ignore the 402?",
    a: "No. A 402 response means no content is served — the body is empty. To get the content, the agent must pay and resubmit proof. There's nothing to scrape until the payment clears on Solana.",
  },
  {
    q: "Will real human visitors be affected?",
    a: "No. Botlock's detection runs in microseconds and only challenges requests that look like bots. Human browsers with normal headers, JS, and timing patterns pass straight through to a 200 OK.",
  },
  {
    q: "Where does the money go?",
    a: "Straight to your Solana wallet. USDC is transferred on-chain to the address you configure in botlock-sdk. No custodian, no payout schedule, no platform fee — you keep 100% of every payment.",
  },
  {
    q: "What if the facilitator goes down?",
    a: "The facilitator at botlock-production.up.railway.app verifies transactions, but payment enforcement happens on Solana itself. If the facilitator is briefly unavailable, agents can submit on-chain proof directly and Botlock will still honor verified settlements.",
  },
  {
    q: "Can I use Botlock with frameworks other than Express and Next.js?",
    a: "Yes. botlock-sdk ships adapters for Express, Next.js, Hono, and Fastify, and the core is framework-agnostic. You can wrap any request handler with the 402 challenge logic in a few lines.",
  },
  {
    q: "How do AI agents integrate with botlock-agent-sdk?",
    a: "Install botlock-agent-sdk, create a payer keypair, and swap fetch() for createBotlockFetch(). It intercepts 402 responses, signs a USDC transfer on Solana, and retries the request automatically. There's also a LangChain tool adapter for agentic workflows.",
  },
];

function FaqItem({
  item,
  isOpen,
  onToggle,
}: {
  item: { q: string; a: string };
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-gray-200 dark:border-border">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
      >
        <span className="text-base font-medium text-black dark:text-ink">
          {item.q}
        </span>
        <Plus
          className={`h-4 w-4 shrink-0 text-accent transition-transform duration-300 ${
            isOpen ? "rotate-45" : ""
          }`}
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="pb-5 pr-8 text-sm text-gray-600 dark:text-inkMuted leading-relaxed">
              {item.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section
      id="faq"
      className="relative py-24 sm:py-32 border-t border-gray-200 dark:border-border"
    >
      <div className="mx-auto max-w-3xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl"
        >
          <span className="section-label">FAQ</span>
          <h2 className="mt-4 font-serif text-3xl sm:text-4xl lg:text-5xl leading-tight text-black dark:text-ink text-balance">
            Common questions
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-10 border-t border-gray-200 dark:border-border"
        >
          {faqs.map((item, i) => (
            <FaqItem
              key={i}
              item={item}
              isOpen={open === i}
              onToggle={() => setOpen(open === i ? null : i)}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
