const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Society = require('../models/Society');
const { logActivity } = require('../utils/logger');
const { sendNotification } = require('../utils/notifier');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'redevelopease_jwt_secret_2026_super_secure', {
    expiresIn: '30d',
  });
};

// @desc    Register a new resident
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password, societyId, wing, flatNumber, phone } = req.body;

    if (!name || !email || !password || !societyId) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const society = await Society.findById(societyId);
    if (!society) {
      return res.status(404).json({ success: false, message: 'Selected society not found' });
    }

    // Role is strictly enforced as resident with pending status
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: 'resident',
      accountStatus: 'pending',
      societyId,
      wing: wing || '',
      flatNumber: flatNumber || '',
      phone: phone || '',
    });

    // Notify Secretary
    if (society.secretaryId) {
      await sendNotification({
        userId: society.secretaryId,
        title: 'New Resident Approval Required',
        message: `${name} has registered for Flat ${flatNumber || 'N/A'}, Wing ${wing || 'N/A'}. Approval required.`,
        type: 'warning',
        link: '/residents',
      });
    }

    // Log Activity
    await logActivity({
      societyId,
      userId: user._id,
      action: 'Resident Registration Submitted',
      details: `${name} (${email}) registered for Flat ${flatNumber} ${wing}`,
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: 'Registration submitted successfully! Your account is pending approval by your Society Secretary.',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        accountStatus: user.accountStatus,
      },
    });
  } catch (error) {
    console.error('[Register Error]', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password').populate('societyId');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.accountStatus === 'pending') {
      return res.status(403).json({
        success: false,
        isPending: true,
        message: 'Your registration is still pending approval by your Society Secretary.',
      });
    }

    if (user.accountStatus === 'rejected') {
      return res.status(403).json({
        success: false,
        message: 'Your registration request was rejected by the Society Secretary.',
      });
    }

    if (user.accountStatus === 'deactivated') {
      return res.status(403).json({
        success: false,
        message: 'Your account is deactivated. Please contact society administration.',
      });
    }

    const token = generateToken(user._id);

    // Log login activity
    await logActivity({
      societyId: user.societyId ? user.societyId._id : null,
      userId: user._id,
      action: 'User Logged In',
      details: `${user.name} logged in (${user.role})`,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        accountStatus: user.accountStatus,
        societyId: user.societyId,
        wing: user.wing,
        flatNumber: user.flatNumber,
        phone: user.phone,
        builderCompany: user.builderCompany,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error('[Login Error]', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('societyId');
    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { name, phone, wing, flatNumber, avatar, password } = req.body;

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (wing !== undefined) user.wing = wing;
    if (flatNumber !== undefined) user.flatNumber = flatNumber;
    if (avatar) user.avatar = avatar;

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
      }
      user.password = password;
    }

    await user.save();

    const updatedUser = await User.findById(req.user._id).populate('societyId');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

module.exports = { register, login, getMe, updateProfile };
