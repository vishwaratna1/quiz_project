import axios from 'axios'
import { auth } from './utils/auth'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = auth.getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Handle 401 errors (unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      auth.removeToken()
      // Redirect to login if not already there
      if (window.location.pathname !== '/admin/login') {
        window.location.href = '/admin/login'
      }
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: async (username, password) => {
    const formData = new FormData()
    formData.append('username', username)
    formData.append('password', password)
    
    const response = await api.post('/api/auth/login', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },
}

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

