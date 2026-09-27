const Notice = require('../models/Notice');
const { logActivity } = require('../utils/logger');
const { notifySociety } = require('../utils/notifier');

// @desc    Get notices for society
// @route   GET /api/notices
// @access  Private
const getNotices = async (req, res) => {
  try {
    const query = {};

    if (req.user.role !== 'super_admin') {
      query.societyId = req.user.societyId;
    }

    const notices = await Notice.find(query)
      .populate('createdBy', 'name email role')
      .sort({ isPinned: -1, createdAt: -1 });

    res.json({
      success: true,
      count: notices.length,
      data: notices,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Create a notice
// @route   POST /api/notices
// @access  Private (Secretary only)
const createNotice = async (req, res) => {
  try {
    const { title, content, category, priority, isPinned, attachments, expiresAt } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Please provide title and content' });
    }

    if (!req.user.societyId) {
      return res.status(400).json({ success: false, message: 'No society assigned' });
    }

    const notice = await Notice.create({
      title,
      content,
      category: category || 'General',
      priority: priority || 'Normal',
      isPinned: !!isPinned,
      attachments: attachments || [],
      expiresAt: expiresAt || null,
      societyId: req.user.societyId,
      createdBy: req.user._id,
    });

    // Notify all residents
    await notifySociety({
      societyId: req.user.societyId,
      title: `Notice: ${title}`,
      message: `${content.substring(0, 80)}...`,
      type: priority === 'Urgent' ? 'warning' : 'info',
      link: '/notices',
    });

    await logActivity({
      societyId: req.user.societyId,
      userId: req.user._id,
      action: 'Notice Created',
      details: `New notice published: "${title}" (${category || 'General'})`,
      ipAddress: req.ip,
    });

    const populated = await Notice.findById(notice._id).populate('createdBy', 'name email role');

    res.status(201).json({
      success: true,
      message: 'Notice published successfully',
      data: populated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Update a notice
// @route   PUT /api/notices/:id
// @access  Private (Secretary only)
const updateNotice = async (req, res) => {
  try {
    const { id } = req.params;
    const notice = await Notice.findById(id);

    if (!notice) {
      return res.status(404).json({ success: false, message: 'Notice not found' });
    }

    if (req.user.role !== 'super_admin' && notice.societyId.toString() !== req.user.societyId?.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { title, content, category, priority, isPinned, attachments, expiresAt } = req.body;

    if (title) notice.title = title;
    if (content) notice.content = content;
    if (category) notice.category = category;
    if (priority) notice.priority = priority;
    if (isPinned !== undefined) notice.isPinned = isPinned;
    if (attachments !== undefined) notice.attachments = attachments;
    if (expiresAt !== undefined) notice.expiresAt = expiresAt;

    await notice.save();

    await logActivity({
      societyId: notice.societyId,
      userId: req.user._id,
      action: 'Notice Updated',
      details: `Notice updated: "${notice.title}"`,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Notice updated successfully',
      data: notice,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Delete a notice
// @route   DELETE /api/notices/:id
// @access  Private (Secretary only)
const deleteNotice = async (req, res) => {
  try {
    const { id } = req.params;
    const notice = await Notice.findById(id);

    if (!notice) {
      return res.status(404).json({ success: false, message: 'Notice not found' });
    }

    if (req.user.role !== 'super_admin' && notice.societyId.toString() !== req.user.societyId?.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Notice.findByIdAndDelete(id);

    await logActivity({
      societyId: notice.societyId,
      userId: req.user._id,
      action: 'Notice Deleted',
      details: `Deleted notice: "${notice.title}"`,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Notice deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

module.exports = {
  getNotices,
  createNotice,
  updateNotice,
  deleteNotice,
};
