const Meeting = require('../models/Meeting');
const { logActivity } = require('../utils/logger');
const { notifySociety } = require('../utils/notifier');

// @desc    Get meetings for society
// @route   GET /api/meetings
// @access  Private
const getMeetings = async (req, res) => {
  try {
    const query = {};

    if (req.user.role !== 'super_admin') {
      query.societyId = req.user.societyId;
    }

    const meetings = await Meeting.find(query)
      .populate('createdBy', 'name email role')
      .sort({ date: -1 });

    res.json({
      success: true,
      count: meetings.length,
      data: meetings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Create a meeting
// @route   POST /api/meetings
// @access  Private (Secretary only)
const createMeeting = async (req, res) => {
  try {
    const { title, agenda, location, date, time, status, documentUrl } = req.body;

    if (!title || !agenda || !location || !date || !time) {
      return res.status(400).json({ success: false, message: 'Please provide all required meeting fields' });
    }

    if (!req.user.societyId) {
      return res.status(400).json({ success: false, message: 'No society assigned' });
    }

    const meeting = await Meeting.create({
      title,
      agenda,
      location,
      date,
      time,
      status: status || 'Scheduled',
      documentUrl: documentUrl || '',
      societyId: req.user.societyId,
      createdBy: req.user._id,
    });

    // Notify all residents about meeting
    await notifySociety({
      societyId: req.user.societyId,
      title: `Meeting Scheduled: ${title}`,
      message: `Date: ${new Date(date).toLocaleDateString()}, Time: ${time} at ${location}`,
      type: 'info',
      link: '/meetings',
    });

    await logActivity({
      societyId: req.user.societyId,
      userId: req.user._id,
      action: 'Meeting Scheduled',
      details: `Scheduled meeting "${title}" on ${new Date(date).toLocaleDateString()} at ${time}`,
      ipAddress: req.ip,
    });

    const populated = await Meeting.findById(meeting._id).populate('createdBy', 'name email role');

    res.status(201).json({
      success: true,
      message: 'Meeting scheduled successfully',
      data: populated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Update meeting / add minutes
// @route   PUT /api/meetings/:id
// @access  Private (Secretary only)
const updateMeeting = async (req, res) => {
  try {
    const { id } = req.params;
    const meeting = await Meeting.findById(id);

    if (!meeting) {
      return res.status(404).json({ success: false, message: 'Meeting not found' });
    }

    if (req.user.role !== 'super_admin' && meeting.societyId.toString() !== req.user.societyId?.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { title, agenda, location, date, time, status, minutes, attendeesCount, documentUrl } = req.body;

    if (title) meeting.title = title;
    if (agenda) meeting.agenda = agenda;
    if (location) meeting.location = location;
    if (date) meeting.date = date;
    if (time) meeting.time = time;
    if (status) meeting.status = status;
    if (minutes !== undefined) meeting.minutes = minutes;
    if (attendeesCount !== undefined) meeting.attendeesCount = attendeesCount;
    if (documentUrl !== undefined) meeting.documentUrl = documentUrl;

    await meeting.save();

    await logActivity({
      societyId: meeting.societyId,
      userId: req.user._id,
      action: 'Meeting Updated',
      details: `Updated meeting "${meeting.title}" (Status: ${meeting.status})`,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Meeting updated successfully',
      data: meeting,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Delete meeting
// @route   DELETE /api/meetings/:id
// @access  Private (Secretary only)
const deleteMeeting = async (req, res) => {
  try {
    const { id } = req.params;
    const meeting = await Meeting.findById(id);

    if (!meeting) {
      return res.status(404).json({ success: false, message: 'Meeting not found' });
    }

    if (req.user.role !== 'super_admin' && meeting.societyId.toString() !== req.user.societyId?.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Meeting.findByIdAndDelete(id);

    await logActivity({
      societyId: meeting.societyId,
      userId: req.user._id,
      action: 'Meeting Deleted',
      details: `Deleted meeting: "${meeting.title}"`,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Meeting deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

module.exports = {
  getMeetings,
  createMeeting,
  updateMeeting,
  deleteMeeting,
};
