import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getSettingsApi, updateSettingsApi } from '../services/api';
import { Settings, Save, CheckCircle2, ShieldAlert, Sliders } from 'lucide-react';

export const SettingsPage = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    appName: 'RedevelopEase',
    maintenanceMode: false,
    allowPublicRegistration: true,
    systemEmail: 'admin@redevelopease.in',
    supportContact: '+91 22 4567 8900',
    announcementBanner: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await getSettingsApi();
      if (res.data.success) {
        setSettings(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMsg('');
      const res = await updateSettingsApi(settings);
      if (res.data.success) {
        setMsg('Platform parameters saved successfully!');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="py-16 text-center text-xs text-slate-400">Loading platform settings...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Platform Governance & Configuration
        </h1>
        <p className="text-xs text-slate-500">
          Super Admin global settings across the housing society ecosystem
        </p>
      </div>

      {msg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{msg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Sliders className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-900">General Platform Parameters</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Application Brand Name
              </label>
              <input
                type="text"
                value={settings.appName}
                onChange={(e) => setSettings({ ...settings, appName: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Platform Support Helpline
              </label>
              <input
                type="text"
                value={settings.supportContact}
                onChange={(e) => setSettings({ ...settings, supportContact: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              System Notification Email
            </label>
            <input
              type="email"
              value={settings.systemEmail}
              onChange={(e) => setSettings({ ...settings, systemEmail: e.target.value })}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Global Platform Broadcast Announcement Banner
            </label>
            <input
              type="text"
              value={settings.announcementBanner || ''}
              onChange={(e) => setSettings({ ...settings, announcementBanner: e.target.value })}
              placeholder="e.g. Scheduled platform maintenance Sunday 02:00 AM IST"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          {/* Toggle Switches */}
          <div className="pt-2 space-y-3">
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl">
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  Allow Public Resident Self-Registration
                </span>
                <span className="text-[11px] text-slate-500">
                  When enabled, residents can submit registration requests for secretary approval.
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.allowPublicRegistration}
                onChange={(e) =>
                  setSettings({ ...settings, allowPublicRegistration: e.target.checked })
                }
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl">
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  System Maintenance Mode
                </span>
                <span className="text-[11px] text-slate-500">
                  Restrict portal write operations during active database upgrades.
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Updating Settings...' : 'Save Configuration'}
          </button>
        </div>
      </form>
    </div>
  );
};
