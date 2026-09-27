import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDashboardAnalyticsApi, approveResidentApi } from '../services/api';
import { StatCard } from '../components/StatCard';
import { ProgressBar } from '../components/ProgressBar';
import { Badge, StatusBadge, RoleBadge } from '../components/Badge';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  Users,
  HardHat,
  TrendingUp,
  AlertCircle,
  FileText,
  Calendar,
  FolderOpen,
  DollarSign,
  Plus,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Server,
  Activity,
} from 'lucide-react';

export const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await getDashboardAnalyticsApi();
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [user]);

  const handleQuickApprove = async (residentId) => {
    try {
      await approveResidentApi(residentId);
      fetchAnalytics();
    } catch (err) {
      console.error('Approval failed:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Loading dashboard telemetry...</p>
        </div>
      </div>
    );
  }

  const role = user?.role || 'resident';
  const cards = data?.cards || {};

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Welcome back, {user?.name}
            </h1>
            <RoleBadge role={role} />
          </div>
          <p className="text-xs text-slate-500">
            {role === 'super_admin' && 'Platform oversight across all housing societies & builder partners'}
            {role === 'secretary' && `Managing ${data?.society?.name || 'Society Portal'}`}
            {role === 'committee_member' && `Committee member at ${data?.society?.name || 'Society'}`}
            {role === 'resident' && `Flat ${user?.flatNumber || ''} ${user?.wing ? 'Wing ' + user.wing : ''} • ${data?.society?.name || 'Resident Portal'}`}
            {role === 'builder' && `${user?.builderCompany || 'Redevelopment Partner'} Workspace`}
          </p>
        </div>

        {/* Quick Action Buttons per role */}
        <div className="flex items-center gap-2 flex-wrap">
          {role === 'super_admin' && (
            <Link
              to="/societies"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" /> Create Society
            </Link>
          )}

          {role === 'secretary' && (
            <>
              <Link
                to="/residents"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors shadow-2xs"
              >
                <Users className="w-3.5 h-3.5 text-slate-500" />
                <span>Approvals ({cards.pendingApprovals || 0})</span>
              </Link>
              <Link
                to="/notices"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs"
              >
                <Plus className="w-4 h-4" /> New Notice
              </Link>
            </>
          )}

          {role === 'resident' && (
            <>
              <Link
                to="/complaints"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs"
              >
                <Plus className="w-4 h-4" /> Raise Complaint
              </Link>
              <Link
                to="/redevelopment"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors shadow-2xs"
              >
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" /> View Timeline
              </Link>
            </>
          )}

          {role === 'builder' && (
            <Link
              to="/redevelopment"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" /> Submit Milestone
            </Link>
          )}
        </div>
      </div>

      {/* ---------------- SUPER ADMIN VIEW ---------------- */}
      {role === 'super_admin' && (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Societies"
              value={cards.totalSocieties || 0}
              subtitle="Registered in Maharashtra"
              icon={Building2}
              color="emerald"
              onClick={() => navigate('/societies')}
            />
            <StatCard
              title="Platform Users"
              value={cards.totalUsers || 0}
              subtitle="Active across all roles"
              icon={Users}
              color="blue"
            />
            <StatCard
              title="Builder Partners"
              value={cards.totalBuilders || 0}
              subtitle="MahaRERA verified"
              icon={HardHat}
              color="purple"
              onClick={() => navigate('/builders')}
            />
            <StatCard
              title="Active Redevelopments"
              value={cards.activeProjects || 0}
              subtitle="Under construction / review"
              icon={TrendingUp}
              color="amber"
            />
          </div>

          {/* System Health & Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* System Health Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Server className="w-4 h-4 text-emerald-600" /> Platform Infrastructure
                </h3>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  Operational
                </span>
              </div>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Database Engine</span>
                  <span className="font-semibold text-slate-800">MongoDB Core (Embedded)</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Service Uptime</span>
                  <span className="font-semibold text-emerald-600">99.98% High Availability</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Security Middleware</span>
                  <span className="font-semibold text-slate-800">JWT + BCrypt RBAC</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Release Version</span>
                  <span className="font-mono text-slate-600">v2.4.0-production</span>
                </div>
              </div>
            </div>

            {/* User Distribution by Role */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" /> User Distribution by Role
              </h3>
              <div className="space-y-3">
                {data.usersByRole?.map((group) => {
                  const percentage = Math.round((group.count / (cards.totalUsers || 1)) * 100);
                  return (
                    <div key={group._id} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="capitalize font-medium text-slate-700">
                          {group._id.replace('_', ' ')}
                        </span>
                        <span className="text-slate-500">{group.count} users ({percentage}%)</span>
                      </div>
                      <ProgressBar progress={percentage} size="sm" showPercentage={false} color="blue" />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Redevelopment Projects Distribution */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-600" /> Redevelopment Phases
              </h3>
              <div className="space-y-2.5">
                {data.projectsByStatus?.map((item) => (
                  <div key={item._id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl text-xs">
                    <span className="font-medium text-slate-800">{item._id || 'In Planning'}</span>
                    <span className="px-2 py-0.5 bg-white border border-slate-200 rounded-md font-bold text-slate-700">
                      {item.count} Societies
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Societies Table Quick Preview */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Registered Housing Societies</h3>
                <p className="text-xs text-slate-500">Recent societies onboarded to RedevelopEase</p>
              </div>
              <Link to="/societies" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-5">Society Name</th>
                    <th className="py-3 px-5">Location</th>
                    <th className="py-3 px-5">Flats</th>
                    <th className="py-3 px-5">Appointed Secretary</th>
                    <th className="py-3 px-5">Phase</th>
                    <th className="py-3 px-5">Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {data.recentSocieties?.map((s) => (
                    <tr key={s._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-5 font-semibold text-slate-900">{s.name}</td>
                      <td className="py-3 px-5">{s.city} - {s.pincode}</td>
                      <td className="py-3 px-5">{s.totalFlats} Flats</td>
                      <td className="py-3 px-5">{s.secretaryId?.name || 'Unassigned'}</td>
                      <td className="py-3 px-5">
                        <StatusBadge status={s.redevelopmentInfo?.status || 'Planning'} />
                      </td>
                      <td className="py-3 px-5 w-36">
                        <ProgressBar progress={s.redevelopmentInfo?.currentProgress || 0} size="sm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ---------------- SECRETARY & COMMITTEE VIEW ---------------- */}
      {(role === 'secretary' || role === 'committee_member') && (
        <>
          {/* Pending Approvals Callout Banner (If any) */}
          {cards.pendingApprovals > 0 && (
            <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-amber-900">
                    {cards.pendingApprovals} Resident Registrations Awaiting Verification
                  </h4>
                  <p className="text-xs text-amber-700">
                    Residents have registered and cannot sign in until you verify their flat allocation.
                  </p>
                </div>
              </div>
              <Link
                to="/residents"
                className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors shrink-0 shadow-xs"
              >
                Review Applications
              </Link>
            </div>
          )}

          {/* Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <StatCard
              title="Residents"
              value={cards.totalResidents || 0}
              subtitle="Approved members"
              icon={Users}
              color="emerald"
              onClick={() => navigate('/residents')}
            />
            <StatCard
              title="Pending Approvals"
              value={cards.pendingApprovals || 0}
              subtitle="Verification needed"
              icon={Clock}
              color="amber"
              onClick={() => navigate('/residents')}
            />
            <StatCard
              title="Complaints"
              value={`${cards.openComplaints || 0} / ${cards.totalComplaints || 0}`}
              subtitle="Open / Total"
              icon={AlertCircle}
              color="rose"
              onClick={() => navigate('/complaints')}
            />
            <StatCard
              title="Documents"
              value={cards.totalDocuments || 0}
              subtitle="Legal & Architect"
              icon={FolderOpen}
              color="blue"
              onClick={() => navigate('/documents')}
            />
            <StatCard
              title="Meetings"
              value={cards.upcomingMeetings || 0}
              subtitle="Scheduled SGMs"
              icon={Calendar}
              color="purple"
              onClick={() => navigate('/meetings')}
            />
            <StatCard
              title="Progress"
              value={`${cards.redevelopmentProgress || 0}%`}
              subtitle={data?.society?.redevelopmentInfo?.status || 'Planning'}
              icon={TrendingUp}
              color="emerald"
              onClick={() => navigate('/redevelopment')}
            />
          </div>

          {/* Redevelopment Project Banner */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">
                    Redevelopment Project Status
                  </h3>
                  <StatusBadge status={data?.society?.redevelopmentInfo?.status || 'Planning'} />
                </div>
                <p className="text-xs text-slate-500">
                  Appointed Builder:{' '}
                  <span className="font-semibold text-slate-800">
                    {data?.society?.redevelopmentInfo?.builderName || 'Apex Lifespaces & Infra Pvt Ltd'}
                  </span>{' '}
                  • MahaRERA:{' '}
                  <span className="font-mono text-slate-700">
                    {data?.society?.redevelopmentInfo?.reraNumber || 'P51800028192'}
                  </span>
                </p>
              </div>

              <div className="w-full lg:w-96">
                <ProgressBar
                  progress={cards.redevelopmentProgress || 0}
                  label="Overall Project Completion"
                  size="md"
                />
              </div>
            </div>

            <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block">Carpet Area Hike</span>
                <span className="font-bold text-slate-800 text-sm">
                  +{data?.society?.redevelopmentInfo?.carpetAreaHikePercentage || 28.5}% Additional
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Monthly Transit Rent</span>
                <span className="font-bold text-slate-800 text-sm">
                  ₹{data?.society?.redevelopmentInfo?.monthlyTransitRentPerSqFt || 75} / sq.ft
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Hardship Compensation</span>
                <span className="font-bold text-slate-800 text-sm">
                  {data?.society?.redevelopmentInfo?.hardshipCompensation || '₹15,00,000 / member'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Target Handover</span>
                <span className="font-bold text-slate-800 text-sm">
                  {data?.society?.redevelopmentInfo?.completionDate
                    ? new Date(data.society.redevelopmentInfo.completionDate).toLocaleDateString()
                    : 'December 2027'}
                </span>
              </div>
            </div>
          </div>

          {/* Two-column layout: Recent Milestones & Recent Activity Logs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Milestones */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" /> Recent Redevelopment Milestones
                </h3>
                <Link to="/redevelopment" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
                  All milestones
                </Link>
              </div>
              <div className="space-y-3">
                {data.redevelopmentUpdates?.map((update) => (
                  <div key={update._id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{update.milestone}</span>
                        <StatusBadge status={update.status} />
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2">{update.description}</p>
                      <span className="text-[10px] text-slate-400 block">
                        Submitted by {update.builderId?.name || 'Builder'} • {new Date(update.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <span className="px-2 py-1 rounded-lg bg-white border border-slate-200 font-bold text-xs text-emerald-700 shrink-0">
                      {update.progressPercentage}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Audit Logs */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-600" /> Society Audit Trail
                </h3>
                <Link to="/audit-logs" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
                  Full log
                </Link>
              </div>
              <div className="space-y-2.5">
                {data.recentLogs?.map((log) => (
                  <div key={log._id} className="flex items-start gap-2.5 text-xs py-2 border-b border-slate-100 last:border-none">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800">{log.action}</p>
                      <p className="text-slate-500 text-[11px] truncate">{log.details}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ---------------- RESIDENT VIEW ---------------- */}
      {role === 'resident' && (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard
              title="Society Notices"
              value={cards.noticesCount || 0}
              subtitle="Circulars & updates"
              icon={FileText}
              color="emerald"
              onClick={() => navigate('/notices')}
            />
            <StatCard
              title="My Complaints"
              value={`${cards.openComplaintsCount || 0} / ${cards.myComplaintsCount || 0}`}
              subtitle="Active / Total raised"
              icon={AlertCircle}
              color="rose"
              onClick={() => navigate('/complaints')}
            />
            <StatCard
              title="General Meetings"
              value={cards.meetingsCount || 0}
              subtitle="Upcoming SGMs"
              icon={Calendar}
              color="purple"
              onClick={() => navigate('/meetings')}
            />
            <StatCard
              title="Society Documents"
              value={cards.documentsCount || 0}
              subtitle="Sanctioned plans & DA"
              icon={FolderOpen}
              color="blue"
              onClick={() => navigate('/documents')}
            />
          </div>

          {/* Redevelopment Visual Status Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-emerald-700">
                  Live Redevelopment Telemetry
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                  Current Construction Phase:{' '}
                  <span className="text-emerald-700">{cards.redevelopmentStatus}</span>
                </h3>
                <p className="text-xs text-slate-500">
                  {data?.society?.name} • Appointed Developer: {data?.society?.redevelopmentInfo?.builderName}
                </p>
              </div>
              <div className="w-full md:w-80">
                <ProgressBar progress={cards.redevelopmentProgress} size="lg" />
              </div>
            </div>

            {/* Approved Milestones Visual Feed */}
            <div className="mt-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Verified Construction Milestones
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {data.latestUpdates?.map((up) => (
                  <div key={up._id} className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/60 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-xs text-slate-900">{up.milestone}</span>
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          {up.progressPercentage}%
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-3 mb-3">{up.description}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 block pt-2 border-t border-slate-200/60">
                      Verified by Secretary on {up.approvalDate ? new Date(up.approvalDate).toLocaleDateString() : 'Active'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Shortcuts for Resident */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50/50 rounded-2xl border border-emerald-200/80 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-emerald-950">Transit Rent Reimbursement</h4>
                <p className="text-xs text-emerald-800 mt-1 max-w-sm">
                  Submit monthly rental agreement and bank details to receive transit rent directly.
                </p>
              </div>
              <Link
                to="/rent-vacating"
                className="px-3.5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-colors shrink-0"
              >
                View Rent Status
              </Link>
            </div>

            <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-2xl border border-blue-200/80 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-blue-950">Flat Handover & Vacating</h4>
                <p className="text-xs text-blue-800 mt-1 max-w-sm">
                  Schedule your pre-demolition flat inspection, submit meter readings and hand over keys.
                </p>
              </div>
              <Link
                to="/rent-vacating"
                className="px-3.5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-colors shrink-0"
              >
                Vacating Handover
              </Link>
            </div>
          </div>
        </>
      )}

      {/* ---------------- BUILDER VIEW ---------------- */}
      {role === 'builder' && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard
              title="Assigned Societies"
              value={cards.assignedProjects || 0}
              subtitle="Active redevelopment mandates"
              icon={Building2}
              color="emerald"
            />
            <StatCard
              title="Milestone Updates"
              value={cards.totalUpdates || 0}
              subtitle="Total logged"
              icon={TrendingUp}
              color="blue"
              onClick={() => navigate('/redevelopment')}
            />
            <StatCard
              title="Pending Review"
              value={cards.pendingApprovals || 0}
              subtitle="Awaiting Secretary signoff"
              icon={Clock}
              color="amber"
              onClick={() => navigate('/redevelopment')}
            />
            <StatCard
              title="Uploaded Documents"
              value={cards.uploadedDocs || 0}
              subtitle="Drawings & test certificates"
              icon={FolderOpen}
              color="purple"
              onClick={() => navigate('/documents')}
            />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Assigned Society Projects</h3>
                <p className="text-xs text-slate-500">Your contracted redevelopment projects in Maharashtra</p>
              </div>
              <Link
                to="/redevelopment"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs"
              >
                <Plus className="w-4 h-4" /> Upload Progress Milestone
              </Link>
            </div>

            <div className="space-y-4">
              {data.assignedSocieties?.map((s) => (
                <div key={s._id} className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{s.name}</h4>
                      <p className="text-xs text-slate-500">{s.address}, {s.city} • {s.totalFlats} Flats</p>
                    </div>
                    <StatusBadge status={s.redevelopmentInfo?.status || 'Active'} />
                  </div>
                  <ProgressBar progress={s.redevelopmentInfo?.currentProgress || 0} label="Construction Progress" />
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
