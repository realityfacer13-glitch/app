const express = require('express');
const { body, param } = require('express-validator');
const { admin, db } = require('../config/firebase');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.use(requireAuth);

router.post(
  '/',
  [body('deliveryAddress').isString().isLength({ min: 5 }), body('paymentMethod').equals('COD')],
  validate,
  async (req, res) => {
    try {
      const cartRef = db.collection('carts').doc(req.user.uid);
      const cartSnap = await cartRef.get();

      if (!cartSnap.exists || cartSnap.data().items.length === 0) {
        return res.status(400).json({ error: 'Cart is empty' });
      }

      const cart = cartSnap.data();
      const orderPayload = {
        userId: req.user.uid,
        items: cart.items,
        totalAmount: cart.total,
        paymentMethod: req.body.paymentMethod,
        status: 'PLACED',
        deliveryAddress: req.body.deliveryAddress,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      const orderRef = await db.collection('orders').add(orderPayload);
      await cartRef.set({ items: [], total: 0, updatedAt: admin.firestore.FieldValue.serverTimestamp() });

      return res.status(201).json({ orderId: orderRef.id, ...orderPayload });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to place order' });
    }
  }
);

router.get('/my', async (req, res) => {
  const snapshot = await db
    .collection('orders')
    .where('userId', '==', req.user.uid)
    .orderBy('createdAt', 'desc')
    .get();

  const orders = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  return res.json({ orders });
});

router.get('/admin/all', requireAdmin, async (req, res) => {
  const snapshot = await db.collection('orders').orderBy('createdAt', 'desc').get();
  return res.json({ orders: snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) });
});

router.patch(
  '/admin/:orderId/status',
  requireAdmin,
  [param('orderId').isString().notEmpty(), body('status').isIn(['PLACED', 'CONFIRMED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'])],
  validate,
  async (req, res) => {
    await db.collection('orders').doc(req.params.orderId).set(
      {
        status: req.body.status,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      },
      { merge: true }
    );

    return res.json({ message: 'Order status updated' });
  }
);

module.exports = router;
