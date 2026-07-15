"use client";

import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Copy, Check, Terminal } from "lucide-react";

type Tab = "publisher-install" | "publisher-express" | "publisher-nextjs" | "agent-install" | "agent-basic" | "agent-langchain";

const TABS: { id: Tab; label: string; side: "publisher" | "agent" }[] = [
  { id: "publisher-install", label: "Install", side: "publisher" },
  { id: "publisher-express", label: "Express", side: "publisher" },
  { id: "publisher-nextjs", label: "Next.js", side: "publisher" },
  { id: "agent-install", label: "Install", side: "agent" },
  { id: "agent-basic", label: "Basic", side: "agent" },
  { id: "agent-langchain", label: "LangChain", side: "agent" },
];

const CODE: Record<Tab, { lang: string; code: string }> = {
  "publisher-install": {
    lang: "bash",
    code: `npm install botlock-sdk

# Set your wallet — this is the only config required.
# Payments land directly in this Solana address.
SOLANA_WALLET_ADDRESS=YourSolanaWallet...`,
  },
  "publisher-express": {
    lang: "js",
    code: `import express from "express";
import { createPaywall } from "botlock-sdk";
import { expressMiddleware } from "botlock-sdk/express";

const paywall = createPaywall({
  walletAddress: process.env.SOLANA_WALLET_ADDRESS,
  network: "mainnet-beta",
  protect: ["/articles/*", "/blog/*"],
  basePriceMicroUsdc: 1_000,
});

const app = express();
app.use(expressMiddleware(paywall));

app.get("/articles/:slug", (req, res) => {
  res.json({ content: "...", paid: true });
});`,
  },
  "publisher-nextjs": {
    lang: "ts",
    code: `// middleware.ts
import { createPaywall } from "botlock-sdk";
import { paywallMiddleware } from "botlock-sdk/nextjs";

const paywall = createPaywall({
  walletAddress: process.env.SOLANA_WALLET_ADDRESS!,
  basePriceMicroUsdc: 1_000,
  protect: ["/articles/*", "/blog/*"],
});

export default paywallMiddleware(paywall);

export const config = { matcher: ["/articles/:path*", "/blog/:path*"] };

// --- App Router route handler ---
// app/articles/[slug]/route.ts
import { withRouteHandler } from "botlock-sdk/nextjs";

export const GET = withRouteHandler(paywall, async (req) =>
  Response.json({ content: "...", paid: true })
);`,
  },
  "agent-install": {
    lang: "bash",
    code: `npm install botlock-agent-sdk \\
  @solana/web3.js \\
  @solana/spl-token \\
  @x402-solana/core

# Peer deps required — keeps your agent project
# in control of Solana SDK versions.`,
  },
  "agent-basic": {
    lang: "js",
    code: `import {
  createAgentPaywallClient,
  fromKeypairFile,
  PaymentRefusedError,
} from "botlock-agent-sdk";

const client = createAgentPaywallClient({
  network: "mainnet-beta",
  signer: fromKeypairFile(),
  maxAmountMicroUsdc: 10_000,
  maxTotalMicroUsdc: 1_000_000,

  onPayment: (p) => console.log("paid:", p.signature, p.amountMicroUsdc),
});

try {
  const res = await client.fetch("https://yoursite.com/articles/ai");
  const data = await res.json();
  console.log("spend so far:", client.spend());
} catch (err) {
  if (err instanceof PaymentRefusedError) {
    // Policy refused — do not retry
  }
}`,
  },
  "agent-langchain": {
    lang: "js",
    code: `import { createAgentPaywallClient, fromKeypairFile } from "botlock-agent-sdk";
import { paywallFetchTool } from "botlock-agent-sdk/langchain";
import { createOpenAIToolsAgent, AgentExecutor } from "langchain/agents";

const client = createAgentPaywallClient({
  network: "mainnet-beta",
  signer: fromKeypairFile(),
  maxAmountMicroUsdc: 5_000,
});

const tool = paywallFetchTool(client, {
  allowHost: (host) => host.endsWith("youralloweddomain.com"),
});

const agent = createOpenAIToolsAgent({ llm, tools: [tool], prompt });
const executor = AgentExecutor.fromAgentAndTools({ agent, tools: [tool] });

const result = await executor.invoke({ input: "Fetch the article at ..." });`,
  },
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="p-1.5 rounded text-gray-400 dark:text-inkSubtle hover:text-gray-600 dark:hover:text-inkMuted transition-colors"
      aria-label="Copy code"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-accent" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

export function CodeInAction() {
  const [active, setActive] = useState<Tab>("publisher-install");
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const publisherTabs = TABS.filter((t) => t.side === "publisher");
  const agentTabs = TABS.filter((t) => t.side === "agent");
  const current = CODE[active];

  return (
    <section className="py-24 sm:py-32 border-t border-gray-200 dark:border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <span className="section-label">Code In Action</span>
          <h2 className="mt-4 font-serif italic text-3xl sm:text-4xl text-black dark:text-ink tracking-tight">
            Integration takes minutes, not days
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5 }}
          className="mt-12 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-surface overflow-hidden"
        >
          {/* Tab bar */}
          <div className="border-b border-gray-200 dark:border-border bg-gray-100 dark:bg-raised">
            <div className="flex items-center px-4 overflow-x-auto">
              {/* Publisher group */}
              <div className="flex items-center gap-0.5 mr-4 shrink-0">
                <span className="text-xs text-gray-400 dark:text-inkSubtle font-mono pr-3 border-r border-gray-200 dark:border-border mr-1 shrink-0">Publisher</span>
                {publisherTabs.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActive(t.id)}
                    className={`px-3 py-3 text-xs font-medium transition-colors whitespace-nowrap border-b-2 ${
                      active === t.id
                        ? "text-accent border-accent"
                        : "text-gray-400 dark:text-inkSubtle border-transparent hover:text-gray-600 dark:hover:text-inkMuted"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="w-px h-5 bg-gray-200 dark:bg-border shrink-0" />

              {/* Agent group */}
              <div className="flex items-center gap-0.5 ml-4 shrink-0">
                <span className="text-xs text-gray-400 dark:text-inkSubtle font-mono pr-3 border-r border-gray-200 dark:border-border mr-1 shrink-0">Agent</span>
                {agentTabs.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActive(t.id)}
                    className={`px-3 py-3 text-xs font-medium transition-colors whitespace-nowrap border-b-2 ${
                      active === t.id
                        ? "text-emerald-500 border-emerald-500"
                        : "text-gray-400 dark:text-inkSubtle border-transparent hover:text-gray-600 dark:hover:text-inkMuted"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Code area */}
          <div className="relative">
            <div className="absolute top-3 right-3 flex items-center gap-2">
              <span className="text-xs text-gray-400 dark:text-inkSubtle font-mono">{current.lang}</span>
              <CopyButton text={current.code} />
            </div>

            <AnimatePresence mode="wait">
              <motion.pre
                key={active}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="code-block text-gray-600 dark:text-inkMuted p-6 pt-10 overflow-x-auto min-h-[240px]"
              >
                <code>{current.code}</code>
              </motion.pre>
            </AnimatePresence>
          </div>

          {/* Footer bar */}
          <div className="border-t border-gray-200 dark:border-border px-4 py-2 flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-gray-400 dark:text-inkSubtle" />
            <span className="text-xs text-gray-400 dark:text-inkSubtle">
              {active.startsWith("publisher") ? "botlock-sdk" : "botlock-agent-sdk"} — MIT license
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
