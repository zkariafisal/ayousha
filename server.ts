import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  // Proxy for Firebase Cloud Messaging notifications to partner app on Vercel
  app.post('/api/notify', async (req, res) => {
    try {
      const { token, title, body, type = 'notification', itemId = '', role = 'her', url } = req.body;
      if (!token || !title) {
        return res.status(400).json({ error: 'Missing token or title' });
      }

      console.log(`[Proxy FCM] Sending notification to ${role} (${token.slice(0, 15)}...): "${title}"`);

      const targetUrl = url || `https://ayousha.vercel.app/?for=${encodeURIComponent(role)}&open=${encodeURIComponent(type)}&item=${encodeURIComponent(itemId)}`;

      const response = await fetch('https://ayousha.vercel.app/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          title,
          body: body || '',
          type,
          itemId,
          role,
          url: targetUrl
        })
      });

      const data = await response.json().catch(() => ({}));
      return res.status(response.status).json(data);
    } catch (err: any) {
      console.error('[Proxy FCM] Error forwarding push notification:', err);
      return res.status(500).json({ error: err.message });
    }
  });

  // Health and connection status endpoint
  app.get('/api/status', async (req, res) => {
    try {
      // Check Firebase Realtime Database
      const rtdbRes = await fetch('https://ayousha-default-rtdb.firebaseio.com/config/her.json');
      const herConfig = await rtdbRes.json().catch(() => null);

      return res.json({
        status: 'ok',
        partner: 'ayousha',
        partnerAppUrl: 'https://ayousha.vercel.app/?for=her',
        partnerRegisteredFCM: !!(herConfig && herConfig.fcmToken),
        time: new Date().toISOString()
      });
    } catch (e: any) {
      return res.status(500).json({ status: 'error', error: e.message });
    }
  });

  // Explicit download endpoint for the application ZIP package
  app.get('/ayousha-app.zip', (req, res) => {
    res.download(path.resolve(__dirname, 'public/ayousha-app.zip'), 'ayousha-app.zip');
  });

  app.get('/download-zip', (req, res) => {
    res.download(path.resolve(__dirname, 'public/ayousha-app.zip'), 'ayousha-app.zip');
  });

  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Couple App server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
