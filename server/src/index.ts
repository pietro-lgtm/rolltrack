import express from 'express';
import cors from 'cors';
import { authMiddleware } from './middleware/auth.js';

// Import seed data (runs on import)
import './seed.js';

// Import route modules
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
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use(authMiddleware);

// Mount routes
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

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', name: 'RollTrack API', version: '1.0.0' });
});

app.listen(PORT, () => {
  console.log(`RollTrack API running on http://localhost:${PORT}`);
});

export default app;
