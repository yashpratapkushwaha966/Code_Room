const express = require('express');
const {
  getUsers,
  setUserSuspended,
  getPendingProperties,
  setPropertyVerification,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect, authorize('admin')); // everything in this router is admin-only

router.get('/users', getUsers);
router.put('/users/:id/suspend', setUserSuspended);
router.get('/properties/pending', getPendingProperties);
router.put('/properties/:id/verify', setPropertyVerification);

module.exports = router;
