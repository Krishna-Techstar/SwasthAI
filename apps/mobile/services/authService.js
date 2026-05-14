// apps/mobile/services/authService.js
// ============================================================
// Auth Service — API layer for authentication flows
// Backend-ready: swap mock implementations for real HTTP calls
// ============================================================

const API_BASE = process.env.EXPO_PUBLIC_AUTH_API_URL ?? 'http://localhost:3001'

// ── Mock delay helper ─────────────────────────────────────────────────────────

function mockDelay(ms = 800) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ── Auth API ──────────────────────────────────────────────────────────────────

export const authService = {
  /**
   * Login with email/phone + password
   * @returns {{ user, accessToken, refreshToken }}
   */
  async login({ email, password }) {
    await mockDelay(1000)
    // Mock: return a doctor user for demo
    return {
      user: {
        id: 'usr_001',
        name: 'Dr. Rajan Kumar',
        email: email || 'dr.rajan@swasthai.com',
        phone: '+91 98765 43210',
        role: 'Doctor',
        verificationStatus: 'approved',
        avatarInitials: 'RK',
        specialization: 'General Medicine',
        hospital: 'Apollo Clinic',
        createdAt: new Date().toISOString(),
      },
      accessToken: 'mock_access_token_' + Date.now(),
      refreshToken: 'mock_refresh_token_' + Date.now(),
    }
  },

  /**
   * Register a new user
   */
  async signup({ role, basicDetails, roleDetails }) {
    await mockDelay(1200)
    const needsVerification = role === 'Doctor' || role === 'Nurse'
    return {
      user: {
        id: 'usr_' + Date.now(),
        name: basicDetails.name,
        email: basicDetails.email,
        phone: basicDetails.phone,
        role,
        verificationStatus: needsVerification ? 'doc_pending' : 'approved',
        avatarInitials: basicDetails.name
          .split(' ')
          .map((w) => w[0])
          .join('')
          .toUpperCase()
          .slice(0, 2),
        ...roleDetails,
        createdAt: new Date().toISOString(),
      },
      accessToken: 'mock_access_token_' + Date.now(),
      refreshToken: 'mock_refresh_token_' + Date.now(),
    }
  },

  /**
   * Send OTP to phone number
   */
  async sendOTP(phone) {
    await mockDelay(600)
    return { success: true, message: 'OTP sent to ' + phone }
  },

  /**
   * Verify OTP
   */
  async verifyOTP(phone, otp) {
    await mockDelay(800)
    if (otp === '123456' || otp.length === 6) {
      return { success: true, verified: true }
    }
    throw new Error('Invalid OTP. Please try again.')
  },

  /**
   * Send password reset email/SMS
   */
  async forgotPassword(email) {
    await mockDelay(800)
    return { success: true, message: 'Reset link sent to ' + email }
  },

  /**
   * Reset password with token
   */
  async resetPassword(token, newPassword) {
    await mockDelay(800)
    return { success: true }
  },

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken) {
    await mockDelay(300)
    return {
      accessToken: 'mock_access_token_' + Date.now(),
      refreshToken: 'mock_refresh_token_' + Date.now(),
    }
  },

  /**
   * Upload verification documents
   */
  async uploadDocument(userId, docType, fileUri) {
    await mockDelay(1500)
    return {
      success: true,
      documentId: 'doc_' + Date.now(),
      status: 'uploaded',
    }
  },

  /**
   * Check verification status
   */
  async checkVerificationStatus(userId) {
    await mockDelay(500)
    return { status: 'review_pending' }
  },

  /**
   * Logout — invalidate tokens server-side
   */
  async logout(accessToken) {
    await mockDelay(200)
    return { success: true }
  },
}
