import { Router, Request, Response } from 'express';
import db from '../db.js';
import { genId, nowISO } from '../helpers.js';
import { nanoid } from 'nanoid';

const router = Router();

// GET / - user's groups or discover
router.get('/', (req: Request, res: Response) => {
  const userId = req.userId;
  const tab = req.query.tab as string || 'my';
  const groupType = req.query.type as string;
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
  const offset = parseInt(req.query.offset as string) || 0;

  let query: string;
  let countQuery: string;
  const params: any[] = [];
  const countParams: any[] = [];

  if (tab === 'discover') {
    let where = `WHERE g.id NOT IN (SELECT group_id FROM group_members WHERE user_id = ?) AND g.is_private = 0`;
    params.push(userId);
    countParams.push(userId);

    if (groupType) {
      where += ' AND g.group_type = ?';
      params.push(groupType);
      countParams.push(groupType);
    }

    query = `
      SELECT g.*,
        (SELECT COUNT(*) FROM group_members WHERE group_id = g.id) AS member_count,
        u.name AS created_by_name
      FROM groups g
      LEFT JOIN users u ON u.id = g.created_by
      ${where}
      ORDER BY g.created_at DESC
      LIMIT ? OFFSET ?
    `;
    countQuery = `SELECT COUNT(*) AS count FROM groups g ${where}`;
  } else {
    let where = `WHERE gm.user_id = ?`;
    params.push(userId);
    countParams.push(userId);

    if (groupType) {
      where += ' AND g.group_type = ?';
      params.push(groupType);
      countParams.push(groupType);
    }

    query = `
      SELECT g.*,
        gm.role AS my_role,
        (SELECT COUNT(*) FROM group_members WHERE group_id = g.id) AS member_count,
        u.name AS created_by_name
      FROM groups g
      JOIN group_members gm ON gm.group_id = g.id
      LEFT JOIN users u ON u.id = g.created_by
      ${where}
      ORDER BY g.name ASC
      LIMIT ? OFFSET ?
    `;
    countQuery = `
      SELECT COUNT(*) AS count FROM groups g
      JOIN group_members gm ON gm.group_id = g.id
      ${where}
    `;
  }

  const groups = db.prepare(query).all(...params, limit, offset);
  const total = db.prepare(countQuery).get(...countParams) as { count: number };

  res.json({ data: groups, total: total.count, limit, offset });
});

// GET /:id - group detail with member count, upcoming events
router.get('/:id', (req: Request, res: Response) => {
  const userId = req.userId;
  const groupId = req.params.id;

  const group = db.prepare(`
    SELECT g.*,
      (SELECT COUNT(*) FROM group_members WHERE group_id = g.id) AS member_count,
      u.name AS created_by_name
    FROM groups g
    LEFT JOIN users u ON u.id = g.created_by
    WHERE g.id = ?
  `).get(groupId) as any;

  if (!group) {
    res.status(404).json({ error: 'Group not found' });
    return;
  }

  const membership = db.prepare(`
    SELECT role FROM group_members WHERE group_id = ? AND user_id = ?
  `).get(groupId, userId) as { role: string } | undefined;

  const members = db.prepare(`
    SELECT gm.role, gm.joined_at, u.id, u.name, u.avatar_url, u.belt_rank, u.stripes
    FROM group_members gm
    JOIN users u ON u.id = gm.user_id
    WHERE gm.group_id = ?
    ORDER BY
      CASE gm.role WHEN 'owner' THEN 0 WHEN 'admin' THEN 1 ELSE 2 END,
      gm.joined_at ASC
  `).all(groupId);

  const upcomingEvents = db.prepare(`
    SELECT ge.*,
      u.name AS created_by_name,
      (SELECT COUNT(*) FROM group_event_rsvps WHERE event_id = ge.id AND status = 'going') AS going_count
    FROM group_events ge
    LEFT JOIN users u ON u.id = ge.created_by
    WHERE ge.group_id = ? AND ge.starts_at >= datetime('now')
    ORDER BY ge.starts_at ASC
    LIMIT 5
  `).all(groupId);

  res.json({
    ...group,
    my_role: membership?.role || null,
    is_member: !!membership,
    members,
    upcoming_events: upcomingEvents,
  });
});

