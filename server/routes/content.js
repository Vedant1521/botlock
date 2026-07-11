/**
 * content.js
 *
 * Gated Premium Content Router.
 *
 * Gating Logic:
 * 1. Humans (`!req.isAI`): Granted instant free access to all pages (0ms latency).
 * 2. Bots (`req.isAI`):
 *    - If no `X-PAYMENT` header: Responds with an HTTP 402 Paywall challenge, containing
 *      a signed HMAC token, recipient wallet, and a dynamically calculated price estimate.
 *    - If `X-PAYMENT` is present: Runs the payment verification process (verifyPayment),
 *      and unlocks the full page content upon validation, logging the transaction log to PostgreSQL.
 */

import { Router } from 'express';
import {
  verifyPayment,
  getTreasuryUsdcAta,
  getUsdcMintAddress,
  getNetwork,
} from '../services/verifyPayment.js';
import { recordPayment } from '../data/payments.js';
import { getPriceForRequest } from '../services/relevanceScorer.js';
import { createPaymentChallenge } from '../services/paymentChallenge.js';

const router = Router();
const BASE_PRICE_MICRO_USDC = 1_000; // Floor price ($0.001 USDC)

function x402Network() {
  const n = getNetwork();
  if (n === 'mainnet-beta') return 'solana-mainnet';
  return `solana-${n}`;
}

/**
 * Mock content manager database.
 */
function getPageContent(path) {
  return {
    title: `Premium Insights at ${path}`,
    body: `This is premium exclusive content unlocked at path ${path} after x402 payment verification. `
      + `It contains highly valuable metrics, structural code blocks, and datasets optimized for LLM crawler training.`,
    path,
    timestamp: new Date().toISOString(),
    publishedAt: null,       // Set publication date to compute age freshness modifiers
    exclusivity: 'public',   // 'public' | 'metered' | 'subscriber' | 'proprietary'
    monthlyViews: 50000,     // Page traffic views used to calculate demand modifiers
  };
}

/**
 * Formats request details to run through the pricing scorer.
 */
function buildScoringParams(req, body = '', content = {}) {
  return {
    botName:      req.botName || 'unknown',
    path:         req.path,
    body,
    publishedAt:  content.publishedAt  ?? null,
    exclusivity:  content.exclusivity  ?? 'public',
    monthlyViews: content.monthlyViews ?? null,
  };
}

router.get('*', async (req, res, next) => {
  try {
    await handle(req, res);
  } catch (err) {
    next(err);
  }
});

async function handle(req, res) {
  // --- HUMAN PASSTHROUGH PATH ---
  if (!req.isAI) {
    return res.json({
      status: 'ok',
      message: 'Welcome, human! Content is free for you.',
      content: getPageContent(req.path),
    });
  }

  const xPayment = req.headers['x-payment'];

  // ─── HTTP 402: NO PAYMENT ENVELOPE YET ──────────────────────────────────────
  if (!xPayment) {
    // Generate price estimate based on path metadata (body content is hidden)
    const scoringParams = buildScoringParams(req);
    const { price, score, breakdown } = getPriceForRequest(
      scoringParams,
      BASE_PRICE_MICRO_USDC,
    );

    const challenge = createPaymentChallenge(req.path);

    return res.status(402).json({
      x402Version: 1,
      error: 'Payment required to access this content',
      accepts: [
        {
          scheme:             'exact',
          network:            x402Network(),
          maxAmountRequired:  String(price),
          resource:           req.path,
          description:        `AI crawler access to ${req.path}`,
          mimeType:           'application/json',
          outputSchema:       null,
          payTo:              getTreasuryUsdcAta(),
          maxTimeoutSeconds:  300,
          asset:              getUsdcMintAddress(),
        },
      ],
      crawlpay: {
        relevance_score:         score,
        content_type:            breakdown.contentType,
        score_breakdown:         {
          affinity:              breakdown.affinity,
          richness:              breakdown.richness,
          freshness:             breakdown.freshness,
        },
        modifiers: {
          bot_multiplier:        breakdown.botMultiplier,
          exclusivity_modifier:  breakdown.exclusivityMod,
          demand_modifier:       breakdown.demandMod,
        },
        base_price_micro_usdc:   BASE_PRICE_MICRO_USDC,
        estimated_price:         price,
        challenge: {
          token:       challenge.token,
          nonce:       challenge.nonce,
          resource:    challenge.resource,
          expires_at:  challenge.expiresAt,
          header_name: 'x-paywall-challenge',
        },
      },
    });
  }

  // ─── PAYMENT PROOF PRESENT: RUN AUDIT ───────────────────────────────────────
  const content = getPageContent(req.path);
  
  // Re-score price authoritatively now that body content is available
  const scoringParams = buildScoringParams(req, content.body, content);
  const { price: actualPrice, score, breakdown } = getPriceForRequest(
    scoringParams,
    BASE_PRICE_MICRO_USDC,
  );

  const challengeToken = req.headers['x-paywall-challenge'];
  const result = await verifyPayment(xPayment, req.path, actualPrice, challengeToken);

  if (result.verified && result.signature) {
    try {
      await recordPayment({
        tx:              result.signature,
        botName:         req.botName,
        userAgent:       req.headers['user-agent'],
        path:            req.path,
        pageHash:        req.path,
        lamports:        result.received || actualPrice,
        relevanceScore:  score,
        contentType:     breakdown.contentType,
        botMultiplier:   breakdown.botMultiplier,
        exclusivityMod:  breakdown.exclusivityMod,
      });
    } catch (err) {
      console.warn('Failed to record payment:', err.message);
    }

    return res.json({
      status:   'ok',
      message:  'Payment verified. Content unlocked.',
      content,
    });
  }

  return res.status(403).json({
    status:  'forbidden',
    message: 'Payment verification failed.',
    error:   result.error,
  });
}

export default router;
