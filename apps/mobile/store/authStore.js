// apps/mobile/store/authStore.js
// ============================================================
// SWASTHAI AUTH STORE — Enterprise RBAC + Secure Session
// ============================================================
import { create } from 'zustand'
import { ROLE_PERMISSIONS, ROLE_HOME_ROUTE, VERIFICATION_STATUS } from '../constants/permissions'

export const useAuthStore = create((set, get) => ({
  // ── Core auth state ────────────────────────────────────────────────────────
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,

  // ── RBAC ────────────────────────────────────────────────────────────────────
  role: null,                // 'Patient' | 'Doctor' | 'Nurse'
  permissions: null,         // resolved permission object for current role
  verificationStatus: VERIFICATION_STATUS.NONE,

  // ── Onboarding progress ─────────────────────────────────────────────────────
  onboardingComplete: false,
  otpVerified: false,
  documentsUploaded: false,

  // ── Session metadata ────────────────────────────────────────────────────────
  deviceId: null,
  lastLoginAt: null,

  // ── Actions ─────────────────────────────────────────────────────────────────

  setLoading: (loading) => set({ isLoading: loading }),

  /**
   * Set tokens after login/signup
   */
  setTokens: (accessToken, refreshToken) =>
    set({ accessToken, refreshToken, isAuthenticated: true }),

  /**
   * Set user + resolve role permissions
   */
  setUser: (user) => {
    const role = user?.role ?? null
    const permissions = role ? ROLE_PERMISSIONS[role] ?? null : null
    set({
      user,
      role,
      permissions,
      verificationStatus: user?.verificationStatus ?? VERIFICATION_STATUS.NONE,
    })
  },

  /**
   * Complete login — called after successful auth API response
   */
  completeLogin: ({ user, accessToken, refreshToken }) => {
    const role = user?.role ?? null
    const permissions = role ? ROLE_PERMISSIONS[role] ?? null : null
    set({
      user,
      accessToken,
      refreshToken,
      isAuthenticated: true,
      role,
      permissions,
      verificationStatus: user?.verificationStatus ?? VERIFICATION_STATUS.APPROVED,
      onboardingComplete: true,
      lastLoginAt: new Date().toISOString(),
    })
  },

  /**
   * Update verification status (after doc upload or admin review)
   */
  setVerificationStatus: (status) =>
    set({ verificationStatus: status }),

  /**
   * Mark OTP verified
   */
  setOTPVerified: (verified) =>
    set({ otpVerified: verified }),

  /**
   * Mark documents uploaded
   */
  setDocumentsUploaded: (uploaded) =>
    set({ documentsUploaded: uploaded }),

  /**
   * Mark onboarding complete
   */
  setOnboardingComplete: (complete) =>
    set({ onboardingComplete: complete }),

  /**
   * Check if user has a specific permission
   */
  hasPermission: (permissionKey) => {
    const { permissions } = get()
    return permissions?.[permissionKey] ?? false
  },

  /**
   * Get the home route for the current user role
   */
  getHomeRoute: () => {
    const { role, verificationStatus } = get()
    if (!role) return '/onboarding/welcome'

    // Doctor/Nurse with pending verification
    if (
      (role === 'Doctor' || role === 'Nurse') &&
      verificationStatus !== VERIFICATION_STATUS.APPROVED
    ) {
      if (verificationStatus === VERIFICATION_STATUS.DOC_PENDING) {
        return '/onboarding/doc-upload'
      }
      if (
        verificationStatus === VERIFICATION_STATUS.REVIEW_PENDING ||
        verificationStatus === VERIFICATION_STATUS.REJECTED
      ) {
        return '/onboarding/pending'
      }
    }

    return ROLE_HOME_ROUTE[role] ?? '/(doctor)/home'
  },

  /**
   * Check if current user can access a role-specific route group
   */
  canAccessRouteGroup: (group) => {
    const { role, isAuthenticated, verificationStatus } = get()
    if (!isAuthenticated || !role) return false

    const groupMap = {
      '(doctor)': 'Doctor',
      '(patient)': 'Patient',
      '(nurse)': 'Nurse',
    }

    if (groupMap[group] && groupMap[group] !== role) return false
    if (
      (role === 'Doctor' || role === 'Nurse') &&
      verificationStatus !== VERIFICATION_STATUS.APPROVED
    ) {
      return false
    }
    return true
  },

  /**
   * Full logout — clear everything
   */
  logout: () =>
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      role: null,
      permissions: null,
      verificationStatus: VERIFICATION_STATUS.NONE,
      onboardingComplete: false,
      otpVerified: false,
      documentsUploaded: false,
      lastLoginAt: null,
    }),
}))
