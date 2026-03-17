import { Router, Request, Response } from 'express';
import db from '../db.js';
import { nowISO } from '../helpers.js';

const router = Router();

// GET /me - current user
router.get('/me', (req: Request, res: Response) => {
  const user = db.prepare(`
    SELECT u.*, a.name AS home_academy_name
    FROM users u
    LEFT JOIN academies a ON a.id = u.home_academy_id
    WHERE u.id = ?
  `).get(req.userId);

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.json(user);
});

// PUT /me - update profile
router.put('/me', (req: Request, res: Response) => {
  const userId = req.userId;
  const { name, avatar_url, belt_rank, stripes, home_academy_id, bio, weight_kg, date_of_birth } = req.body;

  db.prepare(`
    UPDATE users SET
      name = COALESCE(?, name),
      avatar_url = COALESCE(?, avatar_url),
      belt_rank = COALESCE(?, belt_rank),
      stripes = COALESCE(?, stripes),
      home_academy_id = COALESCE(?, home_academy_id),
      bio = COALESCE(?, bio),
      weight_kg = COALESCE(?, weight_kg),
      date_of_birth = COALESCE(?, date_of_birth),
      updated_at = ?
    WHERE id = ?
  `).run(
    name ?? null, avatar_url ?? null, belt_rank ?? null, stripes ?? null,
    home_academy_id ?? null, bio ?? null, weight_kg ?? null, date_of_birth ?? null,
    nowISO(), userId
  );

  const user = db.prepare(`
    SELECT u.*, a.name AS home_academy_name
    FROM users u
    LEFT JOIN academies a ON a.id = u.home_academy_id
    WHERE u.id = ?
  `).get(userId);

  res.json(user);
});

// GET /:id - public profile
router.get('/:id', (req: Request, res: Response) => {
  const user = db.prepare(`
    SELECT u.id, u.name, u.avatar_url, u.belt_rank, u.stripes, u.home_academy_id, u.bio, u.created_at,
      a.name AS home_academy_name
    FROM users u
    LEFT JOIN academies a ON a.id = u.home_academy_id
    WHERE u.id = ?
  `).get(req.params.id);

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  // Check friendship status
  const friendship = db.prepare(`
    SELECT id, status,
      CASE WHEN requester_id = ? THEN 'sent' ELSE 'received' END AS direction
    FROM friendships
    WHERE (requester_id = ? AND addressee_id = ?) OR (requester_id = ? AND addressee_id = ?)
  `).get(req.userId, req.userId, req.params.id, req.params.id, req.userId) as any;

  res.json({
    ...user as any,
    friendship_status: friendship?.status || null,
    friendship_id: friendship?.id || null,
    friendship_direction: friendship?.direction || null,
  });
});

// GET /:id/stats - user stats
router.get('/:id/stats', (req: Request, res: Response) => {
  const targetId = req.params.id;

  const user = db.prepare('SELECT id FROM users WHERE id = ?').get(targetId);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const stats = db.prepare(`
    SELECT
      COUNT(*) AS total_sessions,
      COALESCE(SUM(duration_secs), 0) AS total_time_secs,
      COALESCE(AVG(feeling_rating), 0) AS avg_feeling,
      COALESCE(AVG(intensity_rating), 0) AS avg_intensity,
      COALESCE(SUM(sparring_time_secs), 0) AS total_sparring_secs
    FROM training_sessions
    WHERE user_id = ?
  `).get(targetId) as any;

  const rollStats = db.prepare(`
    SELECT
      COUNT(*) AS total_rolls,
      SUM(CASE WHEN result IN ('submission_win', 'points_win') THEN 1 ELSE 0 END) AS wins,
      SUM(CASE WHEN result IN ('submission_loss', 'points_loss') THEN 1 ELSE 0 END) AS losses
    FROM rolls r
    JOIN training_sessions ts ON ts.id = r.session_id
    WHERE ts.user_id = ?
  `).get(targetId);

  const topTechniques = db.prepare(`
    SELECT name, category, position,
      SUM(success_count) AS total_successes,
      SUM(attempt_count) AS total_attempts
    FROM techniques t
    JOIN training_sessions ts ON ts.id = t.session_id
    WHERE ts.user_id = ?
    GROUP BY name
    ORDER BY total_successes DESC
    LIMIT 5
  `).all(targetId);

  const sessionsThisMonth = db.prepare(`
    SELECT COUNT(*) AS count FROM training_sessions
    WHERE user_id = ? AND started_at >= date('now', 'start of month')
  `).get(targetId) as { count: number };

  res.json({
    ...stats,
    rolls: rollStats,
    top_techniques: topTechniques,
    sessions_this_month: sessionsThisMonth.count,
  });
});

export default router;
