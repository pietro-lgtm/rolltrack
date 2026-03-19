import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dataDir = path.resolve('./data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
const dbPath = path.join(dataDir, 'rolltrack.db');

import type BetterSqlite3 from 'better-sqlite3';
const db: BetterSqlite3.Database = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS academies (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT,
    city TEXT,
    state TEXT,
    country TEXT DEFAULT 'US',
    lat REAL,
    lng REAL,
    phone TEXT,
    website TEXT,
    instagram TEXT,
    description TEXT,
    logo_url TEXT,
    banner_url TEXT,
    allows_drop_ins INTEGER DEFAULT 0,
    has_open_mat INTEGER DEFAULT 0,
    drop_in_price REAL,
    affiliation TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    avatar_url TEXT,
    belt_rank TEXT CHECK(belt_rank IN ('white','blue','purple','brown','black')) DEFAULT 'white',
    stripes INTEGER DEFAULT 0 CHECK(stripes >= 0 AND stripes <= 4),
    home_academy_id TEXT REFERENCES academies(id),
    bio TEXT,
    weight_kg REAL,
    date_of_birth TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS academy_schedules (
    id TEXT PRIMARY KEY,
    academy_id TEXT NOT NULL REFERENCES academies(id),
    day_of_week INTEGER NOT NULL CHECK(day_of_week >= 0 AND day_of_week <= 6),
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    class_type TEXT CHECK(class_type IN ('gi','nogi','open_mat','fundamentals','advanced','competition','kids','private')) DEFAULT 'gi',
    instructor TEXT,
    notes TEXT
  );

  CREATE TABLE IF NOT EXISTS training_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    academy_id TEXT REFERENCES academies(id),
    session_type TEXT CHECK(session_type IN ('class','open_mat','private','competition','home_drill','open_gym')) DEFAULT 'class',
    gi_nogi TEXT CHECK(gi_nogi IN ('gi','nogi','both')) DEFAULT 'gi',
    started_at TEXT NOT NULL,
    ended_at TEXT,
    duration_secs INTEGER,
    class_time_secs INTEGER,
    sparring_time_secs INTEGER,
    drilling_time_secs INTEGER,
    notes TEXT,
    photo_url TEXT,
    feeling_rating INTEGER CHECK(feeling_rating >= 1 AND feeling_rating <= 5),
    intensity_rating INTEGER CHECK(intensity_rating >= 1 AND intensity_rating <= 5),
    weather_temp_f REAL,
    weather_condition TEXT,
    weather_humidity REAL,
    is_public INTEGER DEFAULT 1,
    shared_to_feed INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS rolls (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL REFERENCES training_sessions(id) ON DELETE CASCADE,
    partner_user_id TEXT REFERENCES users(id),
    partner_name TEXT,
    partner_belt TEXT,
    duration_secs INTEGER,
    result TEXT CHECK(result IN ('submission_win','submission_loss','points_win','points_loss','draw','positional')),
    submission_type TEXT,
    notes TEXT,
    round_number INTEGER
  );

  CREATE TABLE IF NOT EXISTS techniques (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL REFERENCES training_sessions(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT,
    position TEXT,
    success_count INTEGER DEFAULT 0,
    attempt_count INTEGER DEFAULT 0,
    notes TEXT
  );

  CREATE TABLE IF NOT EXISTS wearable_data (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL REFERENCES training_sessions(id) ON DELETE CASCADE,
    source TEXT,
    avg_heart_rate INTEGER,
    max_heart_rate INTEGER,
    min_heart_rate INTEGER,
    calories_burned INTEGER,
    heart_rate_zones TEXT,
    heart_rate_data TEXT,
    vo2_max REAL,
    recovery_score REAL
  );

  CREATE TABLE IF NOT EXISTS weekly_schedule (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    day_of_week INTEGER NOT NULL CHECK(day_of_week >= 0 AND day_of_week <= 6),
    academy_id TEXT REFERENCES academies(id),
    session_type TEXT,
    start_time TEXT NOT NULL,
    end_time TEXT,
    gi_nogi TEXT CHECK(gi_nogi IN ('gi','nogi','both')) DEFAULT 'gi',
    notes TEXT,
    is_active INTEGER DEFAULT 1,
    UNIQUE(user_id, day_of_week, start_time)
  );

  CREATE TABLE IF NOT EXISTS friendships (
    id TEXT PRIMARY KEY,
    requester_id TEXT NOT NULL REFERENCES users(id),
    addressee_id TEXT NOT NULL REFERENCES users(id),
    status TEXT CHECK(status IN ('pending','accepted','blocked')) DEFAULT 'pending',
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(requester_id, addressee_id)
  );

  CREATE TABLE IF NOT EXISTS groups (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    group_type TEXT CHECK(group_type IN ('academy','friend','comp_team')) DEFAULT 'friend',
    avatar_url TEXT,
    banner_url TEXT,
    academy_id TEXT REFERENCES academies(id),
    is_private INTEGER DEFAULT 0,
    invite_code TEXT UNIQUE,
    created_by TEXT REFERENCES users(id),
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS group_members (
    id TEXT PRIMARY KEY,
    group_id TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id),
    role TEXT CHECK(role IN ('owner','admin','member')) DEFAULT 'member',
    joined_at TEXT DEFAULT (datetime('now')),
    UNIQUE(group_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS group_events (
    id TEXT PRIMARY KEY,
    group_id TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    event_type TEXT CHECK(event_type IN ('training','competition','seminar','social','open_mat','other')) DEFAULT 'training',
    location TEXT,
    academy_id TEXT REFERENCES academies(id),
    starts_at TEXT NOT NULL,
    ends_at TEXT,
    created_by TEXT REFERENCES users(id),
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS group_event_rsvps (
    id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL REFERENCES group_events(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id),
    status TEXT CHECK(status IN ('going','maybe','not_going')) DEFAULT 'going',
    UNIQUE(event_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS group_posts (
    id TEXT PRIMARY KEY,
    group_id TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    image_url TEXT,
    session_id TEXT REFERENCES training_sessions(id),
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS likes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    target_type TEXT CHECK(target_type IN ('session','group_post')) NOT NULL,
    target_id TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(user_id, target_type, target_id)
  );

  CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    target_type TEXT CHECK(target_type IN ('session','group_post')) NOT NULL,
    target_id TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  CREATE INDEX IF NOT EXISTS idx_users_home_academy ON users(home_academy_id);
  CREATE INDEX IF NOT EXISTS idx_academy_schedules_academy ON academy_schedules(academy_id);
  CREATE INDEX IF NOT EXISTS idx_training_sessions_user ON training_sessions(user_id);
  CREATE INDEX IF NOT EXISTS idx_training_sessions_academy ON training_sessions(academy_id);
  CREATE INDEX IF NOT EXISTS idx_training_sessions_started ON training_sessions(started_at);
  CREATE INDEX IF NOT EXISTS idx_rolls_session ON rolls(session_id);
  CREATE INDEX IF NOT EXISTS idx_techniques_session ON techniques(session_id);
  CREATE INDEX IF NOT EXISTS idx_wearable_session ON wearable_data(session_id);
  CREATE INDEX IF NOT EXISTS idx_weekly_schedule_user ON weekly_schedule(user_id);
  CREATE INDEX IF NOT EXISTS idx_friendships_requester ON friendships(requester_id);
  CREATE INDEX IF NOT EXISTS idx_friendships_addressee ON friendships(addressee_id);
  CREATE INDEX IF NOT EXISTS idx_friendships_status ON friendships(status);
  CREATE INDEX IF NOT EXISTS idx_group_members_group ON group_members(group_id);
  CREATE INDEX IF NOT EXISTS idx_group_members_user ON group_members(user_id);
  CREATE INDEX IF NOT EXISTS idx_group_events_group ON group_events(group_id);
  CREATE INDEX IF NOT EXISTS idx_group_event_rsvps_event ON group_event_rsvps(event_id);
  CREATE INDEX IF NOT EXISTS idx_group_posts_group ON group_posts(group_id);
  CREATE INDEX IF NOT EXISTS idx_likes_target ON likes(target_type, target_id);
  CREATE INDEX IF NOT EXISTS idx_likes_user ON likes(user_id);
  CREATE INDEX IF NOT EXISTS idx_comments_target ON comments(target_type, target_id);

  CREATE TABLE IF NOT EXISTS competitions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    tournament_name TEXT NOT NULL,
    date TEXT NOT NULL,
    result TEXT CHECK(result IN ('gold','silver','bronze','did_not_place')) NOT NULL,
    weight_class TEXT,
    division TEXT CHECK(division IN ('gi','nogi')) DEFAULT 'gi',
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_competitions_user ON competitions(user_id);
  CREATE INDEX IF NOT EXISTS idx_competitions_date ON competitions(date);
`);

// Add password_hash column if it doesn't exist (for existing databases)
try {
  db.exec(`ALTER TABLE users ADD COLUMN password_hash TEXT`);
} catch {
  // Column already exists, ignore
}

// Add session_name column for share overlay
try {
  db.exec(`ALTER TABLE training_sessions ADD COLUMN session_name TEXT`);
} catch {
  // Column already exists, ignore
}

// Academy claim/moderation columns
try {
  db.exec(`ALTER TABLE academies ADD COLUMN created_by_user_id TEXT REFERENCES users(id)`);
} catch {}
try {
  db.exec(`ALTER TABLE academies ADD COLUMN claimed_by_user_id TEXT REFERENCES users(id)`);
} catch {}
try {
  db.exec(`ALTER TABLE academies ADD COLUMN is_claimed INTEGER DEFAULT 0`);
} catch {}

// Academy members table
db.exec(`
  CREATE TABLE IF NOT EXISTS academy_members (
    id TEXT PRIMARY KEY,
    academy_id TEXT NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id),
    role TEXT CHECK(role IN ('moderator','member')) DEFAULT 'member',
    status TEXT CHECK(status IN ('pending','approved','rejected')) DEFAULT 'pending',
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(academy_id, user_id)
  );
  CREATE INDEX IF NOT EXISTS idx_academy_members_academy ON academy_members(academy_id);
  CREATE INDEX IF NOT EXISTS idx_academy_members_user ON academy_members(user_id);
`);

// Wearable OAuth tokens
db.exec(`
  CREATE TABLE IF NOT EXISTS wearable_tokens (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    provider TEXT NOT NULL CHECK(provider IN ('whoop','oura')),
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TEXT,
    scope TEXT,
    provider_user_id TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    UNIQUE(user_id, provider)
  );
`);

export default db;
