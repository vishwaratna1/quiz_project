const TOKEN_KEY = 'quiz_admin_token'

export const auth = {
  getToken: () => {
    return localStorage.getItem(TOKEN_KEY)
  },

  setToken: (token) => {
    localStorage.setItem(TOKEN_KEY, token)
  },

  removeToken: () => {
    localStorage.removeItem(TOKEN_KEY)
  },

  isAuthenticated: () => {
    return !!localStorage.getItem(TOKEN_KEY)
  }
}

