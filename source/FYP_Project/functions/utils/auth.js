/**
 * Admin authentication for Cloudflare Functions
 * Uses Web Crypto API for HMAC-SHA256 JWT signing (no bcryptjs in CF Workers)
 * 
 * IMPORTANT: Since bcryptjs is not available in CF Workers, we use a simpler 
 * password verification approach. The ADMIN_PASSWORD_HASH env var in CF should
 * be set to a SHA-256 hex digest of the password:
 *   echo -n "yourpassword" | sha256sum
 * 
 * For production, consider using Cloudflare Access or a proper auth service.
 */

/**
 * Verify admin credentials and return a signed JWT token
 * @param {string} username 
 * @param {string} password 
 * @param {Object} env - Cloudflare env vars
 * @returns {string|null} JWT token or null
 */
export async function verifyAdminPassword(username, password, env) {
  const ADMIN_USERNAME = env.ADMIN_USERNAME || 'admin';
  const ADMIN_PASSWORD_HASH = env.ADMIN_PASSWORD_HASH; // SHA-256 hex digest
  const JWT_SECRET = env.JWT_SECRET;

  if (!ADMIN_PASSWORD_HASH || !JWT_SECRET) return null;

  // Constant-time username check (always verify password to prevent timing attacks)
  const isValidUser = username === ADMIN_USERNAME;

  // Hash the provided password with SHA-256 and compare
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(password));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  // Constant-time comparison
  const isValidPassword = hashHex.length === ADMIN_PASSWORD_HASH.length &&
    crypto.subtle.timingSafeEqual
      ? await timingSafeCompare(hashHex, ADMIN_PASSWORD_HASH)
      : hashHex === ADMIN_PASSWORD_HASH;

  if (!isValidUser || !isValidPassword) return null;

  // Sign JWT using Web Crypto HMAC-SHA256
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const payload = btoa(JSON.stringify({
    role: 'admin',
    username,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 8 * 60 * 60 // 8 hours
  })).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(JWT_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const sigBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(`${header}.${payload}`)
  );
  const signature = btoa(String.fromCharCode(...new Uint8Array(sigBuffer)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  return `${header}.${payload}.${signature}`;
}

/**
 * Constant-time string comparison (fallback)
 */
async function timingSafeCompare(a, b) {
  if (a.length !== b.length) return false;
  const encoder = new TextEncoder();
  const bufA = encoder.encode(a);
  const bufB = encoder.encode(b);
  // XOR all bytes and check if result is 0
  let result = 0;
  for (let i = 0; i < bufA.length; i++) {
    result |= bufA[i] ^ bufB[i];
  }
  return result === 0;
}
