const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage engine for property images
const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'rent-near-me/properties/images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1600, height: 1600, crop: 'limit', quality: 'auto' }],
  },
});

// Storage engine for property videos (reels)
const videoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'rent-near-me/properties/videos',
    resource_type: 'video',
    allowed_formats: ['mp4', 'mov', 'webm'],
  },
});

// Storage engine for user profile images
const profileImageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'rent-near-me/users/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'fill', gravity: 'face', quality: 'auto' }],
  },
});

module.exports = {
  cloudinary,
  imageStorage,
  videoStorage,
  profileImageStorage,
};
