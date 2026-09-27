import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getComplaintsApi, createComplaintApi, updateComplaintApi } from '../services/api';
import { Modal } from '../components/Modal';
import { StatusBadge, Badge } from '../components/Badge';
import { EmptyState } from '../components/EmptyState';
import {
  AlertCircle,
  Plus,
  Filter,
  Search,
  MessageSquare,
  Clock,
  CheckCircle,
  UserCheck,
  User,
  ShieldAlert,
} from 'lucide-react';

export const ComplaintsPage = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [search, setSearch] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    category: 'Redevelopment',
    priority: 'Medium',
  });

  const [updateForm, setUpdateForm] = useState({
    status: 'In Progress',
    resolutionNotes: '',
    priority: 'Medium',
  });

  const isSecretary = user?.role === 'secretary' || user?.role === 'super_admin';
  const isCommittee = user?.role === 'committee_member';
  const canUpdate = isSecretary || isCommittee;

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await getComplaintsApi({
        status: statusFilter,
        category: categoryFilter,
      });
      if (res.data.success) {
        setComplaints(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter, categoryFilter]);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await createComplaintApi(createForm);
      if (res.data.success) {
        setIsCreateModalOpen(false);
        setCreateForm({ title: '', description: '', category: 'Redevelopment', priority: 'Medium' });
        fetchComplaints();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit complaint');
    }
  };

  const openUpdateModal = (complaint) => {
    setSelectedComplaint(complaint);
    setUpdateForm({
      status: complaint.status || 'In Progress',
      resolutionNotes: complaint.resolutionNotes || '',
      priority: complaint.priority || 'Medium',
    });
    setIsUpdateModalOpen(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    try {
      const res = await updateComplaintApi(selectedComplaint._id, updateForm);
      if (res.data.success) {
        setIsUpdateModalOpen(false);
        fetchComplaints();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update complaint');
    }
  };

  const filtered = complaints.filter(
    (c) =>
      c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase()) ||
      c.residentId?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Complaints & Grievance Redressal
          </h1>
          <p className="text-xs text-slate-500">
            Submit issues concerning redevelopment, transit rent disbursals, site safety, or flat handover
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" /> Raise Complaint
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search grievances..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" /> Filters:
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
          >
            <option value="">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Rejected">Rejected</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
          >
            <option value="">All Categories</option>
            <option value="Redevelopment">Redevelopment</option>
            <option value="Transit Rent">Transit Rent</option>
            <option value="Vacating">Vacating</option>
            <option value="Plumbing">Plumbing</option>
            <option value="Electrical">Electrical</option>
            <option value="Maintenance">Maintenance</option>
            <option value="General">General</option>
          </select>
        </div>
      </div>

      {/* Complaints List */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading complaints...</div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={AlertCircle}
          title="No complaints filed"
          description="Everything is currently running smoothly! Members can raise any concerns here."
          actionText="Raise Complaint"
          onAction={() => setIsCreateModalOpen(true)}
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-start justify-between gap-4"
            >
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="slate">{item.category}</Badge>
                  <StatusBadge status={item.status} />
                  <Badge
                    variant={
                      item.priority === 'Urgent'
                        ? 'rose'
                        : item.priority === 'High'
                        ? 'amber'
                        : 'slate'
                    }
                  >
                    {item.priority} Priority
                  </Badge>
                  <span className="text-[11px] text-slate-400">
                    Logged on {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>

                {item.resolutionNotes && (
                  <div className="mt-3 p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl text-xs text-emerald-900">
                    <strong className="block text-[11px] uppercase tracking-wider text-emerald-800 font-bold mb-0.5">
                      Secretary Resolution Notes:
                    </strong>
                    {item.resolutionNotes}
                  </div>
                )}

                <div className="pt-2 flex items-center gap-4 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 font-medium text-slate-700">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    {item.residentId?.name} (Wing {item.residentId?.wing || ''} Flat {item.residentId?.flatNumber || ''})
                  </span>
                  {item.assignedTo && (
                    <span className="flex items-center gap-1 text-slate-600">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Assigned: {item.assignedTo.name}
                    </span>
                  )}
                </div>
              </div>

              {canUpdate && (
                <div className="shrink-0 flex items-center md:flex-col gap-2">
                  <button
                    onClick={() => openUpdateModal(item)}
                    className="px-3.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors shadow-2xs"
                  >
                    Update Status
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* CREATE COMPLAINT MODAL */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Raise Grievance / Complaint"
        subtitle="Your request will be routed directly to the Society Secretary & Committee"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Grievance Title *
            </label>
            <input
              type="text"
              required
              value={createForm.title}
              onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
              placeholder="Brief summary of the issue"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category *
              </label>
              <select
                value={createForm.category}
                onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
              >
                <option value="Redevelopment">Redevelopment</option>
                <option value="Transit Rent">Transit Rent</option>
                <option value="Vacating">Vacating / Handover</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Electrical">Electrical</option>
                <option value="Maintenance">Maintenance</option>
                <option value="General">General</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Urgency Priority *
              </label>
              <select
                value={createForm.priority}
                onChange={(e) => setCreateForm({ ...createForm, priority: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Detailed Description *
            </label>
            <textarea
              rows={4}
              required
              value={createForm.description}
              onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
              placeholder="Describe the problem, dates, flat specifics, or impacts..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
            >
              Submit Complaint
            </button>
          </div>
        </form>
      </Modal>

      {/* UPDATE COMPLAINT MODAL */}
      <Modal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        title="Update Grievance Status & Resolution"
        subtitle={`Managing: "${selectedComplaint?.title}"`}
      >
        <form onSubmit={handleUpdateSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Resolution Status
              </label>
              <select
                value={updateForm.status}
                onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Priority
              </label>
              <select
                value={updateForm.priority}
                onChange={(e) => setUpdateForm({ ...updateForm, priority: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Resolution Notes / Action Taken
            </label>
            <textarea
              rows={3}
              value={updateForm.resolutionNotes}
              onChange={(e) => setUpdateForm({ ...updateForm, resolutionNotes: e.target.value })}
              placeholder="State the remedy, contractor response, or steps taken..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsUpdateModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
            >
              Save Resolution
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
