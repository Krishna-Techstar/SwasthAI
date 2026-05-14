// apps/mobile/constants/permissions.js
// ============================================================
// SWASTHAI RBAC — Role-Based Access Control
// ============================================================

export const ROLES = {
  PATIENT: 'Patient',
  DOCTOR: 'Doctor',
  NURSE: 'Nurse',
}

export const VERIFICATION_STATUS = {
  NONE: 'none',
  OTP_PENDING: 'otp_pending',
  DOC_PENDING: 'doc_pending',       // Doctor/Nurse: awaiting doc upload
  REVIEW_PENDING: 'review_pending', // Doctor/Nurse: under admin review
  APPROVED: 'approved',
  REJECTED: 'rejected',
}

/**
 * Permission map — each role gets specific capabilities.
 * Route guards check these before allowing navigation.
 */
export const ROLE_PERMISSIONS = {
  [ROLES.PATIENT]: {
    canAccessDashboard: true,
    canViewReports: true,
    canBookAppointments: true,
    canUseAIAssistant: true,
    canViewPrescriptions: true,
    canAccessPatientQueue: false,
    canAccessAnalytics: false,
    canAccessConsultation: false,
    canAccessBilling: false,
    canUploadScans: false,
    canManageWard: false,
    canUpdateVitals: false,
    requiresVerification: false,
  },
  [ROLES.DOCTOR]: {
    canAccessDashboard: true,
    canViewReports: true,
    canBookAppointments: true,
    canUseAIAssistant: true,
    canViewPrescriptions: true,
    canAccessPatientQueue: true,
    canAccessAnalytics: true,
    canAccessConsultation: true,
    canAccessBilling: true,
    canUploadScans: true,
    canManageWard: false,
    canUpdateVitals: false,
    requiresVerification: true,
  },
  [ROLES.NURSE]: {
    canAccessDashboard: true,
    canViewReports: true,
    canBookAppointments: false,
    canUseAIAssistant: true,
    canViewPrescriptions: true,
    canAccessPatientQueue: true,
    canAccessAnalytics: false,
    canAccessConsultation: false,
    canAccessBilling: false,
    canUploadScans: false,
    canManageWard: true,
    canUpdateVitals: true,
    requiresVerification: true,
  },
}

/**
 * Maps role → home route after successful auth
 */
export const ROLE_HOME_ROUTE = {
  [ROLES.PATIENT]: '/(patient)/home',
  [ROLES.DOCTOR]:  '/(doctor)/home',
  [ROLES.NURSE]:   '/(nurse)/home',
}

/**
 * Maps role → signup route
 */
export const ROLE_SIGNUP_ROUTE = {
  [ROLES.PATIENT]: '/onboarding/signup-patient',
  [ROLES.DOCTOR]:  '/onboarding/signup-doctor',
  [ROLES.NURSE]:   '/onboarding/signup-nurse',
}

/**
 * Bottom tab configs per role
 */
export const ROLE_TABS = {
  [ROLES.PATIENT]: [
    { name: 'Home',         icon: 'home',         segment: 'home' },
    { name: 'Reports',      icon: 'document-text', segment: 'reports' },
    { name: 'Appointments', icon: 'calendar',      segment: 'appointments' },
    { name: 'AI Assistant', icon: 'sparkles',      segment: 'ai' },
    { name: 'Profile',      icon: 'person',        segment: 'profile' },
  ],
  [ROLES.DOCTOR]: [
    { name: 'Home',      icon: 'home',         segment: 'home' },
    { name: 'Patients',  icon: 'people',       segment: 'patients' },
    { name: 'Analytics', icon: 'bar-chart',    segment: 'analytics' },
    { name: 'Chat',      icon: 'chatbubbles',  segment: 'inbox' },
  ],
  [ROLES.NURSE]: [
    { name: 'Dashboard', icon: 'home',          segment: 'home' },
    { name: 'Patients',  icon: 'people',        segment: 'patients' },
    { name: 'Tasks',     icon: 'list',          segment: 'tasks' },
    { name: 'Alerts',    icon: 'notifications', segment: 'alerts' },
    { name: 'Profile',   icon: 'person',        segment: 'profile' },
  ],
}
