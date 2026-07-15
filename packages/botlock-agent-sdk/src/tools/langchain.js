/**
 * Optional LangChain helper.
 *
 * Wrap a botlock-agent-sdk client into a LangChain DynamicStructuredTool
 * so an LLM can fetch paid URLs without touching crypto plumbing.
 *
 *   import { createAgentPaywallClient, fromKeypairFile } from "botlock-agent-sdk";
 *   import { paywallFetchTool } from "botlock-agent-sdk/langchain";
 *
 *   const client = createAgentPaywallClient({
 *     network: "devnet",
 *     signer: fromKeypairFile(),
 *     maxAmountMicroUsdc: 5_000,
 *   });
 *
 *   const tool = paywallFetchTool(client, {
 *     allowHost: (host) => host.endsWith("example.com"),
 *   });
 */

export function paywallFetchTool(client, options = {}) {
  const { name = "paywall_fetch", description, allowHost } = options;

  return {
    name,
    description:
      description ||
      "Fetch a URL that may require an HTTP 402 USDC payment. Pays automatically inside operator-defined budget caps.",

    schema: {
      type: "object",
      required: ["url"],
      properties: {
        url: { type: "string", description: "Absolute URL to fetch" },
        method: { type: "string", enum: ["GET", "POST", "PUT", "DELETE"], default: "GET" },
        body: { type: "string", description: "Optional request body (string)" },
        headers: { type: "object", additionalProperties: { type: "string" } },
      },
    },

    async invoke({ url, method = "GET", body, headers }) {
      if (allowHost) {
        try {
          const u = new URL(url);
          if (!allowHost(u.host)) {
            return JSON.stringify({
              status: 0,
              error: `Host ${u.host} not allowed by operator policy.`,
            });
          }
        } catch {
          return JSON.stringify({ status: 0, error: "Invalid URL" });
        }
      }

      try {
        const res = await client.fetch(url, { method, body, headers });
        const text = await res.text();
        return JSON.stringify({
          status: res.status,
          body: text,
          signature: res.paywallPayment?.signature || null,
          amountMicroUsdc: res.paywallPayment?.amountMicroUsdc || null,
        });
      } catch (err) {
        return JSON.stringify({
          status: 0,
          error: err.message,
          code: err.code || "FETCH_FAILED",
        });
      }
    },
  };
}
