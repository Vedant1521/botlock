import crypto from 'crypto';

// The Time-To-Live (expiration) of the challenge token is set to 5 minutes (300,000 milliseconds)
const CHALLENGE_TTL_MS = 5 * 60 * 1000;
const secret = process.env.PAYWALL_CHALLENGE_SECRET;

if (!secret) {
  // We use a fallback during development, but warn in production.
  console.warn("⚠️ Warning: PAYWALL_CHALLENGE_SECRET is not set in environment. Falling back to default.");
}

const challengeSecret = secret || 'dev-secret-change-me-securely';

/**
 * Encodes a string value into Base64URL format.
 */
function base64urlEncode(value) {
  return Buffer.from(value).toString('base64url');
}

/**
 * Decodes a Base64URL string back into standard UTF-8 format.
 */
function base64urlDecode(value) {
  return Buffer.from(value, 'base64url').toString('utf8');
}

/**
 * Generates an HMAC-SHA256 signature for a given payload.
 */
function hmac(payloadB64) {
  return crypto.createHmac('sha256', challengeSecret).update(payloadB64).digest('base64url');
}

/**
 * Timing-safe string comparison to prevent timing attacks.
 */
function safeEqual(a, b) {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

/**
 * Generates an HMAC-signed challenge token bound to the request properties.
 * 
 * Binds:
 * - resource: The URL path being accessed (e.g. /articles/test)
 * - walletAddress: The target publisher wallet receiving the payment
 * - network: Solana network (devnet/mainnet-beta)
 * - usdcMint: The contract address of the USDC SPL token
 * - requiredMicroUsdc: The calculated cost in micro-USDC
 */
export function createPaymentChallenge(resourceOrBinding) {
  const binding = typeof resourceOrBinding === 'string'
    ? { resource: resourceOrBinding }
    : (resourceOrBinding || {});

  if (!binding.resource) {
    throw new Error('createPaymentChallenge requires a resource');
  }

  const expiresAtMs = Date.now() + CHALLENGE_TTL_MS;
  const payload = {
    v: 2, // Version of the challenge envelope
    resource: binding.resource,
    wallet: binding.walletAddress || null,
    network: binding.network || null,
    mint: binding.usdcMint || null,
    price: binding.requiredMicroUsdc != null
      ? Number(binding.requiredMicroUsdc)
      : null,
    nonce: crypto.randomBytes(16).toString('hex'), // Prevents dictionary attacks and token recycling
    expiresAtMs,
  };

  const payloadB64 = base64urlEncode(JSON.stringify(payload));
  const signature = hmac(payloadB64);
  const token = `${payloadB64}.${signature}`;

  return {
    token,
    nonce: payload.nonce,
    resource: payload.resource,
    walletAddress: payload.wallet,
    network: payload.network,
    usdcMint: payload.mint,
    requiredMicroUsdc: payload.price,
    expiresAtMs: payload.expiresAtMs,
    expiresAt: new Date(expiresAtMs).toISOString(),
  };
}

/**
 * Validates and decodes a challenge token, verifying it matches the requested parameters.
 */
export function verifyPaymentChallenge(token, expected) {
  if (!token) {
    return { ok: false, error: 'Missing challenge token' };
  }

  const expectedBinding = typeof expected === 'string'
    ? { resource: expected }
    : (expected || {});

  if (!expectedBinding.resource) {
    return { ok: false, error: 'Expected resource missing' };
  }

  const [payloadB64, signature] = token.split('.');
  if (!payloadB64 || !signature) {
    return { ok: false, error: 'Malformed challenge token' };
  }

  // 1. Verify the cryptographic integrity of the token (Signature Check)
  const expectedSig = hmac(payloadB64);
  if (!safeEqual(signature, expectedSig)) {
    return { ok: false, error: 'Invalid challenge signature' };
  }

  // 2. Parse the payload
  let payload;
  try {
    payload = JSON.parse(base64urlDecode(payloadB64));
  } catch {
    return { ok: false, error: 'Invalid challenge payload' };
  }

  // 3. Verify the bindings to block token interception/forgery
  if (payload.resource !== expectedBinding.resource) {
    return { ok: false, error: 'Challenge resource mismatch' };
  }
  
  // 4. Verify the expiration window
  if (typeof payload.expiresAtMs !== 'number' || Date.now() > payload.expiresAtMs) {
    return { ok: false, error: 'Challenge expired' };
  }

  // 5. Verify the wallet binding (blocks bots from paying wallet A but reusing signature for wallet B)
  if (payload.wallet && expectedBinding.walletAddress
      && payload.wallet !== expectedBinding.walletAddress) {
    return { ok: false, error: 'Challenge wallet mismatch' };
  }

  // 6. Verify network binding
  if (payload.network && expectedBinding.network
      && payload.network !== expectedBinding.network) {
    return { ok: false, error: 'Challenge network mismatch' };
  }

  // 7. Verify mint binding
  if (payload.mint && expectedBinding.usdcMint
      && payload.mint !== expectedBinding.usdcMint) {
    return { ok: false, error: 'Challenge mint mismatch' };
  }

  // 8. Verify pricing constraint
  if (payload.price != null
      && expectedBinding.requiredMicroUsdc != null
      && Number(payload.price) > Number(expectedBinding.requiredMicroUsdc)) {
    return { ok: false, error: 'Challenge price mismatch' };
  }

  return {
    ok: true,
    nonce: payload.nonce,
    binding: {
      resource: payload.resource,
      walletAddress: payload.wallet || null,
      network: payload.network || null,
      usdcMint: payload.mint || null,
      requiredMicroUsdc: payload.price ?? null,
    },
  };
}
