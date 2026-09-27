import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfileApi } from '../services/api';
import { RoleBadge } from '../components/Badge';
import { User, Save, Lock, Phone, Building, CheckCircle2, ShieldAlert } from 'lucide-react';

export const ProfilePage = () => {
  const { user, refreshUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    wing: user?.wing || '',
    flatNumber: user?.flatNumber || '',
    password: '',
  });

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [isError, setIsError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    setIsError(false);
    setSaving(true);

    try {
      const payload = {
        name: formData.name,
        phone: formData.phone,
        wing: formData.wing,
        flatNumber: formData.flatNumber,
      };
      if (formData.password) {
        payload.password = formData.password;
      }

      const res = await updateProfileApi(payload);
      if (res.data.success) {
        setMsg('Profile credentials updated successfully!');
        setFormData((prev) => ({ ...prev, password: '' }));
        refreshUser();
      }
    } catch (err) {
      setIsError(true);
      setMsg(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          User Account Profile
        </h1>
        <p className="text-xs text-slate-500">
          Manage your personal details, contact information, and security credentials
        </p>
      </div>

      {msg && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
            isError ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          {isError ? <ShieldAlert className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
          <span>{msg}</span>
        </div>
      )}

      {/* Profile Overview Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-extrabold text-2xl flex items-center justify-center shadow-md shadow-emerald-600/20">
          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-slate-900">{user?.name}</h3>
            <RoleBadge role={user?.role} />
          </div>
          <p className="text-xs text-slate-500 font-mono">{user?.email}</p>
          {user?.societyId && (
            <p className="text-xs text-emerald-700 font-medium mt-1">
              {typeof user.societyId === 'object' ? user.societyId.name : 'Registered Society'}
            </p>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-100">
          Personal Information
        </h4>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Phone Number</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Wing</label>
            <input
              type="text"
              value={formData.wing}
              onChange={(e) => setFormData({ ...formData, wing: e.target.value })}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Flat Number</label>
            <input
              type="text"
              value={formData.flatNumber}
              onChange={(e) => setFormData({ ...formData, flatNumber: e.target.value })}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Change Password (Leave blank to keep existing)
          </label>
          <input
            type="password"
            minLength={6}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Enter new password (optional)"
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
          />
        </div>

        <div className="pt-3 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Updating...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};
