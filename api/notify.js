import admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    // سيتم قراءة المفتاح من إعدادات Vercel السرية
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } catch (error) {
    console.error('Firebase admin initialization error', error.stack);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  
  const { token, title, body, type = 'notification', itemId = '', role = '' } = req.body;
  if (!token || !title) return res.status(400).json({ error: 'Missing token or title' });
  if (!admin.apps.length) return res.status(503).json({error:'FIREBASE_SERVICE_ACCOUNT is not configured'});

  try {
    const response = await admin.messaging().send({
      token: token,
      data: { title: String(title), body: String(body || ''), type: String(type), itemId: String(itemId), role: String(role) },
      webpush: {
        headers: { Urgency: 'high', TTL: '86400' },
        // Data-only push: the service worker creates exactly one notification.
        // High urgency requests immediate delivery, but Android may still defer it.
      },
      android: { priority: 'high', notification: { sound: 'default' } },
      apns: { payload: { aps: { sound: 'default' } } }
    });
    res.status(200).json({ success: true, response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
