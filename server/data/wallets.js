/**
 * Wallet-scoped data layer.
 *
 * Analytics rows are keyed by `wallet_address`. Replay protection (`verified_tx_cache`)
 * is tracked globally, but contains `wallet_address` for auditing and filtering.
 */

import db from "./db.js";

/**
 * Logs a payment directly associated with a specific publisher's wallet address.
 */
export async function recordWalletPayment({
  walletAddress,
  network,
  tx,
  botName,
  userAgent,
  path,
  pageHash,
  lamports,
  relevanceScore,
  contentType,
  botMultiplier,
  exclusivityMod,
}) {
  const { error } = await db.from("payments").insert({
    wallet_address: walletAddress,
    network: network || null,
    tx,
    bot_name: botName || null,
    user_agent: userAgent || null,
    path: path || null,
    page_hash: pageHash || null,
    lamports: lamports || null,
    relevance_score: relevanceScore || null,
    content_type: contentType || null,
    bot_multiplier: botMultiplier || null,
    exclusivity_mod: exclusivityMod || null,
    timestamp: new Date().toISOString(),
  });

  // Ignore unique violation (code 23505) to remain idempotent in case of concurrent requests.
  if (error && error.code !== "23505") {
    throw new Error(`Failed to record wallet payment: ${error.message}`);
  }
}

/**
 * Fetches all transaction logs belonging to a specific publisher's wallet address.
 */
export async function getWalletPayments(walletAddress) {
  const { data, error } = await db
    .from("payments")
    .select("*")
    .eq("wallet_address", walletAddress)
    .order("timestamp", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch wallet payments: ${error.message}`);
  }

  return (data || []).map((row) => ({
    txSignature: row.tx,
    botName: row.bot_name,
    userAgent: row.user_agent,
    path: row.path,
    pageHash: row.page_hash,
    lamports: row.lamports,
    network: row.network,
    relevanceScore: row.relevance_score,
    timestamp: row.timestamp,
  }));
}

/**
 * Sums the total lamports earned by a specific publisher's wallet.
 */
export async function getWalletTotalLamports(walletAddress) {
  const { data, error } = await db
    .from("payments")
    .select("lamports")
    .eq("wallet_address", walletAddress);

  if (error) {
    throw new Error(`Failed to sum wallet payments: ${error.message}`);
  }

  return (data || []).reduce((total, row) => total + Number(row.lamports || 0), 0);
}

/**
 * Checks if a transaction signature is already in the global replay cache.
 * Even though it includes a wallet, transactions must be unique globally on the network.
 */
export async function isTxCachedGlobal(tx) {
  const { data, error } = await db
    .from("verified_tx_cache")
    .select("tx")
    .eq("tx", tx)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to read global tx cache: ${error.message}`);
  }

  return !!data;
}

/**
 * Adds a transaction signature to the global replay cache, recording the associated wallet address.
 */
export async function cacheTxGlobal({ walletAddress, tx }) {
  const { error } = await db.from("verified_tx_cache").insert({
    wallet_address: walletAddress || null,
    tx,
    cached_at: new Date().toISOString(),
  });

  if (error && error.code !== "23505") {
    throw new Error(`Failed to cache global tx: ${error.message}`);
  }
}
