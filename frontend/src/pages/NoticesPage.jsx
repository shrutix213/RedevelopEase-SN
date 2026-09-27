import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getNoticesApi, createNoticeApi, updateNoticeApi, deleteNoticeApi } from '../services/api';
import { Modal } from '../components/Modal';
import { Badge } from '../components/Badge';
import { EmptyState } from '../components/EmptyState';
import {
  FileText,
  Plus,
  Pin,
  Trash2,
  Edit2,
  Calendar,
  AlertTriangle,
  Search,
  Filter,
} from 'lucide-react';

export const NoticesPage = () => {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'General',
    priority: 'Normal',
    isPinned: false,
  });

  const isSecretary = user?.role === 'secretary' || user?.role === 'super_admin';

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const res = await getNoticesApi();
      if (res.data.success) {
        setNotices(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const openCreateModal = () => {
    setEditingNotice(null);
    setFormData({
      title: '',
      content: '',
      category: 'General',
      priority: 'Normal',
      isPinned: false,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (notice) => {
    setEditingNotice(notice);
    setFormData({
      title: notice.title || '',
      content: notice.content || '',
      category: notice.category || 'General',
      priority: notice.priority || 'Normal',
      isPinned: !!notice.isPinned,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingNotice) {
        await updateNoticeApi(editingNotice._id, formData);
      } else {
        await createNoticeApi(formData);
      }
      setIsModalOpen(false);
      fetchNotices();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save notice');
    }
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete circular: "${title}"?`)) return;
    try {
      await deleteNoticeApi(id);
      fetchNotices();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete notice');
    }
  };

  const filtered = notices.filter(
    (n) =>
      (!categoryFilter || n.category === categoryFilter) &&
      (n.title?.toLowerCase().includes(search.toLowerCase()) ||
        n.content?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Society Notices & Circulars
          </h1>
          <p className="text-xs text-slate-500">
            Official announcements, Section 79A directives, SGM notices, and general correspondence
          </p>
        </div>

        {isSecretary && (
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4" /> Publish New Notice
          </button>
        )}
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search circulars..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
          >
            <option value="">All Categories</option>
            <option value="General">General</option>
            <option value="Redevelopment">Redevelopment</option>
            <option value="Meeting">Meeting / SGM</option>
            <option value="Emergency">Emergency</option>
            <option value="Financial">Financial / Audit</option>
            <option value="Legal">Legal</option>
          </select>
        </div>
      </div>

      {/* Notices Feed */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading notices...</div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No notices found"
          description="There are currently no circulars matching your criteria."
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => (
            <div
              key={item._id}
              className={`bg-white rounded-2xl border p-6 shadow-sm hover:shadow-md transition-all ${
                item.isPinned ? 'border-emerald-300 bg-emerald-50/15' : 'border-slate-200/80'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {item.isPinned && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                      <Pin className="w-3 h-3 rotate-45" /> Pinned
                    </span>
                  )}
                  <Badge variant="blue">{item.category}</Badge>
                  {item.priority === 'Urgent' && (
                    <Badge variant="rose">Urgent Priority</Badge>
                  )}
                  {item.priority === 'Important' && (
                    <Badge variant="amber">Important</Badge>
                  )}
                  <span className="text-[11px] text-slate-400">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {isSecretary && (
                  <div className="flex items-center gap-1 self-end sm:self-auto">
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Edit Notice"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item._id, item.title)}
                      className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Notice"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <h3 className="text-base font-bold text-slate-900 mb-2">{item.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                {item.content}
              </p>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Published by {item.createdBy?.name || 'Managing Committee'}</span>
                <span>Cooperative Housing Society Directive</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT NOTICE MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingNotice ? 'Edit Notice Circular' : 'Publish Notice Circular'}
        subtitle="This circular will be distributed to all society residents"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Notice Subject / Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Schedule for Structural Demolition & Utility Disconnection"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
              >
                <option value="General">General</option>
                <option value="Redevelopment">Redevelopment</option>
                <option value="Meeting">Meeting / SGM</option>
                <option value="Emergency">Emergency</option>
                <option value="Financial">Financial / Audit</option>
                <option value="Legal">Legal</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
              >
                <option value="Normal">Normal</option>
                <option value="Important">Important</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Notice Content *
            </label>
            <textarea
              rows={5}
              required
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Full text of the circular to members..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPinned"
              checked={formData.isPinned}
              onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <label htmlFor="isPinned" className="text-xs font-medium text-slate-700 cursor-pointer">
              Pin to top of Notice Board
            </label>
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
            >
              {editingNotice ? 'Update Notice' : 'Publish Notice'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
