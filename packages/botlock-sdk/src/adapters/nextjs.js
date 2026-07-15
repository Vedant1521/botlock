/**
 * Next.js adapter — supports:
 *   1) `/middleware.ts` (Edge / Node runtime) via `paywallMiddleware`
 *   2) Pages API routes via `withPaywall(handler)`
 *   3) App Router route handlers via `withRouteHandler(handler)`
 *
 *   import { createPaywall } from "botlock-sdk";
 *   import { paywallMiddleware } from "botlock-sdk/nextjs";
 *
 *   const paywall = createPaywall({ walletAddress: process.env.SOLANA_WALLET_ADDRESS });
 *   export default paywallMiddleware(paywall);
 *   export const config = { matcher: ["/articles/:path*"] };
 */

function buildResponse(verdict, NextResponse) {
  if (NextResponse) {
    return NextResponse.json(verdict.body, { status: verdict.status });
  }
  return new Response(JSON.stringify(verdict.body), {
    status: verdict.status,
    headers: verdict.headers || { "Content-Type": "application/json" },
  });
}

export function paywallMiddleware(paywall) {
  return async function nextMiddleware(request) {
    let NextResponse;
    try {
      ({ NextResponse } = await import("next/server"));
    } catch {
      NextResponse = null;
    }

    const url = new URL(request.url);
    const verdict = await paywall.run({
      method: request.method,
      pathname: url.pathname,
      headers: request.headers,
    });

    if (verdict.kind === "passthrough") {
      return NextResponse ? NextResponse.next() : new Response(null, { status: 200 });
    }
    return buildResponse(verdict, NextResponse);
  };
}

export function withPaywall(paywall, handler) {
  return async function paywalledApi(req, res) {
    const verdict = await paywall.run({
      method: req.method,
      pathname: req.url?.split("?")[0] || "/",
      headers: req.headers,
    });
    if (verdict.kind === "passthrough") {
      if (verdict.payment) req.paywallPayment = verdict.payment;
      return handler(req, res);
    }
    res.status(verdict.status);
    Object.entries(verdict.headers || {}).forEach(([k, v]) => res.setHeader(k, v));
    return res.json(verdict.body);
  };
}

export function withRouteHandler(paywall, handler) {
  return async function paywalledHandler(request, context) {
    const url = new URL(request.url);
    const verdict = await paywall.run({
      method: request.method,
      pathname: url.pathname,
      headers: request.headers,
    });
    if (verdict.kind === "passthrough") {
      return handler(request, context);
    }
    return new Response(JSON.stringify(verdict.body), {
      status: verdict.status,
      headers: verdict.headers || { "Content-Type": "application/json" },
    });
  };
}
