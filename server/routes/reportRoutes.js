const express = require('express');
const { createReport, getReports, updateReportStatus } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createReportSchema, updateReportStatusSchema } = require('../utils/validators/reportValidators');

const router = express.Router();

router.post('/', protect, validate(createReportSchema), createReport);
router.get('/', protect, authorize('admin'), getReports);
router.put('/:id', protect, authorize('admin'), validate(updateReportStatusSchema), updateReportStatus);

module.exports = router;
