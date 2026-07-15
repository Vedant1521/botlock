import Link from "next/link";
import { ArrowRight, Bot } from "lucide-react";
import { DocLayout } from "@/components/docs/doc-layout";
import {
  DocSection,
  DocSubSection,
  DocP,
  DocCode,
  DocTable,
  DocBadge,
  DocCallout,
} from "@/components/docs/doc-components";

const SECTIONS = [
  { id: "overview",    label: "Overview" },
  { id: "install",     label: "Installation" },
  { id: "quickstart",  label: "Quick Start" },
  { id: "signers",     label: "Signers" },
  { id: "config",      label: "Configuration" },
  { id: "guards",      label: "Safety Guards" },
  { id: "hooks",       label: "Hooks" },
  { id: "errors",      label: "Error Handling" },
  { id: "langchain",   label: "LangChain" },
  { id: "concurrency", label: "Concurrency" },
  { id: "spend",       label: "Spend Tracking" },
];

export const metadata = {
  title: "Agent SDK — Botlock Docs",
  description: "Drop-in fetch replacement for AI agents that auto-pays HTTP 402 paywalls.",
};

export default function AgentDocsPage() {
  return (
    <DocLayout sdk="agent" sections={SECTIONS}>
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <Bot className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="section-label" style={{ color: "#10b981" }}>Agent SDK</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif italic font-normal text-black dark:text-ink tracking-tight">
          botlock-agent-sdk
        </h1>
        <p className="mt-3 text-gray-600 dark:text-inkMuted max-w-2xl">
          Drop-in <DocBadge>fetch()</DocBadge> replacement for AI agents. Automatically detects,
          pays, and retries HTTP 402 paywalls. USDC settlement on Solana with configurable per-request
          and lifetime budget caps.
        </p>
        <div className="mt-4">
          <Link
            href="/docs/publisher"
            className="inline-flex items-center gap-1.5 text-sm text-gray-600 dark:text-inkMuted hover:text-black dark:hover:text-ink transition-colors"
          >
            Publishing content? Use the Publisher SDK <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      <div className="space-y-0">
        <DocSection id="overview" title="Overview">
          <DocP>
            Replace <DocBadge>fetch()</DocBadge> with <DocBadge>client.fetch()</DocBadge>.
            On a 200 response, it&apos;s a pure passthrough. On a 402, the SDK:
          </DocP>
          <ol className="list-decimal list-inside text-sm text-gray-600 dark:text-inkMuted space-y-1.5 mb-4 pl-1">
            <li>Parses the x402 envelope and challenge token</li>
            <li>Validates it against your safety policy (network, mint, amount, recipient)</li>
            <li>Builds, signs, and submits a USDC SPL transfer on Solana</li>
            <li>Retries the original request with <DocBadge>X-PAYMENT</DocBadge> and <DocBadge>x-paywall-challenge</DocBadge></li>
            <li>Returns the unlocked <DocBadge>Response</DocBadge> with <DocBadge>res.paywallPayment</DocBadge> attached</li>
          </ol>
          <DocCallout>
            <strong className="text-accent">Your policy is enforced client-side</strong> before anything is signed.
            A malicious or misconfigured server cannot drain your wallet — all checks happen before the transaction is built.
          </DocCallout>
        </DocSection>

        <DocSection id="install" title="Installation">
          <DocCode lang="bash">{`npm install botlock-agent-sdk \\
  @solana/web3.js \\
  @solana/spl-token \\
  @x402-solana/core`}</DocCode>
          <DocP>
            The Solana and x402 packages are peer dependencies — your project stays in control of versions.
          </DocP>
          <DocSubSection title="Fund your agent wallet">
            <DocP>The agent needs SOL (for transaction fees) and USDC (for payments).</DocP>
            <DocCode lang="bash">{`# Devnet SOL (for fees)
solana airdrop 2 --url devnet

# Devnet USDC — get from Circle faucet:
# https://faucet.circle.com
# Mint: 4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU

# Check balances
solana balance --url devnet
spl-token balance 4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU --url devnet`}</DocCode>
          </DocSubSection>
        </DocSection>

        <DocSection id="quickstart" title="Quick Start">
          <DocCode lang="js">{`import { createAgentPaywallClient, fromKeypairFile } from "botlock-agent-sdk";

const client = createAgentPaywallClient({
  network: "devnet",
  signer: fromKeypairFile(),
  maxAmountMicroUsdc: 10_000,
  maxTotalMicroUsdc: 1_000_000,
});

const res = await client.fetch("https://publisher.com/articles/ai-trends");
const data = await res.json();

if (res.paywallPayment) {
  console.log("paid:", res.paywallPayment.signature);
  console.log("amount:", res.paywallPayment.amountMicroUsdc, "micro-USDC");
}

console.log(client.spend());
// { totalMicroUsdc: 1000, count: 1, lastSignature: "..." }`}</DocCode>
        </DocSection>

        <DocSection id="signers" title="Signers">
          <DocP>
            The SDK needs to sign Solana transactions. Pick the helper that matches your setup.
          </DocP>
          <DocSubSection title="Keypair file (Solana CLI default)">
            <DocCode lang="js">{`import { fromKeypairFile } from "botlock-agent-sdk";

signer: fromKeypairFile()
signer: fromKeypairFile("/path/to/keypair.json")`}</DocCode>
          </DocSubSection>
          <DocSubSection title="JSON array (solana-keygen format)">
            <DocCode lang="js">{`import { fromSecretKeyArray } from "botlock-agent-sdk";

const arr = JSON.parse(fs.readFileSync("keypair.json", "utf8"));
signer: fromSecretKeyArray(arr)`}</DocCode>
          </DocSubSection>
          <DocSubSection title="Base58 secret key (from env var)">
            <DocCode lang="js">{`import { fromSecretKeyBase58 } from "botlock-agent-sdk";

signer: fromSecretKeyBase58(process.env.AGENT_WALLET_SECRET)`}</DocCode>
          </DocSubSection>
          <DocSubSection title="Existing @solana/web3.js Keypair">
            <DocCode lang="js">{`import { fromKeypair } from "botlock-agent-sdk";
import { Keypair } from "@solana/web3.js";

signer: fromKeypair(Keypair.generate())`}</DocCode>
          </DocSubSection>
          <DocSubSection title="Custom signer (HSM / KMS / browser wallet)">
            <DocCode lang="js">{`const signer = {
  publicKey: myPublicKey,
  async signTransaction(tx) {
    await myKms.sign(tx);
    return tx;
  },
};

signer: signer`}</DocCode>
          </DocSubSection>
        </DocSection>

        <DocSection id="config" title="Configuration">
          <DocP>
            Pass these options to <DocBadge>createAgentPaywallClient({"{ ... }"})</DocBadge>.
          </DocP>
          <DocTable
            headers={["Option", "Default", "Description"]}
            rows={[
              [<DocBadge key="s">signer</DocBadge>, <span key="r" className="text-red-500 text-xs">required</span>, "Keypair or custom signer. See Signers section."],
              [<DocBadge key="n">network</DocBadge>, <DocBadge key="nd" color="default">"devnet"</DocBadge>, '"devnet", "mainnet-beta", or "testnet".'],
              [<DocBadge key="r">rpcUrl</DocBadge>, "public RPC", "Override Solana RPC endpoint. Use a paid RPC in production."],
              [<DocBadge key="ma">maxAmountMicroUsdc</DocBadge>, "unlimited", "Hard per-request cap. SDK refuses any 402 that asks for more."],
              [<DocBadge key="mt">maxTotalMicroUsdc</DocBadge>, "unlimited", "Lifetime budget for this client instance. Throws when exceeded."],
              [<DocBadge key="am">allowedMints</DocBadge>, "any", "Restrict acceptable USDC mint addresses."],
              [<DocBadge key="ar">allowedRecipients</DocBadge>, "any", "Restrict acceptable payTo ATAs."],
              [<DocBadge key="ap">autoPay</DocBadge>, <DocBadge key="apd" color="default">true</DocBadge>, "If false, 402s pass through unchanged — SDK will not pay."],
              [<DocBadge key="ua">userAgent</DocBadge>, "botlock-agent-sdk/0.1", "User-Agent sent with all requests."],
              [<DocBadge key="cc">confirmCommitment</DocBadge>, <DocBadge key="ccd" color="default">"confirmed"</DocBadge>, "Solana commitment level for transaction confirmation."],
              [<DocBadge key="oc">onChallenge(info)</DocBadge>, "—", "Hook called before each payment. Return false to refuse."],
              [<DocBadge key="op">onPayment(info)</DocBadge>, "—", "Hook called after each successful payment."],
            ]}
          />
        </DocSection>

        <DocSection id="guards" title="Safety Guards">
          <DocP>
            Every check runs client-side before any transaction is built. Violations throw typed
            errors immediately — no SOL or USDC leaves the wallet.
          </DocP>
          <DocTable
            headers={["What is checked", "How to configure"]}
            rows={[
              ["Network mismatch (mainnet claim on devnet)", "Automatic — always enforced"],
              ["Amount exceeds per-request cap", <DocBadge key="ma">maxAmountMicroUsdc</DocBadge>],
              ["Cumulative spend exceeds session budget", <DocBadge key="mt">maxTotalMicroUsdc</DocBadge>],
              ["Asset mint not in allowlist", <DocBadge key="am">allowedMints</DocBadge>],
              ["Recipient ATA not in allowlist", <DocBadge key="ar">allowedRecipients</DocBadge>],
              ["Programmatic approval", <><DocBadge key="oc">onChallenge</DocBadge> — return false to block</>],
              ["Insufficient USDC balance", "Automatic — checked before transaction build"],
            ]}
          />
        </DocSection>

        <DocSection id="hooks" title="Hooks">
          <DocSubSection title="onChallenge — approve or refuse before paying">
            <DocCode lang="js">{`const client = createAgentPaywallClient({
  // ...
  onChallenge: async ({ url, amountMicroUsdc, envelope }) => {
    console.log(\`About to pay \${amountMicroUsdc} µUSDC for \${url}\`);

    if (amountMicroUsdc > 5_000) return false;

    return true;
  },
});`}</DocCode>
          </DocSubSection>
          <DocSubSection title="onPayment — record after each payment">
            <DocCode lang="js">{`const client = createAgentPaywallClient({
  // ...
  onPayment: async ({ url, signature, amountMicroUsdc, payTo, network }) => {
    await db.insert({ url, signature, amountMicroUsdc, ts: new Date() });
  },
});`}</DocCode>
            <DocP>
              Errors thrown inside <DocBadge>onPayment</DocBadge> are silently swallowed — they
              won&apos;t break the response flow.
            </DocP>
          </DocSubSection>
        </DocSection>

        <DocSection id="errors" title="Error Handling">
          <DocP>
            All SDK errors extend <DocBadge>PaywallError</DocBadge> and carry a <DocBadge>.code</DocBadge> string.
          </DocP>
          <DocCode lang="js">{`import {
  PaymentRefusedError,
  PaymentBudgetExceededError,
  UnsupportedChallengeError,
  OnChainError,
  VerificationRejectedError,
} from "botlock-agent-sdk";

try {
  const res = await client.fetch("https://publisher.com/article");
} catch (err) {
  if (err instanceof PaymentRefusedError) {
    // Policy refused: wrong network, mint, recipient, or amount too high.
  } else if (err instanceof PaymentBudgetExceededError) {
    // Lifetime budget exhausted.
  } else if (err instanceof UnsupportedChallengeError) {
    // The 402 was malformed or uses an unsupported payment scheme.
  } else if (err instanceof OnChainError) {
    // RPC failure, insufficient balance, or tx rejected on-chain.
  } else if (err instanceof VerificationRejectedError) {
    // Payment submitted on-chain but server returned 402/403 anyway.
    console.error("sig:", err.details.signature);
  } else {
    throw err;
  }
}`}</DocCode>
          <DocTable
            headers={["Error class", "Code", "When it throws"]}
            rows={[
              [<DocBadge key="1">PaymentRefusedError</DocBadge>, "PAYMENT_REFUSED", "Network/mint/recipient/amount violates your policy"],
              [<DocBadge key="2">PaymentBudgetExceededError</DocBadge>, "BUDGET_EXCEEDED", "maxTotalMicroUsdc would be exceeded"],
              [<DocBadge key="3">UnsupportedChallengeError</DocBadge>, "UNSUPPORTED_CHALLENGE", "402 is malformed or unsupported scheme"],
              [<DocBadge key="4">OnChainError</DocBadge>, "ON_CHAIN_ERROR", "RPC, balance, or confirmation failure"],
              [<DocBadge key="5">VerificationRejectedError</DocBadge>, "VERIFICATION_REJECTED", "Server rejected payment after on-chain confirmation"],
            ]}
          />
        </DocSection>

        <DocSection id="langchain" title="LangChain Integration">
          <DocCode lang="js">{`import { createAgentPaywallClient, fromKeypairFile } from "botlock-agent-sdk";
import { paywallFetchTool } from "botlock-agent-sdk/langchain";
import { createOpenAIToolsAgent, AgentExecutor } from "langchain/agents";
import { ChatOpenAI } from "@langchain/openai";

const client = createAgentPaywallClient({
  network: "mainnet-beta",
  signer: fromKeypairFile(),
  maxAmountMicroUsdc: 5_000,
});

const tool = paywallFetchTool(client, {
  allowHost: (host) => host.endsWith("trusted-publisher.com"),
});

const llm = new ChatOpenAI({ model: "gpt-4o" });
const agent = await createOpenAIToolsAgent({ llm, tools: [tool], prompt });
const executor = AgentExecutor.fromAgentAndTools({ agent, tools: [tool] });

const result = await executor.invoke({
  input: "Fetch the article at https://trusted-publisher.com/articles/ai-2026",
});`}</DocCode>
          <DocSubSection title="OpenAI function-calling (manual)">
            <DocCode lang="js">{`const tool = paywallFetchTool(client);

// tool.name        -> "paywall_fetch"
// tool.description -> natural language description for the model
// tool.schema      -> JSON Schema of arguments ({ url, method?, headers? })
// tool.invoke(args) -> Promise<string> (response body as text)`}</DocCode>
          </DocSubSection>
        </DocSection>

        <DocSection id="concurrency" title="Concurrency & Idempotency">
          <DocP>
            Concurrent <DocBadge>client.fetch()</DocBadge> calls to the same URL+nonce coalesce
            automatically. If ten parallel requests all receive the same 402, only one payment
            is submitted. All ten callers receive the unlocked response.
          </DocP>
          <DocCode lang="js">{`// Safe — only ONE payment is sent for these concurrent calls
const [a, b, c] = await Promise.all([
  client.fetch("https://publisher.com/article"),
  client.fetch("https://publisher.com/article"),
  client.fetch("https://publisher.com/article"),
]);

// All three responses are the same unlocked content
// client.spend().count === 1`}</DocCode>
          <DocCallout>
            Create separate client instances if you need independent payment tracking per caller
            or per-agent budget isolation.
          </DocCallout>
        </DocSection>

        <DocSection id="spend" title="Spend Tracking">
          <DocCode lang="js">{`const stats = client.spend();
// {
//   totalMicroUsdc: 4500,
//   count: 3,
//   lastSignature: "3jK9...",
//   limit: 1_000_000,
//   remaining: 995_500
// }`}</DocCode>
          <DocP>
            The spend tracker resets when the client is re-created (i.e. per Node.js process).
            Use <DocBadge>onPayment</DocBadge> to persist receipts across restarts.
          </DocP>
          <DocSubSection title="res.paywallPayment shape">
            <DocCode lang="js">{`res.paywallPayment = {
  url:             "https://publisher.com/article",
  signature:       "3jK9xZ...",
  amountMicroUsdc: 1000,
  payTo:           "7xKpT...",
  asset:           "EPjFW...",
  network:         "mainnet-beta",
  challengeToken:  "tok_9fK2...",
}

// Note: paywallPayment is non-enumerable — won't appear in JSON.stringify(res)`}</DocCode>
          </DocSubSection>
        </DocSection>
      </div>
    </DocLayout>
  );
}
