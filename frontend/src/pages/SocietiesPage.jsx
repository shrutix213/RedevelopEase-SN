import React, { useState, useEffect } from 'react';
import { getSocietiesApi, createSocietyApi, deleteSocietyApi } from '../services/api';
import { Modal } from '../components/Modal';
import { ProgressBar } from '../components/ProgressBar';
import { StatusBadge } from '../components/Badge';
import { EmptyState } from '../components/EmptyState';
import { Building2, Plus, Search, Trash2, MapPin, Users, Calendar, ShieldCheck, Mail, Lock } from 'lucide-react';

export const SocietiesPage = () => {
  const [societies, setSocieties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: 'Mumbai',
    pincode: '',
    totalFlats: '',
    establishedYear: '',
    registrationNumber: '',
    societyType: 'Cooperative Housing Society (CHS)',
    secretaryName: '',
    secretaryEmail: '',
    temporaryPassword: '',
    secretaryPhone: '',
    secretaryWing: 'A',
    secretaryFlatNumber: '101',
  });

  const fetchSocieties = async () => {
    try {
      setLoading(true);
      const res = await getSocietiesApi();
      if (res.data.success) {
        setSocieties(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSocieties();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateSociety = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setSubmitting(true);

    try {
      const res = await createSocietyApi(formData);
      if (res.data.success) {
        setSuccessMsg('Society and Secretary onboarded successfully!');
        setIsCreateModalOpen(false);
        fetchSocieties();
        setFormData({
          name: '',
          address: '',
          city: 'Mumbai',
          pincode: '',
          totalFlats: '',
          establishedYear: '',
          registrationNumber: '',
          societyType: 'Cooperative Housing Society (CHS)',
          secretaryName: '',
          secretaryEmail: '',
          temporaryPassword: '',
          secretaryPhone: '',
          secretaryWing: 'A',
          secretaryFlatNumber: '101',
        });
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Creation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSociety = async (id, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete '${name}' and all associated records?`)) {
      return;
    }
    try {
      await deleteSocietyApi(id);
      fetchSocieties();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete society');
    }
  };

  const filtered = societies.filter(
    (s) =>
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.city?.toLowerCase().includes(search.toLowerCase()) ||
      s.pincode?.includes(search)
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Societies Directory
          </h1>
          <p className="text-xs text-slate-500">
            Super Admin platform management for all housing societies in Maharashtra
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" /> Create New Society
        </button>
      </div>

      {/* Success alert */}
      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-600 font-bold">×</button>
        </div>
      )}

      {/* Search & Stats Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search societies by name, city, pincode..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors"
          />
        </div>
        <div className="text-xs text-slate-500">
          Showing <span className="font-bold text-slate-800">{filtered.length}</span> registered societies
        </div>
      </div>

      {/* Societies Grid */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading societies...</div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No societies found"
          description="Create your first society and assign a secretary to get started."
          actionText="Create Society"
          onAction={() => setIsCreateModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((society) => (
            <div
              key={society._id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-base text-slate-900 leading-snug line-clamp-1">
                    {society.name}
                  </h3>
                  <StatusBadge status={society.redevelopmentInfo?.status || 'Planning'} />
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="line-clamp-1">{society.address}, {society.city} - {society.pincode}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs mb-4">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Flats</span>
                    <span className="font-semibold text-slate-800">{society.totalFlats} Units</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Secretary</span>
                    <span className="font-semibold text-slate-800">
                      {society.secretaryId?.name || 'Unassigned'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Secretary Email</span>
                    <span className="font-mono text-slate-700 text-[11px] truncate max-w-[160px]">
                      {society.secretaryId?.email || 'N/A'}
                    </span>
                  </div>
                  {society.registrationNumber && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Reg No</span>
                      <span className="font-mono text-slate-700 text-[10px]">{society.registrationNumber}</span>
                    </div>
                  )}
                </div>

                <div className="mb-2">
                  <ProgressBar
                    progress={society.redevelopmentInfo?.currentProgress || 0}
                    label="Redevelopment Progress"
                    size="sm"
                  />
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Est. {society.establishedYear || 'N/A'}
                </span>

                <button
                  onClick={() => handleDeleteSociety(society._id, society.name)}
                  className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Delete Society"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE SOCIETY MODAL */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Housing Society & Appoint Secretary"
        subtitle="Registers the society and automatically provisions the first Secretary administrative account"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCreateSociety} className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Section 1: Society Info */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-2 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-emerald-600" /> Society Details
            </h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Society Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Sagar Darshan Co-op Housing Society Ltd."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Plot / Road / Locality"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Mumbai / Pune"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    required
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="400001"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Total Flats *
                  </label>
                  <input
                    type="number"
                    name="totalFlats"
                    required
                    min="1"
                    value={formData.totalFlats}
                    onChange={handleChange}
                    placeholder="e.g. 72"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Established Year
                  </label>
                  <input
                    type="number"
                    name="establishedYear"
                    value={formData.establishedYear}
                    onChange={handleChange}
                    placeholder="e.g. 1992"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Registration Number
                </label>
                <input
                  type="text"
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  placeholder="e.g. BOM/HSG/TC/12984/1992"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 my-3" />

          {/* Section 2: Secretary Details */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-800 mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600" /> Appointed Secretary Account
            </h4>
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Secretary Full Name *
                  </label>
                  <input
                    type="text"
                    name="secretaryName"
                    required
                    value={formData.secretaryName}
                    onChange={handleChange}
                    placeholder="e.g. Sunil Varma"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Secretary Email *
                  </label>
                  <input
                    type="email"
                    name="secretaryEmail"
                    required
                    value={formData.secretaryEmail}
                    onChange={handleChange}
                    placeholder="sunil.varma@gmail.com"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Temporary Password *
                  </label>
                  <input
                    type="password"
                    name="temporaryPassword"
                    required
                    minLength={6}
                    value={formData.temporaryPassword}
                    onChange={handleChange}
                    placeholder="Min 6 chars"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Wing
                  </label>
                  <input
                    type="text"
                    name="secretaryWing"
                    value={formData.secretaryWing}
                    onChange={handleChange}
                    placeholder="A"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Flat No
                  </label>
                  <input
                    type="text"
                    name="secretaryFlatNumber"
                    value={formData.secretaryFlatNumber}
                    onChange={handleChange}
                    placeholder="201"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs disabled:opacity-50"
            >
              {submitting ? 'Creating Society...' : 'Create Society & Account'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
