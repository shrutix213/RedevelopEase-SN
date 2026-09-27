import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDocumentsApi, uploadDocumentApi, deleteDocumentApi } from '../services/api';
import { Modal } from '../components/Modal';
import { Badge } from '../components/Badge';
import { EmptyState } from '../components/EmptyState';
import {
  FolderOpen,
  Plus,
  FileText,
  Download,
  Trash2,
  Eye,
  Search,
  Filter,
  Shield,
  Layers,
} from 'lucide-react';

const CATEGORIES = ['All', 'Legal', 'Finance', 'Architectural', 'Government', 'Builder'];

export const DocumentsPage = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Legal',
    description: '',
    customUrl: '',
    fileSize: '2.4 MB',
    fileType: 'pdf',
  });
  const [selectedFile, setSelectedFile] = useState(null);

  const isSecretary = user?.role === 'secretary' || user?.role === 'super_admin';
  const isBuilder = user?.role === 'builder';
  const canUpload = isSecretary || isBuilder;

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await getDocumentsApi({
        category: activeCategory === 'All' ? '' : activeCategory,
        search,
      });
      if (res.data.success) {
        setDocuments(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [activeCategory]);

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('category', formData.category);
      data.append('description', formData.description);
      data.append('customUrl', formData.customUrl);
      data.append('fileSize', formData.fileSize);
      data.append('fileType', formData.fileType);
      data.append('societyId', typeof user.societyId === 'object' ? user.societyId._id : user.societyId);

      if (selectedFile) {
        data.append('file', selectedFile);
      }

      await uploadDocumentApi(data);
      setIsUploadModalOpen(false);
      setFormData({
        title: '',
        category: 'Legal',
        description: '',
        customUrl: '',
        fileSize: '2.4 MB',
        fileType: 'pdf',
      });
      setSelectedFile(null);
      fetchDocuments();
    } catch (err) {
      alert(err.response?.data?.message || 'Upload failed');
    }
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete document "${title}"?`)) return;
    try {
      await deleteDocumentApi(id);
      fetchDocuments();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete document');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Document Repository & Archives
          </h1>
          <p className="text-xs text-slate-500">
            Secure vault for Development Agreements, MCGM Sanctioned Layouts, RERA Filings, and Guarantees
          </p>
        </div>

        {canUpload && (
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4" /> Upload Document
          </button>
        )}
      </div>

      {/* Category Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all shrink-0 ${
                activeCategory === cat
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchDocuments()}
            placeholder="Search documents..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
          />
        </div>
      </div>

      {/* Documents Grid */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading document vault...</div>
      ) : documents.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="No documents found"
          description={`There are currently no records filed under category "${activeCategory}".`}
          actionText={canUpload ? 'Upload Document' : undefined}
          onAction={canUpload ? () => setIsUploadModalOpen(true) : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {documents.map((doc) => (
            <div
              key={doc._id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
                    <FileText className="w-5 h-5" />
                  </div>
                  <Badge variant={doc.category === 'Legal' ? 'purple' : doc.category === 'Government' ? 'emerald' : 'blue'}>
                    {doc.category}
                  </Badge>
                </div>

                <h3 className="font-bold text-sm text-slate-900 leading-snug line-clamp-2 mb-1.5 group-hover:text-emerald-700 transition-colors">
                  {doc.title}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                  {doc.description || 'Verified society redevelopment record'}
                </p>

                <div className="p-2.5 bg-slate-50 rounded-xl space-y-1 text-[11px] text-slate-500 mb-4">
                  <div className="flex justify-between">
                    <span>File Format:</span>
                    <span className="font-semibold uppercase text-slate-700">{doc.fileType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Size:</span>
                    <span className="font-semibold text-slate-700">{doc.fileSize}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Uploaded:</span>
                    <span className="text-slate-600">{new Date(doc.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setPreviewDoc(doc)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-emerald-700 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" /> Preview
                </button>

                <div className="flex items-center gap-1.5">
                  <a
                    href={doc.fileUrl}
                    download={doc.fileName}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </a>

                  {isSecretary && (
                    <button
                      onClick={() => handleDelete(doc._id, doc.title)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* UPLOAD DOCUMENT MODAL */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Document to Society Vault"
        subtitle="Ensure copies are verified by the legal counsel or appointed architect"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Document Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Registered Development Agreement & Power of Attorney"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
              >
                <option value="Legal">Legal</option>
                <option value="Finance">Finance</option>
                <option value="Architectural">Architectural</option>
                <option value="Government">Government / RERA</option>
                <option value="Builder">Builder Site Reports</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select File (PDF, DOCX, PNG)
              </label>
              <input
                type="file"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description & Notes
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief details regarding validity, registration numbers, sub-registrar Dadar, etc..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
            >
              Upload to Repository
            </button>
          </div>
        </form>
      </Modal>

      {/* DOCUMENT PREVIEW MODAL */}
      <Modal
        isOpen={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        title={previewDoc?.title || 'Document Preview'}
        subtitle={`Category: ${previewDoc?.category} • ${previewDoc?.fileSize}`}
        maxWidth="max-w-3xl"
        footer={
          <div className="flex items-center justify-between w-full">
            <span className="text-xs text-slate-400">
              Uploaded on {previewDoc?.createdAt && new Date(previewDoc.createdAt).toLocaleDateString()}
            </span>
            <div className="flex items-center gap-2">
              <a
                href={previewDoc?.fileUrl}
                download
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs flex items-center gap-1.5 hover:bg-emerald-700 shadow-xs"
              >
                <Download className="w-3.5 h-3.5" /> Download Document
              </a>
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 rounded-xl text-slate-600 font-semibold text-xs hover:bg-slate-100"
              >
                Close
              </button>
            </div>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <h4 className="font-bold text-slate-800 mb-1">Document Summary</h4>
            <p className="text-slate-600">{previewDoc?.description || 'Official society document'}</p>
          </div>

          {/* Preview frame or placeholder */}
          <div className="h-96 rounded-xl border border-slate-200 bg-slate-100 flex flex-col items-center justify-center p-6 text-center">
            <FileText className="w-16 h-16 text-emerald-600 mb-3" />
            <h4 className="text-sm font-bold text-slate-800 mb-1">{previewDoc?.title}</h4>
            <p className="text-xs text-slate-500 max-w-md mb-4">
              This document is securely archived in the RedevelopEase encrypted store.
            </p>
            <a
              href={previewDoc?.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:border-emerald-600 text-slate-800 font-semibold text-xs transition-colors shadow-2xs"
            >
              Open Full Document in New Tab
            </a>
          </div>
        </div>
      </Modal>
    </div>
  );
};
