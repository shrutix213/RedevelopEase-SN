const User = require('../models/User');
const Society = require('../models/Society');
const { logActivity } = require('../utils/logger');
const { sendNotification } = require('../utils/notifier');

// @desc    Get residents of current society
// @route   GET /api/residents
// @access  Private (Secretary, Committee Member, Super Admin)
const getResidents = async (req, res) => {
  try {
    const { status, role, wing, search, societyId } = req.query;

    let targetSocietyId = req.user.societyId;
    if (req.user.role === 'super_admin' && societyId) {
      targetSocietyId = societyId;
    }

    const query = {};

    if (targetSocietyId) {
      query.societyId = targetSocietyId;
    }

    // Filter by status
    if (status) {
      query.accountStatus = status;
    }

    // Filter by role
    if (role) {
      query.role = role;
    } else if (req.user.role !== 'super_admin') {
      // Secretary and Committee member manage residents and committee members
      query.role = { $in: ['resident', 'committee_member'] };
    }

    // Filter by wing
    if (wing) {
      query.wing = wing;
    }

    // Search by name, email, flat number
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { flatNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const residents = await User.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: residents.length,
      data: residents,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Approve a pending resident
// @route   PUT /api/residents/:id/approve
// @access  Private (Secretary only)
const approveResident = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'Resident not found' });
    }

    // Validate that secretary belongs to the same society
    if (req.user.role !== 'super_admin' && user.societyId?.toString() !== req.user.societyId?.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to approve residents of another society' });
    }

    user.accountStatus = 'approved';
    await user.save();

    // Send notification to Resident
    await sendNotification({
      userId: user._id,
      title: 'Registration Approved 🎉',
      message: 'Your society registration has been approved. You can now access all portal features.',
      type: 'success',
      link: '/dashboard',
    });

    // Audit Log
    await logActivity({
      societyId: user.societyId,
      userId: req.user._id,
      action: 'Resident Approved',
      details: `Secretary approved resident registration for ${user.name} (Flat ${user.flatNumber} ${user.wing})`,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: `${user.name} has been approved successfully!`,
      data: user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Reject a pending resident
// @route   PUT /api/residents/:id/reject
// @access  Private (Secretary only)
const rejectResident = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'Resident not found' });
    }

    if (req.user.role !== 'super_admin' && user.societyId?.toString() !== req.user.societyId?.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized for this society' });
    }

    user.accountStatus = 'rejected';
    await user.save();

    await sendNotification({
      userId: user._id,
      title: 'Registration Rejected',
      message: `Your registration request was rejected. Reason: ${reason || 'Details could not be verified by society management.'}`,
      type: 'danger',
    });

    await logActivity({
      societyId: user.societyId,
      userId: req.user._id,
      action: 'Resident Registration Rejected',
      details: `Secretary rejected ${user.name}. Reason: ${reason || 'N/A'}`,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: `Resident registration for ${user.name} has been rejected.`,
      data: user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Update resident details / promote to committee member
// @route   PUT /api/residents/:id
// @access  Private (Secretary only)
const updateResident = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'Resident not found' });
    }

    if (user.societyId?.toString() !== req.user.societyId?.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized for this society' });
    }

    const { name, phone, wing, flatNumber, role, accountStatus } = req.body;

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (wing !== undefined) user.wing = wing;
    if (flatNumber !== undefined) user.flatNumber = flatNumber;
    
    // Can switch between 'resident' and 'committee_member'
    if (role && ['resident', 'committee_member'].includes(role)) {
      user.role = role;
    }

    if (accountStatus && ['approved', 'deactivated', 'pending'].includes(accountStatus)) {
      user.accountStatus = accountStatus;
    }

    await user.save();

    await logActivity({
      societyId: user.societyId,
      userId: req.user._id,
      action: 'Resident Record Updated',
      details: `Updated resident ${user.name} (Role: ${user.role}, Status: ${user.accountStatus})`,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Resident updated successfully',
      data: user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Deactivate or Delete resident
// @route   DELETE /api/residents/:id
// @access  Private (Secretary only)
const deleteResident = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'Resident not found' });
    }

    if (user.societyId?.toString() !== req.user.societyId?.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized for this society' });
    }

    // Soft deactivate or delete
    user.accountStatus = 'deactivated';
    await user.save();

    await logActivity({
      societyId: user.societyId,
      userId: req.user._id,
      action: 'Resident Deactivated',
      details: `Secretary deactivated account of ${user.name}`,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: `Account of ${user.name} has been deactivated.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

module.exports = {
  getResidents,
  approveResident,
  rejectResident,
  updateResident,
  deleteResident,
};
