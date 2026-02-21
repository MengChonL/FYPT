/**
 * Admin Authentication & JWT Management for Cloudflare
 * 使用 Web Crypto API 實作 HMAC-SHA256 簽署及 SHA-256 密碼雜湊比對
 */

/**
 * 1. 驗證管理員密碼並簽發 JWT Token
 * @param {string} username - 輸入帳戶名
 * @param {string} password - 明文密碼（前端傳入）
 * @param {Object} env - Cloudflare 環境變數 (需包含 ADMIN_PASSWORD_HASH, JWT_SECRET)
 * @returns {Promise<string|null>} 返回 JWT Token 或 null
 */
export async function verifyAdminPassword(username, password, env) {
  const ADMIN_USERNAME = env.ADMIN_USERNAME || 'admin';
  const ADMIN_PASSWORD_HASH = env.ADMIN_PASSWORD_HASH; // 存儲在 CF 的 SHA-256 16進位字串
  const JWT_SECRET = env.JWT_SECRET;

  if (!ADMIN_PASSWORD_HASH || !JWT_SECRET) {
    console.error("❌ 缺少環境變數: ADMIN_PASSWORD_HASH 或 JWT_SECRET");
    return null;
  }

  // 驗證帳戶名
  const isValidUser = username === ADMIN_USERNAME;

  // 將輸入的明文密碼轉為 SHA-256 Hex
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(password));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  // 安全比對防止計時攻擊
  const isValidPassword = await timingSafeCompare(hashHex, ADMIN_PASSWORD_HASH);

  if (!isValidUser || !isValidPassword) {
    return null;
  }

  // 生成並簽署 JWT
  return await signJWT({
    role: 'admin',
    username,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 8 * 60 * 60 // 8 小時過期
  }, JWT_SECRET);
}

/**
 * 2. 驗證 JWT Token 是否有效
 * @param {string} token - 來自 Authorization Header 的 Token
 * @param {string} secret - JWT_SECRET
 * @returns {Promise<Object|null>} 返回解碼後的 Payload 或 null
 */
export async function verifyToken(token, secret) {
  if (!token || !secret) return null;

  try {
    const [headerB64, payloadB64, signatureB64] = token.split('.');
    if (!headerB64 || !payloadB64 || !signatureB64) return null;

    const encoder = new TextEncoder();
    const data = `${headerB64}.${payloadB64}`;
    
    // 導入密鑰
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    // 驗證簽名
    const signature = base64UrlToUint8Array(signatureB64);
    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signature,
      encoder.encode(data)
    );

    if (!isValid) return null;

    // 檢查是否過期
    const payload = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')));
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      return null;
    }

    return payload;
  } catch (err) {
    console.error("JWT 驗證出錯:", err);
    return null;
  }
}

/**
 * 內部輔助函數：簽署 JWT
 */
async function signJWT(payload, secret) {
  const encoder = new TextEncoder();
  const header = { alg: 'HS256', typ: 'JWT' };
  
  const headerB64 = uint8ArrayToBase64Url(encoder.encode(JSON.stringify(header)));
  const payloadB64 = uint8ArrayToBase64Url(encoder.encode(JSON.stringify(payload)));
  const data = `${headerB64}.${payloadB64}`;

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  const signatureB64 = uint8ArrayToBase64Url(new Uint8Array(signatureBuffer));

  return `${data}.${signatureB64}`;
}

/**
 * 內部輔助函數：安全比對
 */
async function timingSafeCompare(a, b) {
  if (a.length !== b.length) return false;
  const encoder = new TextEncoder();
  const bufA = encoder.encode(a);
  const bufB = encoder.encode(b);
  let result = 0;
  for (let i = 0; i < bufA.length; i++) {
    result |= bufA[i] ^ bufB[i];
  }
  return result === 0;
}

/**
 * Base64URL 轉換工具
 */
function uint8ArrayToBase64Url(uint8array) {
  return btoa(String.fromCharCode(...uint8array))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlToUint8Array(base64url) {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(base64);
  return Uint8Array.from(binary, c => c.charCodeAt(0));
}
