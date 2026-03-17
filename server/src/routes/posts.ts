import { Router, Request, Response } from 'express';
import db from '../db.js';
import { genId, nowISO } from '../helpers.js';

const router = Router();

// GET / - group feed (requires group_id)
router.get('/', (req: Request, res: Response) => {
  const { group_id } = req.query;
  const userId = req.userId;
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
  const offset = parseInt(req.query.offset as string) || 0;

  if (!group_id) {
    res.status(400).json({ error: 'group_id is required' });
    return;
  }

  const posts = db.prepare(`
    SELECT gp.*,
      u.name AS user_name,
      u.avatar_url AS user_avatar_url,
      u.belt_rank AS user_belt_rank,
      u.stripes AS user_stripes,
      (SELECT COUNT(*) FROM likes WHERE target_type = 'group_post' AND target_id = gp.id) AS likes_count,
      (SELECT COUNT(*) FROM comments WHERE target_type = 'group_post' AND target_id = gp.id) AS comments_count,
      (SELECT COUNT(*) FROM likes WHERE target_type = 'group_post' AND target_id = gp.id AND user_id = ?) AS liked_by_me
    FROM group_posts gp
    JOIN users u ON u.id = gp.user_id
    WHERE gp.group_id = ?
    ORDER BY gp.created_at DESC
    LIMIT ? OFFSET ?
  `).all(userId, group_id, limit, offset);

  const total = db.prepare(`
    SELECT COUNT(*) AS count FROM group_posts WHERE group_id = ?
  `).get(group_id) as { count: number };

  res.json({ data: posts, total: total.count, limit, offset });
});

// POST / - create post
router.post('/', (req: Request, res: Response) => {
  const userId = req.userId;
  const { group_id, content, image_url, session_id } = req.body;

  if (!group_id || !content) {
    res.status(400).json({ error: 'group_id and content are required' });
    return;
  }

  // Verify membership
  const membership = db.prepare(`
    SELECT id FROM group_members WHERE group_id = ? AND user_id = ?
  `).get(group_id, userId);

  if (!membership) {
    res.status(403).json({ error: 'Must be a group member to post' });
    return;
  }

  const id = genId();
  db.prepare(`
    INSERT INTO group_posts (id, group_id, user_id, content, image_url, session_id, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, group_id, userId, content, image_url || null, session_id || null, nowISO());

  const post = db.prepare(`
    SELECT gp.*,
      u.name AS user_name,
      u.avatar_url AS user_avatar_url,
      u.belt_rank AS user_belt_rank
    FROM group_posts gp
    JOIN users u ON u.id = gp.user_id
    WHERE gp.id = ?
  `).get(id);

  res.status(201).json(post);
});

// DELETE /:id - delete own post
router.delete('/:id', (req: Request, res: Response) => {
  const userId = req.userId;
  const postId = req.params.id;

  const post = db.prepare('SELECT * FROM group_posts WHERE id = ?').get(postId) as any;
  if (!post) {
    res.status(404).json({ error: 'Post not found' });
    return;
  }

  // Allow delete if owner of post, or admin/owner of group
  if (post.user_id !== userId) {
    const membership = db.prepare(`
      SELECT role FROM group_members WHERE group_id = ? AND user_id = ?
    `).get(post.group_id, userId) as { role: string } | undefined;

    if (!membership || membership.role === 'member') {
      res.status(403).json({ error: 'Not authorized to delete this post' });
      return;
    }
  }

  // Delete associated likes and comments
  db.prepare("DELETE FROM likes WHERE target_type = 'group_post' AND target_id = ?").run(postId);
  db.prepare("DELETE FROM comments WHERE target_type = 'group_post' AND target_id = ?").run(postId);
  db.prepare('DELETE FROM group_posts WHERE id = ?').run(postId);

  res.json({ success: true });
});

// POST /:id/like - toggle like
router.post('/:id/like', (req: Request, res: Response) => {
  const userId = req.userId;
  const postId = req.params.id;

  const post = db.prepare('SELECT id FROM group_posts WHERE id = ?').get(postId);
  if (!post) {
    res.status(404).json({ error: 'Post not found' });
    return;
  }

  const existing = db.prepare(`
    SELECT id FROM likes WHERE user_id = ? AND target_type = 'group_post' AND target_id = ?
  `).get(userId, postId) as any;

  if (existing) {
    db.prepare('DELETE FROM likes WHERE id = ?').run(existing.id);
    res.json({ liked: false });
  } else {
    db.prepare(`
      INSERT INTO likes (id, user_id, target_type, target_id, created_at)
      VALUES (?, ?, 'group_post', ?, ?)
    `).run(genId(), userId, postId, nowISO());
    res.json({ liked: true });
  }
});

// GET /:id/comments - get comments for a post
router.get('/:id/comments', (req: Request, res: Response) => {
  const postId = req.params.id;

  const comments = db.prepare(`
    SELECT c.*,
      u.name AS user_name,
      u.avatar_url AS user_avatar_url,
      u.belt_rank AS user_belt_rank
    FROM comments c
    JOIN users u ON u.id = c.user_id
    WHERE c.target_type = 'group_post' AND c.target_id = ?
    ORDER BY c.created_at ASC
  `).all(postId);

  res.json({ data: comments });
});

// POST /:id/comments - add comment to post
router.post('/:id/comments', (req: Request, res: Response) => {
  const userId = req.userId;
  const postId = req.params.id;
  const { content } = req.body;

  if (!content) {
    res.status(400).json({ error: 'content is required' });
    return;
  }

  const post = db.prepare('SELECT id FROM group_posts WHERE id = ?').get(postId);
  if (!post) {
    res.status(404).json({ error: 'Post not found' });
    return;
  }

  const id = genId();
  db.prepare(`
    INSERT INTO comments (id, user_id, target_type, target_id, content, created_at)
    VALUES (?, ?, 'group_post', ?, ?, ?)
  `).run(id, userId, postId, content, nowISO());

  const comment = db.prepare(`
    SELECT c.*,
      u.name AS user_name,
      u.avatar_url AS user_avatar_url,
      u.belt_rank AS user_belt_rank
    FROM comments c
    JOIN users u ON u.id = c.user_id
    WHERE c.id = ?
  `).get(id);

  res.status(201).json(comment);
});

export default router;
