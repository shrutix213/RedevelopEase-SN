import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getActivityLogsApi } from '../services/api';
import { EmptyState } from '../components/EmptyState';
import { RoleBadge } from '../components/Badge';
import { History, Shield, Search, RefreshCw, Terminal } from 'lucide-react';

export const AuditLogsPage = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await getActivityLogsApi();
      if (res.data.success) {
        setLogs(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filtered = logs.filter(
    (l) =>
      l.action?.toLowerCase().includes(search.toLowerCase()) ||
      l.details?.toLowerCase().includes(search.toLowerCase()) ||
      l.userId?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            System & Society Audit Logs
          </h1>
          <p className="text-xs text-slate-500">
            Immutable legal activity trail recording administrative approvals, milestones, and circulars
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors shadow-2xs self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" /> Refresh Telemetry
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search audit trail..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
          />
        </div>
        <div className="text-xs text-slate-500 font-mono">
          Logs: <span className="font-bold text-slate-800">{filtered.length}</span> events
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">Loading audit records...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={History}
              title="No audit entries"
              description="Platform actions are automatically recorded in this tamper-evident audit store."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-5">Timestamp</th>
                  <th className="py-3 px-5">Action Event</th>
                  <th className="py-3 px-5">Actor / User</th>
                  <th className="py-3 px-5">Role</th>
                  <th className="py-3 px-5">Event Details</th>
                  <th className="py-3 px-5">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-mono text-[11px]">
                {filtered.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-5 text-slate-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-5 font-bold text-slate-900 font-sans">
                      {log.action}
                    </td>
                    <td className="py-3 px-5 font-sans font-medium text-slate-800">
                      {log.userId?.name || 'System Service'}
                    </td>
                    <td className="py-3 px-5 font-sans">
                      <RoleBadge role={log.userId?.role} />
                    </td>
                    <td className="py-3 px-5 text-slate-600 font-sans max-w-sm truncate">
                      {log.details || '—'}
                    </td>
                    <td className="py-3 px-5 text-slate-400 text-[10px]">
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
