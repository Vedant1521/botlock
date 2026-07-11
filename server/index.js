/**
 * index.js
 *
 * Main Express server entrypoint.
 *
 * Bootstraps the Express application, configures global parsing middlewares,
 * registers the bot-interception middleware, serves client static assets,
 * and sets up router mounts.
 */

import "dotenv/config";
import express from "express";
import path from "url"; // Note: we use fileURLToPath from url, and path from path. Let's fix the imports.
import pathModule from "path";
import { fileURLToPath } from "url";
import { aiDetector } from "./middleware/aiDetector.js";
import contentRoute from "./routes/content.js";
import policyRoute from "./routes/policy.js";
import dashboardRoute from "./routes/dashboard.js";
import v1Route from "./routes/v1.js";

const __dirname = pathModule.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Run the heuristics bot detector globally on all requests
app.use(aiDetector);

// Serve static dashboard asset files
app.use(express.static(pathModule.join(__dirname, "../client")));

// Route mounts
app.use("/.well-known/ai-policy.json", policyRoute);
app.use("/dashboard", dashboardRoute);
app.use("/v1", v1Route);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

// Gated content pages route (catch-all)
app.use(contentRoute);

// Error handler to prevent HTML crash pages from breaking API clients
app.use((err, req, res, _next) => {
  console.error("Server Error:", err);
  if (res.headersSent) return;
  res.status(err.statusCode || 500).json({
    status: "error",
    error: err.message || "Internal Server Error",
  });
});

app.listen(PORT, () => {
  console.log(`\n  🛡️  Botlock Gating Server running on http://localhost:${PORT}`);
  console.log(`  📄 Gated Content: http://localhost:${PORT}/articles/test`);
  console.log(`  📊 Dashboard:     http://localhost:${PORT}/dashboard`);
  console.log(`  📜 Policy:        http://localhost:${PORT}/.well-known/ai-policy.json`);
  console.log(`  💰 Target Wallet: ${process.env.WALLET_ADDRESS}`);
  console.log(`  🌐 Network:       Solana ${process.env.SOLANA_NETWORK || "devnet"}\n`);
});
