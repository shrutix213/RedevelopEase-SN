const express = require('express');
const router = express.Router();
const {
  getDocuments,
  uploadDocument,
  deleteDocument,
} = require('../controllers/documentController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const upload = require('../middleware/upload');

router.get('/', protect, getDocuments);
router.post('/', protect, authorize('secretary', 'builder', 'super_admin'), upload.single('file'), uploadDocument);
router.delete('/:id', protect, authorize('secretary', 'super_admin'), deleteDocument);

module.exports = router;
