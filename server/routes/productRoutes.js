const express = require('express');
const router = express.Router();
const {
  createProduct,
  updateProduct,
  addProductImages,
  getProducts,
  getFeaturedProducts,
  getProductById,
  getArtisanProducts,
  deleteProduct,
  createProductReview,
} = require('../controllers/productController');
const { protect, authorize, isApprovedArtisan } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

// Public routes
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/artisan/:id', getArtisanProducts);
router.get('/:id', getProductById);

// Protected routes
router.post(
  '/',
  protect,
  authorize('artisan'),
  isApprovedArtisan,
  upload.single('image'),
  createProduct
);

router.put(
  '/:id',
  protect,
  authorize('artisan', 'admin'),
  upload.single('image'),
  updateProduct
);

router.post(
  '/:id/images',
  protect,
  authorize('artisan'),
  isApprovedArtisan,
  upload.array('images', 5),
  addProductImages
);

router.post(
  '/:id/reviews',
  protect,
  authorize('customer'),
  createProductReview
);

router.delete(
  '/:id',
  protect,
  authorize('artisan', 'admin'),
  deleteProduct
);

module.exports = router; 