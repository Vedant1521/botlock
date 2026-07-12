# Botlock

[![Solana Web3](https://img.shields.io/badge/Solana-Web3.js-black?style=flat&logo=solana)](https://solana.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Botlock** is a decentralized, multi-tenant protocol-level AI agent paywall and request-gating gateway. It implements the **HTTP 402 (Payment Required)** status protocol, allowing digital content publishers to block automated AI crawlers (e.g., `GPTBot`, `ClaudeBot`, `Bytespider`) and enforce self-custody micro-transactions paid in **USDC** on the Solana blockchain—while maintaining a **0ms latency passthrough** for human browser visitors.

---

## 🏗️ Core Concept: The Cinema Ticket Analogy

To understand how Botlock secures content gates statelessly and validates transactions without performance bottlenecks, visualize the **Cinema Ticket with a Security Stamp** analogy:

```
  AI Agent (Movie Guest)                             Facilitator Server (Gatekeeper)
        |                                                           |
        |--- 1. GET /articles/premium ----------------------------->|  (Recognizes Bot UA)
        |                                                           |
        |<-- 2. HTTP 402 + Laminated Ticket (Challenge Token) ------|  (HMAC challenge)
        |                                                           |
        |--- 3. Transfer USDC (On Solana Blockchain) -------------->|  [Solana Network]
        |                                                           |
        |--- 4. GET /articles/premium ----------------------------->|
        |       Headers: X-PAYMENT, x-paywall-challenge             |  (Audit Stamp & Cache)
        |                                                           |
        |<-- 5. HTTP 200 + Premium Content -------------------------|  (Unlocks resource)
```

1. **The Bot Arrives at the Gate**: An AI crawler tries to read a premium page (`GET /articles/premium`). The Server acts as a Cinema Gatekeeper. Recognizing the bot, it blocks access: *"You cannot enter for free. You must pay a fee of $0.01."*
2. **The Server Generates and Hands Over a Laminated, Stamped Ticket**: The server generates a challenge token (the ticket) containing metadata: URL path, destination wallet address, price, and expiration time.
   * **The Security Stamp (HMAC-SHA256)**: The server mixes this metadata with a private secret (`PAYWALL_CHALLENGE_SECRET`), producing a cryptographic signature. If the bot tries to modify any parameter (e.g., changing the price to `$0.00`), the signature breaks.
   * **The Lamination (Base64URL Encoding)**: Characters like `/`, `+`, and `=` can break HTTP headers. The ticket is encoded into safe characters (`-`, `_`) so it travels securely. The server sends this token back in an **HTTP 402 Payment Required** response.
3. **The Bot Pays the Solana Blockchain**: The bot reads the ticket, extracts the publisher's wallet address, and sends a transaction transferring `10,000 micro-USDC` ($0.01) on Solana. The network confirms the transfer and returns a unique **Transaction Signature** (the receipt).
4. **The Bot Returns to the Gate**: The bot sends the request again, attaching the laminated ticket (`x-paywall-challenge`) and the transaction receipt (`X-PAYMENT`).
5. **The Server Verifies Credentials and Grants Access**: The server checks the signature to confirm the ticket is genuine, checks the transaction receipt on the blockchain to verify payment, and cross-references its replay database cache to make sure the receipt wasn't already used. Once validated, it returns **HTTP 200 OK** and delivers the content.

---

## 🛠️ Tech Stack

* **Runtime & Language**: Node.js (ES Modules), JavaScript (ES6+), native cryptography bindings
* **Backend Framework**: Express.js
* **Web3 / Blockchain**: Solana Web3.js SDK, SPL Token Protocol, Associated Token Accounts (ATA)
* **Database & Storage**: Supabase (PostgreSQL) with custom B-Tree indexing
* **Cryptography & Security**: HMAC-SHA256 (`crypto`), TweetNaCl (Ed25519 signature checks), Sign-In with Solana (SIWS)
* **Local Caching & Performance**: `lru-cache` (DNS pooling), memory-mapped JSON-RPC connection caching

---

## 🚀 Key Technical Features

### 1. Composite Heuristic Bot-Detection Middleware
Implemented in [aiDetector.js](file:///C:/Projects%20Placements/botlock/server/middleware/aiDetector.js):
* **Multi-Signal Score Audit**: Analyzes User-Agent expressions, browser HTTP header fingerprints (checking for missing headers like `accept-language`, `sec-fetch-site`, or suspicious default wildcards `accept: */*`), and datacenter subnets.
* **O(1) Bitwise Subnet Filter**: human visitors browse from consumer ISPs, not Cloud datacenters. The engine converts datacenter CIDRs (AWS, GCP, Azure, Cloudflare egress) into 32-bit unsigned integers, pre-computing subnet masks to run checks locally in **0ms** (no regex or string parsing overhead).
* **Asynchronous Reverse DNS Cache**: Performs hostname checks to verify legitimate bots (e.g., Googlebot, Bingbot, Anthropic, OpenAI) against fake bots spoofing UAs. An in-memory **LRU Cache (2,000 max size, 1-hour TTL)** prevents DNS lookup bottlenecks.

### 2. Stateless Cryptographic Gating (HMAC-SHA256)
Implemented in [paymentChallenge.js](file:///C:/Projects%20Placements/botlock/server/services/paymentChallenge.js):
* **Token Structure**: Generates challenge envelopes formatted as `[Base64URL(Payload)].[HMAC-SHA256(Payload, ServerSecret)]`.
* **Tamper-Proof Binding**: Binds challenge tokens to specific URLs (resources), target wallets, prices, and networks. Any modification (e.g., changing the price to `$0.00`) breaks the signature, preventing token-forgery without database state queries.
* **Timing-Safe Validator**: Prevents nanosecond-resolution timing attack hacks by validating signatures using `crypto.timingSafeEqual` byte-buffer checks.

### 3. Solana On-Chain USDC Verification
Implemented in [verifyPayment.js](file:///C:/Projects%20Placements/botlock/server/services/verifyPayment.js) and [verifyPaymentForWallet.js](file:///C:/Projects%20Placements/botlock/server/services/verifyPaymentForWallet.js):
* **Balance Delta Verification**: To avoid parsing unstable transaction instruction schemas, Botlock checks on-chain USDC Associated Token Account (ATA) balances before and after the transaction:
  $$\Delta = \text{Balance}_{\text{post}} - \text{Balance}_{\text{pre}}$$
  Asserts that $\Delta \geq \text{Required Price}$ to verify funding.
* **Double-Spend Replay Cache**: Stores verified transaction signatures in PostgreSQL as `PRIMARY KEY` (backed by B-Tree indexes) to achieve $O(\log N)$ deduplication checks, mitigating transaction recycling vectors.

### 4. Sponsored Onboarding ATA Pipeline
Implemented in [v1.js](file:///C:/Projects%20Placements/botlock/server/routes/v1.js):
* **Auto-Creation UX**: Detects if a publisher's wallet lacks a USDC account on-chain. The gateway automatically generates and broadcasts a `createAssociatedTokenAccountInstruction` transaction funded by a server-side fee-payer keypair, eliminating onboarding setup costs for publishers.
* **Overlapping Broadcast Protection**: Prevents concurrent crawler requests from triggering parallel account creation transactions on-chain (which fails transactions and wastes gas) using an in-flight promise cache (`ataEnsureInFlight`).
* **Economic Viability**: Sponsoring an ATA costs ~0.002 SOL (~$0.30 - $0.40 USD) in rent, which is recovered through transaction cuts or optional sponsorship settings.

### 5. Stateless Sign-In with Solana (SIWS) Dashboard
Implemented in [walletAuth.js](file:///C:/Projects%20Placements/botlock/server/services/walletAuth.js):
* **Secure Session Cookies**: Implements Ed25519 cryptographically signed login challenges.
* **Decentralized Sessions**: Sessions are wrapped in stateless HMAC tokens containing `{ wallet, exp }`, reducing session authorization lookups to **0ms** by bypassing SQL queries.

---

## 📈 The Heuristic Pricing Scorer

To monetize content fairly without blocking SEO search indexers, the gateway runs a dynamic pricing engine on-the-fly inside [relevanceScorer.js](file:///C:/Projects%20Placements/botlock/server/services/relevanceScorer.js):

### 1. Valuation Scoring Math
The core valuation score $S$ is a weighted composite mapped from **0.0 to 1.0**:

$$S = (A \times 0.35) + (R \times 0.35) + (F \times 0.20) + 0.10$$

Where:
* **$A$ (Affinity Score)**: How much the scraping bot values this specific content type.
* **$R$ (Content Richness)**: The length, complexity, and structural density of the text.
* **$F$ (Freshness)**: The age of the article (newer content commands a premium).
* **$0.10$**: A fixed baseline floor contribution to ensure no page returns a $0$ score.

The resulting score is mapped to a price multiplier:

$$\text{Price Multiplier} = 1 + (S \times 9)$$

This yields a base multiplier scaling linearly from **1.0× to 10.0×**.

---

### 2. Heuristic Content Classifier
To determine the Content Type (Prose, News, Technical, Dataset, Legal, Code), the system uses a dual-pass classifier:

#### Pass 1: Path Rule Mapping
First, the engine checks regex patterns against the request path. Path mappings take precedence:
* `blog`/`articles`/`posts` $\rightarrow$ **Prose**
* `news`/`press` $\rightarrow$ **News**
* `docs`/`api`/`reference` $\rightarrow$ **Technical**
* `data`/`research`/`datasets` $\rightarrow$ **Dataset**
* `legal`/`terms`/`privacy` $\rightarrow$ **Legal**
* `code`/`github`/`snippets` $\rightarrow$ **Code**

#### Pass 2: Body Structural Feature Signals
If the path is neutral (e.g. `/page/test`), the engine runs pattern-matching heuristics on the HTML/Markdown body to identify dominant structural features:

| Feature Signal | Regex Pattern | Target Weight | Classified Category |
| :--- | :--- | :--- | :--- |
| **Code** | `` ```[\s\S]*?``` `` or `<code...>` | 1.4 | Code |
| **Table** | `<table...>` or markdown pipes | 1.3 | Dataset |
| **Datapoint** | Numbers containing %, USD, $, €, etc. | 1.2 | Dataset |
| **Equation** | LaTeX double dollar signs `$$...$$` | 1.5 | Technical |
| **Citation** | Scientific citations `[1]` or `(Author, 2026)` | 1.3 | Technical |
| **Heading** | Markdown headers `#` or HTML `<h1>` | 1.1 | (Structure) |
| **List** | Bullet points HTML `<ul>` / `<ol>` | 1.1 | (Structure) |

---

### 3. Bot Commercial Registry & Affinity Matrix

#### Bot Multipliers
Bots are categorized into tiers with base multipliers reflecting their commercial exploitation value:
* **Googlebot / Bingbot** (SEO Search Indexers): **1.0×** (Minimum price to encourage SEO crawls).
* **PerplexityBot / YouBot** (AI Search/Answer Engines): **1.8× – 2.0×** (Real-time answer citation value).
* **GPTBot / ClaudeBot** (General LLMs): **2.5×** (High-quality consumer models).
* **CCBot / MetaAI** (Bulk Training Crawlers): **2.7× – 2.8×** (Massive data ingestion for model training).

#### Content Affinity Matrix
Different bot tiers value content types differently. For example, a bulk training crawler prioritizes datasets and prose, while a code interpreter bot prioritizes technical code. The system uses a 2D lookup matrix ($A$) to compute this match:

| Bot Tier | Prose | Technical | Dataset | Code | Legal | News |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Training** | 1.0 | 0.9 | 1.0 | 0.8 | 0.7 | 0.9 |
| **LLM** | 0.9 | 1.0 | 0.8 | 1.0 | 0.6 | 0.8 |
| **Answer** | 0.8 | 0.7 | 0.6 | 0.6 | 0.5 | 1.0 |
| **Extraction**| 0.6 | 0.5 | 1.0 | 0.4 | 0.8 | 0.6 |
| **Search** | 0.5 | 0.5 | 0.4 | 0.5 | 0.4 | 0.7 |

---

### 4. Exclusivity & Demand Modifiers
The composite price multiplier is multiplied by two environmental modifiers:

1. **Exclusivity Modifier**:
   * **`public`**: **1.0×** (Standard open page).
   * **`metered`**: **1.4×** (Limited free views, then gated).
   * **`subscriber`**: **1.8×** (Typically requires a paid user registration).
   * **`proprietary`**: **2.5×** (Highly unique research, private datasets).
2. **Demand Modifier**:
   Determined by monthly page views from analytics. High-demand pages command a premium:
   * $>1,000,000$ views $\rightarrow$ **1.5×**
   * $>100,000$ views $\rightarrow$ **1.3×**
   * $>10,000$ views $\rightarrow$ **1.15×**
   * $<1,000$ views $\rightarrow$ **0.9×** (Slight discount to incentivize exploration).

The final calculated price is clamped to a maximum ceiling of **20×** of the floor price to prevent runaway pricing anomalies.

---

## 📊 Database Schema

The database relies on PostgreSQL (Supabase) to store payment logs and enforce double-spend protection. Find the script in [schema.sql](file:///C:/Projects%20Placements/botlock/supabase/schema.sql):

```sql
-- 1. Payments Analytics Table
CREATE TABLE IF NOT EXISTS public.payments (
  id              BIGSERIAL PRIMARY KEY,
  tx              TEXT NOT NULL UNIQUE,                -- Solana Signature (Unique receipt)
  wallet_address  TEXT NOT NULL,                       -- Target Publisher wallet
  network         TEXT NOT NULL,                       -- devnet / mainnet-beta
  bot_name        TEXT,                                -- Bot type classification
  user_agent      TEXT,                                -- RAW HTTP User Agent
  path            TEXT,                                -- Gated resource URL path
  page_hash       TEXT,
  lamports        BIGINT,                              -- Micro-USDC paid
  relevance_score INTEGER,                             -- Calculated valuation score (1-10)
  content_type    TEXT,                                -- Classified content category
  bot_multiplier  DOUBLE PRECISION,
  exclusivity_mod DOUBLE PRECISION,
  timestamp       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexing optimizations for analytics reads
CREATE INDEX IF NOT EXISTS payments_timestamp_idx ON public.payments (timestamp DESC);
CREATE INDEX IF NOT EXISTS payments_path_idx      ON public.payments (path);
CREATE INDEX IF NOT EXISTS payments_bot_name_idx  ON public.payments (bot_name);
CREATE INDEX IF NOT EXISTS payments_wallet_idx    ON public.payments (wallet_address);

-- 2. Consolidated Transaction Replay Cache
CREATE TABLE IF NOT EXISTS public.verified_tx_cache (
  tx              TEXT PRIMARY KEY,                    -- Unique Solana signature (B-Tree Index)
  wallet_address  TEXT NOT NULL,
  cached_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexing optimizations for validation caching
CREATE INDEX IF NOT EXISTS verified_tx_cache_wallet_idx ON public.verified_tx_cache (wallet_address);
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000

# Cryptographic secrets
PAYWALL_CHALLENGE_SECRET="your-super-secret-hmac-key"
PAYWALL_AUTH_SECRET="your-super-secret-siws-auth-key"
PAYWALL_AUTH_DOMAIN="localhost"

# Supabase Configurations
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-admin-key"

# Live Solana Configurations (Set MOCK_VERIFICATION=true to test offline)
SOLANA_NETWORK="devnet"
SOLANA_RPC_URL="https://api.devnet.solana.com"
WALLET_ADDRESS="YourPublisherWalletAddressHere"

# Optional: Server keypair for auto-sponsoring USDC ATA creation
# Expressed as either base58 string or a raw JSON array of bytes
FACILITATOR_FEE_PAYER_SECRET_KEY="[12,45,...]" 

# Local testing toggle (Set to true to skip Solana RPC network validations)
MOCK_VERIFICATION="true"
```

---

## 💻 Local Quickstart

### 1. Installation
```bash
# Clone the repository
git clone https://github.com/Vedant1521/botlock.git
cd botlock

# Install dependencies
npm install
```

### 2. Generate a Test Wallet
If you don't have a Solana wallet ready, use the helper script [generate-wallet.js](file:///C:/Projects%20Placements/botlock/test/generate-wallet.js):
```bash
npm run generate-wallet
```
This generates a keypair, prints the keys, and saves it to `test/treasury-keypair.json`. Paste the printed `Public Key` into your `.env` as the `WALLET_ADDRESS`.

### 3. Running the Server
```bash
# Run in development mode (hot reloading)
npm run dev
```

---

## 🧪 Interactive Testing & Verification Suite

### A. Manual Gated Content Testing (Mock Mode)
When `MOCK_VERIFICATION="true"`, you can simulate the gating loop locally:

**Step 1: Request a gated content page as an AI Bot**
To simulate being an AI bot (like GPTBot), send a request with a crawler User-Agent:
```bash
curl -i http://localhost:3000/articles/test \
  -H "User-Agent: Mozilla/5.0 (compatible; GPTBot/1.0; +https://openai.com/gptbot)"
```
*The server intercepts the crawler, calculates a dynamic price estimate (e.g. 10,000 micro-USDC based on page metrics), and returns an **HTTP 402 Payment Required** response with the challenge token.*

**Step 2: Request a challenge envelope explicitly**
You can also generate a challenge envelope via the challenge API:
```bash
curl -X POST http://localhost:3000/v1/challenge \
  -H "Content-Type: application/json" \
  -d '{"walletAddress": "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU", "resource": "/articles/test", "basePriceMicroUsdc": 1000}'
```
*Note the returned `"challenge.token"`.*

**Step 3: Verify the payment using a mock signature**
Submit the request again, attaching the challenge token in the `x-paywall-challenge` header, and the payment signature inside the `X-Payment` envelope header (Base64URL-encoded JSON payload):
```bash
curl http://localhost:3000/articles/test \
  -H "User-Agent: Mozilla/5.0 (compatible; GPTBot/1.0; +https://openai.com/gptbot)" \
  -H "x-paywall-challenge: YOUR_CHALLENGE_TOKEN_FROM_STEP_2" \
  -H "X-Payment: exact; payload=eyJzaWduYXR1cmUiOiJtb2NrX3R4Xzk5OTk5OSJ9"
```
*The server validates the signature, caches the mock signature to block replays, and returns an **HTTP 200 OK** response with the unlocked page content!*

---

### B. Automated End-to-End Devnet Testing (`npm run test:e2e`)
To test the complete blockchain lifecycle, set `MOCK_VERIFICATION="false"` and configure `SOLANA_RPC_URL`.
The E2E script [e2e.js](file:///C:/Projects%20Placements/botlock/test/e2e.js) runs the following pipeline:
1. Validates that the local CLI wallet (`~/.config/solana/id.json`) has SOL (for fees) and devnet USDC (Circle Faucet: https://faucet.circle.com/).
2. Requests the gated page `/articles/test` as a bot, receiving the HTTP 402 and the publisher's receiving ATA.
3. Builds, signs, and broadcasts an on-chain USDC transfer transaction to Solana.
4. Serializes the transaction into an x402 header envelope.
5. Submits the payment headers to the verifier, unlocking the content and recording metrics to Supabase.
```bash
npm run test:e2e
```

---

### C. Request Simulation Suite (`npm run test:ai`)
To run a batch of simulated request states (Human visitor, unpaid bot, bot with invalid signature, policy endpoints, health checks), run the simulator [simulate.js](file:///C:/Projects%20Placements/botlock/test/simulate.js):
```bash
npm run test:ai
```

---

## 📈 API Reference

### `POST /v1/challenge`
Generates a signed HMAC challenge envelope indicating the price, currency, and destination wallet for the requested page.
* **Body**:
  ```json
  {
    "walletAddress": "SolanaPublicKey",
    "resource": "/gated-page-url",
    "basePriceMicroUsdc": 1000,
    "network": "devnet",
    "ensureTreasuryAta": true
  }
  ```
* **Response**:
  ```json
  {
    "x402Version": 1,
    "accepts": [
      {
        "scheme": "exact",
        "network": "solana-devnet",
        "maxAmountRequired": "1000",
        "resource": "/gated-page-url",
        "payTo": "ATA_Address_Here",
        "asset": "USDC_Mint_Address"
      }
    ],
    "crawlpay": {
      "challenge": {
        "token": "challenge_token_here",
        "nonce": "nonce_here",
        "expires_at": "ISO_Timestamp"
      }
    }
  }
  ```

---

### `POST /v1/verify`
Audits the transaction signature, confirms the USDC transfer to the correct ATA, and commits the signature to the replay cache database.
* **Body**:
  ```json
  {
    "walletAddress": "SolanaPublicKey",
    "resource": "/gated-page-url",
    "paymentHeader": "exact; payload=[Base64URL_Payment_Payload]",
    "challengeToken": "[Base64URL_Challenge].[HMAC]",
    "requiredMicroUsdc": 1000
  }
  ```
* **Response (Success)**:
  ```json
  {
    "verified": true,
    "received": 1000,
    "signature": "Solana_Tx_Signature",
    "payer": "Bot_Wallet_Address",
    "network": "devnet"
  }
  ```

---

### `POST /v1/auth/nonce`
Initiates a passwordless, decentralized wallet-ownership check (SIWS).
* **Body**:
  ```json
  { "walletAddress": "SolanaPublicKey" }
  ```
* **Response**:
  ```json
  {
    "token": "Opaque_Challenge_Envelope",
    "message": "Sign in message text containing wallet, nonce, and timestamps...",
    "expiresAt": "ISO_Timestamp"
  }
  ```

---

### `POST /v1/auth/verify`
Verifies the cryptographic Ed25519 signature of the nonce and mints a stateless session token.
* **Body**:
  ```json
  {
    "walletAddress": "SolanaPublicKey",
    "message": "Sign in message text",
    "signature": "Base58_Encoded_Signature",
    "token": "Opaque_Challenge_Envelope"
  }
  ```
* **Response**:
  ```json
  {
    "session": "Stateless_Session_Token_Envelope",
    "walletAddress": "SolanaPublicKey",
    "expiresAt": "ISO_Timestamp"
  }
  ```

---

### `GET /v1/dashboard`
Fetches analytics metrics for the logged-in publisher.
* **Headers**: `Authorization: Bearer <session>`
* **Response**:
  ```json
  {
    "wallet": { "address": "SolanaPublicKey" },
    "total": 42,
    "total_lamports": 42000,
    "payments": [
      {
        "txSignature": "tx_hash",
        "botName": "GPTBot",
        "userAgent": "Mozilla...",
        "path": "/articles/test",
        "lamports": 1000,
        "network": "devnet",
        "timestamp": "ISO_Timestamp"
      }
    ]
  }
  ```

---

### `GET /v1/wallet/treasury`
Convenience endpoint allowing developers to query and verify their USDC ATA destination before deploying live integrations.
* **Query Params**: `?walletAddress=...&network=...`
* **Response**:
  ```json
  {
    "walletAddress": "Publisher_Wallet_Address",
    "network": "devnet",
    "usdcMint": "USDC_Mint_Address",
    "treasuryAta": "Derived_ATA_Address"
  }
  ```

---

### `GET /.well-known/ai-policy.json`
Returns the machine-readable AI access policy configuration, describing token mints, pricing, and default recipient addresses. Conforms to the standard X402 schema.

---

### `GET /dashboard`
Renders and serves the publisher metrics analytics panel interface (`dashboard.html`).

---

### `GET /health`
Returns a liveness confirmation payload indicating server status and uptime metrics.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
