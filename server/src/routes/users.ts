import { Router, Request, Response } from 'express';
import db from '../db.js';
import { genId, nowISO } from '../helpers.js';

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

// GET /me/achievements - computed achievements for the current user
router.get('/me/achievements', (req: Request, res: Response) => {
  const userId = req.userId;

  // Training milestones
  const sessionStats = db.prepare(`
    SELECT
      COUNT(*) AS total_sessions,
      COALESCE(SUM(duration_secs), 0) AS total_time_secs,
      COALESCE(SUM(sparring_time_secs), 0) AS total_sparring_secs
    FROM training_sessions
    WHERE user_id = ?
  `).get(userId) as any;

  // Streak calculation
  const sessionDates = db.prepare(`
    SELECT DISTINCT date(started_at) AS d
    FROM training_sessions
    WHERE user_id = ?
    ORDER BY d DESC
  `).all(userId) as { d: string }[];

  let currentStreak = 0;
  let longestStreak = 0;
  if (sessionDates.length > 0) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let checkDate = today;
    let tempStreak = 0;

    for (const row of sessionDates) {
      const sessionDate = new Date(row.d);
      sessionDate.setHours(0, 0, 0, 0);
      const diffDays = Math.round((checkDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays <= 1) {
        tempStreak++;
        checkDate = sessionDate;
      } else {
        break;
      }
    }
    currentStreak = tempStreak;

    // Longest streak
    let streak = 1;
    for (let i = 1; i < sessionDates.length; i++) {
      const prev = new Date(sessionDates[i - 1].d);
      const curr = new Date(sessionDates[i].d);
      const diff = Math.round((prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24));
      if (diff === 1) {
        streak++;
      } else {
        if (streak > longestStreak) longestStreak = streak;
        streak = 1;
      }
    }
    if (streak > longestStreak) longestStreak = streak;
  }

  // Belt progression (from user data)
  const user = db.prepare('SELECT belt_rank, stripes, created_at FROM users WHERE id = ?').get(userId) as any;

  // Competition record
  const compRecord = db.prepare(`
    SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN result = 'gold' THEN 1 ELSE 0 END) AS wins,
      SUM(CASE WHEN result IN ('silver', 'bronze', 'did_not_place') THEN 1 ELSE 0 END) AS losses,
      SUM(CASE WHEN result IN ('silver', 'bronze') THEN 1 ELSE 0 END) AS podiums
    FROM competitions
    WHERE user_id = ?
  `).get(userId) as any;

  // Build milestones
  const milestones: any[] = [];
  const totalSessions = sessionStats.total_sessions;
  const totalHours = Math.floor(sessionStats.total_time_secs / 3600);
  const sparringHours = Math.floor(sessionStats.total_sparring_secs / 3600);

  const sessionMilestones = [10, 25, 50, 100, 250, 500, 1000];
  for (const m of sessionMilestones) {
    milestones.push({
      id: `sessions-${m}`,
      type: 'training',
      icon: 'target',
      title: `${m} Sessions`,
      description: `Completed ${m} training sessions`,
      earned: totalSessions >= m,
      progress: Math.min(totalSessions / m, 1),
    });
  }

  const hourMilestones = [10, 50, 100, 250, 500];
  for (const m of hourMilestones) {
    milestones.push({
      id: `hours-${m}`,
      type: 'training',
      icon: 'clock',
      title: `${m} Hours Training`,
      description: `Spent ${m} hours on the mats`,
      earned: totalHours >= m,
      progress: Math.min(totalHours / m, 1),
    });
  }

  const sparringMilestones = [10, 50, 100];
  for (const m of sparringMilestones) {
    milestones.push({
      id: `sparring-${m}`,
      type: 'training',
      icon: 'swords',
      title: `${m} Hours Sparring`,
      description: `Spent ${m} hours sparring`,
      earned: sparringHours >= m,
      progress: Math.min(sparringHours / m, 1),
    });
  }

  const streakMilestones = [3, 5, 7, 10, 14, 30];
  for (const m of streakMilestones) {
    milestones.push({
      id: `streak-${m}`,
      type: 'training',
      icon: 'flame',
      title: `${m} Day Streak`,
      description: `Trained ${m} days in a row`,
      earned: longestStreak >= m,
      progress: Math.min(longestStreak / m, 1),
    });
  }

  res.json({
    milestones,
    competition_record: {
      total: compRecord.total,
      wins: compRecord.wins,
      losses: compRecord.losses,
      podiums: compRecord.podiums,
    },
    belt_progression: {
      current_belt: user?.belt_rank || 'white',
      stripes: user?.stripes || 0,
      started_at: user?.created_at,
    },
    current_streak: currentStreak,
    longest_streak: longestStreak,
    total_sessions: totalSessions,
    total_hours: totalHours,
    sparring_hours: sparringHours,
  });
});

// GET /me/competitions - list user competitions
router.get('/me/competitions', (req: Request, res: Response) => {
  const userId = req.userId;
  const competitions = db.prepare(`
    SELECT * FROM competitions
    WHERE user_id = ?
    ORDER BY date DESC
  `).all(userId);

  res.json({ data: competitions });
});

// POST /me/competitions - add a competition result
router.post('/me/competitions', (req: Request, res: Response) => {
  const userId = req.userId;
  const { tournament_name, date, result, weight_class, division, notes } = req.body;

  if (!tournament_name || !date || !result) {
    res.status(400).json({ error: 'tournament_name, date, and result are required' });
    return;
  }

  const id = genId();
  const now = nowISO();

  db.prepare(`
    INSERT INTO competitions (id, user_id, tournament_name, date, result, weight_class, division, notes, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, userId, tournament_name, date, result, weight_class || null, division || 'gi', notes || null, now, now);

  const created = db.prepare('SELECT * FROM competitions WHERE id = ?').get(id);
  res.status(201).json(created);
});

// DELETE /me/competitions/:id - delete a competition result
router.delete('/me/competitions/:id', (req: Request, res: Response) => {
  const userId = req.userId;
  const result = db.prepare('DELETE FROM competitions WHERE id = ? AND user_id = ?').run(req.params.id, userId);

  if (result.changes === 0) {
    res.status(404).json({ error: 'Competition not found' });
    return;
  }

  res.json({ success: true });
});

export default router;
