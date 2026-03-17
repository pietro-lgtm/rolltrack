import { Router, Request, Response } from 'express';
import db from '../db.js';

const router = Router();

// GET / - paginated feed of friends' public sessions
router.get('/', (req: Request, res: Response) => {
  const userId = req.userId;
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
  const offset = parseInt(req.query.offset as string) || 0;

  const sessions = db.prepare(`
    SELECT
      ts.id,
      ts.user_id,
      ts.academy_id,
      ts.session_type,
      ts.gi_nogi,
      ts.started_at,
      ts.ended_at,
      ts.duration_secs,
      ts.class_time_secs,
      ts.sparring_time_secs,
      ts.drilling_time_secs,
      ts.notes,
      ts.photo_url,
      ts.feeling_rating,
      ts.intensity_rating,
      ts.is_public,
      ts.created_at,
      u.name AS user_name,
      u.avatar_url AS user_avatar_url,
      u.belt_rank AS user_belt_rank,
      u.stripes AS user_stripes,
      a.name AS academy_name,
      (SELECT COUNT(*) FROM likes WHERE target_type = 'session' AND target_id = ts.id) AS likes_count,
      (SELECT COUNT(*) FROM comments WHERE target_type = 'session' AND target_id = ts.id) AS comments_count,
      (SELECT COUNT(*) FROM likes WHERE target_type = 'session' AND target_id = ts.id AND user_id = ?) AS liked_by_me
    FROM training_sessions ts
    JOIN users u ON u.id = ts.user_id
    LEFT JOIN academies a ON a.id = ts.academy_id
    WHERE ts.shared_to_feed = 1
      AND ts.is_public = 1
      AND (
        ts.user_id = ?
        OR ts.user_id IN (
          SELECT CASE
            WHEN requester_id = ? THEN addressee_id
            ELSE requester_id
          END
          FROM friendships
          WHERE status = 'accepted'
            AND (requester_id = ? OR addressee_id = ?)
        )
      )
    ORDER BY ts.started_at DESC
    LIMIT ? OFFSET ?
  `).all(userId, userId, userId, userId, userId, limit, offset);

  const total = db.prepare(`
    SELECT COUNT(*) AS count
    FROM training_sessions ts
    WHERE ts.shared_to_feed = 1
      AND ts.is_public = 1
      AND (
        ts.user_id = ?
        OR ts.user_id IN (
          SELECT CASE
            WHEN requester_id = ? THEN addressee_id
            ELSE requester_id
          END
          FROM friendships
          WHERE status = 'accepted'
            AND (requester_id = ? OR addressee_id = ?)
        )
      )
  `).get(userId, userId, userId, userId) as { count: number };

  res.json({ data: sessions, total: total.count, limit, offset });
});

export default router;
