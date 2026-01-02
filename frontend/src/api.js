import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Admin API
export const adminAPI = {
  getQuizzes: () => api.get('/api/admin/quizzes'),
  getQuiz: (quizId) => api.get(`/api/admin/quizzes/${quizId}`),
  createQuiz: (data) => api.post('/api/admin/quizzes', data),
  updateQuiz: (quizId, data) => api.put(`/api/admin/quizzes/${quizId}`, data),
  deleteQuiz: (quizId) => api.delete(`/api/admin/quizzes/${quizId}`),
  createQuestion: (quizId, data) => api.post(`/api/admin/quizzes/${quizId}/questions`, data),
  updateQuestion: (questionId, data) => api.put(`/api/admin/questions/${questionId}`, data),
  deleteQuestion: (questionId) => api.delete(`/api/admin/questions/${questionId}`),
}

// Public API
export const publicAPI = {
  getQuiz: (quizId) => api.get(`/api/public/quizzes/${quizId}`),
  submitQuiz: (quizId, data) => api.post(`/api/public/quizzes/${quizId}/submit`, data),
}

export default api

