import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getBuildersApi, createBuilderApi, assignSocietyApi, getSocietiesApi } from '../services/api';
import { Modal } from '../components/Modal';
import { EmptyState } from '../components/EmptyState';
import {
  HardHat,
  Plus,
  Building,
  Phone,
  Mail,
  ShieldCheck,
  Search,
  Globe,
  Award,
  Link as LinkIcon,
} from 'lucide-react';

export const BuildersPage = () => {
  const { user } = useAuth();
  const [builders, setBuilders] = useState([]);
  const [societies, setSocieties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedBuilder, setSelectedBuilder] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    email: '',
    phone: '',
    reraNumber: '',
    experienceYears: 15,
    completedProjects: 8,
    password: 'builder123',
    address: 'Mumbai, Maharashtra',
    website: '',
  });

  const [assignForm, setAssignForm] = useState({
    societyId: '',
    agreementDate: '',
    completionDate: '',
  });

  const isSuperAdmin = user?.role === 'super_admin';

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resBld, resSoc] = await Promise.all([
        getBuildersApi(),
        getSocietiesApi(),
      ]);
      if (resBld.data.success) setBuilders(resBld.data.data);
      if (resSoc.data.success) setSocieties(resSoc.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      await createBuilderApi(formData);
      setIsCreateModalOpen(false);
      setFormData({
        name: '',
        companyName: '',
        email: '',
        phone: '',
        reraNumber: '',
        experienceYears: 15,
        completedProjects: 8,
        password: 'builder123',
        address: 'Mumbai, Maharashtra',
        website: '',
      });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create builder');
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBuilder) return;
    try {
      await assignSocietyApi(selectedBuilder._id, assignForm);
      setIsAssignModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign builder');
    }
  };

  const filtered = builders.filter(
    (b) =>
      b.companyName?.toLowerCase().includes(search.toLowerCase()) ||
      b.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.reraNumber?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            MahaRERA Builder Partners
          </h1>
          <p className="text-xs text-slate-500">
            Empaneled real estate developers and infrastructure contractors for society redevelopment
          </p>
        </div>

        {isSuperAdmin && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4" /> Onboard Builder Partner
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search builders by company or RERA..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
          />
        </div>
        <div className="text-xs text-slate-500">
          Total: <span className="font-bold text-slate-800">{filtered.length}</span> Developers
        </div>
      </div>

      {/* Builders Grid */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading builder directory...</div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={HardHat}
          title="No builder partners registered"
          description="Register verified builder companies to assign them to society redevelopment tenders."
          actionText={isSuperAdmin ? 'Onboard Builder' : undefined}
          onAction={isSuperAdmin ? () => setIsCreateModalOpen(true) : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((builder) => (
            <div
              key={builder._id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="p-2.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200">
                    <HardHat className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[10px] font-bold border border-slate-200">
                    RERA: {builder.reraNumber}
                  </span>
                </div>

                <h3 className="font-bold text-base text-slate-900 leading-snug line-clamp-1">
                  {builder.companyName}
                </h3>
                <p className="text-xs text-slate-500 mb-3">Director: {builder.name}</p>

                <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs mb-4">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Track Record:</span>
                    <span className="font-semibold text-slate-800">
                      {builder.completedProjects} Projects Delivered
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Industry Exp:</span>
                    <span className="font-semibold text-slate-800">
                      {builder.experienceYears} Years
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Login Email:</span>
                    <span className="font-mono text-slate-700 text-[11px] truncate max-w-[150px]">
                      {builder.email}
                    </span>
                  </div>
                  {builder.phone && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Contact:</span>
                      <span className="text-slate-700 font-mono text-[11px]">{builder.phone}</span>
                    </div>
                  )}
                </div>

                {/* Assigned Societies */}
                <div className="space-y-1.5 mb-2">
                  <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                    Assigned Societies ({builder.assignedSocieties?.length || 0})
                  </span>
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {builder.assignedSocieties?.length > 0 ? (
                      builder.assignedSocieties.map((s) => (
                        <div
                          key={s._id}
                          className="p-1.5 bg-emerald-50/60 rounded-lg text-xs font-semibold text-emerald-900 border border-emerald-100 flex items-center justify-between"
                        >
                          <span className="truncate">{s.name}</span>
                          <span className="text-[10px] text-emerald-700 font-bold">
                            {s.redevelopmentInfo?.currentProgress || 0}%
                          </span>
                        </div>
                      ))
                    ) : (
                      <span className="text-[11px] text-slate-400 italic block">
                        No active society assignment
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {isSuperAdmin && (
                <div className="pt-3 border-t border-slate-100 mt-2 flex justify-end">
                  <button
                    onClick={() => {
                      setSelectedBuilder(builder);
                      setIsAssignModalOpen(true);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors flex items-center gap-1 shadow-2xs"
                  >
                    <LinkIcon className="w-3.5 h-3.5" /> Assign to Society
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* CREATE BUILDER MODAL */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Onboard Builder Partner & Provision Portal Account"
        subtitle="Registers builder profile and creates their login credentials"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Builder / Company Name *
            </label>
            <input
              type="text"
              required
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              placeholder="e.g. Apex Lifespaces & Infra Pvt Ltd"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Authorized Signatory / Contact Person *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Rohan Sharma"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                MahaRERA Registration Number *
              </label>
              <input
                type="text"
                required
                value={formData.reraNumber}
                onChange={(e) => setFormData({ ...formData, reraNumber: e.target.value })}
                placeholder="P518000XXXXX"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Login Email Address *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="builder@domain.in"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Temporary Password *
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Min 6 characters"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98200 00000"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Completed Projects
              </label>
              <input
                type="number"
                value={formData.completedProjects}
                onChange={(e) => setFormData({ ...formData, completedProjects: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Years in Business
              </label>
              <input
                type="number"
                value={formData.experienceYears}
                onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>
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
              Register & Create Account
            </button>
          </div>
        </form>
      </Modal>

      {/* ASSIGN BUILDER TO SOCIETY MODAL */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign Builder to Housing Society"
        subtitle={`Appointing ${selectedBuilder?.companyName}`}
      >
        <form onSubmit={handleAssignSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Housing Society *
            </label>
            <select
              required
              value={assignForm.societyId}
              onChange={(e) => setAssignForm({ ...assignForm, societyId: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
            >
              <option value="">-- Choose Society --</option>
              {societies.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.city})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                DA Agreement Date
              </label>
              <input
                type="date"
                value={assignForm.agreementDate}
                onChange={(e) => setAssignForm({ ...assignForm, agreementDate: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Handover Date
              </label>
              <input
                type="date"
                value={assignForm.completionDate}
                onChange={(e) => setAssignForm({ ...assignForm, completionDate: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAssignModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
            >
              Assign Mandate
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
