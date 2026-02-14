const express = require('express');
const { body } = require('express-validator');
const { admin, auth, db } = require('../config/firebase');
const { requireAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.post(
  '/verify',
  [body('idToken').isString().notEmpty()],
  validate,
  async (req, res) => {
    try {
      const { idToken } = req.body;
      const decoded = await auth.verifyIdToken(idToken);
      const userRef = db.collection('users').doc(decoded.uid);
      const snapshot = await userRef.get();

      if (!snapshot.exists) {
        await userRef.set({
          phone: decoded.phone_number || '',
          name: '',
          address: '',
          role: 'customer',
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }

      return res.json({
        message: 'Token verified',
        userId: decoded.uid,
        phone: decoded.phone_number || null
      });
    } catch (error) {
      return res.status(401).json({ error: 'Invalid Firebase token' });
    }
  }
);

router.get('/me', requireAuth, async (req, res) => {
  const snap = await db.collection('users').doc(req.user.uid).get();
  if (!snap.exists) {
    return res.status(404).json({ error: 'User not found' });
  }

  return res.json({ id: snap.id, ...snap.data() });
});

module.exports = router;
