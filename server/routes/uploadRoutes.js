const express = require('express');
const { uploadImages, uploadVideo } = require('../controllers/uploadController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/images', protect, uploadImages);
router.post('/video', protect, uploadVideo);

module.exports = router;
