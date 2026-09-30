import axios from 'axios';

const API = axios.create({
  baseURL: "https://redevelopease-sn.onrender.com/api",
});

// Intercept requests to inject JWT token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('redevelopease_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept responses for global 401 handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't wipe token if attempting login
      if (!error.config.url.includes('/auth/login')) {
        localStorage.removeItem('redevelopease_token');
        localStorage.removeItem('redevelopease_user');
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const loginApi = (credentials) => API.post('/auth/login', credentials);
export const registerApi = (data) => API.post('/auth/register', data);
export const getMeApi = () => API.get('/auth/me');
export const updateProfileApi = (data) => API.put('/auth/profile', data);

// Societies
export const getSocietiesApi = () => API.get('/societies');
export const getSocietyByIdApi = (id) => API.get(`/societies/${id}`);
export const createSocietyApi = (data) => API.post('/societies', data);
export const updateSocietyApi = (id, data) => API.put(`/societies/${id}`, data);
export const deleteSocietyApi = (id) => API.delete(`/societies/${id}`);

// Residents
export const getResidentsApi = (params) => API.get('/residents', { params });
export const approveResidentApi = (id) => API.put(`/residents/${id}/approve`);
export const rejectResidentApi = (id, data) => API.put(`/residents/${id}/reject`, data);
export const updateResidentApi = (id, data) => API.put(`/residents/${id}`, data);
export const deleteResidentApi = (id) => API.delete(`/residents/${id}`);

// Complaints
export const getComplaintsApi = (params) => API.get('/complaints', { params });
export const createComplaintApi = (data) => API.post('/complaints', data);
export const updateComplaintApi = (id, data) => API.put(`/complaints/${id}`, data);

// Notices
export const getNoticesApi = () => API.get('/notices');
export const createNoticeApi = (data) => API.post('/notices', data);
export const updateNoticeApi = (id, data) => API.put(`/notices/${id}`, data);
export const deleteNoticeApi = (id) => API.delete(`/notices/${id}`);

// Meetings
export const getMeetingsApi = () => API.get('/meetings');
export const createMeetingApi = (data) => API.post('/meetings', data);
export const updateMeetingApi = (id, data) => API.put(`/meetings/${id}`, data);
export const deleteMeetingApi = (id) => API.delete(`/meetings/${id}`);

// Redevelopment
export const getRedevelopmentUpdatesApi = () => API.get('/redevelopment');
export const createRedevelopmentUpdateApi = (data) => API.post('/redevelopment', data);
export const reviewRedevelopmentUpdateApi = (id, data) => API.put(`/redevelopment/${id}/review`, data);

// Documents
export const getDocumentsApi = (params) => API.get('/documents', { params });
export const uploadDocumentApi = (formData) => API.post('/documents', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const deleteDocumentApi = (id) => API.delete(`/documents/${id}`);

// Rent & Vacating
export const getRentRequestsApi = () => API.get('/rent-requests');
export const createRentRequestApi = (data) => API.post('/rent-requests', data);
export const updateRentRequestApi = (id, data) => API.put(`/rent-requests/${id}`, data);

export const getVacatingRequestsApi = () => API.get('/vacating-requests');
export const createVacatingRequestApi = (data) => API.post('/vacating-requests', data);
export const updateVacatingRequestApi = (id, data) => API.put(`/vacating-requests/${id}`, data);

// Builders
export const getBuildersApi = () => API.get('/builders');
export const createBuilderApi = (data) => API.post('/builders', data);
export const assignSocietyApi = (id, data) => API.put(`/builders/${id}/assign`, data);

// Analytics
export const getDashboardAnalyticsApi = () => API.get('/analytics/dashboard');

// Notifications
export const getNotificationsApi = () => API.get('/notifications');
export const markNotificationReadApi = (id) => API.put(`/notifications/${id}/read`);
export const markAllNotificationsReadApi = () => API.put('/notifications/read-all');

// Activity Logs
export const getActivityLogsApi = (params) => API.get('/activity-logs', { params });

// Settings
export const getSettingsApi = () => API.get('/settings');
export const updateSettingsApi = (data) => API.put('/settings', data);

export default API;
