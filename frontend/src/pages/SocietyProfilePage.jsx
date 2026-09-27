import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getSocietyByIdApi, updateSocietyApi, getBuildersApi } from '../services/api';
import { ProgressBar } from '../components/ProgressBar';
import { StatusBadge } from '../components/Badge';
import { Building2, Save, HardHat, Calendar, FileText, CheckCircle2, ShieldAlert } from 'lucide-react';

export const SocietyProfilePage = () => {
  const { user } = useAuth();
  const [society, setSociety] = useState(null);
  const [builders, setBuilders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [isError, setIsError] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    pincode: '',
    totalFlats: 0,
    establishedYear: '',
    registrationNumber: '',
    societyType: '',
    redevelopmentInfo: {
      builderName: '',
      builderId: '',
      reraNumber: '',
      status: 'Planning',
      currentProgress: 0,
      carpetAreaHikePercentage: 25,
      hardshipCompensation: '',
      monthlyTransitRentPerSqFt: 65,
      agreementDate: '',
      completionDate: '',
    },
  });

  const isSecretary = user?.role === 'secretary' || user?.role === 'super_admin';

  const fetchSociety = async () => {
    try {
      setLoading(true);
      const societyId = typeof user.societyId === 'object' ? user.societyId._id : user.societyId;
      if (!societyId) return;

      const [resSoc, resBld] = await Promise.all([
        getSocietyByIdApi(societyId),
        getBuildersApi(),
      ]);

      if (resSoc.data.success) {
        const s = resSoc.data.data;
        setSociety(s);
        setFormData({
          name: s.name || '',
          address: s.address || '',
          city: s.city || '',
          pincode: s.pincode || '',
          totalFlats: s.totalFlats || 0,
          establishedYear: s.establishedYear || '',
          registrationNumber: s.registrationNumber || '',
          societyType: s.societyType || 'Cooperative Housing Society (CHS)',
          redevelopmentInfo: {
            builderName: s.redevelopmentInfo?.builderName || '',
            builderId: s.redevelopmentInfo?.builderId?._id || '',
            reraNumber: s.redevelopmentInfo?.reraNumber || '',
            status: s.redevelopmentInfo?.status || 'Planning',
            currentProgress: s.redevelopmentInfo?.currentProgress || 0,
            carpetAreaHikePercentage: s.redevelopmentInfo?.carpetAreaHikePercentage || 25,
            hardshipCompensation: s.redevelopmentInfo?.hardshipCompensation || '',
            monthlyTransitRentPerSqFt: s.redevelopmentInfo?.monthlyTransitRentPerSqFt || 65,
            agreementDate: s.redevelopmentInfo?.agreementDate ? s.redevelopmentInfo.agreementDate.split('T')[0] : '',
            completionDate: s.redevelopmentInfo?.completionDate ? s.redevelopmentInfo.completionDate.split('T')[0] : '',
          },
        });
      }

      if (resBld.data.success) {
        setBuilders(resBld.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSociety();
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRedevChange = (e) => {
    setFormData({
      ...formData,
      redevelopmentInfo: {
        ...formData.redevelopmentInfo,
        [e.target.name]: e.target.value,
      },
    });
  };

  const handleBuilderSelect = (e) => {
    const bldId = e.target.value;
    const bld = builders.find((b) => b._id === bldId);
    if (bld) {
      setFormData({
        ...formData,
        redevelopmentInfo: {
          ...formData.redevelopmentInfo,
          builderId: bld._id,
          builderName: bld.companyName,
          reraNumber: bld.reraNumber,
        },
      });
    } else {
      setFormData({
        ...formData,
        redevelopmentInfo: {
          ...formData.redevelopmentInfo,
          builderId: '',
          builderName: '',
          reraNumber: '',
        },
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isSecretary) return;

    setStatusMsg('');
    setIsError(false);
    setSaving(true);

    try {
      const societyId = typeof user.societyId === 'object' ? user.societyId._id : user.societyId;
      const res = await updateSocietyApi(societyId, formData);
      if (res.data.success) {
        setStatusMsg('Society & Redevelopment profiles updated successfully!');
        setSociety(res.data.data);
      }
    } catch (err) {
      setIsError(true);
      setStatusMsg(err.response?.data?.message || 'Failed to update society details');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-xs text-slate-400">Loading society profile...</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Society Management & Redevelopment Parameters
          </h1>
          <p className="text-xs text-slate-500">
            Configure legal entity metadata, appointed builder, and member redevelopment benefits
          </p>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge status={society?.redevelopmentInfo?.status || 'Planning'} />
        </div>
      </div>

      {statusMsg && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
            isError ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          {isError ? <ShieldAlert className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Progress Telemetry Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
          <div>
            <h3 className="font-bold text-sm text-slate-900">{society?.name}</h3>
            <p className="text-xs text-slate-500">
              Registration No: <span className="font-mono text-slate-700">{society?.registrationNumber || 'Not set'}</span>
            </p>
          </div>
          <div className="w-full sm:w-64">
            <ProgressBar progress={formData.redevelopmentInfo.currentProgress} label="Execution Progress" />
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Society Details */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Building2 className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-900">Society Entity Details</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Society Name
              </label>
              <input
                type="text"
                name="name"
                disabled={!isSecretary}
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Registration Number
              </label>
              <input
                type="text"
                name="registrationNumber"
                disabled={!isSecretary}
                value={formData.registrationNumber}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-mono disabled:bg-slate-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Society Address
              </label>
              <input
                type="text"
                name="address"
                disabled={!isSecretary}
                value={formData.address}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                City
              </label>
              <input
                type="text"
                name="city"
                disabled={!isSecretary}
                value={formData.city}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 disabled:bg-slate-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pincode
              </label>
              <input
                type="text"
                name="pincode"
                disabled={!isSecretary}
                value={formData.pincode}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 disabled:bg-slate-50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Total Flats / Units
              </label>
              <input
                type="number"
                name="totalFlats"
                disabled={!isSecretary}
                value={formData.totalFlats}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 disabled:bg-slate-50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Established Year
              </label>
              <input
                type="number"
                name="establishedYear"
                disabled={!isSecretary}
                value={formData.establishedYear}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 disabled:bg-slate-50"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Redevelopment Project Parameters */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <HardHat className="w-4 h-4 text-amber-600" />
            <h3 className="font-bold text-sm text-slate-900">Redevelopment Contract & Developer</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Appointed Builder Partner
              </label>
              <select
                name="builderId"
                disabled={!isSecretary}
                value={formData.redevelopmentInfo.builderId}
                onChange={handleBuilderSelect}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white disabled:bg-slate-50"
              >
                <option value="">-- Custom / Pending Selection --</option>
                {builders.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.companyName} (RERA: {b.reraNumber})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Developer Company Name
              </label>
              <input
                type="text"
                name="builderName"
                disabled={!isSecretary}
                value={formData.redevelopmentInfo.builderName}
                onChange={handleRedevChange}
                placeholder="e.g. Apex Lifespaces & Infra Pvt Ltd"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 disabled:bg-slate-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                MahaRERA Project Number
              </label>
              <input
                type="text"
                name="reraNumber"
                disabled={!isSecretary}
                value={formData.redevelopmentInfo.reraNumber}
                onChange={handleRedevChange}
                placeholder="P518000XXXXX"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-mono disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Development Phase / Status
              </label>
              <select
                name="status"
                disabled={!isSecretary}
                value={formData.redevelopmentInfo.status}
                onChange={handleRedevChange}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white disabled:bg-slate-50"
              >
                <option value="Planning">Planning</option>
                <option value="Tendering">Tendering</option>
                <option value="Builder Appointed">Builder Appointed</option>
                <option value="DA Signed">DA Signed</option>
                <option value="Demolition">Demolition</option>
                <option value="Excavation & Plinth">Excavation & Plinth</option>
                <option value="RCC Construction">RCC Construction</option>
                <option value="Finishing & Handover">Finishing & Handover</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Current Completion %
              </label>
              <input
                type="number"
                name="currentProgress"
                min="0"
                max="100"
                disabled={!isSecretary}
                value={formData.redevelopmentInfo.currentProgress}
                onChange={handleRedevChange}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 disabled:bg-slate-50 font-bold text-emerald-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Carpet Area Hike (%)
              </label>
              <input
                type="number"
                step="0.1"
                name="carpetAreaHikePercentage"
                disabled={!isSecretary}
                value={formData.redevelopmentInfo.carpetAreaHikePercentage}
                onChange={handleRedevChange}
                placeholder="25"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Monthly Transit Rent (₹ / sq.ft)
              </label>
              <input
                type="number"
                name="monthlyTransitRentPerSqFt"
                disabled={!isSecretary}
                value={formData.redevelopmentInfo.monthlyTransitRentPerSqFt}
                onChange={handleRedevChange}
                placeholder="65"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Hardship Compensation
              </label>
              <input
                type="text"
                name="hardshipCompensation"
                disabled={!isSecretary}
                value={formData.redevelopmentInfo.hardshipCompensation}
                onChange={handleRedevChange}
                placeholder="₹15,00,000 per member"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 disabled:bg-slate-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                DA Agreement Date
              </label>
              <input
                type="date"
                name="agreementDate"
                disabled={!isSecretary}
                value={formData.redevelopmentInfo.agreementDate}
                onChange={handleRedevChange}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Completion / Handover
              </label>
              <input
                type="date"
                name="completionDate"
                disabled={!isSecretary}
                value={formData.redevelopmentInfo.completionDate}
                onChange={handleRedevChange}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 disabled:bg-slate-50"
              />
            </div>
          </div>
        </div>

        {isSecretary && (
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving Changes...' : 'Save Society Configuration'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};
