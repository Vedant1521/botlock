/**
 * Test helper to simulate AI agent requests against the paywall.
 * Usage: node test/simulate.js
 * Make sure the server is running first (npm start).
 */

const BASE = process.env.BASE_URL || "http://localhost:3000";

async function request(label, url, headers = {}) {
  console.log(`\n━━━ ${label} ━━━`);
  try {
    const res = await fetch(url, { headers });
    const contentType = res.headers.get("content-type") || "";
    let body;
    console.log(`Status: ${res.status}`);
    
    if (contentType.includes("application/json")) {
      body = await res.json();
      console.log(JSON.stringify(body, null, 2));
    } else {
      body = await res.text();
      console.log(`Content-Type: ${contentType} (${body.length} characters)`);
      console.log(body.substring(0, 200).trim() + "\n...");
    }
    return { status: res.status, body };
  } catch (err) {
    console.error("Request failed:", err.message);
    return null;
  }
}

async function run() {
  console.log("🧪 AI Paywall — Test Suite\n");

  // 1. Normal human request → should get content for free
  await request("1. Human visitor (expect 200)", `${BASE}/articles/test`);

  // 2. AI request without payment → should get HTTP 402 challenge
  await request("2. GPTBot without payment (expect 402)", `${BASE}/articles/test`, {
    "User-Agent": "Mozilla/5.0 (compatible; GPTBot/1.0)",
  });

  // 3. AI request with fake tx → should get HTTP 403 Forbidden
  await request("3. ClaudeBot with fake tx (expect 403)", `${BASE}/articles/test`, {
    "User-Agent": "Mozilla/5.0 (compatible; ClaudeBot/1.0)",
    "x-payment": "exact; payload=eyJzaWduYXR1cmUiOiJmYWtlX3R4X3NpZ25hdHVyZTEyMzQ1Njc4OTAifQ==",
  });

  // 4. Check policy endpoint
  await request("4. AI Policy (expect 200)", `${BASE}/.well-known/ai-policy.json`);

  // 5. Check dashboard
  await request("5. Dashboard (expect 200)", `${BASE}/dashboard`);

  // 6. Health check
  await request("6. Health check (expect 200)", `${BASE}/health`);

  console.log("\n✅ All tests complete.\n");
}

run();
