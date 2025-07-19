const express = require('express');
const router = express.Router();
const {
  registerArtisan,
  loginArtisan,
  getArtisanProfile,
  updateArtisanProfile,
  uploadArtisanImage,
  uploadArtisanCover,
  getArtisans,
  getArtisanById,
  getArtisansAdmin,
  approveArtisan,
  deleteArtisan,
} = require('../controllers/artisanController');
const { protect, authorize, isApprovedArtisan } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

// Public routes
router.post('/', registerArtisan);
router.post('/login', loginArtisan);
router.get('/', getArtisans);
router.get('/:id', getArtisanById);

// Protected artisan routes
router.route('/profile')
  .get(protect, authorize('artisan'), getArtisanProfile)
  .put(protect, authorize('artisan'), updateArtisanProfile);

router.post(
  '/profile/image',
  protect,
  authorize('artisan'),
  upload.single('image'),
  uploadArtisanImage
);

router.post(
  '/profile/cover',
  protect,
  authorize('artisan'),
  upload.single('image'),
  uploadArtisanCover
);

// Admin routes
router.get(
  '/admin/all',
  protect,
  authorize('admin'),
  getArtisansAdmin
);

router.put(
  '/:id/approve',
  protect,
  authorize('admin'),
  approveArtisan
);

router.delete(
  '/:id',
  protect,
  authorize('admin'),
  deleteArtisan
);

module.exports = router; 