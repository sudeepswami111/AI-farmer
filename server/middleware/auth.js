/* ============================================================
   KisanMitra - Supabase Auth Middleware
   ============================================================ */
import { createClient } from '@supabase/supabase-js';

// Wait until you set these in your .env or paste them here directly
const SUPABASE_URL = process.env.SUPABASE_URL || 'PASTE_YOUR_SUPABASE_PROJECT_URL';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'PASTE_YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(403).json({ error: 'Invalid or expired token.' });
    }
    
    req.user = { id: user.id, email: user.email, ...user.user_metadata };
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
}

// Optional auth — doesn't fail, just sets req.user if token exists
export async function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token) {
    try {
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) {
        req.user = { id: user.id, email: user.email, ...user.user_metadata };
      }
    } catch (_) {}
  }
  next();
}

export const JWT_SECRET = 'supabase-handles-jwt-now';
