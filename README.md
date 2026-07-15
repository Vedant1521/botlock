# Botlock

> **robots.txt was a suggestion. This isn't.**

Botlock makes AI agent content access **enforceable at the protocol layer**. Publishers drop in two lines of SDK to gate any route and receive USDC micropayments directly in their Solana wallet. AI agents pay automatically, or they don't get in.

---

## Live Links

| Resource | URL |
|---|---|
| Facilitator API | https://botlock-production.up.railway.app |
| Publisher SDK (npm) | https://www.npmjs.com/package/botlock-sdk |
| Agent SDK (npm) | https://www.npmjs.com/package/botlock-agent-sdk |
| GitHub | https://github.com/Vedant1521/botlock |

---

## What This Solves

AI crawlers (GPTBot, ClaudeBot, PerplexityBot) scrape web content at scale, train on it, and return zero revenue to publishers. `robots.txt` is advisory — it's ignored when economically convenient.

Botlock attaches a **price tag** to bot access using HTTP 402 Payment Required. The server issues a signed payment challenge; the agent submits a USDC transfer on Solana and retries with a payment header. Content unlocks in ~400ms. USDC lands directly in the publisher's wallet — no platform cut, no intermediary.

---

## How It Works

```
AI Agent                    Publisher Server              Solana
   │                              │                          │
   │── GET /article ─────────────▶│                          │
   │                              │  (bot fingerprint)       │
   │◀── HTTP 402 ─────────────────│                          │
   │    {                         │                          │
   │      payTo: "<wallet ATA>",  │                          │
   │      amount: 17688 µUSDC,    │                          │
   │      challenge: "tok_9fK2"   │                          │
   │    }                         │                          │
   │                              │                          │
   │── USDC transfer ────────────────────────────────────────▶│
   │                              │                          │
   │── GET /article ─────────────▶│                          │
   │   X-PAYMENT: <signed_tx>     │── verify tx ────────────▶│
   │   x-paywall-challenge: ...   │◀── confirmed ────────────│
   │                              │                          │
   │◀── HTTP 200 + content ───────│                          │
```

1. AI bot hits a protected route → server returns HTTP 402 with an x402 payment envelope
2. Agent SDK reads the envelope, submits a USDC SPL transfer on Solana, retries with `X-PAYMENT` and `x-paywall-challenge` headers
3. Facilitator verifies the on-chain transaction via Solana RPC — replays are blocked via Supabase cache
4. Content unlocked. USDC lands in the publisher's wallet. No intermediary.

---

## Publisher SDK — Gate Your Content

```bash
npm install botlock-sdk
```

```js
import { createPaywall } from "botlock-sdk";
import { expressMiddleware } from "botlock-sdk/express";

const paywall = createPaywall({
  walletAddress: process.env.SOLANA_WALLET_ADDRESS,
  network: "devnet",
  protect: ["/articles/*", "/api/data/*"],
  basePriceMicroUsdc: 1_000,
});

app.use(expressMiddleware(paywall));

app.get("/articles/:slug", (req, res) => {
  res.json({ content: "...", paid: true, sig: req.paywallPayment?.signature });
});
```

Adapters included: **Express · Next.js App Router · Fastify · Cloudflare Workers**

---

## Agent SDK — Pay Paywalls Automatically

```bash
npm install botlock-agent-sdk @solana/web3.js @solana/spl-token @x402-solana/core
```

```js
import { createAgentPaywallClient, fromKeypairFile } from "botlock-agent-sdk";

const client = createAgentPaywallClient({
  network: "devnet",
  signer: fromKeypairFile(),
  maxAmountMicroUsdc: 10_000,
  maxTotalMicroUsdc: 1_000_000,
});

const res = await client.fetch("https://example.com/articles/ai-trends", {
  headers: { "User-Agent": "GPTBot" },
});
const data = await res.json();

console.log("paid:", res.paywallPayment?.signature);
console.log("total spend:", client.spend(), "µUSDC");
```

LangChain integration available via `botlock-agent-sdk/langchain`.

---

## Run Locally

### Prerequisites

