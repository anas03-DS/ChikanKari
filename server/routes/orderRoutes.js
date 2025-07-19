const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrderById,
  updateOrderToPaid,
  updateOrderStatus,
  getMyOrders,
  getArtisanOrders,
  getOrders,
} = require('../controllers/orderController');
const { protect, authorize, isApprovedArtisan } = require('../middleware/authMiddleware');

// Customer routes
router.route('/')
  .post(protect, authorize('customer'), createOrder)
  .get(protect, authorize('admin'), getOrders);

router.get('/myorders', protect, authorize('customer'), getMyOrders);

// Artisan routes
router.get('/artisan', protect, authorize('artisan'), isApprovedArtisan, getArtisanOrders);

// Shared routes
router.get('/:id', protect, getOrderById);

// Customer-only routes
router.put('/:id/pay', protect, authorize('customer'), updateOrderToPaid);

// Artisan/Admin routes
router.put('/:id/status', protect, authorize('artisan', 'admin'), updateOrderStatus);

module.exports = router; 