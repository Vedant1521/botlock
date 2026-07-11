# Botlock

[![Solana Web3](https://img.shields.io/badge/Solana-Web3.js-black?style=flat&logo=solana)](https://solana.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Botlock** is a decentralized, protocol-level AI agent paywall and request-gating gateway. It implements the **HTTP 402 (Payment Required)** status protocol, allowing digital content publishers to block automated AI crawlers (e.g., `GPTBot`, `ClaudeBot`, `Bytespider`) and enforce self-custody micro-transactions paid in **USDC** on the Solana blockchain—while maintaining a **0ms latency passthrough** for human browser visitors.

---

## 🛠 Tech Stack

* **Runtime & Language**: Node.js (ES Modules), JavaScript (ES6+)
* **Backend Framework**: Express.js
* **Web3 / Blockchain**: Solana Web3.js SDK, SPL Token Protocol, Associated Token Accounts (ATA)
* **Database & Storage**: Supabase (PostgreSQL) with custom B-Tree indexing
* **Cryptography & Security**: HMAC-SHA256 (crypto), TweetNaCl (Ed25519 signature checks), Sign-In with Solana (SIWS)
* **Local Caching & Performance**: `lru-cache` (DNS pooling), memory-mapped JSON-RPC connection pooling

---

## 🏗 System Architecture

```text
Incoming Request -> [1. Bot Scorer Middleware]
                         │
                         ├── [Human / Score < 40] ──▶ Allow access (0ms penalty)
                         │
                         └── [AI Bot / Score >= 70] ──▶ Intercept (HTTP 402)
                                                             │
   ┌─────────────────────────────────────────────────────────┘
   ▼
[2. Issue HMAC-SHA256 Challenge] ──▶ Bot signs & pays USDC on Solana
                                             │
   ┌─────────────────────────────────────────┘
   ▼
[3. Submit Transaction to /v1/verify]
   ├── [Mock Mode / 'mock_'] ──▶ Bypass RPC check ──▶ Cache & Unlock
   └── [Live Network Check]  ──▶ RPC Node Verification
                                       │
      ┌────────────────────────────────┘
      ▼
   Verify: Recipient ATA + Balance Delta + BlockTime Age (<5 mins)
      │
      └───▶ Log Signature in Cache (Deduplicate) ──▶ Unlock Page (Success)
```

---

## 🚀 Key Technical Features

### 1. Composite Heuristic Bot-Detection Middleware
* **Multi-Signal Audit**: Analyzes User-Agent expressions, browser HTTP header fingerprints (missing `Accept-Language`, `sec-fetch-site`, etc.), and datacenter subnets.
* **O(1) Bitwise CIDR Filtering**: Converts Cloud Datacenter CIDRs (AWS, GCP, Azure, Cloudflare egress) into 32-bit unsigned integers, pre-computing subnet masks to run checks locally in **0ms** (no regex or string parsing overhead).
* **Asynchronous Reverse DNS Cache**: Performs hostname checks to verify legitimate bots (e.g. Googlebot vs. spoofed UAs) using an in-memory **LRU Cache (2,000 max size, 1-hour TTL)** to prevent DNS network blocks.

### 2. Stateless Cryptographic Gating (HMAC-SHA256)
* **Token Structure**: Generates and signs challenge envelopes as `[Base64URL(Payload)].[HMAC-SHA256(Payload, ServerSecret)]`.
* **Tamper-Proof Binding**: Binds challenge tokens to specific URLs (resources), target wallets, prices, and networks. Any modification (e.g. changing the price to `$0.00`) breaks the signature, preventing token-forgery without database state queries.
* **Timing-Safe Validator**: Prevents nanosecond-resolution timing attack hacks by validating signatures using `crypto.timingSafeEqual` byte-buffer checks.

### 3. Solana On-Chain USDC Verification
* **Balance Delta Verification**: To avoid parsing unstable instruction schemas, Botlock checks on-chain USDC Associated Token Account (ATA) balances before and after the transaction:
  $$\Delta = \text{Balance}_{\text{post}} - \text{Balance}_{\text{pre}}$$
  Asserts that $\Delta \geq \text{Required Price}$ to verify funding.
* **Double-Spend Replay Cache**: Stores verified transaction signatures in PostgreSQL as `PRIMARY KEY` (backed by B-Tree indexes) to achieve $O(\log N)$ deduplication checks, mitigating transaction recycling vectors.

### 4. Gasless Onboarding ATA Sponsorship
* **Auto-Creation UX**: Detects if a publisher's wallet lacks a USDC account on-chain. The gateway automatically generates and broadcasts a `createAssociatedTokenAccountInstruction` transaction funded by a server-side fee-payer keypair, eliminating onboarding setup costs for publishers.
* **Overlapping Broadcast Protection**: Prevents concurrent crawler requests from triggering parallel account creation transactions on-chain (which fails transactions and wastes gas) using an in-flight promise cache (`ataEnsureInFlight`).

### 5. Stateless Sign-In with Solana (SIWS) Dashboard
* **Secure Session Cookies**: Implements Ed25519 cryptographically signed login challenges.
* **Decentralized Sessions**: Sessions are wrapped in stateless HMAC tokens containing `{ wallet, exp }`, reducing session authorization lookups to **0ms** by bypassing SQL queries.

### 6. Heuristics Dynamic Pricing Scorer
* **Multi-Signal Content Type Classifier**: Analyzes path rules and structural page markers (LaTeX formatting, code block tags, markdown tables) to classify the content type (e.g. Code, Dataset, Prose, News, Legal).
* **2D Bot-Content Affinity Matrix**: Cross-references the bot's commercial tier (e.g., training scrapers pay a premium, search engines get discounts) against the classified content type to generate a base price multiplier.
* **Compound Modifiers & Clamping**: Applies environmental modifiers for content age freshness and analytics pageview demand, clamping the final calculated price to a maximum **20×** of the floor price to prevent runaway pricing anomalies.

---

## 📊 Database Schema

Run this SQL inside your Supabase SQL Editor to establish tables and optimized indexes:

```sql
-- 1. Payments Analytics Table
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address VARCHAR(44) NOT NULL,
    network VARCHAR(20) NOT NULL,
    tx VARCHAR(88) NOT NULL,
    bot_name VARCHAR(50),
    user_agent TEXT,
    path TEXT NOT NULL,
    page_hash VARCHAR(64),
    lamports BIGINT NOT NULL,           -- Micro-USDC paid
    relevance_score NUMERIC(5,2),
    content_type VARCHAR(50),
    bot_multiplier NUMERIC(5,2),
    exclusivity_mod NUMERIC(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexing for Dashboard Analytics query logs
CREATE INDEX IF NOT EXISTS idx_payments_wallet_created 
ON payments(wallet_address, created_at DESC);

-- 2. Consolidated Transaction Replay Cache
CREATE TABLE IF NOT EXISTS verified_tx_cache (
    tx VARCHAR(88) PRIMARY KEY,        -- Solana Signature (Index: B-Tree PRIMARY KEY)
    wallet_address VARCHAR(44) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
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

# Local testing toggle
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

### 2. Running the Server
```bash
# Run in development mode (hot reloading)
npm run dev
```

### 3. Verification Testing (Mock Mode)

When `MOCK_VERIFICATION="true"`, you can simulate transactions locally using a mock transaction hash (must start with `mock_`):

**Step 1: Request a challenge envelope**
```bash
curl -X POST http://localhost:3000/v1/challenge \
  -H "Content-Type: application/json" \
  -d '{"walletAddress": "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU", "resource": "/articles/test", "basePriceMicroUsdc": 1000}'
```
*Note the `"challenge.token"` returned in the response.*

**Step 2: Verify the payment using a mock signature**
```bash
curl -X POST http://localhost:3000/v1/verify \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
    "resource": "/articles/test",
    "requiredMicroUsdc": 1000,
    "challengeToken": "YOUR_CHALLENGE_TOKEN_FROM_STEP_1",
    "paymentHeader": "exact; payload=eyJzaWduYXR1cmUiOiJtb2NrX3R4XzEyMzQ1NiJ9"
  }'
```
*If you submit the same mock transaction signature a second time, it will be rejected as a replay attack!*

### 4. Gated Content Route Testing (Mock Mode)

You can test how the server gates actual local pages (like `/articles/test`) when hit by a crawler bot:

**Step 1: Request the gated content as a Bot**
AI bots are detected automatically via headers/IP checks. To simulate being a crawler bot (like GPTBot) during local test calls, send a request with a crawler User-Agent:
```bash
curl http://localhost:3000/articles/test \
  -H "User-Agent: Mozilla/5.0 (compatible; GPTBot/1.0; +https://openai.com/gptbot)"
```
*The server intercepts the crawler, calculates a dynamic price estimate ($0.01 USDC / 10,000 micro-USDC based on page metrics), and returns an **HTTP 402 Payment Required** response with the challenge token.*

**Step 2: Submit the payment header to unlock the page**
Submit the request again, attaching the challenge token in the `x-paywall-challenge` header, and the payment signature inside the `X-Payment` envelope header (must be Base64URL-encoded JSON payload):
```bash
curl http://localhost:3000/articles/test \
  -H "User-Agent: Mozilla/5.0 (compatible; GPTBot/1.0; +https://openai.com/gptbot)" \
  -H "x-paywall-challenge: YOUR_CHALLENGE_TOKEN_FROM_STEP_1" \
  -H "X-Payment: exact; payload=eyJzaWduYXR1cmUiOiJtb2NrX3R4Xzk5OTk5OSJ9"
```
*The server verifies the signature, logs the metrics to the database, and returns an **HTTP 200 OK** response with the unlocked page content!*

---

## 📈 API Reference

### `POST /v1/challenge`
Generates a signed HMAC challenge envelope.
* **Body**:
  ```json
  {
    "walletAddress": "SolanaPublicKey",
    "resource": "/gated-page-url",
    "basePriceMicroUsdc": 1000,
    "network": "devnet"
  }
  ```

### `POST /v1/verify`
Validates a transaction signature against the challenge token and updates the replay protection cache.
* **Body**:
  ```json
  {
    "walletAddress": "SolanaPublicKey",
    "resource": "/gated-page-url",
    "paymentHeader": "exact; payload=[Base64URL_Payment_Payload]",
    "challengeToken": "[Base64URL_Challenge].[HMAC]"
  }
  ```

### `POST /v1/auth/nonce`
Initiates a Sign-In with Solana (SIWS) challenge.
* **Body**: `{"walletAddress": "SolanaPublicKey"}`

### `POST /v1/auth/verify`
Validates the cryptographic signature for the login challenge and issues a stateless session token.
* **Body**:
  ```json
  {
    "walletAddress": "SolanaPublicKey",
    "message": "The issued challenge message string",
    "signature": "Base58SignatureBytes",
    "token": "IssuedLoginChallengeToken"
  }
  ```

### `GET /v1/dashboard`
Returns total earnings and analytical logs of payments for the authenticated wallet.
* **Headers**: `Authorization: Bearer <session>`

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
