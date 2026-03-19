import { Router, Request, Response } from 'express';
import db from '../db.js';
import { genId } from '../helpers.js';

const router = Router();

const PROVIDERS: Record<string, {
  authUrl: string;
  tokenUrl: string;
  scopes: string;
}> = {
  whoop: {
    authUrl: 'https://api.prod.whoop.com/oauth/oauth2/auth',
    tokenUrl: 'https://api.prod.whoop.com/oauth/oauth2/token',
    scopes: 'read:recovery read:workout read:body_measurement',
  },
  oura: {
    authUrl: 'https://cloud.ouraring.com/oauth/authorize',
    tokenUrl: 'https://cloud.ouraring.com/oauth/token',
    scopes: 'daily workout heartrate',
  },
};

function getProviderConfig(provider: string) {
  const clientId = process.env[`${provider.toUpperCase()}_CLIENT_ID`];
  const clientSecret = process.env[`${provider.toUpperCase()}_CLIENT_SECRET`];
  const redirectUri = process.env[`${provider.toUpperCase()}_REDIRECT_URI`] ||
    `${process.env.API_URL || 'http://localhost:3001'}/api/wearable/callback/${provider}`;
  return { clientId, clientSecret, redirectUri };
}

// GET /connect/:provider - redirect to OAuth
router.get('/connect/:provider', (req: Request, res: Response) => {
  const { provider } = req.params;
  const userId = (req as any).userId;

  if (!PROVIDERS[provider]) {
    res.status(400).json({ error: 'Unsupported provider' });
    return;
  }

  const { clientId, redirectUri } = getProviderConfig(provider);
  if (!clientId) {
    res.status(501).json({ error: `${provider} integration not configured. Set ${provider.toUpperCase()}_CLIENT_ID env var.` });
    return;
  }

  const config = PROVIDERS[provider];
  const state = Buffer.from(JSON.stringify({ userId, provider })).toString('base64url');
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: config.scopes,
    state,
  });

  res.json({ url: `${config.authUrl}?${params}` });
});

// GET /callback/:provider - OAuth callback (exchanging code for token)
router.get('/callback/:provider', async (req: Request, res: Response) => {
  const { provider } = req.params;
  const { code, state } = req.query;

  if (!PROVIDERS[provider] || !code || !state) {
    res.status(400).json({ error: 'Invalid callback' });
    return;
  }

  let stateData: { userId: string; provider: string };
  try {
    stateData = JSON.parse(Buffer.from(state as string, 'base64url').toString());
  } catch {
    res.status(400).json({ error: 'Invalid state' });
    return;
  }

  const { clientId, clientSecret, redirectUri } = getProviderConfig(provider);
  if (!clientId || !clientSecret) {
    res.status(501).json({ error: 'Provider not configured' });
    return;
  }

  try {
    const config = PROVIDERS[provider];
    const tokenRes = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code as string,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    const tokenData = await tokenRes.json() as any;

    if (!tokenRes.ok) {
      res.status(400).json({ error: 'Token exchange failed', details: tokenData });
      return;
    }

    const expiresAt = tokenData.expires_in
      ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
      : null;

    // Upsert token
    db.prepare(`
      INSERT INTO wearable_tokens (id, user_id, provider, access_token, refresh_token, token_expires_at, scope, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(user_id, provider) DO UPDATE SET
        access_token = excluded.access_token,
        refresh_token = COALESCE(excluded.refresh_token, wearable_tokens.refresh_token),
        token_expires_at = excluded.token_expires_at,
        scope = excluded.scope,
        updated_at = datetime('now')
    `).run(
      genId(),
      stateData.userId,
      provider,
      tokenData.access_token,
      tokenData.refresh_token || null,
      expiresAt,
      tokenData.scope || PROVIDERS[provider].scopes
    );

    // Redirect to settings page
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    res.redirect(`${clientUrl}/settings?connected=${provider}`);
  } catch (err) {
    res.status(500).json({ error: 'Token exchange failed' });
  }
});

// GET /status - connection status for all providers
router.get('/status', (req: Request, res: Response) => {
  const userId = (req as any).userId;

  const tokens = db.prepare(
    'SELECT provider, token_expires_at, updated_at FROM wearable_tokens WHERE user_id = ?'
  ).all(userId) as any[];

  const status: Record<string, { connected: boolean; lastSync?: string }> = {
    whoop: { connected: false },
    oura: { connected: false },
    apple_health: { connected: false },
  };

  for (const t of tokens) {
    status[t.provider] = {
      connected: true,
      lastSync: t.updated_at,
    };
  }

  res.json(status);
});

// POST /disconnect/:provider
router.post('/disconnect/:provider', (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { provider } = req.params;

  db.prepare('DELETE FROM wearable_tokens WHERE user_id = ? AND provider = ?')
    .run(userId, provider);

  res.json({ success: true });
});

export default router;
