const RentRequest = require('../models/RentRequest');
const VacatingRequest = require('../models/VacatingRequest');
const { logActivity } = require('../utils/logger');
const { sendNotification } = require('../utils/notifier');

// ---------- RENT REQUESTS ----------

// @desc    Get rent requests
// @route   GET /api/rent-requests
// @access  Private
const getRentRequests = async (req, res) => {
  try {
    const query = {};

    if (req.user.role === 'resident') {
      query.residentId = req.user._id;
    } else if (req.user.role !== 'super_admin') {
      query.societyId = req.user.societyId;
    }

    const requests = await RentRequest.find(query)
      .populate('residentId', 'name email phone wing flatNumber')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: requests.length, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Create rent reimbursement request
// @route   POST /api/rent-requests
// @access  Private (Resident)
const createRentRequest = async (req, res) => {
  try {
    const { monthlyAmount, bankDetails, rentalAgreementUrl, remarks } = req.body;

    if (!monthlyAmount || !bankDetails?.accountNumber || !bankDetails?.ifscCode) {
      return res.status(400).json({ success: false, message: 'Please provide monthly rent amount and complete bank details' });
    }

    if (!req.user.societyId) {
      return res.status(400).json({ success: false, message: 'No society assigned' });
    }

    const request = await RentRequest.create({
      societyId: req.user.societyId,
      residentId: req.user._id,
      flatNumber: req.user.flatNumber || 'N/A',
      wing: req.user.wing || 'N/A',
      monthlyAmount: Number(monthlyAmount),
      bankDetails,
      rentalAgreementUrl: rentalAgreementUrl || '',
      remarks: remarks || '',
      status: 'Submitted',
    });

    await logActivity({
      societyId: req.user.societyId,
      userId: req.user._id,
      action: 'Rent Request Submitted',
      details: `${req.user.name} submitted rent request of ₹${monthlyAmount}/month`,
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: 'Transit rent reimbursement request submitted successfully',
      data: request,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Update rent request status (Secretary only)
// @route   PUT /api/rent-requests/:id
// @access  Private (Secretary)
const updateRentRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks, disbursedMonth } = req.body;

    const request = await RentRequest.findById(id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Rent request not found' });
    }

    if (status) request.status = status;
    if (remarks) request.remarks = remarks;

    if (disbursedMonth && !request.disbursedMonths.includes(disbursedMonth)) {
      request.disbursedMonths.push(disbursedMonth);
      request.status = 'Disbursed';
    }

    await request.save();

    await sendNotification({
      userId: request.residentId,
      title: `Transit Rent Status: ${request.status}`,
      message: `Your transit rent request for Flat ${request.flatNumber} has been updated to "${request.status}".`,
      type: request.status === 'Disbursed' || request.status === 'Approved' ? 'success' : 'info',
      link: '/rent-vacating',
    });

    await logActivity({
      societyId: request.societyId,
      userId: req.user._id,
      action: 'Rent Request Updated',
      details: `Rent request updated to ${request.status} by ${req.user.name}`,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Rent request updated successfully',
      data: request,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// ---------- VACATING REQUESTS ----------

// @desc    Get vacating requests
// @route   GET /api/vacating-requests
// @access  Private
const getVacatingRequests = async (req, res) => {
  try {
    const query = {};

    if (req.user.role === 'resident') {
      query.residentId = req.user._id;
    } else if (req.user.role !== 'super_admin') {
      query.societyId = req.user.societyId;
    }

    const requests = await VacatingRequest.find(query)
      .populate('residentId', 'name email phone wing flatNumber')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: requests.length, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Submit vacating request
// @route   POST /api/vacating-requests
// @access  Private (Resident)
const createVacatingRequest = async (req, res) => {
  try {
    const { plannedDate, electricityMeterReading, gasMeterReading, remarks } = req.body;

    if (!plannedDate) {
      return res.status(400).json({ success: false, message: 'Please provide planned vacating date' });
    }

    const request = await VacatingRequest.create({
      societyId: req.user.societyId,
      residentId: req.user._id,
      flatNumber: req.user.flatNumber || 'N/A',
      wing: req.user.wing || 'N/A',
      plannedDate,
      electricityMeterReading: electricityMeterReading || '',
      gasMeterReading: gasMeterReading || '',
      remarks: remarks || '',
      status: 'Submitted',
    });

    await logActivity({
      societyId: req.user.societyId,
      userId: req.user._id,
      action: 'Vacating Request Submitted',
      details: `${req.user.name} submitted vacating schedule for ${new Date(plannedDate).toLocaleDateString()}`,
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: 'Vacating request registered successfully',
      data: request,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Update vacating request status
// @route   PUT /api/vacating-requests/:id
// @access  Private (Secretary)
const updateVacatingRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, inspectionDate, remarks } = req.body;

    const request = await VacatingRequest.findById(id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Vacating request not found' });
    }

    if (status) request.status = status;
    if (inspectionDate) request.inspectionDate = inspectionDate;
    if (remarks) request.remarks = remarks;

    await request.save();

    await sendNotification({
      userId: request.residentId,
      title: `Vacating Request: ${request.status}`,
      message: `Your flat handover status is now "${request.status}".`,
      type: request.status === 'Completed' ? 'success' : 'info',
      link: '/rent-vacating',
    });

    await logActivity({
      societyId: request.societyId,
      userId: req.user._id,
      action: 'Vacating Request Updated',
      details: `Handover request for Flat ${request.flatNumber} marked as ${request.status}`,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Vacating request updated successfully',
      data: request,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

module.exports = {
  getRentRequests,
  createRentRequest,
  updateRentRequest,
  getVacatingRequests,
  createVacatingRequest,
  updateVacatingRequest,
};
