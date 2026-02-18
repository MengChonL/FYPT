import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH; // bcrypt hash

if (!JWT_SECRET) {
  console.error('❌ Missing JWT_SECRET environment variable!');
  process.exit(1);
}

if (!ADMIN_USERNAME) {
  console.error('❌ Missing ADMIN_USERNAME environment variable!');
  process.exit(1);
}

if (!ADMIN_PASSWORD_HASH) {
  console.error('❌ Missing ADMIN_PASSWORD_HASH environment variable!');
  console.error('   Generate one with: node -e "import(\'bcryptjs\').then(b=>b.hash(\'yourpassword\',12).then(console.log))"');
  process.exit(1);
}

/**
 * Verify admin credentials and return a JWT token
 */
// Pre-computed dummy hash to prevent timing attacks on username enumeration
const DUMMY_HASH = '$2b$12$LJ3m4ys3Lf0YVJBkSdW8ruGTviK0mEHmGlBqCOCBklbSTxuZGNmCm';

export async function authenticateAdmin(username, password) {
  // Always run bcrypt.compare regardless of username validity (timing attack prevention)
  const isValidUser = username === ADMIN_USERNAME;
  const isValid = await bcrypt.compare(password, isValidUser ? ADMIN_PASSWORD_HASH : DUMMY_HASH);
  if (!isValidUser || !isValid) {
    return null;
  }

  const token = jwt.sign(
    { role: 'admin', username },
    JWT_SECRET,
    { expiresIn: '2h' }
  );

  return token;
}

/**
 * Express middleware: require valid admin JWT in Authorization header
 */
export function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    req.admin = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
}

/**
 * Utility: generate a bcrypt hash for a password
 * Usage: node -e "import('./middleware/auth.js').then(m => m.hashPassword('yourpassword').then(console.log))"
 */
export async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}
