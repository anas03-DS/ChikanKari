const express = require('express');
const router = express.Router();
const {
  createPaymentIntent,
  stripeWebhook,
  updatePaymentStatus,
  getPaymentById,
  getPaymentMethods,
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { rawBodyParser } = require('../middleware/uploadMiddleware');

// Public routes
router.get('/methods', getPaymentMethods);

// Webhook route (must be raw body for Stripe signature verification)
router.post('/webhook', rawBodyParser, stripeWebhook);

// Protected routes
router.post('/create-payment-intent', protect, authorize('customer'), createPaymentIntent);
router.post('/update-payment-status', protect, authorize('customer'), updatePaymentStatus);
router.get('/:id', protect, getPaymentById);

module.exports = router; 