- Node.js >= 18
- A [Supabase](https://supabase.com) project (free tier)
- A Solana wallet address (Phantom wallet)
- Optional: funded devnet wallet for E2E testing

### 1. Clone and Install

```bash
git clone https://github.com/Vedant1521/botlock.git
cd botlock
npm install
```

### 2. Set Up Supabase

Open the [Supabase SQL editor](https://app.supabase.com) and run the contents of `supabase/schema.sql`. This creates:
- `payments` — payment analytics, keyed by wallet address
- `verified_tx_cache` — replay protection (one Solana tx → one unlock)

### 3. Configure Environment

Copy `.env.example` to `.env` and fill in:

```bash
WALLET_ADDRESS=YourSolanaWalletBase58...
SOLANA_NETWORK=devnet
SOLANA_RPC_URL=https://api.devnet.solana.com
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PAYWALL_CHALLENGE_SECRET=<32-byte-hex>
PAYWALL_AUTH_SECRET=<32-byte-hex>
PAYWALL_AUTH_DOMAIN=localhost:3000
MOCK_VERIFICATION="true"
PORT=3000
```

> Generate HMAC secrets with: `openssl rand -hex 32`

### 4. Start the Server

```bash
npm start
# Server running at http://localhost:3000
```

### 5. Open the Dashboard

Visit http://localhost:3000/dashboard — connect your Phantom wallet to view real-time analytics.

---

## Testing

### Smoke Tests (Mock Mode)

```bash
# Health check
curl http://localhost:3000/health

# Human request — passes through (200)
curl http://localhost:3000/articles/test

# AI bot request — blocked with 402
curl -A "GPTBot/1.0" http://localhost:3000/articles/test

# Run full smoke test suite
npm run test:ai
```

### Mock Unlock Test

```bash
# Tests the full unlock cycle with a mock payment (no blockchain needed)
node test/mock-unlock.js
```

### End-to-End Devnet Test

```bash
# Prerequisites: funded devnet wallet at ~/.config/solana/id.json
# Get devnet SOL:  solana airdrop 2 --url devnet
# Get devnet USDC: https://faucet.circle.com

# Set MOCK_VERIFICATION="false" in .env
npm run test:e2e
```

The test sends real USDC on Solana devnet, verifies the on-chain transaction, and unlocks the content.

---

## Project Structure

```
botlock/
├── packages/
│   ├── botlock-sdk/                # Publisher SDK (npm)
│   │   └── src/
│   │       ├── index.js                # createPaywall()
│   │       ├── core/
│   │       │   ├── paywall.js          # framework-agnostic orchestrator
│   │       │   ├── botDetector.js      # multi-signal bot scoring (33 patterns)
│   │       │   └── client.js           # facilitator API client
│   │       └── adapters/
│   │           ├── express.js
│   │           ├── nextjs.js
│   │           ├── fastify.js
│   │           └── cloudflare.js
│   └── botlock-agent-sdk/          # Agent SDK (npm)
│       └── src/
│           ├── index.js                # createAgentPaywallClient()
│           ├── core/
│           │   ├── client.js           # fetch() wrapper + payment loop
│           │   ├── payment.js          # USDC SPL transfer builder
│           │   ├── signer.js           # keypair helpers
│           │   ├── guards.js           # safety policy + budget enforcement
│           │   ├── spendTracker.js     # spend tracking + coalescing
│           │   └── errors.js           # typed error classes
│           └── tools/
│               └── langchain.js        # LangChain tool wrapper
│
├── server/                         # Facilitator server
│   ├── index.js                    # Express entry point
│   ├── routes/
│   │   ├── v1.js                   # /v1/challenge, /v1/verify, /v1/auth/*, /v1/dashboard
│   │   ├── content.js              # catch-all content gate (402 for bots, 200 for humans)
│   │   ├── dashboard.js            # serves dashboard.html
│   │   └── policy.js               # /.well-known/ai-policy.json
│   ├── middleware/
│   │   └── aiDetector.js           # composite bot scoring middleware
│   └── services/
│       ├── verifyPayment.js        # single-tenant on-chain USDC verification
│       ├── verifyPaymentForWallet.js # multi-tenant verification
│       ├── paymentChallenge.js     # HMAC-SHA256 challenge token issuance
│       ├── walletAuth.js           # Sign-In with Solana (SIWS)
│       └── relevanceScorer.js      # dynamic pricing engine
│
├── client/
│   ├── dashboard.html              # Publisher analytics dashboard (SIWS + Phantom)
│   ├── index.html                  # Server gateway homepage
│   └── policy.html                 # Human-readable AI access policy
│
├── supabase/
│   └── schema.sql                  # Postgres schema
│
└── test/
    ├── simulate.js                 # Smoke test suite
    ├── mock-unlock.js              # Mock unlock test
    ├── e2e.js                      # End-to-end devnet test
    └── generate-wallet.js          # Solana keypair generator
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Facilitator server | Node.js (ES Modules), Express |
| Blockchain | Solana (devnet + mainnet-beta) |
| Token | USDC SPL token |
| Payment protocol | x402 (`@x402-solana/core`) |
| Database | Supabase Postgres |
| Dashboard auth | Sign-In with Solana (stateless HMAC-signed sessions) |
| Bot detection | 33 UA patterns + header fingerprint + datacenter CIDR + reverse DNS |
| SDKs | `botlock-sdk` (zero deps) + `botlock-agent-sdk` (peer deps) |

---

## Key Technical Features

### Bot Detection (0ms for humans)

Multi-signal scoring with **33 User-Agent regex patterns**, browser header fingerprint analysis, O(1) bitwise datacenter IP CIDR matching, and LRU-cached reverse DNS verification. Humans pass through with zero network overhead — scoring is entirely local.

| Signal | Weight | Examples |
|--------|--------|---------|
| User-Agent pattern | High | `GPTBot`, `ClaudeBot`, `PerplexityBot`, `CCBot` |
| Missing browser headers | Medium | No `Accept-Language`, no `Sec-Fetch-*` |
| Datacenter IP CIDR | Medium | AWS, GCP, Azure, Cloudflare ranges |
| Reverse DNS | Medium | Hostname resolves to known crawler infra |

### Dynamic Pricing Engine

Prices calculated per-request based on:
- **Bot tier** (GPTBot = 2.5x, Googlebot = free)
- **Content type** (code, dataset, prose, news)
- **Content richness** (log-scale word count, code blocks, tables, equations)
- **Page freshness** (newer content costs more)
- **Exclusivity** (public = 1x, proprietary = 2.5x)
- **Traffic demand** (monthly views)

Range: $0.001 to $0.02 per crawl. Googlebot is whitelisted for free to preserve SEO.

### On-Chain Verification

Every payment verified by querying Solana RPC directly:
- Pre/post token balance delta calculation
- Transaction age check (under 5 minutes)
- Replay protection via Postgres B-Tree indexed signature cache
- Payer wallet identification from balance changes

### Stateless SIWS Dashboard

Publishers authenticate via Phantom wallet (Sign-In with Solana). No passwords, no database sessions — HMAC-signed session tokens verified in 0ms. Dashboard auto-refreshes every 15 seconds showing earnings, payment history, bot breakdowns, and network status.

### Sponsored ATA Onboarding

New publishers without a USDC token account get one auto-created by the server's fee-payer wallet (~0.002 SOL). Concurrent request race conditions are prevented via in-flight promise caching (`ataEnsureInFlight`).

---

## API Reference

### SDK Endpoints (stateless, unauthenticated)

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/v1/challenge` | Issue an x402 payment challenge for a wallet + resource |
| `POST` | `/v1/verify` | Verify an on-chain USDC payment against a challenge |
| `GET` | `/v1/wallet/treasury` | Look up the USDC ATA for a wallet address |

### Dashboard (Sign-In with Solana)

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/v1/auth/nonce` | Request a SIWS challenge nonce |
| `POST` | `/v1/auth/verify` | Submit signed nonce, receive 24h session token |
| `GET` | `/v1/dashboard` | Fetch payment analytics for the authenticated wallet |

### Utility

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/health` | Health check — `{ status: "ok", uptime: N }` |
| `GET` | `/.well-known/ai-policy.json` | Machine-readable pricing policy |
| `GET` | `/dashboard` | Publisher analytics dashboard UI |
| `GET` | `/` | Server gateway homepage |

---

## Integration Without npm

The SDK is a convenience wrapper. Publishers using Python, Go, or any language can call the REST API directly:

```python
import requests

# Issue challenge
resp = requests.post("https://your-server.com/v1/challenge", json={
    "walletAddress": "ABC...",
    "resource": "/articles/test",
    "network": "devnet",
})
challenge = resp.json()

# After paying USDC on Solana, verify:
verify = requests.post("https://your-server.com/v1/verify", json={
    "walletAddress": "ABC...",
    "paymentHeader": payment_header,
    "resource": "/articles/test",
    "challengeToken": challenge["crawlpay"]["challenge"]["token"],
    "requiredMicroUsdc": int(challenge["accepts"][0]["maxAmountRequired"]),
})
```

See `documentation/integration_methods.md` for full cross-language examples.

---

## Database Schema

```sql
CREATE TABLE IF NOT EXISTS public.payments (
  id              BIGSERIAL PRIMARY KEY,
  tx              TEXT NOT NULL UNIQUE,
  wallet_address  TEXT NOT NULL,
  network         TEXT NOT NULL,
  bot_name        TEXT,
  user_agent      TEXT,
  path            TEXT,
  lamports        BIGINT,
  relevance_score INTEGER,
  content_type    TEXT,
  bot_multiplier  DOUBLE PRECISION,
  exclusivity_mod DOUBLE PRECISION,
  timestamp       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.verified_tx_cache (
  tx              TEXT PRIMARY KEY,
  wallet_address  TEXT NOT NULL,
  cached_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## License

MIT
