import { Router, Request, Response } from 'express';
import db from '../db.js';
import { genId, nowISO } from '../helpers.js';

const router = Router();

// GET / - list events (optionally by group_id)
router.get('/', (req: Request, res: Response) => {
  const { group_id, upcoming } = req.query;
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
  const offset = parseInt(req.query.offset as string) || 0;

  let where = 'WHERE 1=1';
  const params: any[] = [];

  if (group_id) {
    where += ' AND ge.group_id = ?';
    params.push(group_id);
  }
  if (upcoming === '1' || upcoming === 'true') {
    where += " AND ge.starts_at >= datetime('now')";
  }

  const events = db.prepare(`
    SELECT ge.*,
      g.name AS group_name,
      u.name AS created_by_name,
      a.name AS academy_name,
      (SELECT COUNT(*) FROM group_event_rsvps WHERE event_id = ge.id AND status = 'going') AS going_count,
      (SELECT COUNT(*) FROM group_event_rsvps WHERE event_id = ge.id AND status = 'maybe') AS maybe_count
    FROM group_events ge
    JOIN groups g ON g.id = ge.group_id
    LEFT JOIN users u ON u.id = ge.created_by
    LEFT JOIN academies a ON a.id = ge.academy_id
    ${where}
    ORDER BY ge.starts_at ASC
    LIMIT ? OFFSET ?
  `).all(...params, limit, offset);

  const total = db.prepare(`
    SELECT COUNT(*) AS count FROM group_events ge ${where}
  `).get(...params) as { count: number };

  res.json({ data: events, total: total.count, limit, offset });
});

// GET /:id - event detail with RSVPs
router.get('/:id', (req: Request, res: Response) => {
  const userId = req.userId;
  const eventId = req.params.id;

  const event = db.prepare(`
    SELECT ge.*,
      g.name AS group_name,
      u.name AS created_by_name,
      a.name AS academy_name
    FROM group_events ge
    JOIN groups g ON g.id = ge.group_id
    LEFT JOIN users u ON u.id = ge.created_by
    LEFT JOIN academies a ON a.id = ge.academy_id
    WHERE ge.id = ?
  `).get(eventId) as any;

  if (!event) {
    res.status(404).json({ error: 'Event not found' });
    return;
  }

  const rsvps = db.prepare(`
    SELECT r.status, u.id, u.name, u.avatar_url, u.belt_rank
    FROM group_event_rsvps r
    JOIN users u ON u.id = r.user_id
    WHERE r.event_id = ?
    ORDER BY
      CASE r.status WHEN 'going' THEN 0 WHEN 'maybe' THEN 1 ELSE 2 END,
      u.name ASC
  `).all(eventId);

  const myRsvp = db.prepare(`
    SELECT status FROM group_event_rsvps WHERE event_id = ? AND user_id = ?
  `).get(eventId, userId) as { status: string } | undefined;

  res.json({
    ...event,
    rsvps,
    my_rsvp: myRsvp?.status || null,
  });
});

// POST / - create event
router.post('/', (req: Request, res: Response) => {
  const userId = req.userId;
  const { group_id, title, description, event_type, location, academy_id, starts_at, ends_at } = req.body;

  if (!group_id || !title || !starts_at) {
    res.status(400).json({ error: 'group_id, title, and starts_at are required' });
    return;
  }

  // Verify user is a member of the group
  const membership = db.prepare(`
    SELECT role FROM group_members WHERE group_id = ? AND user_id = ?
  `).get(group_id, userId);

  if (!membership) {
    res.status(403).json({ error: 'Must be a group member to create events' });
    return;
  }

  const id = genId();
  db.prepare(`
    INSERT INTO group_events (id, group_id, title, description, event_type, location, academy_id, starts_at, ends_at, created_by, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, group_id, title, description || null, event_type || 'training', location || null, academy_id || null, starts_at, ends_at || null, userId, nowISO());

  const event = db.prepare('SELECT * FROM group_events WHERE id = ?').get(id);
  res.status(201).json(event);
});

// PUT /:id - update event
router.put('/:id', (req: Request, res: Response) => {
  const userId = req.userId;
  const eventId = req.params.id;

  const event = db.prepare('SELECT * FROM group_events WHERE id = ?').get(eventId) as any;
  if (!event) {
    res.status(404).json({ error: 'Event not found' });
    return;
  }

  // Only creator or group admin/owner can update
  const membership = db.prepare(`
    SELECT role FROM group_members WHERE group_id = ? AND user_id = ?
  `).get(event.group_id, userId) as { role: string } | undefined;

  if (event.created_by !== userId && (!membership || membership.role === 'member')) {
    res.status(403).json({ error: 'Not authorized to update this event' });
    return;
  }

  const { title, description, event_type, location, academy_id, starts_at, ends_at } = req.body;

  db.prepare(`
    UPDATE group_events SET
      title = COALESCE(?, title),
      description = COALESCE(?, description),
      event_type = COALESCE(?, event_type),
      location = COALESCE(?, location),
      academy_id = COALESCE(?, academy_id),
      starts_at = COALESCE(?, starts_at),
      ends_at = COALESCE(?, ends_at)
    WHERE id = ?
  `).run(title ?? null, description ?? null, event_type ?? null, location ?? null, academy_id ?? null, starts_at ?? null, ends_at ?? null, eventId);

  const updated = db.prepare('SELECT * FROM group_events WHERE id = ?').get(eventId);
  res.json(updated);
});

// DELETE /:id - delete event
router.delete('/:id', (req: Request, res: Response) => {
  const userId = req.userId;
  const eventId = req.params.id;

  const event = db.prepare('SELECT * FROM group_events WHERE id = ?').get(eventId) as any;
  if (!event) {
    res.status(404).json({ error: 'Event not found' });
    return;
  }

  const membership = db.prepare(`
    SELECT role FROM group_members WHERE group_id = ? AND user_id = ?
  `).get(event.group_id, userId) as { role: string } | undefined;

  if (event.created_by !== userId && (!membership || membership.role === 'member')) {
    res.status(403).json({ error: 'Not authorized to delete this event' });
    return;
  }

  db.prepare('DELETE FROM group_events WHERE id = ?').run(eventId);
  res.json({ success: true });
});

// POST /:id/rsvp - RSVP to event
router.post('/:id/rsvp', (req: Request, res: Response) => {
  const userId = req.userId;
  const eventId = req.params.id;
  const { status } = req.body;

  if (!status || !['going', 'maybe', 'not_going'].includes(status)) {
    res.status(400).json({ error: 'status must be going, maybe, or not_going' });
    return;
  }

  const event = db.prepare('SELECT group_id FROM group_events WHERE id = ?').get(eventId) as any;
  if (!event) {
    res.status(404).json({ error: 'Event not found' });
    return;
  }

  // Verify membership
  const membership = db.prepare(`
    SELECT id FROM group_members WHERE group_id = ? AND user_id = ?
  `).get(event.group_id, userId);

  if (!membership) {
    res.status(403).json({ error: 'Must be a group member to RSVP' });
    return;
  }

  const existing = db.prepare('SELECT id FROM group_event_rsvps WHERE event_id = ? AND user_id = ?').get(eventId, userId) as any;

  if (existing) {
    db.prepare('UPDATE group_event_rsvps SET status = ? WHERE id = ?').run(status, existing.id);
  } else {
    db.prepare(`
      INSERT INTO group_event_rsvps (id, event_id, user_id, status)
      VALUES (?, ?, ?, ?)
    `).run(genId(), eventId, userId, status);
  }

  res.json({ success: true, status });
});

export default router;
