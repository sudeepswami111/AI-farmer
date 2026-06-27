import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import db from '../db.js';
import { authenticateToken, JWT_SECRET } from '../middleware/auth.js';
import { sendMagicLinkEmail, sendRegistrationVerificationEmail } from '../emailService.js';

const router = express.Router();

/* ============================================================
   Helper — generate a secure random token
   ============================================================ */
function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

/* ============================================================
   POST /api/auth/register
   Registers a new user and sends a verification email
   ============================================================ */
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  if (password.length < 4) {
    return res.status(400).json({ error: 'Password must be at least 4 characters long' });
  }

  try {
    // Check if email already exists
    const existingUser = db.prepare('SELECT id, is_verified FROM users WHERE email = ?').get(email);
    if (existingUser) {
      if (!existingUser.is_verified) {
        return res.status(400).json({ error: 'Email already registered but not verified. Please check your inbox.' });
      }
      return res.status(400).json({ error: 'Email is already registered' });
    }

    // Hash password & create user (unverified)
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const insert = db.prepare('INSERT INTO users (name, email, password_hash, is_verified) VALUES (?, ?, ?, 0)');
    const info = insert.run(name, email, passwordHash);

    // Create a verification token (24h expiry)
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    // Upsert into email_verifications
    db.prepare(`INSERT OR REPLACE INTO email_verifications (email, token, verified, expires_at)
                VALUES (?, ?, 0, ?)`).run(email, token, expiresAt);

    // Send verification email
    try {
      await sendRegistrationVerificationEmail(email, token, name);
    } catch (emailErr) {
      console.error('Email send failed:', emailErr.message);
      // Don't fail registration if email fails — still create account
    }

    res.status(201).json({
      message: 'Account created! Please check your email to verify your account.',
      requiresVerification: true,
      user: { id: info.lastInsertRowid, email, name }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error during registration' });
  }
});

/* ============================================================
   GET /api/auth/verify-email?token=xxx&email=xxx
   Called when user clicks the link in their registration email
   ============================================================ */
router.get('/verify-email', (req, res) => {
  const { token, email } = req.query;

  if (!token || !email) {
    return res.redirect('/verify-result.html?status=error&msg=Invalid+verification+link');
  }

  try {
    const record = db.prepare('SELECT * FROM email_verifications WHERE email = ? AND token = ?').get(email, token);

    if (!record) {
      return res.redirect('/verify-result.html?status=error&msg=Invalid+or+expired+link');
    }

    if (new Date(record.expires_at) < new Date()) {
      return res.redirect('/verify-result.html?status=error&msg=Link+has+expired.+Please+register+again.');
    }

    if (record.verified) {
      return res.redirect('/verify-result.html?status=already&msg=Email+already+verified');
    }

    // Mark email as verified
    db.prepare('UPDATE email_verifications SET verified = 1 WHERE email = ?').run(email);
    db.prepare('UPDATE users SET is_verified = 1 WHERE email = ?').run(email);

    return res.redirect(`/verify-result.html?status=success&email=${encodeURIComponent(email)}`);
  } catch (error) {
    console.error('Email verification error:', error);
    return res.redirect('/verify-result.html?status=error&msg=Something+went+wrong');
  }
});

/* ============================================================
   POST /api/auth/resend-verification
   Resends the verification email
   ============================================================ */
router.post('/resend-verification', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  try {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) return res.status(404).json({ error: 'No account found with this email' });
    if (user.is_verified) return res.status(400).json({ error: 'Email is already verified' });

    const token = generateToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    db.prepare(`INSERT OR REPLACE INTO email_verifications (email, token, verified, expires_at)
                VALUES (?, ?, 0, ?)`).run(email, token, expiresAt);

    await sendRegistrationVerificationEmail(email, token, user.name);

    res.json({ message: 'Verification email resent! Please check your inbox.' });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ error: 'Failed to resend verification email' });
  }
});

/* ============================================================
   POST /api/auth/send-magic-link
   Sends a magic link (passwordless login) to the user's email
   ============================================================ */
router.post('/send-magic-link', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  try {
    // Create a short-lived magic link token (15 min)
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    // Upsert the verification record
    db.prepare(`INSERT OR REPLACE INTO email_verifications (email, token, verified, expires_at)
                VALUES (?, ?, 0, ?)`).run(email, token, expiresAt);

    await sendMagicLinkEmail(email, token);

    res.json({ message: 'Magic link sent! Check your email inbox (and spam folder).' });
  } catch (error) {
    console.error('Send magic link error:', error);
    res.status(500).json({ error: 'Failed to send magic link. Check your email configuration.' });
  }
});

/* ============================================================
   GET /api/auth/verify-magic?token=xxx&email=xxx
   Called when user clicks the magic link in their email
   ============================================================ */
router.get('/verify-magic', (req, res) => {
  const { token, email } = req.query;

  if (!token || !email) {
    return res.redirect('/verify-result.html?status=error&msg=Invalid+magic+link');
  }

  try {
    const record = db.prepare('SELECT * FROM email_verifications WHERE email = ? AND token = ?').get(email, token);

    if (!record) {
      return res.redirect('/verify-result.html?status=error&msg=Invalid+or+already+used+link');
    }

    if (new Date(record.expires_at) < new Date()) {
      return res.redirect('/verify-result.html?status=error&msg=Magic+link+has+expired.+Please+request+a+new+one.');
    }

    if (record.verified) {
      return res.redirect('/verify-result.html?status=error&msg=This+link+has+already+been+used');
    }

    // Mark token as used
    db.prepare('UPDATE email_verifications SET verified = 1 WHERE email = ?').run(email);

    // Auto-create account if user doesn't exist (magic link signup)
    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      const name = email.split('@')[0];
      const insert = db.prepare(`INSERT INTO users (name, email, password_hash, is_verified) VALUES (?, ?, '', 1)`);
      const info = insert.run(name, email);
      user = { id: info.lastInsertRowid, name, email };
    } else {
      // Mark existing user as verified
      db.prepare('UPDATE users SET is_verified = 1 WHERE email = ?').run(email);
    }

    // Generate JWT and pass to frontend
    const jwtToken = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Redirect to verify-result page with token
    return res.redirect(`/verify-result.html?status=magic_success&token=${jwtToken}&name=${encodeURIComponent(user.name)}&email=${encodeURIComponent(email)}`);
  } catch (error) {
    console.error('Magic link verification error:', error);
    return res.redirect('/verify-result.html?status=error&msg=Something+went+wrong');
  }
});

/* ============================================================
   POST /api/auth/login
   ============================================================ */
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Block magic-link only accounts from password login
    if (!user.password_hash) {
      return res.status(401).json({ error: 'This account uses Magic Link login. Please use the Magic Link option.' });
    }

    const validPassword = bcrypt.compareSync(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!user.is_verified) {
      return res.status(403).json({
        error: 'Please verify your email before logging in. Check your inbox for the verification link.',
        requiresVerification: true,
        email: user.email
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Logged in successfully',
      token,
      user: { id: user.id, email: user.email, name: user.name }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login' });
  }
});

/* ============================================================
   GET /api/auth/profile
   ============================================================ */
router.get('/profile', authenticateToken, (req, res) => {
  res.json(req.user);
});

export default router;
