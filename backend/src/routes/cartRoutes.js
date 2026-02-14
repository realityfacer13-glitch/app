const express = require('express');
const { body, param } = require('express-validator');
const { admin, db } = require('../config/firebase');
const { requireAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.use(requireAuth);

router.get('/', async (req, res) => {
  const cartRef = db.collection('carts').doc(req.user.uid);
  const cartSnap = await cartRef.get();

  if (!cartSnap.exists) {
    return res.json({ items: [], total: 0 });
  }

  return res.json(cartSnap.data());
});

router.post(
  '/items',
  [body('productId').isString().notEmpty(), body('quantity').isInt({ min: 1 })],
  validate,
  async (req, res) => {
    try {
      const { productId, quantity } = req.body;
      const productSnap = await db.collection('products').doc(productId).get();
      if (!productSnap.exists) {
        return res.status(404).json({ error: 'Product not found' });
      }

      const product = productSnap.data();
      const cartRef = db.collection('carts').doc(req.user.uid);
      const cartSnap = await cartRef.get();
      const cart = cartSnap.exists ? cartSnap.data() : { items: [], total: 0 };

      const existing = cart.items.find((i) => i.productId === productId);
      if (existing) {
        existing.quantity += quantity;
        existing.price = product.price;
      } else {
        cart.items.push({
          productId,
          name: product.name,
          quantity,
          price: product.price,
          unit: product.unit,
          imageUrl: product.imageUrl
        });
      }

      cart.total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      cart.updatedAt = admin.firestore.FieldValue.serverTimestamp();
      await cartRef.set(cart);
      return res.status(201).json(cart);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to update cart' });
    }
  }
);

router.patch(
  '/items/:productId',
  [param('productId').isString().notEmpty(), body('quantity').isInt({ min: 1 })],
  validate,
  async (req, res) => {
    const cartRef = db.collection('carts').doc(req.user.uid);
    const cartSnap = await cartRef.get();
    if (!cartSnap.exists) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    const cart = cartSnap.data();
    const item = cart.items.find((entry) => entry.productId === req.params.productId);
    if (!item) {
      return res.status(404).json({ error: 'Item not found in cart' });
    }

    item.quantity = req.body.quantity;
    cart.total = cart.items.reduce((sum, entry) => sum + entry.price * entry.quantity, 0);
    cart.updatedAt = admin.firestore.FieldValue.serverTimestamp();
    await cartRef.set(cart);

    return res.json(cart);
  }
);

router.delete('/items/:productId', [param('productId').isString().notEmpty()], validate, async (req, res) => {
  const cartRef = db.collection('carts').doc(req.user.uid);
  const cartSnap = await cartRef.get();
  if (!cartSnap.exists) {
    return res.status(404).json({ error: 'Cart not found' });
  }

  const cart = cartSnap.data();
  cart.items = cart.items.filter((entry) => entry.productId !== req.params.productId);
  cart.total = cart.items.reduce((sum, entry) => sum + entry.price * entry.quantity, 0);
  cart.updatedAt = admin.firestore.FieldValue.serverTimestamp();
  await cartRef.set(cart);

  return res.json(cart);
});

module.exports = router;
