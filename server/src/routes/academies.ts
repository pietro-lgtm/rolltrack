import { Router, Request, Response } from 'express';
import db from '../db.js';
import { genId } from '../helpers.js';

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

// POST / - create academy
router.post('/', (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { name, address, city, state, country, lat, lng, phone, website, instagram, description, affiliation, allows_drop_ins, has_open_mat, drop_in_price } = req.body;

  if (!name) {
    res.status(400).json({ error: 'Name is required' });
    return;
  }

  const id = genId();
  db.prepare(`
    INSERT INTO academies (id, name, address, city, state, country, lat, lng, phone, website, instagram, description, affiliation, allows_drop_ins, has_open_mat, drop_in_price, created_by_user_id, claimed_by_user_id, is_claimed)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
  `).run(id, name, address || '', city || '', state || '', country || '', lat || 0, lng || 0, phone || null, website || null, instagram || null, description || '', affiliation || null, allows_drop_ins ? 1 : 0, has_open_mat ? 1 : 0, drop_in_price || null, userId, userId);

  // Auto-add creator as moderator
  db.prepare(`
    INSERT INTO academy_members (id, academy_id, user_id, role, status) VALUES (?, ?, ?, 'moderator', 'approved')
  `).run(genId(), id, userId);

  const academy = db.prepare('SELECT * FROM academies WHERE id = ?').get(id);
  res.status(201).json(academy);
});

// GET /:id - academy detail with schedules and membership info
router.get('/:id', (req: Request, res: Response) => {
  const userId = (req as any).userId;
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

  const memberCount = (db.prepare(`
    SELECT COUNT(*) as count FROM academy_members WHERE academy_id = ? AND status = 'approved'
  `).get(req.params.id) as any).count;

  const myMembership = db.prepare(`
    SELECT * FROM academy_members WHERE academy_id = ? AND user_id = ?
  `).get(req.params.id, userId) as any;

  res.json({
    ...academy as any,
    schedules,
    member_count: memberCount,
    my_membership: myMembership ? { role: myMembership.role, status: myMembership.status } : null,
  });
});

// PUT /:id - update academy (moderator only)
router.put('/:id', (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const academy = db.prepare('SELECT * FROM academies WHERE id = ?').get(req.params.id) as any;

  if (!academy) { res.status(404).json({ error: 'Academy not found' }); return; }
  if (academy.claimed_by_user_id !== userId) { res.status(403).json({ error: 'Only the moderator can edit' }); return; }

  const { name, address, city, state, phone, website, instagram, description, affiliation, allows_drop_ins, has_open_mat, drop_in_price } = req.body;

  db.prepare(`
    UPDATE academies SET
      name = COALESCE(?, name), address = COALESCE(?, address), city = COALESCE(?, city),
      state = COALESCE(?, state), phone = COALESCE(?, phone), website = COALESCE(?, website),
      instagram = COALESCE(?, instagram), description = COALESCE(?, description),
      affiliation = COALESCE(?, affiliation),
      allows_drop_ins = COALESCE(?, allows_drop_ins), has_open_mat = COALESCE(?, has_open_mat),
      drop_in_price = COALESCE(?, drop_in_price)
    WHERE id = ?
  `).run(name, address, city, state, phone, website, instagram, description, affiliation,
    allows_drop_ins != null ? (allows_drop_ins ? 1 : 0) : null,
    has_open_mat != null ? (has_open_mat ? 1 : 0) : null,
    drop_in_price, req.params.id);

  const updated = db.prepare('SELECT * FROM academies WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// POST /:id/claim - claim an unclaimed academy
router.post('/:id/claim', (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const academy = db.prepare('SELECT * FROM academies WHERE id = ?').get(req.params.id) as any;

  if (!academy) { res.status(404).json({ error: 'Academy not found' }); return; }
  if (academy.is_claimed) { res.status(400).json({ error: 'Academy already claimed' }); return; }

  db.prepare('UPDATE academies SET claimed_by_user_id = ?, is_claimed = 1 WHERE id = ?').run(userId, req.params.id);

  // Add as moderator
  db.prepare(`
    INSERT OR REPLACE INTO academy_members (id, academy_id, user_id, role, status)
    VALUES (?, ?, ?, 'moderator', 'approved')
  `).run(genId(), req.params.id, userId);

  res.json({ success: true });
});

// POST /:id/join - request to join academy
router.post('/:id/join', (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const academy = db.prepare('SELECT * FROM academies WHERE id = ?').get(req.params.id);
  if (!academy) { res.status(404).json({ error: 'Academy not found' }); return; }

  const existing = db.prepare('SELECT * FROM academy_members WHERE academy_id = ? AND user_id = ?').get(req.params.id, userId);
  if (existing) { res.status(400).json({ error: 'Already a member or pending' }); return; }

  const status = (academy as any).is_claimed ? 'pending' : 'approved';
  db.prepare(`
    INSERT INTO academy_members (id, academy_id, user_id, role, status) VALUES (?, ?, ?, 'member', ?)
  `).run(genId(), req.params.id, userId, status);

  res.json({ success: true, status });
});

// GET /:id/members - list members
router.get('/:id/members', (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const isModerator = db.prepare(
    "SELECT 1 FROM academy_members WHERE academy_id = ? AND user_id = ? AND role = 'moderator'"
  ).get(req.params.id, userId);

  let statusFilter = "AND am.status = 'approved'";
  if (isModerator) statusFilter = ''; // Moderators see pending too

  const members = db.prepare(`
    SELECT am.*, u.name, u.avatar_url, u.belt_rank, u.stripes
    FROM academy_members am
    JOIN users u ON u.id = am.user_id
    WHERE am.academy_id = ? ${statusFilter}
    ORDER BY am.role = 'moderator' DESC, am.created_at ASC
  `).all(req.params.id);

  res.json({ data: members });
});

// PUT /:id/members/:memberId - approve/reject (moderator only)
router.put('/:id/members/:memberId', (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const isModerator = db.prepare(
    "SELECT 1 FROM academy_members WHERE academy_id = ? AND user_id = ? AND role = 'moderator'"
  ).get(req.params.id, userId);

  if (!isModerator) { res.status(403).json({ error: 'Only moderators can manage members' }); return; }

  const { status } = req.body;
  if (!['approved', 'rejected'].includes(status)) {
    res.status(400).json({ error: 'Status must be approved or rejected' }); return;
  }

  db.prepare('UPDATE academy_members SET status = ? WHERE id = ? AND academy_id = ?')
    .run(status, req.params.memberId, req.params.id);

  res.json({ success: true });
});

export default router;
