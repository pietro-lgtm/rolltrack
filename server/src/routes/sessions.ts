import { Router, Request, Response } from 'express';
import db from '../db.js';
import { genId, nowISO } from '../helpers.js';

const router = Router();

// GET / - list user sessions with filters
router.get('/', (req: Request, res: Response) => {
  const userId = req.userId;
  const { type, gi_nogi, from, to } = req.query;
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
  const offset = parseInt(req.query.offset as string) || 0;

  let where = 'WHERE ts.user_id = ?';
  const params: any[] = [userId];

  if (type) {
    where += ' AND ts.session_type = ?';
    params.push(type);
  }
  if (gi_nogi) {
    where += ' AND ts.gi_nogi = ?';
    params.push(gi_nogi);
  }
  if (from) {
    where += ' AND ts.started_at >= ?';
    params.push(from);
  }
  if (to) {
    where += ' AND ts.started_at <= ?';
    params.push(to);
  }

  const sessions = db.prepare(`
    SELECT
      ts.*,
      a.name AS academy_name,
      (SELECT COUNT(*) FROM rolls WHERE session_id = ts.id) AS rolls_count,
      (SELECT COUNT(*) FROM techniques WHERE session_id = ts.id) AS techniques_count,
      (SELECT COUNT(*) FROM likes WHERE target_type = 'session' AND target_id = ts.id) AS likes_count,
      (SELECT COUNT(*) FROM comments WHERE target_type = 'session' AND target_id = ts.id) AS comments_count
    FROM training_sessions ts
    LEFT JOIN academies a ON a.id = ts.academy_id
    ${where}
    ORDER BY ts.started_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, limit, offset);

  const total = db.prepare(`
    SELECT COUNT(*) AS count FROM training_sessions ts ${where}
  `).get(...params) as { count: number };

  res.json({ data: sessions, total: total.count, limit, offset });
});

// GET /stats - aggregated stats
router.get('/stats', (req: Request, res: Response) => {
  const userId = req.userId;

  const stats = db.prepare(`
    SELECT
      COUNT(*) AS total_sessions,
      COALESCE(SUM(duration_secs), 0) AS total_time_secs,
      COALESCE(AVG(duration_secs), 0) AS avg_duration_secs,
      COALESCE(AVG(feeling_rating), 0) AS avg_feeling,
      COALESCE(AVG(intensity_rating), 0) AS avg_intensity,
      COALESCE(SUM(sparring_time_secs), 0) AS total_sparring_secs,
      COALESCE(SUM(drilling_time_secs), 0) AS total_drilling_secs,
      COALESCE(SUM(class_time_secs), 0) AS total_class_secs,
      MIN(started_at) AS first_session,
      MAX(started_at) AS last_session
    FROM training_sessions
    WHERE user_id = ?
  `).get(userId) as any;

  // Calculate current streak (consecutive days with sessions)
  const sessionDates = db.prepare(`
    SELECT DISTINCT date(started_at) AS d
    FROM training_sessions
    WHERE user_id = ?
    ORDER BY d DESC
  `).all(userId) as { d: string }[];

  let streak = 0;
  if (sessionDates.length > 0) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let checkDate = today;

    for (const row of sessionDates) {
      const sessionDate = new Date(row.d);
      sessionDate.setHours(0, 0, 0, 0);
      const diffDays = Math.round((checkDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays <= 1) {
        streak++;
        checkDate = sessionDate;
      } else {
        break;
      }
    }
  }

  // Sessions this week and month
  const thisWeek = db.prepare(`
    SELECT COUNT(*) AS count FROM training_sessions
    WHERE user_id = ? AND started_at >= date('now', '-7 days')
  `).get(userId) as { count: number };

  const thisMonth = db.prepare(`
    SELECT COUNT(*) AS count FROM training_sessions
    WHERE user_id = ? AND started_at >= date('now', 'start of month')
  `).get(userId) as { count: number };

  // Rolls stats
  const rollStats = db.prepare(`
    SELECT
      COUNT(*) AS total_rolls,
      SUM(CASE WHEN result IN ('submission_win', 'points_win') THEN 1 ELSE 0 END) AS wins,
      SUM(CASE WHEN result IN ('submission_loss', 'points_loss') THEN 1 ELSE 0 END) AS losses,
      SUM(CASE WHEN result = 'draw' THEN 1 ELSE 0 END) AS draws
    FROM rolls r
    JOIN training_sessions ts ON ts.id = r.session_id
    WHERE ts.user_id = ?
  `).get(userId);

  res.json({
    ...stats,
    streak,
    sessions_this_week: thisWeek.count,
    sessions_this_month: thisMonth.count,
    rolls: rollStats,
  });
});

// GET /:id - single session with rolls, techniques, wearable data
router.get('/:id', (req: Request, res: Response) => {
  const session = db.prepare(`
    SELECT ts.*, a.name AS academy_name
    FROM training_sessions ts
    LEFT JOIN academies a ON a.id = ts.academy_id
    WHERE ts.id = ?
  `).get(req.params.id) as any;

  if (!session) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }

  const rolls = db.prepare(`
    SELECT r.*, u.name AS partner_user_name, u.belt_rank AS partner_user_belt
    FROM rolls r
    LEFT JOIN users u ON u.id = r.partner_user_id
    WHERE r.session_id = ?
    ORDER BY r.round_number ASC
  `).all(req.params.id);

  const techniques = db.prepare(`
    SELECT * FROM techniques WHERE session_id = ? ORDER BY success_count DESC
  `).all(req.params.id);

  const wearable = db.prepare(`
    SELECT * FROM wearable_data WHERE session_id = ?
  `).get(req.params.id);

  const likes_count = (db.prepare(`
    SELECT COUNT(*) AS count FROM likes WHERE target_type = 'session' AND target_id = ?
  `).get(req.params.id) as { count: number }).count;

  const comments = db.prepare(`
    SELECT c.*, u.name AS user_name, u.avatar_url AS user_avatar_url, u.belt_rank AS user_belt_rank
    FROM comments c
    JOIN users u ON u.id = c.user_id
    WHERE c.target_type = 'session' AND c.target_id = ?
    ORDER BY c.created_at ASC
  `).all(req.params.id);

  const liked_by_me = (db.prepare(`
    SELECT COUNT(*) AS count FROM likes
    WHERE target_type = 'session' AND target_id = ? AND user_id = ?
  `).get(req.params.id, req.userId) as { count: number }).count;

  res.json({
    ...session,
    rolls,
    techniques,
    wearable: wearable || null,
    likes_count,
    liked_by_me: liked_by_me > 0,
    comments,
  });
});

// POST / - create session with nested rolls[], techniques[], wearable{}
router.post('/', (req: Request, res: Response) => {
  const userId = req.userId;
  const {
    academy_id, session_type, gi_nogi, started_at, ended_at,
    duration_secs, class_time_secs, sparring_time_secs, drilling_time_secs,
    notes, photo_url, feeling_rating, intensity_rating,
    weather_temp_f, weather_condition, weather_humidity,
    is_public, shared_to_feed,
    rolls, techniques, wearable,
  } = req.body;

  const sessionId = genId();
  const now = nowISO();

  const insertSession = db.transaction(() => {
    db.prepare(`
      INSERT INTO training_sessions (id, user_id, academy_id, session_type, gi_nogi, started_at, ended_at, duration_secs, class_time_secs, sparring_time_secs, drilling_time_secs, notes, photo_url, feeling_rating, intensity_rating, weather_temp_f, weather_condition, weather_humidity, is_public, shared_to_feed, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      sessionId, userId, academy_id || null, session_type || 'class', gi_nogi || 'gi',
      started_at || now, ended_at || null, duration_secs || null,
      class_time_secs || null, sparring_time_secs || null, drilling_time_secs || null,
      notes || null, photo_url || null, feeling_rating || null, intensity_rating || null,
      weather_temp_f || null, weather_condition || null, weather_humidity || null,
      is_public !== undefined ? (is_public ? 1 : 0) : 1,
      shared_to_feed !== undefined ? (shared_to_feed ? 1 : 0) : 1,
      now
    );

    if (rolls && Array.isArray(rolls)) {
      const insertRoll = db.prepare(`
        INSERT INTO rolls (id, session_id, partner_user_id, partner_name, partner_belt, duration_secs, result, submission_type, notes, round_number)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (let i = 0; i < rolls.length; i++) {
        const r = rolls[i];
        insertRoll.run(
          genId(), sessionId, r.partner_user_id || null, r.partner_name || null,
          r.partner_belt || null, r.duration_secs || null, r.result || null,
          r.submission_type || null, r.notes || null, r.round_number || (i + 1)
        );
      }
    }

    if (techniques && Array.isArray(techniques)) {
      const insertTech = db.prepare(`
        INSERT INTO techniques (id, session_id, name, category, position, success_count, attempt_count, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const t of techniques) {
        insertTech.run(
          genId(), sessionId, t.name, t.category || null, t.position || null,
          t.success_count || 0, t.attempt_count || 0, t.notes || null
        );
      }
    }

    if (wearable && typeof wearable === 'object') {
      db.prepare(`
        INSERT INTO wearable_data (id, session_id, source, avg_heart_rate, max_heart_rate, min_heart_rate, calories_burned, heart_rate_zones, heart_rate_data, vo2_max, recovery_score)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        genId(), sessionId, wearable.source || null,
        wearable.avg_heart_rate || null, wearable.max_heart_rate || null,
        wearable.min_heart_rate || null, wearable.calories_burned || null,
        wearable.heart_rate_zones ? JSON.stringify(wearable.heart_rate_zones) : null,
        wearable.heart_rate_data ? JSON.stringify(wearable.heart_rate_data) : null,
        wearable.vo2_max || null, wearable.recovery_score || null
      );
    }
  });

  insertSession();

  const created = db.prepare(`
    SELECT ts.*, a.name AS academy_name
    FROM training_sessions ts
    LEFT JOIN academies a ON a.id = ts.academy_id
    WHERE ts.id = ?
  `).get(sessionId);

  res.status(201).json(created);
});

// PUT /:id - update session
router.put('/:id', (req: Request, res: Response) => {
  const userId = req.userId;
  const sessionId = req.params.id;

  const existing = db.prepare('SELECT * FROM training_sessions WHERE id = ? AND user_id = ?').get(sessionId, userId);
  if (!existing) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }

  const {
    academy_id, session_type, gi_nogi, started_at, ended_at,
    duration_secs, class_time_secs, sparring_time_secs, drilling_time_secs,
    notes, photo_url, feeling_rating, intensity_rating,
    weather_temp_f, weather_condition, weather_humidity,
    is_public, shared_to_feed,
  } = req.body;

  db.prepare(`
    UPDATE training_sessions SET
      academy_id = COALESCE(?, academy_id),
      session_type = COALESCE(?, session_type),
      gi_nogi = COALESCE(?, gi_nogi),
      started_at = COALESCE(?, started_at),
      ended_at = COALESCE(?, ended_at),
      duration_secs = COALESCE(?, duration_secs),
      class_time_secs = COALESCE(?, class_time_secs),
      sparring_time_secs = COALESCE(?, sparring_time_secs),
      drilling_time_secs = COALESCE(?, drilling_time_secs),
      notes = COALESCE(?, notes),
      photo_url = COALESCE(?, photo_url),
      feeling_rating = COALESCE(?, feeling_rating),
      intensity_rating = COALESCE(?, intensity_rating),
      weather_temp_f = COALESCE(?, weather_temp_f),
      weather_condition = COALESCE(?, weather_condition),
      weather_humidity = COALESCE(?, weather_humidity),
      is_public = COALESCE(?, is_public),
      shared_to_feed = COALESCE(?, shared_to_feed)
    WHERE id = ? AND user_id = ?
  `).run(
    academy_id ?? null, session_type ?? null, gi_nogi ?? null,
    started_at ?? null, ended_at ?? null,
    duration_secs ?? null, class_time_secs ?? null,
    sparring_time_secs ?? null, drilling_time_secs ?? null,
    notes ?? null, photo_url ?? null,
    feeling_rating ?? null, intensity_rating ?? null,
    weather_temp_f ?? null, weather_condition ?? null, weather_humidity ?? null,
    is_public !== undefined ? (is_public ? 1 : 0) : null,
    shared_to_feed !== undefined ? (shared_to_feed ? 1 : 0) : null,
    sessionId, userId
  );

  const updated = db.prepare('SELECT * FROM training_sessions WHERE id = ?').get(sessionId);
  res.json(updated);
});

// DELETE /:id - delete session (cascades rolls, techniques, wearable)
router.delete('/:id', (req: Request, res: Response) => {
  const userId = req.userId;
  const result = db.prepare('DELETE FROM training_sessions WHERE id = ? AND user_id = ?').run(req.params.id, userId);

  if (result.changes === 0) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }

  res.json({ success: true });
});

export default router;
