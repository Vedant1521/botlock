/**
 * verifyPayment.js
 *
 * Verifies on-chain USDC payment transactions against a single default publisher wallet
 * defined in the server's environment variables (WALLET_ADDRESS).
 *
 * Consolidated Cache Integration (Option 2):
 * Uses `isTxCachedGlobal` and `cacheTxGlobal` from `wallets.js` to ensure cache records
 * are always tied to the receiving publisher's wallet address.
 *
 * Mock Mode Integration:
 * If MOCK_VERIFICATION is enabled or if the signature starts with "mock_", the verification
 * is simulated locally. This allows full end-to-end routing tests without Solana RPC nodes.
 */

import {
  Connection,
  PublicKey,
  Transaction,
  VersionedTransaction,
} from '@solana/web3.js';
import { getAssociatedTokenAddressSync } from '@solana/spl-token';
import { parseX402Payment } from '@x402-solana/core';
import bs58 from 'bs58';

import { isTxCachedGlobal, cacheTxGlobal } from '../data/wallets.js';
import { verifyPaymentChallenge } from './paymentChallenge.js';

const NETWORK = process.env.SOLANA_NETWORK || 'devnet';
const isMockMode = process.env.MOCK_VERIFICATION === 'true';

// Canonical USDC mints
const USDC_MINT_DEVNET  = '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU';
const USDC_MINT_MAINNET = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

const USDC_MINT = new PublicKey(
  process.env.USDC_MINT
  || (NETWORK === 'mainnet-beta' ? USDC_MINT_MAINNET : USDC_MINT_DEVNET),
);

// We initialize connection conditionally to prevent crashes when SOLANA_RPC_URL is missing in mock mode.
const connection = !isMockMode && process.env.SOLANA_RPC_URL
  ? new Connection(process.env.SOLANA_RPC_URL, 'confirmed')
  : null;

const walletPubkey = process.env.WALLET_ADDRESS ? new PublicKey(process.env.WALLET_ADDRESS) : null;
const treasuryUsdcAta = walletPubkey ? getAssociatedTokenAddressSync(USDC_MINT, walletPubkey) : null;

// Expiration window for blockchain verification (5 minutes)
const MAX_PAYMENT_AGE_MS = 5 * 60 * 1000;

export function getTreasuryUsdcAta() { return treasuryUsdcAta ? treasuryUsdcAta.toString() : 'MockATA'; }
export function getUsdcMintAddress() { return USDC_MINT.toString(); }
export function getNetwork()         { return NETWORK; }

/**
 * Extracts a transaction signature from a base64-serialized transaction.
 */
function extractSignatureFromSerialized(serializedB64) {
  const buf = Buffer.from(serializedB64, 'base64');
  try {
    const v = VersionedTransaction.deserialize(buf);
    return v.signatures[0] ? bs58.encode(v.signatures[0]) : null;
  } catch {
    try {
      const t = Transaction.from(buf);
      const sig = t.signatures[0]?.signature;
      return sig ? bs58.encode(sig) : null;
    } catch {
      return null;
    }
  }
}

/**
 * Fetches transaction details from Solana RPC with retries to account for network propagation delay.
 */
async function fetchTxWithRetry(signature, attempts = 8, delayMs = 500) {
  if (isMockMode || !connection) return null;
  for (let i = 0; i < attempts; i++) {
    const tx = await connection.getTransaction(signature, {
      commitment: 'confirmed',
      maxSupportedTransactionVersion: 0,
    });
    if (tx) return tx;
    await new Promise((r) => setTimeout(r, delayMs));
  }
  return null;
}

/**
 * Public wrapper for verifyPayment. Catches all errors defensively to prevent RPC crashes from halting server processes.
 */
export async function verifyPayment(paymentHeader, resource, maxAmountMicroUsdc, challengeTokenFromHeader) {
  try {
    return await verifyPaymentInner(
      paymentHeader,
      resource,
      maxAmountMicroUsdc,
      challengeTokenFromHeader,
    );
  } catch (err) {
    return { verified: false, error: `Verification error: ${err.message}` };
  }
}

function extractChallengeTokenFromPayload(payload) {
  if (!payload || typeof payload !== 'object') return null;
  return payload.challengeToken
    || payload.challenge_token
    || payload?.metadata?.challengeToken
    || payload?.metadata?.challenge_token
    || payload?.metadata?.crawlpay?.challengeToken
    || payload?.metadata?.crawlpay?.challenge_token
    || payload?.crawlpay?.challengeToken
    || payload?.crawlpay?.challenge_token
    || null;
}

/**
 * Main payment verification logic.
 */
