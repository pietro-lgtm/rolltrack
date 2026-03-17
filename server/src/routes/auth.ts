import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db.js';
import { genId, nowISO } from '../helpers.js';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'rolltrack-dev-secret-2024';
const JWT_EXPIRES_IN = '30d';

interface JwtPayload {
  userId: string;
  email: string;
}

function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function getUserResponse(user: any) {
  const { password_hash, ...safe } = user;
  return safe;
}

// POST /api/auth/signup
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({ error: 'Email, password, and name are required' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters' });
      return;
    }

    // Check if email already exists
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      res.status(409).json({ error: 'An account with this email already exists' });
      return;
    }

    const id = genId();
    const now = nowISO();
    const passwordHash = await bcrypt.hash(password, 10);

    db.prepare(`
      INSERT INTO users (id, email, name, password_hash, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, email, name, passwordHash, now, now);

    const user = db.prepare(`
      SELECT u.*, a.name AS home_academy_name
      FROM users u
      LEFT JOIN academies a ON a.id = u.home_academy_id
      WHERE u.id = ?
    `).get(id) as any;

    const token = signToken({ userId: id, email });

    res.status(201).json({
      token,
      user: getUserResponse(user),
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const user = db.prepare(`
      SELECT u.*, a.name AS home_academy_name
      FROM users u
      LEFT JOIN academies a ON a.id = u.home_academy_id
      WHERE u.email = ?
    `).get(email) as any;

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    if (!user.password_hash) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const token = signToken({ userId: user.id, email: user.email });

    res.json({
      token,
      user: getUserResponse(user),
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/auth/me
router.get('/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    const user = db.prepare(`
      SELECT u.*, a.name AS home_academy_name
      FROM users u
      LEFT JOIN academies a ON a.id = u.home_academy_id
      WHERE u.id = ?
    `).get(decoded.userId) as any;

    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    res.json(getUserResponse(user));
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});

export default router;
