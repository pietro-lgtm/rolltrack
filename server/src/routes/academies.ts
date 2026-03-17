import { Router, Request, Response } from 'express';
import db from '../db.js';

const router = Router();

// GET / - search academies by name, filter by features, distance calculation
router.get('/', (req: Request, res: Response) => {
  const { q, has_open_mat, allows_drop_ins, lat, lng } = req.query;
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
  const offset = parseInt(req.query.offset as string) || 0;

  let where = 'WHERE 1=1';
  const params: any[] = [];

  if (q) {
    where += ' AND (a.name LIKE ? OR a.city LIKE ? OR a.affiliation LIKE ?)';
    const search = `%${q}%`;
    params.push(search, search, search);
  }
  if (has_open_mat === '1' || has_open_mat === 'true') {
    where += ' AND a.has_open_mat = 1';
  }
  if (allows_drop_ins === '1' || allows_drop_ins === 'true') {
    where += ' AND a.allows_drop_ins = 1';
  }

  let distanceSelect = '';
  let orderBy = 'ORDER BY a.name ASC';

  if (lat && lng) {
    const userLat = parseFloat(lat as string);
    const userLng = parseFloat(lng as string);
    // Haversine approximation for distance in miles
    distanceSelect = `,
      ROUND(
        3959 * ACOS(
          MIN(1.0, COS(${userLat} * 0.017453293) * COS(a.lat * 0.017453293) *
          COS((a.lng - ${userLng}) * 0.017453293) +
          SIN(${userLat} * 0.017453293) * SIN(a.lat * 0.017453293))
        ), 1
      ) AS distance_miles`;
    orderBy = 'ORDER BY distance_miles ASC';
  }

  const academies = db.prepare(`
    SELECT
      a.*,
      (SELECT COUNT(*) FROM academy_schedules WHERE academy_id = a.id) AS schedule_count
      ${distanceSelect}
    FROM academies a
    ${where}
    ${orderBy}
    LIMIT ? OFFSET ?
  `).all(...params, limit, offset);

  const total = db.prepare(`
    SELECT COUNT(*) AS count FROM academies a ${where}
  `).get(...params) as { count: number };

  res.json({ data: academies, total: total.count, limit, offset });
});

// GET /:id - academy detail with schedules
router.get('/:id', (req: Request, res: Response) => {
  const academy = db.prepare('SELECT * FROM academies WHERE id = ?').get(req.params.id);

  if (!academy) {
    res.status(404).json({ error: 'Academy not found' });
    return;
  }

  const schedules = db.prepare(`
    SELECT * FROM academy_schedules
    WHERE academy_id = ?
    ORDER BY day_of_week ASC, start_time ASC
  `).all(req.params.id);

  res.json({ ...academy as any, schedules });
});

export default router;
