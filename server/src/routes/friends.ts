import { Router, Request, Response } from 'express';
import db from '../db.js';
import { genId, nowISO } from '../helpers.js';

const router = Router();

// GET / - list accepted friends
router.get('/', (req: Request, res: Response) => {
  const userId = req.userId;

  const friends = db.prepare(`
    SELECT
      f.id AS friendship_id,
      f.created_at AS friends_since,
      u.id, u.name, u.avatar_url, u.belt_rank, u.stripes, u.bio,
      a.name AS home_academy_name,
      (SELECT MAX(started_at) FROM training_sessions WHERE user_id = u.id) AS last_trained
    FROM friendships f
    JOIN users u ON u.id = CASE WHEN f.requester_id = ? THEN f.addressee_id ELSE f.requester_id END
    LEFT JOIN academies a ON a.id = u.home_academy_id
    WHERE f.status = 'accepted'
      AND (f.requester_id = ? OR f.addressee_id = ?)
    ORDER BY u.name ASC
  `).all(userId, userId, userId);

  res.json({ data: friends });
});

// GET /requests - pending incoming requests
router.get('/requests', (req: Request, res: Response) => {
  const userId = req.userId;

  const requests = db.prepare(`
    SELECT
      f.id AS friendship_id,
      f.created_at AS requested_at,
      u.id, u.name, u.avatar_url, u.belt_rank, u.stripes, u.bio,
      a.name AS home_academy_name
    FROM friendships f
    JOIN users u ON u.id = f.requester_id
    LEFT JOIN academies a ON a.id = u.home_academy_id
    WHERE f.addressee_id = ? AND f.status = 'pending'
    ORDER BY f.created_at DESC
  `).all(userId);

  res.json({ data: requests });
});

// POST /request - send friend request
router.post('/request', (req: Request, res: Response) => {
  const userId = req.userId;
  const { user_id: targetId } = req.body;

  if (!targetId) {
    res.status(400).json({ error: 'user_id is required' });
    return;
  }

  if (targetId === userId) {
    res.status(400).json({ error: 'Cannot send friend request to yourself' });
    return;
  }

  const targetUser = db.prepare('SELECT id FROM users WHERE id = ?').get(targetId);
  if (!targetUser) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  // Check existing friendship in either direction
  const existing = db.prepare(`
    SELECT id, status FROM friendships
    WHERE (requester_id = ? AND addressee_id = ?) OR (requester_id = ? AND addressee_id = ?)
  `).get(userId, targetId, targetId, userId) as any;

  if (existing) {
    if (existing.status === 'accepted') {
      res.status(400).json({ error: 'Already friends' });
      return;
    }
    if (existing.status === 'pending') {
      res.status(400).json({ error: 'Friend request already pending' });
      return;
    }
    if (existing.status === 'blocked') {
      res.status(400).json({ error: 'Cannot send request' });
      return;
    }
  }

  const id = genId();
  db.prepare(`
    INSERT INTO friendships (id, requester_id, addressee_id, status, created_at)
    VALUES (?, ?, ?, 'pending', ?)
  `).run(id, userId, targetId, nowISO());

  res.status(201).json({ id, status: 'pending' });
});

// POST /:id/accept - accept friend request
router.post('/:id/accept', (req: Request, res: Response) => {
  const userId = req.userId;
  const friendshipId = req.params.id;

  const friendship = db.prepare(`
    SELECT * FROM friendships WHERE id = ? AND addressee_id = ? AND status = 'pending'
  `).get(friendshipId, userId) as any;

  if (!friendship) {
    res.status(404).json({ error: 'Pending friend request not found' });
    return;
  }

  db.prepare("UPDATE friendships SET status = 'accepted' WHERE id = ?").run(friendshipId);

  res.json({ success: true, status: 'accepted' });
});

// DELETE /:id - remove friendship
router.delete('/:id', (req: Request, res: Response) => {
  const userId = req.userId;
  const friendshipId = req.params.id;

  const result = db.prepare(`
    DELETE FROM friendships
    WHERE id = ? AND (requester_id = ? OR addressee_id = ?)
  `).run(friendshipId, userId, userId);

  if (result.changes === 0) {
    res.status(404).json({ error: 'Friendship not found' });
    return;
  }

  res.json({ success: true });
});

export default router;
