import { apiRequest, apiRole, appRole } from './httpClient'

function normalizeUser(user) {
  if (!user) return user
  return {
    ...user,
    name: user.fullName ?? user.name,
    role: appRole(user.role),
    verificationStatus:
      user.approvalStatus === 'APPROVED' || user.approvalStatus === 'NOT_REQUIRED'
        ? 'approved'
        : user.approvalStatus === 'REJECTED'
          ? 'rejected'
          : 'review_pending',
  }
}

export const authService = {
  async login({ email, password }) {
    const res = await apiRequest('/auth/login', {
      method: 'POST',
      body: { email, password },
    })
    return { ...res, user: normalizeUser(res.user) }
  },

  async signup({ role, basicDetails, roleDetails }) {
    const res = await apiRequest('/auth/signup', {
      method: 'POST',
      body: {
        role: apiRole(role),
        fullName: basicDetails.name ?? basicDetails.fullName,
        email: basicDetails.email,
        phone: basicDetails.phone,
        password: basicDetails.password,
        abhaId: roleDetails?.abhaId,
        hospitalId: roleDetails?.hospitalId,
        registrationNumber: roleDetails?.registrationNumber,
        specialization: roleDetails?.specialization,
        licenseNumber: roleDetails?.licenseNumber ?? roleDetails?.license,
        department: roleDetails?.department,
        experienceYears: Number(roleDetails?.experienceYears ?? roleDetails?.experience) || undefined,
        dateOfBirth: roleDetails?.dob ?? roleDetails?.dateOfBirth,
        gender: roleDetails?.gender,
        bloodGroup: roleDetails?.bloodGroup,
        address: roleDetails?.address,
      },
    })
    return { ...res, user: normalizeUser(res.user) }
  },

  async sendOTP(phone) {
    return apiRequest('/auth/otp/send', {
      method: 'POST',
      body: { phone },
    })
  },

  async verifyOTP(phone, otp) {
    return apiRequest('/auth/otp/verify', {
      method: 'POST',
      body: { phone, otp },
    })
  },

  async forgotPassword(email) {
    return apiRequest('/auth/password/forgot', {
      method: 'POST',
      body: { email },
    })
  },

  async resetPassword(token, newPassword) {
    return apiRequest('/auth/password/reset', {
      method: 'POST',
      body: { token, newPassword },
    })
  },

  async refreshToken(refreshToken) {
    return apiRequest('/auth/refresh', {
      method: 'POST',
      body: { refreshToken },
    })
  },

  async uploadDocument(userId, docType, fileUri) {
    return apiRequest('/files/sign-upload', {
      method: 'POST',
      body: {
        provider: process.env.EXPO_PUBLIC_STORAGE_PROVIDER ?? 'CLOUDINARY',
        category: 'VERIFICATION_DOCUMENT',
        fileName: fileUri.split('/').pop() ?? `${docType}.bin`,
        mimeType: 'application/octet-stream',
        sizeBytes: 0,
      },
    })
  },

  async checkVerificationStatus() {
    const res = await apiRequest('/users/me')
    return { status: normalizeUser(res).verificationStatus }
  },

  async logout() {
    return apiRequest('/auth/logout', { method: 'POST', body: {} })
  },
}
