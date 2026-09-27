import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getRedevelopmentUpdatesApi,
  createRedevelopmentUpdateApi,
  reviewRedevelopmentUpdateApi,
} from '../services/api';
import { Modal } from '../components/Modal';
import { ProgressBar } from '../components/ProgressBar';
import { StatusBadge } from '../components/Badge';
import { EmptyState } from '../components/EmptyState';
import {
  TrendingUp,
  Plus,
  CheckCircle2,
  Clock,
  XCircle,
  HardHat,
  Calendar,
  Building,
  FileCheck,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

export const RedevelopmentPage = () => {
  const { user } = useAuth();
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedUpdate, setSelectedUpdate] = useState(null);
  const [reviewStatus, setReviewStatus] = useState('approved');
  const [rejectionReason, setRejectionReason] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    milestone: '',
    progressPercentage: 50,
    description: '',
  });

  const isSecretary = user?.role === 'secretary' || user?.role === 'super_admin';
  const isBuilder = user?.role === 'builder';
  const canSubmit = isBuilder || isSecretary;

  const fetchUpdates = async () => {
    try {
      setLoading(true);
      const res = await getRedevelopmentUpdatesApi();
      if (res.data.success) {
        setUpdates(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpdates();
  }, []);

  const handleSubmitMilestone = async (e) => {
    e.preventDefault();
    try {
      const res = await createRedevelopmentUpdateApi({
        ...formData,
        societyId: typeof user.societyId === 'object' ? user.societyId._id : user.societyId,
      });
      if (res.data.success) {
        setIsSubmitModalOpen(false);
        setFormData({ title: '', milestone: '', progressPercentage: 50, description: '' });
        fetchUpdates();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Submission failed');
    }
  };

  const openReviewModal = (update) => {
    setSelectedUpdate(update);
    setReviewStatus('approved');
    setRejectionReason('');
    setIsReviewModalOpen(true);
  };

  const handleReviewConfirm = async () => {
    if (!selectedUpdate) return;
    try {
      await reviewRedevelopmentUpdateApi(selectedUpdate._id, {
        status: reviewStatus,
        rejectionReason,
      });
      setIsReviewModalOpen(false);
      fetchUpdates();
    } catch (err) {
      alert(err.response?.data?.message || 'Review action failed');
    }
  };

  // Find max progress
  const latestApproved = updates.filter((u) => u.status === 'approved').sort((a, b) => b.progressPercentage - a.progressPercentage)[0];
  const overallProgress = latestApproved ? latestApproved.progressPercentage : 0;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Redevelopment Construction Milestones
          </h1>
          <p className="text-xs text-slate-500">
            Chronological engineering timeline from foundation piling to structural handover
          </p>
        </div>

        {canSubmit && (
          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4" /> Upload Milestone Update
          </button>
        )}
      </div>

      {/* Progress Telemetry Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs uppercase font-bold text-emerald-700 tracking-wider">
              Project Execution Status
            </span>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5">
              Overall Completion: <span className="text-emerald-700">{overallProgress}%</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Active Milestone: {latestApproved?.milestone || 'Inception & Soil Testing'}
            </p>
          </div>
          <div className="w-full md:w-80">
            <ProgressBar progress={overallProgress} size="lg" />
          </div>
        </div>

        <div className="pt-4 flex items-center justify-between text-xs text-slate-500 flex-wrap gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Verified by Society Secretary</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Under Technical Inspection</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
            <span>Upcoming Milestones</span>
          </div>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-6 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-600" /> Structural Milestone Timeline
        </h3>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading timeline...</div>
        ) : updates.length === 0 ? (
          <EmptyState
            icon={TrendingUp}
            title="No milestones logged yet"
            description="Builder and Secretary will publish construction updates here."
          />
        ) : (
          <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
            {updates.map((item) => (
              <div key={item._id} className="relative group">
                {/* Timeline node icon */}
                <div
                  className={`absolute -left-6 sm:-left-8 top-1 w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 bg-white flex items-center justify-center transition-transform group-hover:scale-110 ${
                    item.status === 'approved'
                      ? 'border-emerald-500 text-emerald-600'
                      : item.status === 'rejected'
                      ? 'border-rose-500 text-rose-600'
                      : 'border-amber-500 text-amber-600'
                  }`}
                >
                  {item.status === 'approved' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
                  ) : item.status === 'rejected' ? (
                    <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-600" />
                  ) : (
                    <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600" />
                  )}
                </div>

                {/* Milestone Content Card */}
                <div className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          Milestone
                        </span>
                        <span className="text-slate-300">•</span>
                        <StatusBadge status={item.status} />
                      </div>
                      <h4 className="text-base font-bold text-slate-900 mt-0.5">{item.milestone}</h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-xl bg-white border border-slate-200 font-extrabold text-sm text-emerald-700 shadow-2xs">
                        {item.progressPercentage}% Complete
                      </span>
                    </div>
                  </div>

                  <h5 className="text-xs font-semibold text-slate-800 mb-1.5">{item.title}</h5>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">{item.description}</p>

                  <div className="pt-3 border-t border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] text-slate-500">
                    <div className="flex items-center gap-2">
                      <HardHat className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        Reported by <strong className="text-slate-700">{item.builderId?.name || 'Developer'}</strong> on{' '}
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {item.status === 'approved' && item.approvedBy && (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                        <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                        Approved by Secretary ({item.approvedBy?.name})
                      </span>
                    )}

                    {isSecretary && item.status === 'pending_approval' && (
                      <button
                        onClick={() => openReviewModal(item)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-2xs flex items-center gap-1 shrink-0"
                      >
                        Review & Approve
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* BUILDER UPLOAD MILESTONE MODAL */}
      <Modal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        title="Upload Construction Progress Milestone"
        subtitle="Submit structural progress and update percentage for Secretary review"
      >
        <form onSubmit={handleSubmitMilestone} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Milestone Name *
            </label>
            <input
              type="text"
              required
              value={formData.milestone}
              onChange={(e) => setFormData({ ...formData, milestone: e.target.value })}
              placeholder="e.g. 12th Floor RCC Slab Casting & MEP Piping"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Update Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Beam shuttering completed"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Progress Percentage (0-100%) *
              </label>
              <input
                type="number"
                min="0"
                max="100"
                required
                value={formData.progressPercentage}
                onChange={(e) => setFormData({ ...formData, progressPercentage: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-bold text-emerald-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Technical Description & Quality Summary *
            </label>
            <textarea
              rows={4}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide concrete grade details, cube test results, structural engineer certifications..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsSubmitModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
            >
              Submit Milestone Update
            </button>
          </div>
        </form>
      </Modal>

      {/* SECRETARY REVIEW MILESTONE MODAL */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title="Secretary Milestone Verification"
        subtitle={`Reviewing milestone: "${selectedUpdate?.milestone}"`}
      >
        <div className="space-y-4">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
            <div className="flex justify-between font-semibold">
              <span className="text-slate-500">Reported Progress:</span>
              <span className="text-emerald-700 font-bold">{selectedUpdate?.progressPercentage}%</span>
            </div>
            <p className="text-slate-700">{selectedUpdate?.description}</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Decision
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setReviewStatus('approved')}
                className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                  reviewStatus === 'approved'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Approve & Update Society %
              </button>
              <button
                type="button"
                onClick={() => setReviewStatus('rejected')}
                className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                  reviewStatus === 'rejected'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Reject / Request Revision
              </button>
            </div>
          </div>

          {reviewStatus === 'rejected' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reason for Rejection *
              </label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="State specific deficiencies or required certificates before approval..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
              />
            </div>
          )}

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsReviewModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleReviewConfirm}
              className={`px-5 py-2 text-xs font-semibold text-white rounded-xl shadow-xs ${
                reviewStatus === 'approved'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              Confirm {reviewStatus === 'approved' ? 'Approval' : 'Rejection'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
