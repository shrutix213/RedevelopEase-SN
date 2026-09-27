import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getRentRequestsApi,
  createRentRequestApi,
  updateRentRequestApi,
  getVacatingRequestsApi,
  createVacatingRequestApi,
  updateVacatingRequestApi,
} from '../services/api';
import { Modal } from '../components/Modal';
import { StatusBadge } from '../components/Badge';
import { EmptyState } from '../components/EmptyState';
import {
  DollarSign,
  Key,
  Plus,
  Building,
  CheckCircle2,
  Clock,
  Calendar,
  CreditCard,
  Check,
  AlertCircle,
} from 'lucide-react';

export const RentVacatingPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('rent'); // 'rent' or 'vacating'
  const [rentRequests, setRentRequests] = useState([]);
  const [vacatingRequests, setVacatingRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isRentModalOpen, setIsRentModalOpen] = useState(false);
  const [isVacatingModalOpen, setIsVacatingModalOpen] = useState(false);
  const [selectedRent, setSelectedRent] = useState(null);
  const [selectedVacating, setSelectedVacating] = useState(null);

  // Forms
  const [rentForm, setRentForm] = useState({
    monthlyAmount: 48000,
    bankDetails: {
      accountHolderName: user?.name || '',
      bankName: 'HDFC Bank Ltd',
      accountNumber: '',
      ifscCode: '',
    },
    remarks: '',
  });

  const [vacatingForm, setVacatingForm] = useState({
    plannedDate: '',
    electricityMeterReading: '',
    gasMeterReading: '',
    remarks: '',
  });

  const [rentUpdateForm, setRentUpdateForm] = useState({
    status: 'Approved',
    remarks: '',
    disbursedMonth: '',
  });

  const [vacatingUpdateForm, setVacatingUpdateForm] = useState({
    status: 'Inspection Scheduled',
    inspectionDate: '',
    remarks: '',
  });

  const isSecretary = user?.role === 'secretary' || user?.role === 'super_admin';
  const isResident = user?.role === 'resident';

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resRent, resVac] = await Promise.all([
        getRentRequestsApi(),
        getVacatingRequestsApi(),
      ]);
      if (resRent.data.success) setRentRequests(resRent.data.data);
      if (resVac.data.success) setVacatingRequests(resVac.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateRent = async (e) => {
    e.preventDefault();
    try {
      await createRentRequestApi(rentForm);
      setIsRentModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit rent request');
    }
  };

  const handleCreateVacating = async (e) => {
    e.preventDefault();
    try {
      await createVacatingRequestApi(vacatingForm);
      setIsVacatingModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit vacating schedule');
    }
  };

  const handleUpdateRent = async (e) => {
    e.preventDefault();
    if (!selectedRent) return;
    try {
      await updateRentRequestApi(selectedRent._id, rentUpdateForm);
      setSelectedRent(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update rent request');
    }
  };

  const handleUpdateVacating = async (e) => {
    e.preventDefault();
    if (!selectedVacating) return;
    try {
      await updateVacatingRequestApi(selectedVacating._id, vacatingUpdateForm);
      setSelectedVacating(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update vacating status');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Transit Rent & Flat Vacating Operations
          </h1>
          <p className="text-xs text-slate-500">
            Track monthly rental compensation escrows and coordinate physical flat handover protocols
          </p>
        </div>

        {isResident && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsRentModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs"
            >
              <DollarSign className="w-4 h-4" /> Request Transit Rent
            </button>
            <button
              onClick={() => setIsVacatingModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors shadow-2xs"
            >
              <Key className="w-4 h-4 text-slate-500" /> Vacating Handover
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('rent')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors flex items-center gap-2 ${
            activeTab === 'rent'
              ? 'bg-emerald-600 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <DollarSign className="w-4 h-4" /> Transit Rent Disbursements ({rentRequests.length})
        </button>

        <button
          onClick={() => setActiveTab('vacating')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors flex items-center gap-2 ${
            activeTab === 'vacating'
              ? 'bg-emerald-600 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Key className="w-4 h-4" /> Flat Vacating Handover ({vacatingRequests.length})
        </button>
      </div>

      {/* RENT TAB CONTENT */}
      {activeTab === 'rent' && (
        <div className="space-y-4">
          {loading ? (
            <div className="py-16 text-center text-xs text-slate-400">Loading rent records...</div>
          ) : rentRequests.length === 0 ? (
            <EmptyState
              icon={DollarSign}
              title="No transit rent requests filed"
              description="Members can register their transit bank details to receive monthly reimbursements."
              actionText={isResident ? 'Submit Rent Request' : undefined}
              onAction={isResident ? () => setIsRentModalOpen(true) : undefined}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rentRequests.map((req) => (
                <div
                  key={req._id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base text-slate-900">
                          {req.residentId?.name || 'Resident'}
                        </span>
                        <StatusBadge status={req.status} />
                      </div>
                      <p className="text-xs text-slate-500">
                        Wing {req.wing} - Flat {req.flatNumber}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-lg font-extrabold text-emerald-700">
                        ₹{req.monthlyAmount?.toLocaleString('en-IN')}
                      </span>
                      <span className="block text-[10px] text-slate-400">per month</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Bank Name:</span>
                      <span className="font-semibold text-slate-800">{req.bankDetails?.bankName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Account No:</span>
                      <span className="font-mono text-slate-800">{req.bankDetails?.accountNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">IFSC Code:</span>
                      <span className="font-mono text-slate-800">{req.bankDetails?.ifscCode}</span>
                    </div>
                  </div>

                  {req.disbursedMonths?.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold text-slate-500">
                        Disbursed Months:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {req.disbursedMonths.map((m, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold"
                          >
                            ✓ {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {isSecretary && (
                    <div className="pt-2 border-t border-slate-100 flex justify-end">
                      <button
                        onClick={() => {
                          setSelectedRent(req);
                          setRentUpdateForm({
                            status: req.status,
                            remarks: req.remarks || '',
                            disbursedMonth: '',
                          });
                        }}
                        className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors shadow-2xs"
                      >
                        Update Status / Disburse
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VACATING TAB CONTENT */}
      {activeTab === 'vacating' && (
        <div className="space-y-4">
          {loading ? (
            <div className="py-16 text-center text-xs text-slate-400">Loading handover records...</div>
          ) : vacatingRequests.length === 0 ? (
            <EmptyState
              icon={Key}
              title="No vacating schedules filed"
              description="Members schedule flat handover and key submission prior to demolition."
              actionText={isResident ? 'Submit Vacating Schedule' : undefined}
              onAction={isResident ? () => setIsVacatingModalOpen(true) : undefined}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vacatingRequests.map((req) => (
                <div
                  key={req._id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base text-slate-900">
                          {req.residentId?.name || 'Resident'}
                        </span>
                        <StatusBadge status={req.status} />
                      </div>
                      <p className="text-xs text-slate-500">
                        Wing {req.wing} - Flat {req.flatNumber}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-700">
                        {new Date(req.plannedDate).toLocaleDateString()}
                      </span>
                      <span className="block text-[10px] text-slate-400">Planned Vacating</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Electricity Meter:</span>
                      <span className="font-mono text-slate-800">
                        {req.electricityMeterReading || 'Not submitted'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Gas Piped Meter:</span>
                      <span className="font-mono text-slate-800">
                        {req.gasMeterReading || 'Not submitted'}
                      </span>
                    </div>
                    {req.inspectionDate && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Joint Inspection Date:</span>
                        <span className="font-semibold text-emerald-700">
                          {new Date(req.inspectionDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {req.remarks && (
                    <p className="text-xs text-slate-500 italic">"{req.remarks}"</p>
                  )}

                  {isSecretary && (
                    <div className="pt-2 border-t border-slate-100 flex justify-end">
                      <button
                        onClick={() => {
                          setSelectedVacating(req);
                          setVacatingUpdateForm({
                            status: req.status,
                            inspectionDate: req.inspectionDate ? req.inspectionDate.split('T')[0] : '',
                            remarks: req.remarks || '',
                          });
                        }}
                        className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors shadow-2xs"
                      >
                        Schedule Inspection / Handover
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL: RESIDENT SUBMIT RENT */}
      <Modal
        isOpen={isRentModalOpen}
        onClose={() => setIsRentModalOpen(false)}
        title="Submit Transit Rent Reimbursement Request"
        subtitle="Provide verified banking details to receive direct monthly subsidy"
      >
        <form onSubmit={handleCreateRent} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Monthly Rent Amount (₹) *
            </label>
            <input
              type="number"
              required
              value={rentForm.monthlyAmount}
              onChange={(e) => setRentForm({ ...rentForm, monthlyAmount: Number(e.target.value) })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-bold text-emerald-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Account Holder Name *
              </label>
              <input
                type="text"
                required
                value={rentForm.bankDetails.accountHolderName}
                onChange={(e) =>
                  setRentForm({
                    ...rentForm,
                    bankDetails: { ...rentForm.bankDetails, accountHolderName: e.target.value },
                  })
                }
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Bank Name *
              </label>
              <input
                type="text"
                required
                value={rentForm.bankDetails.bankName}
                onChange={(e) =>
                  setRentForm({
                    ...rentForm,
                    bankDetails: { ...rentForm.bankDetails, bankName: e.target.value },
                  })
                }
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Bank Account Number *
              </label>
              <input
                type="text"
                required
                value={rentForm.bankDetails.accountNumber}
                onChange={(e) =>
                  setRentForm({
                    ...rentForm,
                    bankDetails: { ...rentForm.bankDetails, accountNumber: e.target.value },
                  })
                }
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                IFSC Code *
              </label>
              <input
                type="text"
                required
                value={rentForm.bankDetails.ifscCode}
                onChange={(e) =>
                  setRentForm({
                    ...rentForm,
                    bankDetails: { ...rentForm.bankDetails, ifscCode: e.target.value },
                  })
                }
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-mono uppercase"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Remarks & Address of Transit Flat
            </label>
            <textarea
              rows={2}
              value={rentForm.remarks}
              onChange={(e) => setRentForm({ ...rentForm, remarks: e.target.value })}
              placeholder="e.g. Rented apartment near Dadar station for 24 months..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsRentModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
            >
              Submit Rent Claim
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: RESIDENT SUBMIT VACATING */}
      <Modal
        isOpen={isVacatingModalOpen}
        onClose={() => setIsVacatingModalOpen(false)}
        title="Schedule Flat Handover & Vacating Protocol"
        subtitle="Submit final meter readings to clear demolition NOC"
      >
        <form onSubmit={handleCreateVacating} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Planned Vacating Date *
            </label>
            <input
              type="date"
              required
              value={vacatingForm.plannedDate}
              onChange={(e) => setVacatingForm({ ...vacatingForm, plannedDate: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Electricity Meter Reading (kWh)
              </label>
              <input
                type="text"
                value={vacatingForm.electricityMeterReading}
                onChange={(e) => setVacatingForm({ ...vacatingForm, electricityMeterReading: e.target.value })}
                placeholder="e.g. 54210"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mahanagar Gas Meter Reading
              </label>
              <input
                type="text"
                value={vacatingForm.gasMeterReading}
                onChange={(e) => setVacatingForm({ ...vacatingForm, gasMeterReading: e.target.value })}
                placeholder="e.g. 840"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Handover Remarks
            </label>
            <textarea
              rows={2}
              value={vacatingForm.remarks}
              onChange={(e) => setVacatingForm({ ...vacatingForm, remarks: e.target.value })}
              placeholder="e.g. All personal belongings cleared. Keys available with resident."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsVacatingModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
            >
              Submit Handover Notice
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: SECRETARY UPDATE RENT */}
      <Modal
        isOpen={!!selectedRent}
        onClose={() => setSelectedRent(null)}
        title="Update Transit Rent & Record Disbursement"
        subtitle={`Resident: ${selectedRent?.residentId?.name} (Wing ${selectedRent?.wing} Flat ${selectedRent?.flatNumber})`}
      >
        <form onSubmit={handleUpdateRent} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Status
            </label>
            <select
              value={rentUpdateForm.status}
              onChange={(e) => setRentUpdateForm({ ...rentUpdateForm, status: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
            >
              <option value="Submitted">Submitted</option>
              <option value="Under Review">Under Review</option>
              <option value="Approved">Approved</option>
              <option value="Disbursed">Disbursed</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Add Newly Disbursed Month (Optional)
            </label>
            <input
              type="text"
              value={rentUpdateForm.disbursedMonth}
              onChange={(e) => setRentUpdateForm({ ...rentUpdateForm, disbursedMonth: e.target.value })}
              placeholder="e.g. April 2026"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Secretary Remarks / Transfer Reference
            </label>
            <input
              type="text"
              value={rentUpdateForm.remarks}
              onChange={(e) => setRentUpdateForm({ ...rentUpdateForm, remarks: e.target.value })}
              placeholder="e.g. NEFT Reference # N19203948 cleared from builder escrow account."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setSelectedRent(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
            >
              Update Rent Record
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: SECRETARY UPDATE VACATING */}
      <Modal
        isOpen={!!selectedVacating}
        onClose={() => setSelectedVacating(null)}
        title="Update Handover & Flat Inspection"
        subtitle={`Flat ${selectedVacating?.flatNumber} Wing ${selectedVacating?.wing}`}
      >
        <form onSubmit={handleUpdateVacating} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Handover Lifecycle Status
            </label>
            <select
              value={vacatingUpdateForm.status}
              onChange={(e) => setVacatingUpdateForm({ ...vacatingUpdateForm, status: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
            >
              <option value="Submitted">Submitted</option>
              <option value="Inspection Scheduled">Inspection Scheduled</option>
              <option value="Keys Handed Over">Keys Handed Over</option>
              <option value="Completed">Completed (Demolition Ready)</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Joint Inspection Date
            </label>
            <input
              type="date"
              value={vacatingUpdateForm.inspectionDate}
              onChange={(e) => setVacatingUpdateForm({ ...vacatingUpdateForm, inspectionDate: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Inspection Notes / Key Receipt Certificate
            </label>
            <textarea
              rows={3}
              value={vacatingUpdateForm.remarks}
              onChange={(e) => setVacatingUpdateForm({ ...vacatingUpdateForm, remarks: e.target.value })}
              placeholder="e.g. Keys received and stored in society safe. Electricity meter reading verified on site."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setSelectedVacating(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
            >
              Save Handover Status
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
