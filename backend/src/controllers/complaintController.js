const Complaint = require('../models/Complaint');
const Society = require('../models/Society');
const { logActivity } = require('../utils/logger');
const { sendNotification } = require('../utils/notifier');

// @desc    Get complaints
// @route   GET /api/complaints
// @access  Private
const getComplaints = async (req, res) => {
  try {
    const { status, category, priority } = req.query;
    const query = {};

    // Filter by society
    if (req.user.role !== 'super_admin') {
      query.societyId = req.user.societyId;
    }

    // Resident can view their own complaints or all public complaints in their society
    if (req.user.role === 'resident') {
      // Allow viewing all complaints in society with priority on their own
      // or filter by my complaints if specified
      if (req.query.mine === 'true') {
        query.residentId = req.user._id;
      }
    }

    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;

    const complaints = await Complaint.find(query)
      .populate('residentId', 'name email wing flatNumber phone')
      .populate('assignedTo', 'name email phone role')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: complaints.length,
      data: complaints,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Create a new complaint
// @route   POST /api/complaints
// @access  Private (Resident, Committee Member)
const createComplaint = async (req, res) => {
  try {
    const { title, description, category, priority, attachments } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Please provide title and description' });
    }

    if (!req.user.societyId) {
      return res.status(400).json({ success: false, message: 'You are not assigned to any society' });
    }

    const complaint = await Complaint.create({
      title,
      description,
      category: category || 'General',
      priority: priority || 'Medium',
      residentId: req.user._id,
      societyId: req.user.societyId,
      attachments: attachments || [],
      status: 'Open',
    });

    // Notify Secretary
    const society = await Society.findById(req.user.societyId);
    if (society && society.secretaryId) {
      await sendNotification({
        userId: society.secretaryId,
        title: 'New Complaint Raised',
        message: `${req.user.name} (Flat ${req.user.flatNumber || ''}) submitted: "${title}"`,
        type: 'warning',
        link: '/complaints',
      });
    }

    await logActivity({
      societyId: req.user.societyId,
      userId: req.user._id,
      action: 'Complaint Raised',
      details: `New complaint: "${title}" by ${req.user.name}`,
      ipAddress: req.ip,
    });

    const populated = await Complaint.findById(complaint._id).populate('residentId', 'name email wing flatNumber');

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully',
      data: populated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Update complaint status / assign / add resolution notes
// @route   PUT /api/complaints/:id
// @access  Private (Secretary, Committee Member)
const updateComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    if (req.user.role !== 'super_admin' && complaint.societyId.toString() !== req.user.societyId?.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized for this complaint' });
    }

    const { status, assignedTo, resolutionNotes, priority } = req.body;

    if (status) complaint.status = status;
    if (assignedTo !== undefined) complaint.assignedTo = assignedTo;
    if (resolutionNotes !== undefined) complaint.resolutionNotes = resolutionNotes;
    if (priority) complaint.priority = priority;

    await complaint.save();

    // Notify Resident
    if (status) {
      await sendNotification({
        userId: complaint.residentId,
        title: `Complaint Updated: ${status}`,
        message: `Your complaint "${complaint.title}" status changed to ${status}.${resolutionNotes ? ' Note: ' + resolutionNotes : ''}`,
        type: status === 'Resolved' ? 'success' : status === 'Rejected' ? 'danger' : 'info',
        link: '/complaints',
      });
    }

    await logActivity({
      societyId: complaint.societyId,
      userId: req.user._id,
      action: 'Complaint Status Updated',
      details: `Complaint "${complaint.title}" updated to status: ${complaint.status} by ${req.user.name}`,
      ipAddress: req.ip,
    });

    const updated = await Complaint.findById(id)
      .populate('residentId', 'name email wing flatNumber phone')
      .populate('assignedTo', 'name email phone role');

    res.json({
      success: true,
      message: 'Complaint updated successfully',
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

module.exports = {
  getComplaints,
  createComplaint,
  updateComplaint,
};
