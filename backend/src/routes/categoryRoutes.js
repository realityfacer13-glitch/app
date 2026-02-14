const express = require('express');
const { db } = require('../config/firebase');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('categories').orderBy('name').get();
    const categories = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return res.json({ categories });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

module.exports = router;