async function verifyPaymentInner(paymentHeader, resource, maxAmountMicroUsdc, challengeTokenFromHeader) {
  if (!paymentHeader) {
    return { verified: false, error: 'Missing X-PAYMENT header' };
  }

  const parsed = parseX402Payment(paymentHeader);
  if (!parsed.success) {
    return { verified: false, error: `Invalid X-PAYMENT header: ${parsed.error}` };
  }
  const payment = parsed.payment;

  if (payment.scheme !== 'exact') {
    return { verified: false, error: `Unsupported payment scheme: ${payment.scheme}` };
  }

  const challengeTokenFromPayload = extractChallengeTokenFromPayload(payment.payload);
  const challengeToken = challengeTokenFromPayload || challengeTokenFromHeader;
  const challengeCheck = verifyPaymentChallenge(challengeToken, resource);
  if (!challengeCheck.ok) {
    return { verified: false, error: `Invalid payment challenge: ${challengeCheck.error}` };
  }

  let signature = payment.payload.signature || null;
  if (!signature && payment.payload.serializedTransaction) {
    signature = extractSignatureFromSerialized(payment.payload.serializedTransaction);
  }
  if (!signature) {
    return { verified: false, error: 'Could not extract transaction signature from payment' };
  }

  // Check the global cache to block double-spend replays (Consolidated Cache)
  if (await isTxCachedGlobal(signature)) {
    return { verified: false, error: 'Replay: this transaction has already been redeemed' };
  }

  // --- MOCK MODE BRANCH ---
  if (isMockMode || signature.startsWith('mock_')) {
    const walletAddressStr = walletPubkey ? walletPubkey.toString() : 'MockWalletAddress';
    
    // Log the transaction in the replay cache table (Consolidated Cache)
    await cacheTxGlobal({ walletAddress: walletAddressStr, tx: signature });
    
    return {
      verified: true,
      received: Number(maxAmountMicroUsdc),
      payer: 'MockPayerAddress11111111111111111111111111',
      signature,
      challengeNonce: challengeCheck.nonce,
    };
  }

  // --- PRODUCTION SOLANA NETWORK BRANCH ---
  if (!walletPubkey || !connection) {
    return { verified: false, error: 'Server misconfigured. Missing WALLET_ADDRESS or SOLANA_RPC_URL for live network verification.' };
  }

  let tx = await connection.getTransaction(signature, {
    commitment: 'confirmed',
    maxSupportedTransactionVersion: 0,
  });

  // Submit serialized transaction on behalf of the client if not already on-chain
  if (!tx && payment.payload.serializedTransaction) {
    try {
      const buf = Buffer.from(payment.payload.serializedTransaction, 'base64');
      await connection.sendRawTransaction(buf);
    } catch {
      // Ignore submission failures (tx might be pending or duplicate); fall through to retry
    }
    tx = await fetchTxWithRetry(signature);
  }

  if (!tx) {
    return { verified: false, error: `Transaction ${signature} not found on ${NETWORK}` };
  }
  if (tx.meta?.err) {
    return { verified: false, error: `Transaction failed on-chain: ${JSON.stringify(tx.meta.err)}` };
  }

  if (tx.blockTime) {
    const ageMs = Date.now() - tx.blockTime * 1000;
    if (ageMs > MAX_PAYMENT_AGE_MS) {
      return {
        verified: false,
        error: `Transaction too old: ${Math.round(ageMs / 1000)}s > ${MAX_PAYMENT_AGE_MS / 1000}s`,
      };
    }
  }

  // Extract account indices to match public keys
  const message = tx.transaction.message;
  const accountKeys = message.staticAccountKeys || message.accountKeys || [];
  const keyAt = (i) => {
    const k = accountKeys[i];
    return typeof k === 'string' ? k : k?.toString();
  };

  const treasury = treasuryUsdcAta.toString();
  const mint = USDC_MINT.toString();

  const findBalance = (balances) =>
    (balances || []).find((b) => keyAt(b.accountIndex) === treasury && b.mint === mint);

  const post = findBalance(tx.meta?.postTokenBalances);
  if (!post) {
    return {
      verified: false,
      error: `Transaction does not touch treasury ATA ${treasury} for mint ${mint}`,
    };
  }
  const pre = findBalance(tx.meta?.preTokenBalances);

  const preAmt  = pre ? Number(pre.uiTokenAmount.amount)  : 0;
  const postAmt = Number(post.uiTokenAmount.amount);
  const delta   = postAmt - preAmt;

  const required = Number(maxAmountMicroUsdc);
  if (delta < required) {
    return {
      verified: false,
      error: `Underpaid: received ${delta} micro-USDC, required ${required}`,
    };
  }

  // Identify payer wallet
  const payerEntry = (tx.meta?.preTokenBalances || []).find((b) => {
    if (b.mint !== mint) return false;
    if (keyAt(b.accountIndex) === treasury) return false;
    const matchingPost = (tx.meta?.postTokenBalances || [])
      .find((p) => p.accountIndex === b.accountIndex);
    if (!matchingPost) return false;
    return Number(b.uiTokenAmount.amount) - Number(matchingPost.uiTokenAmount.amount) >= delta;
  });
  const payer = payerEntry?.owner || null;

  // Save transaction to replay cache (Consolidated Cache)
  await cacheTxGlobal({ walletAddress: walletPubkey.toString(), tx: signature });

  return {
    verified: true,
    received: delta,
    payer,
    signature,
    challengeNonce: challengeCheck.nonce,
  };
}
