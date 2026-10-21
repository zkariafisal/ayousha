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
  
  const { token, title, body } = req.body;
  if (!token || !title) return res.status(400).json({ error: 'Missing token or title' });

  try {
    const response = await admin.messaging().send({
      token: token,
      notification: { title, body },
      android: { priority: 'high', notification: { sound: 'default' } },
      apns: { payload: { aps: { sound: 'default' } } }
    });
    res.status(200).json({ success: true, response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
