import express from 'express';
import cors from 'cors';
import { authMiddleware } from './middleware/auth.js';

// Import seed data (runs on import)
import './seed.js';

// Import route modules
import authRouter from './routes/auth.js';
import feedRouter from './routes/feed.js';
import sessionsRouter from './routes/sessions.js';
import academiesRouter from './routes/academies.js';
import groupsRouter from './routes/groups.js';
import usersRouter from './routes/users.js';
import friendsRouter from './routes/friends.js';
import scheduleRouter from './routes/schedule.js';
import eventsRouter from './routes/events.js';
import postsRouter from './routes/posts.js';
import wearableRouter from './routes/wearable.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.CLIENT_URL ? [process.env.CLIENT_URL, 'http://localhost:5173'] : true,
  credentials: true,
}));
app.use(express.json());

// Auth routes (no JWT required)
app.use('/api/auth', authRouter);

// Health check (no JWT required)
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', name: 'RollTrack API', version: '1.0.0' });
});

// JWT middleware for all other routes
app.use(authMiddleware);

// Mount protected routes
app.use('/api/feed', feedRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/academies', academiesRouter);
app.use('/api/groups', groupsRouter);
app.use('/api/users', usersRouter);
app.use('/api/friends', friendsRouter);
app.use('/api/schedule', scheduleRouter);
app.use('/api/events', eventsRouter);
app.use('/api/posts', postsRouter);
app.use('/api/wearable', wearableRouter);

app.listen(PORT, () => {
  console.log(`RollTrack API running on http://localhost:${PORT}`);
});

export default app;
