/**
 * Cloudflare Workers adapter.
 *
 *   import { createPaywall } from "botlock-sdk";
 *   import { cloudflareHandler } from "botlock-sdk/cloudflare";
 *
 *   export default {
 *     async fetch(request, env, ctx) {
 *       const paywall = createPaywall({ walletAddress: env.SOLANA_WALLET_ADDRESS });
 *       return cloudflareHandler(paywall, request, async () => {
 *         return new Response("Premium content");
 *       });
 *     },
 *   };
 */

export async function cloudflareHandler(paywall, request, originHandler) {
  const url = new URL(request.url);
  const verdict = await paywall.run({
    method: request.method,
    pathname: url.pathname,
    headers: request.headers,
  });

  if (verdict.kind === "passthrough") {
    return originHandler(request, verdict.payment);
  }

  return new Response(JSON.stringify(verdict.body), {
    status: verdict.status,
    headers: verdict.headers || { "Content-Type": "application/json" },
  });
}

export function withPaywall(paywall, originHandler) {
  return async function paywallFetch(request, env, ctx) {
    return cloudflareHandler(
      paywall,
      request,
      (req, payment) => originHandler(req, env, ctx, payment),
    );
  };
}
