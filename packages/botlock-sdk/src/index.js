/**
 * botlock-sdk — drop-in AI bot paywall.
 *
 * Quick start (Express):
 *   import { createPaywall } from "botlock-sdk";
 *   import { expressMiddleware } from "botlock-sdk/express";
 *
 *   const paywall = createPaywall({
 *     walletAddress: process.env.SOLANA_WALLET_ADDRESS,
 *     network: "devnet",
 *   });
 *   app.use("/articles", expressMiddleware(paywall));
 *
 * No API key. Payments land directly in your Solana wallet. Optional
 * dashboard analytics are unlocked by signing a message from that same
 * wallet (Sign-In With Solana).
 */

import { PaywallClient } from "./core/client.js";
import { runPaywall } from "./core/paywall.js";
import { detectBot } from "./core/botDetector.js";

function isLikelySolanaAddress(value) {
  if (typeof value !== "string") return false;
  if (value.length < 32 || value.length > 44) return false;
  return /^[1-9A-HJ-NP-Za-km-z]+$/.test(value);
}

export function createPaywall(config) {
  if (!config || !config.walletAddress) {
    throw new Error(
      "createPaywall requires { walletAddress }. Pass your Solana wallet address — that's where USDC payments will land.",
    );
  }
  if (!isLikelySolanaAddress(config.walletAddress)) {
    throw new Error(
      `createPaywall: walletAddress "${config.walletAddress}" does not look like a valid Solana address (base58, 32-44 chars).`,
    );
  }

  const network = config.network || "devnet";

  const client = new PaywallClient({
    walletAddress: config.walletAddress,
    network,
    usdcMint: config.usdcMint,
    apiUrl: config.apiUrl,
    fetchImpl: config.fetchImpl,
    timeoutMs: config.timeoutMs,
  });

  const resolvedConfig = { ...config, network };

  return {
    config: resolvedConfig,
    client,
    run: (request) => runPaywall({ client, config: resolvedConfig, request }),
  };
}

export { detectBot };
