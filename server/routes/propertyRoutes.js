const express = require('express');
const {
  getProperties,
  getPropertyById,
  getMyProperties,
  createProperty,
  updateProperty,
  deleteProperty,
} = require('../controllers/propertyController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createPropertySchema, updatePropertySchema } = require('../utils/validators/propertyValidators');

const router = express.Router();

// IMPORTANT: /mine must be registered before /:id or Express will try to
// treat "mine" as an :id param.
router.get('/mine', protect, getMyProperties);

router.get('/', getProperties);
router.get('/:id', getPropertyById);

router.post('/', protect, validate(createPropertySchema), createProperty);
router.put('/:id', protect, validate(updatePropertySchema), updateProperty);
router.delete('/:id', protect, deleteProperty);

module.exports = router;
