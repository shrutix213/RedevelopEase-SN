const Society = require('../models/Society');
const User = require('../models/User');
const Builder = require('../models/Builder');
const Complaint = require('../models/Complaint');
const Notice = require('../models/Notice');
const Meeting = require('../models/Meeting');
const Document = require('../models/Document');
const RedevelopmentUpdate = require('../models/RedevelopmentUpdate');
const ActivityLog = require('../models/ActivityLog');
const { logActivity } = require('../utils/logger');
const { sendNotification } = require('../utils/notifier');

// @desc    Get all societies (Super Admin) or public list for registration dropdown
// @route   GET /api/societies
// @access  Public / Private
const getSocieties = async (req, res) => {
  try {
    // If public request (for registration dropdown), return minimal info
    if (!req.user || req.user.role === 'resident') {
      const societies = await Society.find().select('name address city pincode totalFlats');
      return res.json({ success: true, data: societies });
    }

    // Super Admin gets all societies with populated secretary
    if (req.user.role === 'super_admin') {
      const societies = await Society.find()
        .populate('secretaryId', 'name email phone')
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 });

      return res.json({ success: true, data: societies });
    }

    // Others get their own society
    if (req.user.societyId) {
      const society = await Society.findById(req.user.societyId).populate('secretaryId', 'name email phone');
      return res.json({ success: true, data: [society] });
    }

    res.json({ success: true, data: [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Get single society by ID
// @route   GET /api/societies/:id
// @access  Private
const getSocietyById = async (req, res) => {
  try {
    const { id } = req.params;

    // Check authorization: Super admin or member of this society
    if (req.user.role !== 'super_admin' && req.user.societyId?.toString() !== id) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this society' });
    }

    const society = await Society.findById(id)
      .populate('secretaryId', 'name email phone wing flatNumber')
      .populate('createdBy', 'name email')
      .populate('redevelopmentInfo.builderId', 'companyName name reraNumber email phone');

    if (!society) {
      return res.status(404).json({ success: false, message: 'Society not found' });
    }

    res.json({ success: true, data: society });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Create a new society with secretary (Super Admin only)
// @route   POST /api/societies
// @access  Private (Super Admin)
const createSociety = async (req, res) => {
  try {
    const {
      name,
      address,
      city,
      pincode,
      totalFlats,
      establishedYear,
      registrationNumber,
      societyType,
      secretaryName,
      secretaryEmail,
      temporaryPassword,
      secretaryPhone,
      secretaryWing,
      secretaryFlatNumber,
    } = req.body;

    if (!name || !address || !city || !pincode || !totalFlats) {
      return res.status(400).json({ success: false, message: 'Please provide all required society details' });
    }

    if (!secretaryName || !secretaryEmail || !temporaryPassword) {
      return res.status(400).json({ success: false, message: 'Please provide complete secretary details and password' });
    }

    const existingSecretary = await User.findOne({ email: secretaryEmail.toLowerCase() });
    if (existingSecretary) {
      return res.status(400).json({ success: false, message: 'An account with this secretary email already exists' });
    }

    // 1. Create Society first
    const society = await Society.create({
      name,
      address,
      city,
      pincode,
      totalFlats: Number(totalFlats),
      establishedYear: establishedYear ? Number(establishedYear) : null,
      registrationNumber: registrationNumber || '',
      societyType: societyType || 'Cooperative Housing Society (CHS)',
      createdBy: req.user._id,
    });

    // 2. Create Secretary User
    const secretary = await User.create({
      name: secretaryName,
      email: secretaryEmail.toLowerCase(),
      password: temporaryPassword,
      role: 'secretary',
      accountStatus: 'approved',
      societyId: society._id,
      wing: secretaryWing || 'A',
      flatNumber: secretaryFlatNumber || '101',
      phone: secretaryPhone || '',
    });

    // 3. Link Secretary to Society
    society.secretaryId = secretary._id;
    await society.save();

    // 4. Send notification to Secretary
    await sendNotification({
      userId: secretary._id,
      title: 'Welcome to RedevelopEase',
      message: `Your society '${society.name}' has been created. You are appointed as the Secretary.`,
      type: 'success',
      link: '/dashboard',
    });

    // 5. Audit log
    await logActivity({
      societyId: society._id,
      userId: req.user._id,
      action: 'Society Created',
      details: `Created '${society.name}' and linked secretary ${secretary.name} (${secretary.email})`,
      ipAddress: req.ip,
    });

    const populatedSociety = await Society.findById(society._id).populate('secretaryId', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Society and Secretary account created successfully!',
      data: populatedSociety,
    });
  } catch (error) {
    console.error('[Create Society Error]', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Update society profile / redevelopment info
// @route   PUT /api/societies/:id
// @access  Private (Super Admin or Secretary of this society)
const updateSociety = async (req, res) => {
  try {
    const { id } = req.params;

    // Check authorization: Super admin or Secretary of this society
    if (req.user.role !== 'super_admin' && (req.user.role !== 'secretary' || req.user.societyId?.toString() !== id)) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this society' });
    }

    const society = await Society.findById(id);
    if (!society) {
      return res.status(404).json({ success: false, message: 'Society not found' });
    }

    const {
      name,
      address,
      city,
      pincode,
      totalFlats,
      establishedYear,
      registrationNumber,
      societyType,
      redevelopmentInfo,
    } = req.body;

    if (name) society.name = name;
    if (address) society.address = address;
    if (city) society.city = city;
    if (pincode) society.pincode = pincode;
    if (totalFlats !== undefined) society.totalFlats = Number(totalFlats);
    if (establishedYear !== undefined) society.establishedYear = Number(establishedYear);
    if (registrationNumber !== undefined) society.registrationNumber = registrationNumber;
    if (societyType !== undefined) society.societyType = societyType;

    if (redevelopmentInfo) {
      society.redevelopmentInfo = {
        ...society.redevelopmentInfo.toObject(),
        ...redevelopmentInfo,
      };

      // If builder assigned, update builder assignedSocieties
      if (redevelopmentInfo.builderId) {
        await Builder.findByIdAndUpdate(redevelopmentInfo.builderId, {
          $addToSet: { assignedSocieties: society._id },
        });
      }
    }

    await society.save();

    await logActivity({
      societyId: society._id,
      userId: req.user._id,
      action: 'Society Profile Updated',
      details: `Society profile or redevelopment info updated by ${req.user.name}`,
      ipAddress: req.ip,
    });

    const updatedSociety = await Society.findById(id)
      .populate('secretaryId', 'name email phone')
      .populate('redevelopmentInfo.builderId', 'companyName name reraNumber');

    res.json({
      success: true,
      message: 'Society updated successfully',
      data: updatedSociety,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Delete society (Super Admin only)
// @route   DELETE /api/societies/:id
// @access  Private (Super Admin)
const deleteSociety = async (req, res) => {
  try {
    const { id } = req.params;

    const society = await Society.findById(id);
    if (!society) {
      return res.status(404).json({ success: false, message: 'Society not found' });
    }

    // Delete related records
    await User.deleteMany({ societyId: id });
    await Complaint.deleteMany({ societyId: id });
    await Notice.deleteMany({ societyId: id });
    await Meeting.deleteMany({ societyId: id });
    await Document.deleteMany({ societyId: id });
    await RedevelopmentUpdate.deleteMany({ societyId: id });
    await ActivityLog.deleteMany({ societyId: id });
    await Society.findByIdAndDelete(id);

    await logActivity({
      userId: req.user._id,
      action: 'Society Deleted',
      details: `Super Admin deleted society: ${society.name}`,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: `Society '${society.name}' and all associated records deleted successfully`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

module.exports = {
  getSocieties,
  getSocietyById,
  createSociety,
  updateSociety,
  deleteSociety,
};