// POST / - create group, auto-add creator as owner
router.post('/', (req: Request, res: Response) => {
  const userId = req.userId;
  const { name, description, group_type, avatar_url, banner_url, academy_id, is_private } = req.body;

  if (!name) {
    res.status(400).json({ error: 'Name is required' });
    return;
  }

  const groupId = genId();
  const inviteCode = nanoid(8).toUpperCase();

  const create = db.transaction(() => {
    db.prepare(`
      INSERT INTO groups (id, name, description, group_type, avatar_url, banner_url, academy_id, is_private, invite_code, created_by, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      groupId, name, description || null, group_type || 'friend',
      avatar_url || null, banner_url || null, academy_id || null,
      is_private ? 1 : 0, inviteCode, userId, nowISO()
    );

    db.prepare(`
      INSERT INTO group_members (id, group_id, user_id, role, joined_at)
      VALUES (?, ?, ?, 'owner', ?)
    `).run(genId(), groupId, userId, nowISO());
  });

  create();

  const group = db.prepare('SELECT * FROM groups WHERE id = ?').get(groupId);
  res.status(201).json(group);
});

// PUT /:id - update group (admin/owner only)
router.put('/:id', (req: Request, res: Response) => {
  const userId = req.userId;
  const groupId = req.params.id;

  const membership = db.prepare(`
    SELECT role FROM group_members WHERE group_id = ? AND user_id = ?
  `).get(groupId, userId) as { role: string } | undefined;

  if (!membership || (membership.role !== 'owner' && membership.role !== 'admin')) {
    res.status(403).json({ error: 'Only owners and admins can update the group' });
    return;
  }

  const { name, description, group_type, avatar_url, banner_url, is_private } = req.body;

  db.prepare(`
    UPDATE groups SET
      name = COALESCE(?, name),
      description = COALESCE(?, description),
      group_type = COALESCE(?, group_type),
      avatar_url = COALESCE(?, avatar_url),
      banner_url = COALESCE(?, banner_url),
      is_private = COALESCE(?, is_private)
    WHERE id = ?
  `).run(
    name ?? null, description ?? null, group_type ?? null,
    avatar_url ?? null, banner_url ?? null,
    is_private !== undefined ? (is_private ? 1 : 0) : null,
    groupId
  );

  const updated = db.prepare('SELECT * FROM groups WHERE id = ?').get(groupId);
  res.json(updated);
});

// POST /:id/join - join group
router.post('/:id/join', (req: Request, res: Response) => {
  const userId = req.userId;
  const groupId = req.params.id;
  const { invite_code } = req.body;

  const group = db.prepare('SELECT * FROM groups WHERE id = ?').get(groupId) as any;
  if (!group) {
    res.status(404).json({ error: 'Group not found' });
    return;
  }

  if (group.is_private && invite_code !== group.invite_code) {
    res.status(403).json({ error: 'Invalid invite code for private group' });
    return;
  }

  const existing = db.prepare('SELECT id FROM group_members WHERE group_id = ? AND user_id = ?').get(groupId, userId);
  if (existing) {
    res.status(400).json({ error: 'Already a member' });
    return;
  }

  db.prepare(`
    INSERT INTO group_members (id, group_id, user_id, role, joined_at)
    VALUES (?, ?, ?, 'member', ?)
  `).run(genId(), groupId, userId, nowISO());

  res.json({ success: true });
});

// POST /:id/leave - leave group
router.post('/:id/leave', (req: Request, res: Response) => {
  const userId = req.userId;
  const groupId = req.params.id;

  const membership = db.prepare(`
    SELECT role FROM group_members WHERE group_id = ? AND user_id = ?
  `).get(groupId, userId) as { role: string } | undefined;

  if (!membership) {
    res.status(400).json({ error: 'Not a member' });
    return;
  }

  if (membership.role === 'owner') {
    res.status(400).json({ error: 'Owners cannot leave. Transfer ownership first.' });
    return;
  }

  db.prepare('DELETE FROM group_members WHERE group_id = ? AND user_id = ?').run(groupId, userId);
  res.json({ success: true });
});

// GET /:id/invite-code - get invite code
router.get('/:id/invite-code', (req: Request, res: Response) => {
  const userId = req.userId;
  const groupId = req.params.id;

  const membership = db.prepare(`
    SELECT role FROM group_members WHERE group_id = ? AND user_id = ?
  `).get(groupId, userId) as { role: string } | undefined;

  if (!membership || (membership.role !== 'owner' && membership.role !== 'admin')) {
    res.status(403).json({ error: 'Only owners and admins can view the invite code' });
    return;
  }

  const group = db.prepare('SELECT invite_code FROM groups WHERE id = ?').get(groupId) as { invite_code: string };
  res.json({ invite_code: group.invite_code });
});

export default router;
