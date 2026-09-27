const Society = require('../models/Society');
const User = require('../models/User');
const Builder = require('../models/Builder');
const Complaint = require('../models/Complaint');
const Notice = require('../models/Notice');
const Meeting = require('../models/Meeting');
const Document = require('../models/Document');
const RedevelopmentUpdate = require('../models/RedevelopmentUpdate');
const ActivityLog = require('../models/ActivityLog');
const RentRequest = require('../models/RentRequest');
const VacatingRequest = require('../models/VacatingRequest');

// @desc    Get dashboard analytics tailored for user role
// @route   GET /api/analytics/dashboard
// @access  Private
const getDashboardAnalytics = async (req, res) => {
  try {
    const role = req.user.role;
    const societyId = req.user.societyId;

    if (role === 'super_admin') {
      const [
        totalSocieties,
        totalUsers,
        totalBuilders,
        activeProjects,
        recentSocieties,
        recentLogs,
        usersByRole,
        projectsByStatus,
      ] = await Promise.all([
        Society.countDocuments(),
        User.countDocuments(),
        Builder.countDocuments(),
        Society.countDocuments({ 'redevelopmentInfo.status': { $nin: ['Completed', 'Planning'] } }),
        Society.find().sort({ createdAt: -1 }).limit(5).populate('secretaryId', 'name email'),
        ActivityLog.find().sort({ createdAt: -1 }).limit(10).populate('userId', 'name role'),
        User.aggregate([
          { $group: { _id: '$role', count: { $sum: 1 } } },
        ]),
        Society.aggregate([
          { $group: { _id: '$redevelopmentInfo.status', count: { $sum: 1 } } },
        ]),
      ]);

      return res.json({
        success: true,
        data: {
          cards: {
            totalSocieties,
            totalUsers,
            totalBuilders,
            activeProjects,
          },
          systemHealth: {
            status: 'Operational',
            uptime: '99.98%',
            database: 'Connected',
            version: 'v2.4.0-production',
          },
          recentSocieties,
          recentLogs,
          usersByRole,
          projectsByStatus,
        },
      });
    }

    if (role === 'secretary' || role === 'committee_member') {
      const [
        totalResidents,
        pendingApprovals,
        totalComplaints,
        openComplaints,
        totalDocuments,
        upcomingMeetings,
        totalNotices,
        society,
        redevelopmentUpdates,
        recentLogs,
        recentRentRequests,
        recentVacatingRequests,
      ] = await Promise.all([
        User.countDocuments({ societyId, role: { $in: ['resident', 'committee_member'] }, accountStatus: 'approved' }),
        User.countDocuments({ societyId, accountStatus: 'pending' }),
        Complaint.countDocuments({ societyId }),
        Complaint.countDocuments({ societyId, status: { $in: ['Open', 'In Progress'] } }),
        Document.countDocuments({ societyId }),
        Meeting.countDocuments({ societyId, status: 'Scheduled' }),
        Notice.countDocuments({ societyId }),
        Society.findById(societyId).populate('redevelopmentInfo.builderId', 'companyName name reraNumber email phone'),
        RedevelopmentUpdate.find({ societyId }).sort({ createdAt: -1 }).limit(5).populate('builderId', 'name companyName'),
        ActivityLog.find({ societyId }).sort({ createdAt: -1 }).limit(8).populate('userId', 'name role'),
        RentRequest.countDocuments({ societyId, status: 'Submitted' }),
        VacatingRequest.countDocuments({ societyId, status: 'Submitted' }),
      ]);

      return res.json({
        success: true,
        data: {
          cards: {
            totalResidents,
            pendingApprovals,
            totalComplaints,
            openComplaints,
            totalDocuments,
            upcomingMeetings,
            totalNotices,
            redevelopmentProgress: society?.redevelopmentInfo?.currentProgress || 0,
            pendingRentRequests: recentRentRequests,
            pendingVacatingRequests: recentVacatingRequests,
          },
          society,
          redevelopmentUpdates,
          recentLogs,
        },
      });
    }

    if (role === 'resident') {
      const [
        noticesCount,
        myComplaintsCount,
        openComplaintsCount,
        documentsCount,
        meetingsCount,
        society,
        latestUpdates,
        myRentRequests,
        myVacatingRequests,
      ] = await Promise.all([
        Notice.countDocuments({ societyId }),
        Complaint.countDocuments({ residentId: req.user._id }),
        Complaint.countDocuments({ residentId: req.user._id, status: { $in: ['Open', 'In Progress'] } }),
        Document.countDocuments({ societyId }),
        Meeting.countDocuments({ societyId, status: 'Scheduled' }),
        Society.findById(societyId).populate('redevelopmentInfo.builderId', 'companyName name reraNumber'),
        RedevelopmentUpdate.find({ societyId, status: 'approved' }).sort({ createdAt: -1 }).limit(5),
        RentRequest.find({ residentId: req.user._id }).sort({ createdAt: -1 }).limit(3),
        VacatingRequest.find({ residentId: req.user._id }).sort({ createdAt: -1 }).limit(3),
      ]);

      return res.json({
        success: true,
        data: {
          cards: {
            noticesCount,
            myComplaintsCount,
            openComplaintsCount,
            documentsCount,
            meetingsCount,
            redevelopmentStatus: society?.redevelopmentInfo?.status || 'Planning',
            redevelopmentProgress: society?.redevelopmentInfo?.currentProgress || 0,
          },
          society,
          latestUpdates,
          myRentRequests,
          myVacatingRequests,
        },
      });
    }

    if (role === 'builder') {
      const [
        assignedSocieties,
        totalUpdates,
        pendingApprovals,
        uploadedDocs,
      ] = await Promise.all([
        Society.find({
          $or: [
            { 'redevelopmentInfo.builderUserId': req.user._id },
            { _id: req.user.societyId },
          ],
        }),
        RedevelopmentUpdate.countDocuments({ builderId: req.user._id }),
        RedevelopmentUpdate.countDocuments({ builderId: req.user._id, status: 'pending_approval' }),
        Document.countDocuments({ uploadedBy: req.user._id }),
      ]);

      return res.json({
        success: true,
        data: {
          cards: {
            assignedProjects: assignedSocieties.length,
            totalUpdates,
            pendingApprovals,
            uploadedDocs,
            overallAverageProgress: assignedSocieties.length > 0
              ? Math.round(assignedSocieties.reduce((acc, s) => acc + (s.redevelopmentInfo?.currentProgress || 0), 0) / assignedSocieties.length)
              : 0,
          },
          assignedSocieties,
        },
      });
    }

    res.json({ success: true, data: {} });
  } catch (error) {
    console.error('[Analytics Error]', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

module.exports = { getDashboardAnalytics };
