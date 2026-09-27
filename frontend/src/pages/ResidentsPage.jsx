import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getResidentsApi,
  approveResidentApi,
  rejectResidentApi,
  updateResidentApi,
  deleteResidentApi,
} from '../services/api';
import { Modal } from '../components/Modal';
import { StatusBadge, RoleBadge } from '../components/Badge';
import { EmptyState } from '../components/EmptyState';
import { Users, Search, Check, X, Edit2, UserX, ShieldCheck, Filter, Phone, Mail, Building } from 'lucide-react';

export const ResidentsPage = () => {
  const { user } = useAuth();
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [selectedResident, setSelectedResident] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [editFormData, setEditFormData] = useState({
    name: '',
    phone: '',
    wing: '',
    flatNumber: '',
    role: 'resident',
    accountStatus: 'approved',
  });

  const isSecretary = user?.role === 'secretary' || user?.role === 'super_admin';

  const fetchResidents = async () => {
    try {
      setLoading(true);
      const res = await getResidentsApi({
        status: statusFilter,
        role: roleFilter,
        search,
      });
      if (res.data.success) {
        setResidents(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResidents();
  }, [statusFilter, roleFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchResidents();
  };

  const handleApprove = async (id) => {
    if (!isSecretary) return;
    try {
      const res = await approveResidentApi(id);
      if (res.data.success) {
        fetchResidents();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Approval failed');
    }
  };

  const openRejectModal = (resident) => {
    setSelectedResident(resident);
    setRejectReason('');
    setIsRejectModalOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (!selectedResident) return;
    try {
      await rejectResidentApi(selectedResident._id, { reason: rejectReason });
      setIsRejectModalOpen(false);
      fetchResidents();
    } catch (err) {
      alert(err.response?.data?.message || 'Reject failed');
    }
  };

  const openEditModal = (resident) => {
    setSelectedResident(resident);
    setEditFormData({
      name: resident.name || '',
      phone: resident.phone || '',
      wing: resident.wing || '',
      flatNumber: resident.flatNumber || '',
      role: resident.role || 'resident',
      accountStatus: resident.accountStatus || 'approved',
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedResident) return;
    try {
      await updateResidentApi(selectedResident._id, editFormData);
      setIsEditModalOpen(false);
      fetchResidents();
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  const handleDeactivate = async (id, name) => {
    if (!confirm(`Are you sure you want to deactivate the login account for ${name}?`)) return;
    try {
      await deleteResidentApi(id);
      fetchResidents();
    } catch (err) {
      alert(err.response?.data?.message || 'Deactivation failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Resident Management & Approvals
          </h1>
          <p className="text-xs text-slate-500">
            Verify member registrations, manage flat allocations, and designate committee members
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, flat number..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
          />
        </form>

        <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending Approval</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="deactivated">Deactivated</option>
          </select>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
          >
            <option value="">All Roles</option>
            <option value="resident">Residents</option>
            <option value="committee_member">Committee Members</option>
          </select>
        </div>
      </div>

      {/* Residents Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">Loading residents...</div>
        ) : residents.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={Users}
              title="No residents match criteria"
              description="Adjust your search or filter options to view other residents."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-5">Member Name</th>
                  <th className="py-3.5 px-5">Wing & Flat</th>
                  <th className="py-3.5 px-5">Contact Details</th>
                  <th className="py-3.5 px-5">Designation</th>
                  <th className="py-3.5 px-5">Account Status</th>
                  <th className="py-3.5 px-5">Registered</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {residents.map((res) => (
                  <tr
                    key={res._id}
                    className={`hover:bg-slate-50/70 transition-colors ${
                      res.accountStatus === 'pending' ? 'bg-amber-50/30' : ''
                    }`}
                  >
                    <td className="py-3.5 px-5 font-semibold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs">
                          {res.name?.charAt(0).toUpperCase()}
                        </div>
                        <span>{res.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="font-semibold text-slate-800">
                        {res.wing ? `Wing ${res.wing}` : ''} - Flat {res.flatNumber || 'N/A'}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 space-y-0.5">
                      <div className="flex items-center gap-1.5 text-slate-600 font-mono text-[11px]">
                        <Mail className="w-3 h-3 text-slate-400" /> {res.email}
                      </div>
                      {res.phone && (
                        <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                          <Phone className="w-3 h-3 text-slate-400" /> {res.phone}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-5">
                      <RoleBadge role={res.role} />
                    </td>
                    <td className="py-3.5 px-5">
                      <StatusBadge status={res.accountStatus} />
                    </td>
                    <td className="py-3.5 px-5 text-slate-400 text-[11px]">
                      {new Date(res.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      {isSecretary ? (
                        <div className="flex items-center justify-end gap-1.5">
                          {res.accountStatus === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(res._id)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] flex items-center gap-1 transition-colors shadow-2xs"
                                title="Approve Registration"
                              >
                                <Check className="w-3 h-3" /> Approve
                              </button>
                              <button
                                onClick={() => openRejectModal(res)}
                                className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-[11px] flex items-center gap-1 transition-colors"
                                title="Reject"
                              >
                                <X className="w-3 h-3" /> Reject
                              </button>
                            </>
                          )}

                          {res.accountStatus === 'approved' && (
                            <>
                              <button
                                onClick={() => openEditModal(res)}
                                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                                title="Edit Resident"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeactivate(res._id, res.name)}
                                className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Deactivate"
                              >
                                <UserX className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">View Only</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* EDIT RESIDENT MODAL */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Resident Record & Role"
        subtitle={`Updating information for ${selectedResident?.name}`}
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={editFormData.name}
              onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Wing</label>
              <input
                type="text"
                value={editFormData.wing}
                onChange={(e) => setEditFormData({ ...editFormData, wing: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Flat Number</label>
              <input
                type="text"
                value={editFormData.flatNumber}
                onChange={(e) => setEditFormData({ ...editFormData, flatNumber: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Phone</label>
            <input
              type="tel"
              value={editFormData.phone}
              onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Portal Role</label>
              <select
                value={editFormData.role}
                onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
              >
                <option value="resident">Resident Member</option>
                <option value="committee_member">Managing Committee Member</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Account Status</label>
              <select
                value={editFormData.accountStatus}
                onChange={(e) => setEditFormData({ ...editFormData, accountStatus: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
              >
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="deactivated">Deactivated</option>
              </select>
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
            >
              Save Member Details
            </button>
          </div>
        </form>
      </Modal>

      {/* REJECT MODAL */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Reject Resident Registration"
        subtitle={`State reason for denying registration for ${selectedResident?.name}`}
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            The resident will receive a notification and won't be able to access the portal.
          </p>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Rejection Reason
            </label>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Flat ownership record does not match society share certificate."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsRejectModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleRejectConfirm}
              className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs"
            >
              Confirm Rejection
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
