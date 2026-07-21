import api from './axios'

// ---- Auth ----
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  googleAuth: () => `${import.meta.env.VITE_API_URL || '/api'}/auth/google`,
  logout: (data) => api.post('/auth/logout', data),
  refresh: (data) => api.post('/auth/refresh', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (token, data) => api.post(`/auth/reset-password/${token}`, data),
  getMe: () => api.get('/auth/me'),
}

// ---- Notes ----
export const notesAPI = {
  getAll: (params) => api.get('/notes', { params }),
  getTrending: () => api.get('/notes/trending'),
  getById: (id) => api.get(`/notes/${id}`),
  upload: (formData) => api.post('/notes/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (id) => api.delete(`/notes/${id}`),
  download: (id) => api.post(`/notes/${id}/download`),
  upvote: (id) => api.post(`/notes/${id}/upvote`),
  bookmark: (id) => api.post(`/notes/${id}/bookmark`),
  report: (id, data) => api.post(`/notes/${id}/report`, data),
  getMyNotes: (params) => api.get('/notes/my', { params }),
  getMyBookmarks: (params) => api.get('/notes/bookmarks', { params }),
}

// ---- Comments ----
export const commentsAPI = {
  getByNote: (noteId, params) => api.get(`/notes/${noteId}/comments`, { params }),
  create: (noteId, data) => api.post(`/notes/${noteId}/comments`, data),
  delete: (noteId, commentId) => api.delete(`/notes/${noteId}/comments/${commentId}`),
}

// ---- Users ----
export const usersAPI = {
  getProfile: (id) => api.get(`/users/${id}`),
  updateProfile: (data) => api.put('/users/profile', data),
  getStats: (id) => api.get(`/users/${id}/stats`),
  getLeaderboard: () => api.get('/users/leaderboard'),
}

// ---- Admin ----
export const adminAPI = {
  getQueue: (params) => api.get('/admin/queue', { params }),
  approveNote: (id) => api.put(`/admin/notes/${id}/approve`),
  deleteNote: (id) => api.delete(`/admin/notes/${id}`),
  getAnalytics: () => api.get('/admin/analytics'),
  getUsers: (params) => api.get('/admin/users', { params }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getReports: (params) => api.get('/admin/reports', { params }),
  resolveReport: (id, data) => api.put(`/admin/reports/${id}/resolve`, data),
}

// ---- Search ----
export const searchAPI = {
  search: (params) => api.get('/search', { params }),
  getFilters: () => api.get('/search/filters'),
}
