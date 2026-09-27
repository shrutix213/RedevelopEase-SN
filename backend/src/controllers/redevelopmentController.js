const RedevelopmentUpdate = require('../models/RedevelopmentUpdate');
const Society = require('../models/Society');
const { logActivity } = require('../utils/logger');
const { sendNotification, notifySociety } = require('../utils/notifier');

// @desc    Get redevelopment updates for a society
// @route   GET /api/redevelopment
// @access  Private
const getRedevelopmentUpdates = async (req, res) => {
  try {
    const query = {};

    if (req.user.role === 'builder') {
      // Builder can view updates they uploaded or for societies assigned to them
      query.$or = [{ builderId: req.user._id }];
      if (req.user.societyId) {
        query.$or.push({ societyId: req.user.societyId });
      }
    } else if (req.user.role !== 'super_admin') {
      // Secretary, Committee Member, Resident view updates for their society
      query.societyId = req.user.societyId;
      // Residents only view approved updates
      if (req.user.role === 'resident') {
        query.status = 'approved';
      }
    }

    const updates = await RedevelopmentUpdate.find(query)
      .populate('builderId', 'name companyName email')
      .populate('approvedBy', 'name role')
      .populate('societyId', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: updates.length,
      data: updates,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Builder creates redevelopment progress update
// @route   POST /api/redevelopment
// @access  Private (Builder, Super Admin, Secretary)
const createRedevelopmentUpdate = async (req, res) => {
  try {
    const { societyId, title, description, progressPercentage, milestone, images, documents } = req.body;

    const targetSocietyId = societyId || req.user.societyId;
    if (!targetSocietyId) {
      return res.status(400).json({ success: false, message: 'Please specify the society' });
    }

    if (!title || !description || progressPercentage === undefined || !milestone) {
      return res.status(400).json({ success: false, message: 'Please provide all required milestone details' });
    }

    const society = await Society.findById(targetSocietyId);
    if (!society) {
      return res.status(404).json({ success: false, message: 'Society not found' });
    }

    // If Secretary uploads, can be auto-approved; if Builder uploads, status is pending_approval
    const isAutoApproved = req.user.role === 'secretary' || req.user.role === 'super_admin';

    const update = await RedevelopmentUpdate.create({
      societyId: targetSocietyId,
      builderId: req.user._id,
      title,
      description,
      progressPercentage: Number(progressPercentage),
      milestone,
      images: images || [],
      documents: documents || [],
      status: isAutoApproved ? 'approved' : 'pending_approval',
      approvedBy: isAutoApproved ? req.user._id : null,
      approvalDate: isAutoApproved ? new Date() : null,
    });

    if (isAutoApproved) {
      society.redevelopmentInfo.currentProgress = Number(progressPercentage);
      await society.save();

      await notifySociety({
        societyId: targetSocietyId,
        title: `Redevelopment Progress Update: ${milestone}`,
        message: `${title} - Overall completion is now at ${progressPercentage}%.`,
        type: 'success',
        link: '/redevelopment',
      });
    } else {
      // Notify Secretary for review
      if (society.secretaryId) {
        await sendNotification({
          userId: society.secretaryId,
          title: 'New Redevelopment Milestone Pending Approval',
          message: `Builder uploaded milestone "${milestone}" (${progressPercentage}%). Please review and approve.`,
          type: 'warning',
          link: '/redevelopment',
        });
      }
    }

    await logActivity({
      societyId: targetSocietyId,
      userId: req.user._id,
      action: 'Redevelopment Milestone Uploaded',
      details: `${req.user.name} submitted milestone "${milestone}" with progress ${progressPercentage}%`,
      ipAddress: req.ip,
    });

    const populated = await RedevelopmentUpdate.findById(update._id)
      .populate('builderId', 'name companyName')
      .populate('societyId', 'name');

    res.status(201).json({
      success: true,
      message: isAutoApproved
        ? 'Milestone update published successfully!'
        : 'Milestone update submitted! Awaiting Secretary verification and approval.',
      data: populated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Approve or reject redevelopment update
// @route   PUT /api/redevelopment/:id/review
// @access  Private (Secretary only)
const reviewRedevelopmentUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body; // 'approved' or 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status. Must be approved or rejected.' });
    }

    const update = await RedevelopmentUpdate.findById(id);
    if (!update) {
      return res.status(404).json({ success: false, message: 'Milestone update not found' });
    }

    if (req.user.role !== 'super_admin' && update.societyId.toString() !== req.user.societyId?.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized for this society' });
    }

    update.status = status;
    update.approvedBy = req.user._id;
    update.approvalDate = new Date();
    if (rejectionReason) update.rejectionReason = rejectionReason;

    await update.save();

    // If approved, update society currentProgress
    if (status === 'approved') {
      const society = await Society.findById(update.societyId);
      if (society) {
        society.redevelopmentInfo.currentProgress = update.progressPercentage;
        await society.save();
      }

      // Notify residents
      await notifySociety({
        societyId: update.societyId,
        title: `Milestone Verified: ${update.milestone}`,
        message: `Secretary verified milestone. Project progress is now ${update.progressPercentage}%.`,
        type: 'success',
        link: '/redevelopment',
      });
    }

    // Notify builder
    await sendNotification({
      userId: update.builderId,
      title: `Milestone ${status === 'approved' ? 'Approved' : 'Rejected'}`,
      message: `Your update "${update.title}" has been ${status} by the Society Secretary.${rejectionReason ? ' Note: ' + rejectionReason : ''}`,
      type: status === 'approved' ? 'success' : 'danger',
      link: '/redevelopment',
    });

    await logActivity({
      societyId: update.societyId,
      userId: req.user._id,
      action: `Redevelopment Update ${status === 'approved' ? 'Approved' : 'Rejected'}`,
      details: `Secretary ${status} milestone "${update.milestone}"`,
      ipAddress: req.ip,
    });

    const populated = await RedevelopmentUpdate.findById(id)
      .populate('builderId', 'name companyName')
      .populate('approvedBy', 'name role');

    res.json({
      success: true,
      message: `Milestone update ${status} successfully`,
      data: populated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

module.exports = {
  getRedevelopmentUpdates,
  createRedevelopmentUpdate,
  reviewRedevelopmentUpdate,
};
