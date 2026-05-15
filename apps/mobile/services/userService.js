import { apiRequest } from './httpClient'

export const userService = {
  async me() {
    return apiRequest('/users/me')
  },

  async dashboard() {
    return apiRequest('/users/me/dashboard')
  },
}
