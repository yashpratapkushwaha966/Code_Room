const asyncHandler = require('express-async-handler');
const multer = require('multer');
const { imageStorage, videoStorage } = require('../config/cloudinary');
const ApiError = require('../utils/ApiError');

const MAX_IMAGES = 8;

const imageUpload = multer({ storage: imageStorage, limits: { fileSize: 8 * 1024 * 1024 } }).array(
  'images',
  MAX_IMAGES
);
const videoUpload = multer({ storage: videoStorage, limits: { fileSize: 50 * 1024 * 1024 } }).single(
  'video'
);

// @desc    Upload up to 8 property images to Cloudinary
// @route   POST /api/upload/images
// @access  Private
const uploadImages = asyncHandler(async (req, res, next) => {
  imageUpload(req, res, (err) => {
    if (err) return next(new ApiError(400, err.message || 'Image upload failed'));
    if (!req.files || req.files.length === 0) return next(new ApiError(400, 'No images provided'));

    const images = req.files.map((f) => ({ url: f.path, publicId: f.filename }));
    res.status(201).json({ success: true, data: images });
  });
});

// @desc    Upload a single property video (walkthrough/reel) to Cloudinary
// @route   POST /api/upload/video
// @access  Private
const uploadVideo = asyncHandler(async (req, res, next) => {
  videoUpload(req, res, (err) => {
    if (err) return next(new ApiError(400, err.message || 'Video upload failed'));
    if (!req.file) return next(new ApiError(400, 'No video provided'));

    res.status(201).json({ success: true, data: { url: req.file.path, publicId: req.file.filename } });
  });
});

module.exports = { uploadImages, uploadVideo };