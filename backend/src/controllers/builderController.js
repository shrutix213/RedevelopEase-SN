const Builder = require('../models/Builder');
const User = require('../models/User');
const Society = require('../models/Society');
const { logActivity } = require('../utils/logger');

// @desc    Get all builders
// @route   GET /api/builders
// @access  Private
const getBuilders = async (req, res) => {
  try {
    const builders = await Builder.find().populate('assignedSocieties', 'name city totalFlats redevelopmentInfo');
    res.json({ success: true, count: builders.length, data: builders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Create builder profile & user login account (Super Admin)
// @route   POST /api/builders
// @access  Private (Super Admin)
const createBuilder = async (req, res) => {
  try {
    const { name, companyName, email, phone, reraNumber, experienceYears, completedProjects, password, address, website } = req.body;

    if (!name || !companyName || !email || !reraNumber) {
      return res.status(400).json({ success: false, message: 'Please provide company name, contact person, email, and RERA number' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    // 1. Create Builder user login
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: password || 'builder123',
      role: 'builder',
      accountStatus: 'approved',
      builderCompany: companyName,
      phone: phone || '',
    });

    // 2. Create Builder record
    const builder = await Builder.create({
      name,
      companyName,
      email: email.toLowerCase(),
      phone: phone || '',
      reraNumber,
      experienceYears: experienceYears ? Number(experienceYears) : 10,
      completedProjects: completedProjects ? Number(completedProjects) : 5,
      userId: user._id,
      address: address || '',
      website: website || '',
    });

    await logActivity({
      userId: req.user._id,
      action: 'Builder Enrolled',
      details: `Super Admin registered builder partner: ${companyName} (RERA: ${reraNumber})`,
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: 'Builder registered and login credentials activated successfully!',
      data: builder,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Assign builder to society
// @route   PUT /api/builders/:id/assign
// @access  Private (Super Admin, Secretary)
const assignSociety = async (req, res) => {
  try {
    const { id } = req.params;
    const { societyId, agreementDate, completionDate } = req.body;

    const builder = await Builder.findById(id);
    const society = await Society.findById(societyId);

    if (!builder || !society) {
      return res.status(404).json({ success: false, message: 'Builder or Society not found' });
    }

    if (!builder.assignedSocieties.includes(society._id)) {
      builder.assignedSocieties.push(society._id);
      await builder.save();
    }

    // Update Society redevelopment info
    society.redevelopmentInfo.builderId = builder._id;
    society.redevelopmentInfo.builderUserId = builder.userId;
    society.redevelopmentInfo.builderName = builder.companyName;
    society.redevelopmentInfo.reraNumber = builder.reraNumber;
    if (agreementDate) society.redevelopmentInfo.agreementDate = agreementDate;
    if (completionDate) society.redevelopmentInfo.completionDate = completionDate;
    society.redevelopmentInfo.status = 'Builder Appointed';
    await society.save();

    // Also link builder user to this society
    if (builder.userId) {
      await User.findByIdAndUpdate(builder.userId, { societyId: society._id });
    }

    res.json({
      success: true,
      message: `${builder.companyName} assigned to ${society.name} successfully`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

module.exports = {
  getBuilders,
  createBuilder,
  assignSociety,
};
