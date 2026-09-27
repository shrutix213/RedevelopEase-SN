import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMeetingsApi, createMeetingApi, updateMeetingApi, deleteMeetingApi } from '../services/api';
import { Modal } from '../components/Modal';
import { StatusBadge } from '../components/Badge';
import { EmptyState } from '../components/EmptyState';
import {
  Calendar,
  Plus,
  Clock,
  MapPin,
  Users,
  FileText,
  Edit2,
  Trash2,
  CheckCircle,
} from 'lucide-react';

export const MeetingsPage = () => {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isMinutesModalOpen, setIsMinutesModalOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);

  const [scheduleForm, setScheduleForm] = useState({
    title: '',
    agenda: '',
    location: '',
    date: '',
    time: '10:30 AM',
    status: 'Scheduled',
  });

  const [minutesForm, setMinutesForm] = useState({
    minutes: '',
    status: 'Completed',
    attendeesCount: 0,
  });

  const isSecretary = user?.role === 'secretary' || user?.role === 'super_admin';

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const res = await getMeetingsApi();
      if (res.data.success) {
        setMeetings(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createMeetingApi(scheduleForm);
      setIsScheduleModalOpen(false);
      setScheduleForm({
        title: '',
        agenda: '',
        location: '',
        date: '',
        time: '10:30 AM',
        status: 'Scheduled',
      });
      fetchMeetings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to schedule meeting');
    }
  };

  const openMinutesModal = (meeting) => {
    setSelectedMeeting(meeting);
    setMinutesForm({
      minutes: meeting.minutes || '',
      status: meeting.status || 'Completed',
      attendeesCount: meeting.attendeesCount || 0,
    });
    setIsMinutesModalOpen(true);
  };

  const handleMinutesSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMeeting) return;
    try {
      await updateMeetingApi(selectedMeeting._id, minutesForm);
      setIsMinutesModalOpen(false);
      fetchMeetings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record minutes');
    }
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`Cancel and delete meeting "${title}"?`)) return;
    try {
      await deleteMeetingApi(id);
      fetchMeetings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete meeting');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Society Meetings & Special General Body (SGM)
          </h1>
          <p className="text-xs text-slate-500">
            Convene redevelopment review meetings, record official minutes, and document member attendance
          </p>
        </div>

        {isSecretary && (
          <button
            onClick={() => setIsScheduleModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4" /> Schedule Meeting
          </button>
        )}
      </div>

      {/* Meetings List */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading meetings...</div>
      ) : meetings.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No meetings scheduled"
          description="Meetings convened by the Secretary will appear here with location and agenda details."
          actionText={isSecretary ? 'Schedule Meeting' : undefined}
          onAction={isSecretary ? () => setIsScheduleModalOpen(true) : undefined}
        />
      ) : (
        <div className="space-y-4">
          {meetings.map((item) => {
            const meetingDate = new Date(item.date);
            const isPast = meetingDate < new Date();

            return (
              <div
                key={item._id}
                className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-start justify-between gap-5"
              >
                {/* Date Badge */}
                <div className="shrink-0 flex items-center md:flex-col gap-2 p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-center min-w-[90px]">
                  <span className="text-[11px] uppercase font-bold text-emerald-700">
                    {meetingDate.toLocaleString('default', { month: 'short' })}
                  </span>
                  <span className="text-2xl font-extrabold text-slate-900 leading-none">
                    {meetingDate.getDate()}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {meetingDate.getFullYear()}
                  </span>
                </div>

                {/* Meeting Details */}
                <div className="flex-1 space-y-2.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <StatusBadge status={item.status} />
                    <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> {item.time}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> {item.location}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{item.title}</h3>

                  <div className="p-3 bg-slate-50/80 rounded-xl text-xs space-y-1">
                    <span className="font-bold text-slate-700 block uppercase tracking-wider text-[10px]">
                      Meeting Agenda:
                    </span>
                    <p className="text-slate-600 whitespace-pre-line leading-relaxed">{item.agenda}</p>
                  </div>

                  {item.minutes && (
                    <div className="p-3.5 bg-emerald-50/60 border border-emerald-100 rounded-xl text-xs space-y-1">
                      <div className="flex items-center justify-between text-emerald-900 font-bold text-[11px] uppercase tracking-wider">
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Minutes of Meeting (MOM):
                        </span>
                        {item.attendeesCount > 0 && (
                          <span className="text-emerald-700">{item.attendeesCount} Members Present</span>
                        )}
                      </div>
                      <p className="text-slate-700 leading-relaxed whitespace-pre-line">{item.minutes}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {isSecretary && (
                  <div className="shrink-0 flex items-center md:flex-col gap-2 self-end md:self-auto">
                    <button
                      onClick={() => openMinutesModal(item)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold text-xs transition-colors flex items-center gap-1 shadow-2xs"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      {item.minutes ? 'Edit Minutes' : 'Record Minutes'}
                    </button>
                    <button
                      onClick={() => handleDelete(item._id, item.title)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Cancel Meeting"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* SCHEDULE MEETING MODAL */}
      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        title="Schedule Society Meeting / SGM"
        subtitle="Notifies members and posts meeting details to the community calendar"
      >
        <form onSubmit={handleScheduleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Meeting Title *
            </label>
            <input
              type="text"
              required
              value={scheduleForm.title}
              onChange={(e) => setScheduleForm({ ...scheduleForm, title: e.target.value })}
              placeholder="e.g. Special General Meeting for DA Ratification"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                required
                value={scheduleForm.date}
                onChange={(e) => setScheduleForm({ ...scheduleForm, date: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Time *
              </label>
              <input
                type="text"
                required
                value={scheduleForm.time}
                onChange={(e) => setScheduleForm({ ...scheduleForm, time: e.target.value })}
                placeholder="10:30 AM"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Location / Venue *
            </label>
            <input
              type="text"
              required
              value={scheduleForm.location}
              onChange={(e) => setScheduleForm({ ...scheduleForm, location: e.target.value })}
              placeholder="e.g. Society Temporary Clubhouse, Dadar West / Zoom link"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Meeting Agenda *
            </label>
            <textarea
              rows={4}
              required
              value={scheduleForm.agenda}
              onChange={(e) => setScheduleForm({ ...scheduleForm, agenda: e.target.value })}
              placeholder="1. Presentation of revised floor layouts&#10;2. Discussion on transit rent disbursement&#10;3. Resolution voting"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsScheduleModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
            >
              Schedule & Notify Members
            </button>
          </div>
        </form>
      </Modal>

      {/* RECORD MINUTES MODAL */}
      <Modal
        isOpen={isMinutesModalOpen}
        onClose={() => setIsMinutesModalOpen(false)}
        title="Record Minutes of Meeting (MOM)"
        subtitle={`Documenting resolutions for: "${selectedMeeting?.title}"`}
      >
        <form onSubmit={handleMinutesSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Meeting Status
              </label>
              <select
                value={minutesForm.status}
                onChange={(e) => setMinutesForm({ ...minutesForm, status: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
              >
                <option value="Completed">Completed</option>
                <option value="In Progress">In Progress</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Attendees Present
              </label>
              <input
                type="number"
                min="0"
                value={minutesForm.attendeesCount}
                onChange={(e) => setMinutesForm({ ...minutesForm, attendeesCount: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Official Minutes & Resolutions Passed *
            </label>
            <textarea
              rows={6}
              required
              value={minutesForm.minutes}
              onChange={(e) => setMinutesForm({ ...minutesForm, minutes: e.target.value })}
              placeholder="Record points discussed, questions answered by the architect/builder, and vote tallies..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsMinutesModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
            >
              Publish Minutes
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
