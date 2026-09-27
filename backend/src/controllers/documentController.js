const Document = require('../models/Document');
const { logActivity } = require('../utils/logger');
const { notifySociety } = require('../utils/notifier');

// @desc    Get documents
// @route   GET /api/documents
// @access  Private
const getDocuments = async (req, res) => {
  try {
    const { category, search } = req.query;
    const query = {};

    if (req.user.role !== 'super_admin') {
      query.societyId = req.user.societyId;
    }

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { fileName: { $regex: search, $options: 'i' } },
      ];
    }

    // Role-based visibility check: document.accessRole contains user role or is empty
    if (req.user.role !== 'super_admin' && req.user.role !== 'secretary') {
      query.$or = [
        { accessRole: { $in: [req.user.role] } },
        { accessRole: { $size: 0 } },
        { accessRole: { $exists: false } },
      ];
    }

    const documents = await Document.find(query)
      .populate('uploadedBy', 'name email role')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: documents.length,
      data: documents,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Upload new document
// @route   POST /api/documents
// @access  Private (Secretary, Builder, Super Admin)
const uploadDocument = async (req, res) => {
  try {
    const { title, category, description, accessRole, customUrl, fileSize, fileType } = req.body;

    if (!title || !category) {
      return res.status(400).json({ success: false, message: 'Please provide title and category' });
    }

    let fileUrl = customUrl || '';
    let resolvedFileName = '';
    let resolvedFileSize = fileSize || '1.5 MB';
    let resolvedFileType = fileType || 'pdf';

    if (req.file) {
      fileUrl = `/uploads/${req.file.filename}`;
      resolvedFileName = req.file.originalname;
      resolvedFileSize = `${(req.file.size / (1024 * 1024)).toFixed(2)} MB`;
      resolvedFileType = req.file.mimetype.split('/')[1] || 'document';
    }

    if (!fileUrl) {
      fileUrl = `/uploads/sample-${category.toLowerCase()}-agreement.pdf`;
      resolvedFileName = `${title.toLowerCase().replace(/\s+/g, '-')}.pdf`;
    }

    const targetSocietyId = req.body.societyId || req.user.societyId;
    if (!targetSocietyId) {
      return res.status(400).json({ success: false, message: 'Society ID is required' });
    }

    let parsedRoles = ['secretary', 'committee_member', 'resident', 'builder', 'super_admin'];
    if (accessRole) {
      parsedRoles = Array.isArray(accessRole) ? accessRole : JSON.parse(accessRole);
    }

    const doc = await Document.create({
      title,
      category,
      fileUrl,
      fileName: resolvedFileName || `${title}.pdf`,
      fileSize: resolvedFileSize,
      fileType: resolvedFileType,
      societyId: targetSocietyId,
      uploadedBy: req.user._id,
      accessRole: parsedRoles,
      description: description || '',
    });

    // Notify society members
    await notifySociety({
      societyId: targetSocietyId,
      title: `New Document Uploaded: ${title}`,
      message: `A new ${category} document is available in the society repository.`,
      type: 'info',
      link: '/documents',
    });

    await logActivity({
      societyId: targetSocietyId,
      userId: req.user._id,
      action: 'Document Uploaded',
      details: `${req.user.name} uploaded ${category} document "${title}"`,
      ipAddress: req.ip,
    });

    const populated = await Document.findById(doc._id).populate('uploadedBy', 'name role');

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: populated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Delete document
// @route   DELETE /api/documents/:id
// @access  Private (Secretary, Super Admin)
const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Document.findById(id);

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    if (req.user.role !== 'super_admin' && doc.societyId.toString() !== req.user.societyId?.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Document.findByIdAndDelete(id);

    await logActivity({
      societyId: doc.societyId,
      userId: req.user._id,
      action: 'Document Deleted',
      details: `Deleted document: "${doc.title}"`,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Document deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

module.exports = {
  getDocuments,
  uploadDocument,
  deleteDocument,
};
