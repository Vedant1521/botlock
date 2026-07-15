/**
 * botlock-agent-sdk — turnkey 402 paywall client for AI agents.
 *
 * Quick start:
 *
 *   import { createAgentPaywallClient, fromKeypairFile } from "botlock-agent-sdk";
 *
 *   const client = createAgentPaywallClient({
 *     network: "devnet",
 *     signer: fromKeypairFile(),
 *     maxAmountMicroUsdc: 10_000,
 *     maxTotalMicroUsdc: 1_000_000,
 *   });
 *
 *   const res = await client.fetch("https://example.com/articles/test");
 *   const data = await res.json();
 *
 *   console.log("paid:", res.paywallPayment?.signature);
 *   console.log("spend:", client.spend());
 */

export { createAgentPaywallClient } from "./core/client.js";

export {
  fromKeypair,
  fromSecretKeyArray,
  fromSecretKeyBase58,
  fromKeypairFile,
  resolveSigner,
} from "./core/signer.js";

export {
  PaywallError,
  PaymentRefusedError,
  PaymentBudgetExceededError,
  UnsupportedChallengeError,
  OnChainError,
  VerificationRejectedError,
} from "./core/errors.js";
