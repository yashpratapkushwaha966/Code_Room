const express = require('express');
const { getMyFavorites, addFavorite, removeFavorite } = require('../controllers/favoriteController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // every favorites endpoint requires a logged-in user

router.get('/', getMyFavorites);
router.post('/:propertyId', addFavorite);
router.delete('/:propertyId', removeFavorite);

module.exports = router;
