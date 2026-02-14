const express = require('express');
const { query, body } = require('express-validator');
const { admin, db } = require('../config/firebase');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.get('/', [query('categoryId').optional().isString()], validate, async (req, res) => {
  try {
    let ref = db.collection('products').where('isActive', '==', true);
    if (req.query.categoryId) {
      ref = ref.where('categoryId', '==', req.query.categoryId);
    }

    const snapshot = await ref.get();
    const products = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return res.json({ products });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch products' });
  }
});

router.post(
  '/',
  requireAuth,
  requireAdmin,
  [
    body('name').isString().isLength({ min: 2 }),
    body('categoryId').isString().notEmpty(),
    body('price').isFloat({ gt: 0 }),
    body('unit').isString().notEmpty(),
    body('imageUrl').isString().isURL(),
    body('stock').isInt({ min: 0 })
  ],
  validate,
  async (req, res) => {
    try {
      const payload = {
        ...req.body,
        isActive: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      const ref = await db.collection('products').add(payload);
      return res.status(201).json({ id: ref.id, ...payload });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to create product' });
    }
  }
);

router.patch(
  '/:productId',
  requireAuth,
  requireAdmin,
  [body('price').optional().isFloat({ gt: 0 }), body('stock').optional().isInt({ min: 0 })],
  validate,
  async (req, res) => {
    try {
      await db.collection('products').doc(req.params.productId).set(
        { ...req.body, updatedAt: admin.firestore.FieldValue.serverTimestamp() },
        { merge: true }
      );
      return res.json({ message: 'Product updated' });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to update product' });
    }
  }
);

module.exports = router;
