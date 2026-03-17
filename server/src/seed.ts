import db from './db.js';
import { genId, daysAgo, nowISO } from './helpers.js';

function seed() {
  const existingUser = db.prepare('SELECT id FROM users WHERE id = ?').get('user1');
  if (existingUser) {
    console.log('[seed] Data already exists, skipping seed.');
    return;
  }

  console.log('[seed] Seeding database...');

  const insertAcademy = db.prepare(`
    INSERT INTO academies (id, name, address, city, state, country, lat, lng, phone, website, instagram, description, logo_url, banner_url, allows_drop_ins, has_open_mat, drop_in_price, affiliation)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const academies = [
    { id: 'acad1', name: 'Gracie Barra Downtown', address: '123 Main St', city: 'Austin', state: 'TX', country: 'US', lat: 30.2672, lng: -97.7431, phone: '512-555-0101', website: 'https://gbdowntown.com', instagram: '@gbdowntown', description: 'Premier Gracie Barra school in downtown Austin. All levels welcome.', logo_url: null, banner_url: null, allows_drop_ins: 1, has_open_mat: 1, drop_in_price: 30, affiliation: 'Gracie Barra' },
    { id: 'acad2', name: '10th Planet Austin', address: '456 South Lamar Blvd', city: 'Austin', state: 'TX', country: 'US', lat: 30.2550, lng: -97.7650, phone: '512-555-0202', website: 'https://10paustin.com', instagram: '@10paustin', description: 'No-gi jiu jitsu. Rubber guard specialists.', logo_url: null, banner_url: null, allows_drop_ins: 1, has_open_mat: 1, drop_in_price: 25, affiliation: '10th Planet' },
    { id: 'acad3', name: 'Alliance BJJ South', address: '789 Congress Ave', city: 'Austin', state: 'TX', country: 'US', lat: 30.2500, lng: -97.7400, phone: '512-555-0303', website: 'https://alliancesouth.com', instagram: '@alliancesouth', description: 'Competition-focused Alliance affiliate. Strong competitor team.', logo_url: null, banner_url: null, allows_drop_ins: 1, has_open_mat: 0, drop_in_price: 35, affiliation: 'Alliance' },
    { id: 'acad4', name: 'Atos Austin', address: '321 East 6th St', city: 'Austin', state: 'TX', country: 'US', lat: 30.2680, lng: -97.7350, phone: '512-555-0404', website: 'https://atosaustin.com', instagram: '@atosaustin', description: 'Home of champions. Gi and no-gi programs.', logo_url: null, banner_url: null, allows_drop_ins: 0, has_open_mat: 1, drop_in_price: null, affiliation: 'Atos' },
    { id: 'acad5', name: 'Open Mat Society', address: '555 Barton Springs Rd', city: 'Austin', state: 'TX', country: 'US', lat: 30.2610, lng: -97.7550, phone: '512-555-0505', website: null, instagram: '@openmatsociety', description: 'Community open mat space. All affiliations welcome.', logo_url: null, banner_url: null, allows_drop_ins: 1, has_open_mat: 1, drop_in_price: 15, affiliation: null },
  ];

  const insertAcademyTx = db.transaction(() => {
    for (const a of academies) {
      insertAcademy.run(a.id, a.name, a.address, a.city, a.state, a.country, a.lat, a.lng, a.phone, a.website, a.instagram, a.description, a.logo_url, a.banner_url, a.allows_drop_ins, a.has_open_mat, a.drop_in_price, a.affiliation);
    }
  });
  insertAcademyTx();

  const insertUser = db.prepare(`
    INSERT INTO users (id, email, name, avatar_url, belt_rank, stripes, home_academy_id, bio, weight_kg, date_of_birth, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const users = [
    { id: 'user1', email: 'alex@rolltrack.app', name: 'Alex Thompson', avatar_url: null, belt_rank: 'purple', stripes: 2, home_academy_id: 'acad1', bio: 'Training since 2018. Love spider guard and deep half.', weight_kg: 82, date_of_birth: '1992-05-14', created_at: daysAgo(365), updated_at: nowISO() },
    { id: 'user2', email: 'maria@rolltrack.app', name: 'Maria Santos', avatar_url: null, belt_rank: 'brown', stripes: 1, home_academy_id: 'acad1', bio: 'Competitor. 3x state champion. Berimbolo queen.', weight_kg: 62, date_of_birth: '1995-09-22', created_at: daysAgo(300), updated_at: nowISO() },
    { id: 'user3', email: 'jake@rolltrack.app', name: 'Jake Wilson', avatar_url: null, belt_rank: 'blue', stripes: 3, home_academy_id: 'acad2', bio: 'No-gi specialist. Leg lock enthusiast.', weight_kg: 90, date_of_birth: '1990-01-08', created_at: daysAgo(200), updated_at: nowISO() },
    { id: 'user4', email: 'sam@rolltrack.app', name: 'Sam Chen', avatar_url: null, belt_rank: 'white', stripes: 4, home_academy_id: 'acad3', bio: 'New to BJJ but loving it. Wrestler background.', weight_kg: 77, date_of_birth: '1998-11-30', created_at: daysAgo(90), updated_at: nowISO() },
  ];

  const insertUserTx = db.transaction(() => {
    for (const u of users) {
      insertUser.run(u.id, u.email, u.name, u.avatar_url, u.belt_rank, u.stripes, u.home_academy_id, u.bio, u.weight_kg, u.date_of_birth, u.created_at, u.updated_at);
    }
  });
  insertUserTx();

  const insertSchedule = db.prepare(`
    INSERT INTO academy_schedules (id, academy_id, day_of_week, start_time, end_time, class_type, instructor, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const schedules = [
    { id: genId(), academy_id: 'acad1', day: 1, start: '06:00', end: '07:30', type: 'fundamentals', instructor: 'Prof. Carlos', notes: null },
    { id: genId(), academy_id: 'acad1', day: 1, start: '12:00', end: '13:00', type: 'gi', instructor: 'Prof. Carlos', notes: 'Lunch class' },
    { id: genId(), academy_id: 'acad1', day: 1, start: '18:00', end: '19:30', type: 'advanced', instructor: 'Prof. Carlos', notes: null },
    { id: genId(), academy_id: 'acad1', day: 3, start: '06:00', end: '07:30', type: 'fundamentals', instructor: 'Prof. Carlos', notes: null },
    { id: genId(), academy_id: 'acad1', day: 3, start: '18:00', end: '19:30', type: 'advanced', instructor: 'Prof. Carlos', notes: null },
    { id: genId(), academy_id: 'acad1', day: 5, start: '06:00', end: '07:30', type: 'gi', instructor: 'Prof. Carlos', notes: null },
    { id: genId(), academy_id: 'acad1', day: 6, start: '10:00', end: '12:00', type: 'open_mat', instructor: null, notes: 'All levels open mat' },
    { id: genId(), academy_id: 'acad2', day: 1, start: '18:00', end: '19:30', type: 'nogi', instructor: 'Coach Eddie', notes: null },
    { id: genId(), academy_id: 'acad2', day: 2, start: '18:00', end: '19:30', type: 'nogi', instructor: 'Coach Eddie', notes: null },
    { id: genId(), academy_id: 'acad2', day: 3, start: '18:00', end: '19:30', type: 'nogi', instructor: 'Coach Eddie', notes: null },
    { id: genId(), academy_id: 'acad2', day: 4, start: '18:00', end: '19:30', type: 'nogi', instructor: 'Coach Eddie', notes: 'Leg lock focus' },
    { id: genId(), academy_id: 'acad2', day: 6, start: '11:00', end: '13:00', type: 'open_mat', instructor: null, notes: null },
    { id: genId(), academy_id: 'acad3', day: 1, start: '07:00', end: '08:30', type: 'competition', instructor: 'Prof. Lima', notes: null },
    { id: genId(), academy_id: 'acad3', day: 2, start: '18:00', end: '19:30', type: 'gi', instructor: 'Prof. Lima', notes: null },
    { id: genId(), academy_id: 'acad3', day: 4, start: '18:00', end: '19:30', type: 'gi', instructor: 'Prof. Lima', notes: null },
    { id: genId(), academy_id: 'acad4', day: 1, start: '12:00', end: '13:30', type: 'gi', instructor: 'Prof. Tanaka', notes: null },
    { id: genId(), academy_id: 'acad4', day: 3, start: '12:00', end: '13:30', type: 'nogi', instructor: 'Prof. Tanaka', notes: null },
    { id: genId(), academy_id: 'acad4', day: 5, start: '12:00', end: '13:30', type: 'gi', instructor: 'Prof. Tanaka', notes: null },
    { id: genId(), academy_id: 'acad5', day: 6, start: '09:00', end: '12:00', type: 'open_mat', instructor: null, notes: 'All affiliations welcome' },
    { id: genId(), academy_id: 'acad5', day: 0, start: '10:00', end: '13:00', type: 'open_mat', instructor: null, notes: 'Sunday open mat' },
  ];

  const insertScheduleTx = db.transaction(() => {
    for (const s of schedules) {
      insertSchedule.run(s.id, s.academy_id, s.day, s.start, s.end, s.type, s.instructor, s.notes);
    }
  });
  insertScheduleTx();

  // Training sessions for user1
  const insertSession = db.prepare(`
    INSERT INTO training_sessions (id, user_id, academy_id, session_type, gi_nogi, started_at, ended_at, duration_secs, class_time_secs, sparring_time_secs, drilling_time_secs, notes, photo_url, feeling_rating, intensity_rating, weather_temp_f, weather_condition, weather_humidity, is_public, shared_to_feed, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertRoll = db.prepare(`
    INSERT INTO rolls (id, session_id, partner_user_id, partner_name, partner_belt, duration_secs, result, submission_type, notes, round_number)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertTechnique = db.prepare(`
    INSERT INTO techniques (id, session_id, name, category, position, success_count, attempt_count, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertWearable = db.prepare(`
    INSERT INTO wearable_data (id, session_id, source, avg_heart_rate, max_heart_rate, min_heart_rate, calories_burned, heart_rate_zones, heart_rate_data, vo2_max, recovery_score)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const sessions = [
    { id: 'sess1', user_id: 'user1', academy_id: 'acad1', session_type: 'class', gi_nogi: 'gi', started_at: daysAgo(1), duration_secs: 5400, class_time_secs: 2700, sparring_time_secs: 1800, drilling_time_secs: 900, notes: 'Great class. Worked on spider guard sweeps and transitions to triangle.', feeling_rating: 4, intensity_rating: 4, weather_temp_f: 78, weather_condition: 'sunny', weather_humidity: 55 },
    { id: 'sess2', user_id: 'user1', academy_id: 'acad1', session_type: 'class', gi_nogi: 'gi', started_at: daysAgo(3), duration_secs: 5400, class_time_secs: 2700, sparring_time_secs: 1800, drilling_time_secs: 900, notes: 'Deep half guard day. Feeling the progress.', feeling_rating: 5, intensity_rating: 3, weather_temp_f: 72, weather_condition: 'cloudy', weather_humidity: 65 },
    { id: 'sess3', user_id: 'user1', academy_id: 'acad2', session_type: 'open_mat', gi_nogi: 'nogi', started_at: daysAgo(5), duration_secs: 7200, class_time_secs: 0, sparring_time_secs: 5400, drilling_time_secs: 1800, notes: 'Visited 10th Planet for open mat. Got caught in a few leg locks.', feeling_rating: 3, intensity_rating: 5, weather_temp_f: 85, weather_condition: 'hot', weather_humidity: 70 },
    { id: 'sess4', user_id: 'user1', academy_id: 'acad1', session_type: 'class', gi_nogi: 'gi', started_at: daysAgo(7), duration_secs: 5400, class_time_secs: 3000, sparring_time_secs: 1500, drilling_time_secs: 900, notes: 'Back take series from turtle. Need to work on seatbelt grip.', feeling_rating: 4, intensity_rating: 3, weather_temp_f: 70, weather_condition: 'clear', weather_humidity: 50 },
    { id: 'sess5', user_id: 'user1', academy_id: 'acad1', session_type: 'class', gi_nogi: 'gi', started_at: daysAgo(8), duration_secs: 5400, class_time_secs: 2700, sparring_time_secs: 1800, drilling_time_secs: 900, notes: 'Collar choke variations from mount.', feeling_rating: 4, intensity_rating: 4, weather_temp_f: 74, weather_condition: 'partly_cloudy', weather_humidity: 58 },
    // user2 sessions
    { id: 'sess6', user_id: 'user2', academy_id: 'acad1', session_type: 'class', gi_nogi: 'gi', started_at: daysAgo(1), duration_secs: 5400, class_time_secs: 2700, sparring_time_secs: 1800, drilling_time_secs: 900, notes: 'Berimbolo entries from DLR. Nailed the back take twice.', feeling_rating: 5, intensity_rating: 4, weather_temp_f: 78, weather_condition: 'sunny', weather_humidity: 55 },
    { id: 'sess7', user_id: 'user2', academy_id: 'acad1', session_type: 'class', gi_nogi: 'gi', started_at: daysAgo(2), duration_secs: 5400, class_time_secs: 2700, sparring_time_secs: 2000, drilling_time_secs: 700, notes: 'Competition prep. High intensity rolling.', feeling_rating: 4, intensity_rating: 5, weather_temp_f: 80, weather_condition: 'sunny', weather_humidity: 50 },
    // user3 sessions
    { id: 'sess8', user_id: 'user3', academy_id: 'acad2', session_type: 'class', gi_nogi: 'nogi', started_at: daysAgo(2), duration_secs: 5400, class_time_secs: 2700, sparring_time_secs: 1800, drilling_time_secs: 900, notes: 'Heel hook entries from single leg X. Feeling dangerous.', feeling_rating: 5, intensity_rating: 4, weather_temp_f: 82, weather_condition: 'clear', weather_humidity: 45 },
    // user4 sessions
    { id: 'sess9', user_id: 'user4', academy_id: 'acad3', session_type: 'class', gi_nogi: 'gi', started_at: daysAgo(1), duration_secs: 3600, class_time_secs: 2400, sparring_time_secs: 600, drilling_time_secs: 600, notes: 'Fundamentals class. Learning closed guard basics.', feeling_rating: 4, intensity_rating: 2, weather_temp_f: 76, weather_condition: 'clear', weather_humidity: 52 },
  ];

  const insertSessionsTx = db.transaction(() => {
    for (const s of sessions) {
      const endedAt = new Date(new Date(s.started_at).getTime() + s.duration_secs * 1000).toISOString().replace('T', ' ').slice(0, 19);
      insertSession.run(s.id, s.user_id, s.academy_id, s.session_type, s.gi_nogi, s.started_at, endedAt, s.duration_secs, s.class_time_secs, s.sparring_time_secs, s.drilling_time_secs, s.notes, null, s.feeling_rating, s.intensity_rating, s.weather_temp_f, s.weather_condition, s.weather_humidity, 1, 1, s.started_at);
    }
  });
  insertSessionsTx();

  // Rolls
  const rolls = [
    { session_id: 'sess1', partner_user_id: 'user2', partner_name: 'Maria Santos', partner_belt: 'brown', duration_secs: 360, result: 'submission_loss', submission_type: 'armbar', notes: 'Got caught transitioning to triangle', round_number: 1 },
    { session_id: 'sess1', partner_user_id: null, partner_name: 'Diego', partner_belt: 'blue', duration_secs: 360, result: 'submission_win', submission_type: 'cross collar choke', notes: 'Hit it from mount', round_number: 2 },
    { session_id: 'sess1', partner_user_id: null, partner_name: 'Tom', partner_belt: 'purple', duration_secs: 360, result: 'draw', submission_type: null, notes: 'Good positional battle', round_number: 3 },
    { session_id: 'sess2', partner_user_id: 'user2', partner_name: 'Maria Santos', partner_belt: 'brown', duration_secs: 360, result: 'positional', submission_type: null, notes: 'Positional sparring from deep half', round_number: 1 },
    { session_id: 'sess2', partner_user_id: null, partner_name: 'Chris', partner_belt: 'white', duration_secs: 300, result: 'submission_win', submission_type: 'kimura', notes: null, round_number: 2 },
    { session_id: 'sess3', partner_user_id: 'user3', partner_name: 'Jake Wilson', partner_belt: 'blue', duration_secs: 420, result: 'submission_loss', submission_type: 'heel hook', notes: 'Got caught in outside heel hook', round_number: 1 },
    { session_id: 'sess3', partner_user_id: null, partner_name: 'Ryan', partner_belt: 'purple', duration_secs: 360, result: 'draw', submission_type: null, notes: 'Tough round', round_number: 2 },
    { session_id: 'sess6', partner_user_id: 'user1', partner_name: 'Alex Thompson', partner_belt: 'purple', duration_secs: 360, result: 'submission_win', submission_type: 'armbar', notes: null, round_number: 1 },
    { session_id: 'sess8', partner_user_id: null, partner_name: 'Mike', partner_belt: 'purple', duration_secs: 360, result: 'submission_win', submission_type: 'inside heel hook', notes: 'Clean entry from single leg X', round_number: 1 },
  ];

  const insertRollsTx = db.transaction(() => {
    for (const r of rolls) {
      insertRoll.run(genId(), r.session_id, r.partner_user_id, r.partner_name, r.partner_belt, r.duration_secs, r.result, r.submission_type, r.notes, r.round_number);
    }
  });
  insertRollsTx();

  // Techniques
  const techniques = [
    { session_id: 'sess1', name: 'Spider Guard Sweep', category: 'sweep', position: 'spider_guard', success_count: 3, attempt_count: 5, notes: 'Getting better at the lasso version' },
    { session_id: 'sess1', name: 'Triangle from Guard', category: 'submission', position: 'closed_guard', success_count: 1, attempt_count: 3, notes: null },
    { session_id: 'sess2', name: 'Deep Half Sweep', category: 'sweep', position: 'deep_half', success_count: 4, attempt_count: 6, notes: 'The waiter sweep is clicking' },
    { session_id: 'sess2', name: 'Kimura from Half Guard', category: 'submission', position: 'half_guard', success_count: 1, attempt_count: 2, notes: null },
    { session_id: 'sess3', name: 'Single Leg X Entry', category: 'guard_pull', position: 'standing', success_count: 2, attempt_count: 4, notes: 'Need to work on inside position' },
    { session_id: 'sess4', name: 'Back Take from Turtle', category: 'back_take', position: 'turtle', success_count: 3, attempt_count: 4, notes: 'Seatbelt grip needs work' },
    { session_id: 'sess5', name: 'Cross Collar Choke', category: 'submission', position: 'mount', success_count: 2, attempt_count: 3, notes: null },
    { session_id: 'sess6', name: 'Berimbolo', category: 'back_take', position: 'de_la_riva', success_count: 2, attempt_count: 3, notes: 'Clean entries today' },
    { session_id: 'sess8', name: 'Inside Heel Hook', category: 'submission', position: 'single_leg_x', success_count: 3, attempt_count: 4, notes: null },
    { session_id: 'sess9', name: 'Scissor Sweep', category: 'sweep', position: 'closed_guard', success_count: 2, attempt_count: 5, notes: 'Still learning the timing' },
  ];

  const insertTechTx = db.transaction(() => {
    for (const t of techniques) {
      insertTechnique.run(genId(), t.session_id, t.name, t.category, t.position, t.success_count, t.attempt_count, t.notes);
    }
  });
  insertTechTx();

  // Wearable data for some sessions
  const wearableEntries = [
    { session_id: 'sess1', source: 'apple_watch', avg_hr: 145, max_hr: 182, min_hr: 72, calories: 680, zones: JSON.stringify({ zone1: 300, zone2: 900, zone3: 2400, zone4: 1500, zone5: 300 }), hr_data: null, vo2: 42.5, recovery: 78 },
    { session_id: 'sess3', source: 'whoop', avg_hr: 158, max_hr: 192, min_hr: 68, calories: 850, zones: JSON.stringify({ zone1: 200, zone2: 600, zone3: 2000, zone4: 2800, zone5: 1600 }), hr_data: null, vo2: 42.5, recovery: 65 },
    { session_id: 'sess6', source: 'garmin', avg_hr: 152, max_hr: 188, min_hr: 70, calories: 620, zones: JSON.stringify({ zone1: 400, zone2: 800, zone3: 2200, zone4: 1600, zone5: 400 }), hr_data: null, vo2: 45.0, recovery: 82 },
  ];

  const insertWearableTx = db.transaction(() => {
    for (const w of wearableEntries) {
      insertWearable.run(genId(), w.session_id, w.source, w.avg_hr, w.max_hr, w.min_hr, w.calories, w.zones, w.hr_data, w.vo2, w.recovery);
    }
  });
  insertWearableTx();

  // Friendships
  const insertFriendship = db.prepare(`
    INSERT INTO friendships (id, requester_id, addressee_id, status, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);

  const friendships = [
    { requester_id: 'user1', addressee_id: 'user2', status: 'accepted' },
    { requester_id: 'user1', addressee_id: 'user3', status: 'accepted' },
    { requester_id: 'user4', addressee_id: 'user1', status: 'pending' },
    { requester_id: 'user2', addressee_id: 'user3', status: 'accepted' },
  ];

  const insertFriendshipsTx = db.transaction(() => {
    for (const f of friendships) {
      insertFriendship.run(genId(), f.requester_id, f.addressee_id, f.status, daysAgo(30));
    }
  });
  insertFriendshipsTx();

  // Weekly schedule for user1
  const insertWeekly = db.prepare(`
    INSERT INTO weekly_schedule (id, user_id, day_of_week, academy_id, session_type, start_time, end_time, gi_nogi, notes, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const weeklySchedules = [
    { user_id: 'user1', day: 1, academy_id: 'acad1', session_type: 'class', start_time: '06:00', end_time: '07:30', gi_nogi: 'gi', notes: 'Morning fundamentals', is_active: 1 },
    { user_id: 'user1', day: 3, academy_id: 'acad1', session_type: 'class', start_time: '18:00', end_time: '19:30', gi_nogi: 'gi', notes: 'Evening advanced', is_active: 1 },
    { user_id: 'user1', day: 5, academy_id: 'acad1', session_type: 'class', start_time: '06:00', end_time: '07:30', gi_nogi: 'gi', notes: 'Friday morning', is_active: 1 },
    { user_id: 'user1', day: 6, academy_id: 'acad1', session_type: 'open_mat', start_time: '10:00', end_time: '12:00', gi_nogi: 'both', notes: 'Saturday open mat', is_active: 1 },
    { user_id: 'user2', day: 1, academy_id: 'acad1', session_type: 'class', start_time: '18:00', end_time: '19:30', gi_nogi: 'gi', notes: null, is_active: 1 },
    { user_id: 'user2', day: 3, academy_id: 'acad1', session_type: 'class', start_time: '18:00', end_time: '19:30', gi_nogi: 'gi', notes: null, is_active: 1 },
    { user_id: 'user3', day: 1, academy_id: 'acad2', session_type: 'class', start_time: '18:00', end_time: '19:30', gi_nogi: 'nogi', notes: null, is_active: 1 },
  ];

  const insertWeeklyTx = db.transaction(() => {
    for (const w of weeklySchedules) {
      insertWeekly.run(genId(), w.user_id, w.day, w.academy_id, w.session_type, w.start_time, w.end_time, w.gi_nogi, w.notes, w.is_active);
    }
  });
  insertWeeklyTx();

  // Groups
  const insertGroup = db.prepare(`
    INSERT INTO groups (id, name, description, group_type, avatar_url, banner_url, academy_id, is_private, invite_code, created_by, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertGroupMember = db.prepare(`
    INSERT INTO group_members (id, group_id, user_id, role, joined_at)
    VALUES (?, ?, ?, ?, ?)
  `);

  const groups = [
    { id: 'grp1', name: 'GB Downtown Crew', description: 'Official Gracie Barra Downtown training group', group_type: 'academy', academy_id: 'acad1', is_private: 0, invite_code: 'GBDTOWN', created_by: 'user1' },
    { id: 'grp2', name: 'Austin Leg Lock Gang', description: 'Leg lock enthusiasts in the Austin area', group_type: 'friend', academy_id: null, is_private: 0, invite_code: 'LEGLOX', created_by: 'user3' },
    { id: 'grp3', name: 'IBJJF Worlds Prep', description: 'Training group for 2026 Worlds competitors', group_type: 'comp_team', academy_id: null, is_private: 1, invite_code: 'WORLDS26', created_by: 'user2' },
  ];

  const insertGroupsTx = db.transaction(() => {
    for (const g of groups) {
      insertGroup.run(g.id, g.name, g.description, g.group_type, null, null, g.academy_id, g.is_private, g.invite_code, g.created_by, daysAgo(60));
    }
    // Group members
    const members = [
      { group_id: 'grp1', user_id: 'user1', role: 'owner' },
      { group_id: 'grp1', user_id: 'user2', role: 'admin' },
      { group_id: 'grp1', user_id: 'user4', role: 'member' },
      { group_id: 'grp2', user_id: 'user3', role: 'owner' },
      { group_id: 'grp2', user_id: 'user1', role: 'member' },
      { group_id: 'grp3', user_id: 'user2', role: 'owner' },
      { group_id: 'grp3', user_id: 'user1', role: 'member' },
    ];
    for (const m of members) {
      insertGroupMember.run(genId(), m.group_id, m.user_id, m.role, daysAgo(55));
    }
  });
  insertGroupsTx();

  // Group events
  const insertEvent = db.prepare(`
    INSERT INTO group_events (id, group_id, title, description, event_type, location, academy_id, starts_at, ends_at, created_by, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const events = [
    { id: 'evt1', group_id: 'grp1', title: 'Saturday Open Mat', description: 'Weekly open mat - all levels', event_type: 'open_mat', location: 'Gracie Barra Downtown', academy_id: 'acad1', starts_at: daysAgo(-6), ends_at: daysAgo(-6), created_by: 'user1' },
    { id: 'evt2', group_id: 'grp3', title: 'Competition Sparring', description: 'Hard rounds only. Bring your A game.', event_type: 'training', location: 'Gracie Barra Downtown', academy_id: 'acad1', starts_at: daysAgo(-3), ends_at: daysAgo(-3), created_by: 'user2' },
  ];

  const insertEventsTx = db.transaction(() => {
    for (const e of events) {
      insertEvent.run(e.id, e.group_id, e.title, e.description, e.event_type, e.location, e.academy_id, e.starts_at, e.ends_at, e.created_by, daysAgo(5));
    }
  });
  insertEventsTx();

  // Group posts
  const insertPost = db.prepare(`
    INSERT INTO group_posts (id, group_id, user_id, content, image_url, session_id, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const posts = [
    { id: 'post1', group_id: 'grp1', user_id: 'user1', content: 'Great training today! Spider guard sweeps are finally clicking.', session_id: 'sess1', created_at: daysAgo(1) },
    { id: 'post2', group_id: 'grp1', user_id: 'user2', content: 'Who is coming to Saturday open mat? Lets get some good rounds in.', session_id: null, created_at: daysAgo(2) },
    { id: 'post3', group_id: 'grp2', user_id: 'user3', content: 'Inside heel hooks all day. 3 for 4 today.', session_id: 'sess8', created_at: daysAgo(2) },
  ];

  const insertPostsTx = db.transaction(() => {
    for (const p of posts) {
      insertPost.run(p.id, p.group_id, p.user_id, p.content, null, p.session_id, p.created_at);
    }
  });
  insertPostsTx();

  // Likes and comments
  const insertLike = db.prepare(`INSERT INTO likes (id, user_id, target_type, target_id, created_at) VALUES (?, ?, ?, ?, ?)`);
  const insertComment = db.prepare(`INSERT INTO comments (id, user_id, target_type, target_id, content, created_at) VALUES (?, ?, ?, ?, ?, ?)`);

  const insertSocialTx = db.transaction(() => {
    insertLike.run(genId(), 'user2', 'session', 'sess1', daysAgo(1));
    insertLike.run(genId(), 'user3', 'session', 'sess1', daysAgo(1));
    insertLike.run(genId(), 'user1', 'session', 'sess6', daysAgo(1));
    insertLike.run(genId(), 'user1', 'group_post', 'post2', daysAgo(2));
    insertLike.run(genId(), 'user2', 'group_post', 'post3', daysAgo(2));

    insertComment.run(genId(), 'user2', 'session', 'sess1', 'Nice work! Your spider guard is getting dangerous.', daysAgo(1));
    insertComment.run(genId(), 'user3', 'session', 'sess1', 'We need to roll again soon!', daysAgo(1));
    insertComment.run(genId(), 'user1', 'group_post', 'post2', 'I will be there!', daysAgo(2));
  });
  insertSocialTx();

  console.log('[seed] Database seeded successfully.');
}

seed();
