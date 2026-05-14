// apps/mobile/hooks/useAuth.js
// ============================================================
// Auth guard hook — route protection, permission checks
// ============================================================
import { useEffect } from 'react'
import { router, useSegments } from 'expo-router'
import { useAuthStore } from '../store/authStore'

/**
 * useAuthGuard — place in root _layout to auto-redirect based on auth state
 */
export function useAuthGuard() {
  const { isAuthenticated, role, verificationStatus, getHomeRoute } = useAuthStore()
  const segments = useSegments()

  useEffect(() => {
    const inAuthGroup = segments[0] === 'onboarding'
    const inDoctorGroup = segments[0] === '(doctor)'
    const inPatientGroup = segments[0] === '(patient)'
    const inNurseGroup = segments[0] === '(nurse)'

    if (!isAuthenticated && !inAuthGroup) {
      // Not logged in and not on onboarding → redirect to welcome
      router.replace('/onboarding/welcome')
      return
    }

    if (isAuthenticated && inAuthGroup) {
      // Logged in but on onboarding → redirect to home
      const home = getHomeRoute()
      router.replace(home)
      return
    }

    // Role guards — prevent cross-role access
    if (isAuthenticated) {
      if (inDoctorGroup && role !== 'Doctor') {
        router.replace(getHomeRoute())
        return
      }
      if (inPatientGroup && role !== 'Patient') {
        router.replace(getHomeRoute())
        return
      }
      if (inNurseGroup && role !== 'Nurse') {
        router.replace(getHomeRoute())
        return
      }
    }
  }, [isAuthenticated, role, verificationStatus, segments, getHomeRoute])
}

/**
 * usePermission — check if current user has a specific permission
 * @returns {boolean}
 */
export function usePermission(permissionKey) {
  const permissions = useAuthStore((s) => s.permissions)
  return permissions?.[permissionKey] ?? false
}

/**
 * useRequireAuth — redirect if not authenticated
 */
export function useRequireAuth() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/onboarding/welcome')
    }
  }, [isAuthenticated])
  return isAuthenticated
}

/**
 * useRequireRole — redirect if not the required role
 */
export function useRequireRole(requiredRole) {
  const { isAuthenticated, role, getHomeRoute } = useAuthStore()
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/onboarding/welcome')
      return
    }
    if (role !== requiredRole) {
      router.replace(getHomeRoute())
    }
  }, [isAuthenticated, role, requiredRole, getHomeRoute])
  return role === requiredRole
}
