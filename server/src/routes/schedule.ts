import { Router, Request, Response } from 'express';
import db from '../db.js';
import { genId } from '../helpers.js';

const router = Router();

// GET / - list user's weekly schedule
router.get('/', (req: Request, res: Response) => {
  const userId = req.userId;

  const entries = db.prepare(`
    SELECT ws.*, a.name AS academy_name
    FROM weekly_schedule ws
    LEFT JOIN academies a ON a.id = ws.academy_id
    WHERE ws.user_id = ?
    ORDER BY ws.day_of_week ASC, ws.start_time ASC
  `).all(userId);

  res.json({ data: entries });
});

// POST / - create schedule entry
router.post('/', (req: Request, res: Response) => {
  const userId = req.userId;
  const { day_of_week, academy_id, session_type, start_time, end_time, gi_nogi, notes, is_active } = req.body;

  if (day_of_week === undefined || !start_time) {
    res.status(400).json({ error: 'day_of_week and start_time are required' });
    return;
  }

  const id = genId();

  try {
    db.prepare(`
      INSERT INTO weekly_schedule (id, user_id, day_of_week, academy_id, session_type, start_time, end_time, gi_nogi, notes, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, userId, day_of_week, academy_id || null, session_type || null,
      start_time, end_time || null, gi_nogi || 'gi', notes || null,
      is_active !== undefined ? (is_active ? 1 : 0) : 1
    );
  } catch (err: any) {
    if (err.message.includes('UNIQUE')) {
      res.status(400).json({ error: 'Schedule entry already exists for this day and time' });
      return;
    }
    throw err;
  }

  const entry = db.prepare(`
    SELECT ws.*, a.name AS academy_name
    FROM weekly_schedule ws
    LEFT JOIN academies a ON a.id = ws.academy_id
    WHERE ws.id = ?
  `).get(id);

  res.status(201).json(entry);
});

// PUT /:id - update schedule entry
router.put('/:id', (req: Request, res: Response) => {
  const userId = req.userId;
  const entryId = req.params.id;

  const existing = db.prepare('SELECT * FROM weekly_schedule WHERE id = ? AND user_id = ?').get(entryId, userId);
  if (!existing) {
    res.status(404).json({ error: 'Schedule entry not found' });
    return;
  }

  const { day_of_week, academy_id, session_type, start_time, end_time, gi_nogi, notes, is_active } = req.body;

  db.prepare(`
    UPDATE weekly_schedule SET
      day_of_week = COALESCE(?, day_of_week),
      academy_id = COALESCE(?, academy_id),
      session_type = COALESCE(?, session_type),
      start_time = COALESCE(?, start_time),
      end_time = COALESCE(?, end_time),
      gi_nogi = COALESCE(?, gi_nogi),
      notes = COALESCE(?, notes),
      is_active = COALESCE(?, is_active)
    WHERE id = ? AND user_id = ?
  `).run(
    day_of_week ?? null, academy_id ?? null, session_type ?? null,
    start_time ?? null, end_time ?? null, gi_nogi ?? null, notes ?? null,
    is_active !== undefined ? (is_active ? 1 : 0) : null,
    entryId, userId
  );

  const updated = db.prepare(`
    SELECT ws.*, a.name AS academy_name
    FROM weekly_schedule ws
    LEFT JOIN academies a ON a.id = ws.academy_id
    WHERE ws.id = ?
  `).get(entryId);

  res.json(updated);
});

// DELETE /:id - delete schedule entry
router.delete('/:id', (req: Request, res: Response) => {
  const userId = req.userId;
  const result = db.prepare('DELETE FROM weekly_schedule WHERE id = ? AND user_id = ?').run(req.params.id, userId);

  if (result.changes === 0) {
    res.status(404).json({ error: 'Schedule entry not found' });
    return;
  }

  res.json({ success: true });
});

export default router;
