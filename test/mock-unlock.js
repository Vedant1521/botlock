/**
 * Mock unlock test - gets a challenge token and immediately pays with a mock signature.
 * Run: node test/mock-unlock.js  (server must be running on localhost:3000)
 */

const BASE = process.env.BASE_URL || 'http://localhost:3000';

async function run() {
  console.log('🧪 Mock Unlock Test\n');

  // Step 1: Get challenged as a bot
  console.log('1. Requesting page as GPTBot (expect 402)...');
  const r1 = await fetch(`${BASE}/articles/test`, {
    headers: { 'User-Agent': 'GPTBot' },
  });
  const body1 = await r1.json();
  console.log('   Status:', r1.status);

  if (r1.status !== 402) {
    console.log('   ❌ Expected 402, got', r1.status);
    return;
  }
  console.log('   ✅ Paywall challenge received');

  const token = body1?.crawlpay?.challenge?.token;
  if (!token) {
    console.log('   ❌ No challenge token in response');
    return;
  }
  console.log('   Token:', token.substring(0, 50) + '...\n');

  // Step 2: Build proper x402 mock payment header
  const mockPayment = Buffer.from(JSON.stringify({
    x402Version: 1,
    scheme: 'exact',
    network: 'solana-devnet',
    payload: { signature: `mock_tx_${Date.now()}` },
  })).toString('base64');

  // Step 3: Retry with payment + challenge token
  console.log('2. Retrying with mock payment (expect 200)...');
  const r2 = await fetch(`${BASE}/articles/test`, {
    headers: {
      'User-Agent': 'GPTBot',
      'x-paywall-challenge': token,
      'X-Payment': mockPayment,
    },
  });
  const body2 = await r2.json();
  console.log('   Status:', r2.status);

  if (r2.status === 200) {
    console.log('   ✅ Content unlocked!');
    console.log('   Message:', body2.message);
    console.log('   Title:', body2.content?.title);
    console.log('   Body:', body2.content?.body?.substring(80) + '...');
  } else {
    console.log('   ❌ Verification failed:', body2.error);
  }

  console.log('\n✅ Test complete.');
}

run().catch((err) => {
  console.error('Test failed:', err.message);
  process.exit(1);
});
