const express = require('express');
const BannerController = require('../controllers/bannerController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');
const { upload, handleMulterError } = require('../middleware/upload');

const router = express.Router();

// Public routes (Customer app)
router.get('/', BannerController.getBanners);
router.get('/:bannerId', BannerController.getBannerById);
router.post('/:bannerId/view', BannerController.trackBannerView);
router.post('/:bannerId/click', BannerController.trackBannerClick);

// Admin routes (Super Admin & Outlet Admin)

// Upload image AND create banner in one step (RECOMMENDED)
router.post('/upload-and-create',
  authenticate,
  authorize(['super_admin', 'outlet_admin']),
  upload.single('image'),
  handleMulterError,
  BannerController.uploadAndCreateBanner
);

// Upload banner image only (for separate workflow)
router.post('/upload-image',
  authenticate,
  authorize(['super_admin', 'outlet_admin']),
  upload.single('image'),
  handleMulterError,
  BannerController.uploadBannerImage
);

// Delete banner image from storage
router.delete('/delete-image',
  authenticate,
  authorize(['super_admin', 'outlet_admin']),
  BannerController.deleteBannerImage
);

router.post('/',
  authenticate,
  authorize(['super_admin', 'outlet_admin']),
  validate(schemas.banner),
  BannerController.createBanner
);

router.put('/:bannerId',
  authenticate,
  authorize(['super_admin', 'outlet_admin']),
  validate(schemas.bannerUpdate),
  BannerController.updateBanner
);

router.delete('/:bannerId',
  authenticate,
  authorize(['super_admin', 'outlet_admin']),
  BannerController.deleteBanner
);

router.patch('/:bannerId/toggle',
  authenticate,
  authorize(['super_admin', 'outlet_admin']),
  validate(schemas.toggleBannerStatus),
  BannerController.toggleBannerStatus
);

router.get('/:bannerId/analytics',
  authenticate,
  authorize(['super_admin', 'outlet_admin']),
  BannerController.getBannerAnalytics
);

module.exports = router;
