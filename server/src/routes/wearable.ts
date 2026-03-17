import { Router, Request, Response } from 'express';
import db from '../db.js';
import { genId } from '../helpers.js';

const router = Router();

// POST /sync - save wearable data for a session
router.post('/sync', (req: Request, res: Response) => {
  const userId = req.userId;
  const { session_id, source, avg_heart_rate, max_heart_rate, min_heart_rate, calories_burned, heart_rate_zones, heart_rate_data, vo2_max, recovery_score } = req.body;

  if (!session_id) {
    res.status(400).json({ error: 'session_id is required' });
    return;
  }

  // Verify session belongs to user
  const session = db.prepare('SELECT id FROM training_sessions WHERE id = ? AND user_id = ?').get(session_id, userId);
  if (!session) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }

  // Check if wearable data already exists for this session
  const existing = db.prepare('SELECT id FROM wearable_data WHERE session_id = ?').get(session_id) as any;

  if (existing) {
    // Update existing
    db.prepare(`
      UPDATE wearable_data SET
        source = COALESCE(?, source),
        avg_heart_rate = COALESCE(?, avg_heart_rate),
        max_heart_rate = COALESCE(?, max_heart_rate),
        min_heart_rate = COALESCE(?, min_heart_rate),
        calories_burned = COALESCE(?, calories_burned),
        heart_rate_zones = COALESCE(?, heart_rate_zones),
        heart_rate_data = COALESCE(?, heart_rate_data),
        vo2_max = COALESCE(?, vo2_max),
        recovery_score = COALESCE(?, recovery_score)
      WHERE id = ?
    `).run(
      source ?? null,
      avg_heart_rate ?? null, max_heart_rate ?? null, min_heart_rate ?? null,
      calories_burned ?? null,
      heart_rate_zones ? JSON.stringify(heart_rate_zones) : null,
      heart_rate_data ? JSON.stringify(heart_rate_data) : null,
      vo2_max ?? null, recovery_score ?? null,
      existing.id
    );

    const updated = db.prepare('SELECT * FROM wearable_data WHERE id = ?').get(existing.id);
    res.json(updated);
  } else {
    // Insert new
    const id = genId();
    db.prepare(`
      INSERT INTO wearable_data (id, session_id, source, avg_heart_rate, max_heart_rate, min_heart_rate, calories_burned, heart_rate_zones, heart_rate_data, vo2_max, recovery_score)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, session_id, source || null,
      avg_heart_rate || null, max_heart_rate || null, min_heart_rate || null,
      calories_burned || null,
      heart_rate_zones ? JSON.stringify(heart_rate_zones) : null,
      heart_rate_data ? JSON.stringify(heart_rate_data) : null,
      vo2_max || null, recovery_score || null
    );

    const created = db.prepare('SELECT * FROM wearable_data WHERE id = ?').get(id);
    res.status(201).json(created);
  }
});

// GET /:session_id - get wearable data for a session
router.get('/:session_id', (req: Request, res: Response) => {
  const sessionId = req.params.session_id;

  const data = db.prepare('SELECT * FROM wearable_data WHERE session_id = ?').get(sessionId) as any;

  if (!data) {
    res.status(404).json({ error: 'No wearable data found for this session' });
    return;
  }

  // Parse JSON fields
  if (data.heart_rate_zones && typeof data.heart_rate_zones === 'string') {
    try { data.heart_rate_zones = JSON.parse(data.heart_rate_zones); } catch {}
  }
  if (data.heart_rate_data && typeof data.heart_rate_data === 'string') {
    try { data.heart_rate_data = JSON.parse(data.heart_rate_data); } catch {}
  }

  res.json(data);
});

export default router;
