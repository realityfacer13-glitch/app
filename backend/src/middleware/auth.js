const { auth, db } = require('../config/firebase');

async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ error: 'Missing auth token' });
    }

    const decoded = await auth.verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid auth token' });
  }
}

async function requireAdmin(req, res, next) {
  try {
    const userRef = db.collection('users').doc(req.user.uid);
    const userSnap = await userRef.get();

    if (!userSnap.exists || userSnap.data().role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    next();
  } catch (error) {
    return res.status(500).json({ error: 'Failed to verify admin role' });
  }
}

module.exports = { requireAuth, requireAdmin };
