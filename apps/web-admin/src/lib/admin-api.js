"use client";

import { adminRequest } from "@/lib/api-client";

export const adminDataApi = {
  async login(credentials) {
    return adminRequest("/auth/admin/login", { method: "POST", body: credentials });
  },

  async me() {
    return adminRequest("/users/me");
  },

  async dashboard() {
    return adminRequest("/admin/dashboard");
  },

  async approvals(params = {}) {
    return adminRequest("/admin/approvals", { params });
  },

  async approveApproval(id) {
    return adminRequest(`/admin/approvals/${id}/approve`, { method: "PATCH" });
  },

  async rejectApproval(id, reason) {
    return adminRequest(`/admin/approvals/${id}/reject`, { method: "PATCH", body: { reason } });
  },

  async reports() {
    return adminRequest("/admin/reports");
  },

  async aiJobs(params = {}) {
    return adminRequest("/admin/ai-jobs", { params });
  },

  async realtimeHealth() {
    return adminRequest("/admin/realtime/health");
  },

  async hospitals() {
    return adminRequest("/admin/hospitals");
  },

  async createHospital(data) {
    return adminRequest("/admin/hospitals", { method: "POST", body: data });
  },

  async updateHospital(id, data) {
    return adminRequest(`/admin/hospitals/${id}`, { method: "PATCH", body: data });
  },

  async auditLogs(params = {}) {
    return adminRequest("/audit/logs", { params });
  },

  // New admin CRUD endpoints
  async users(params = {}) {
    return adminRequest("/admin/users", { params });
  },

  async userDetail(id) {
    return adminRequest(`/admin/users/${id}`);
  },

  async updateUserStatus(id, data) {
    return adminRequest(`/admin/users/${id}/status`, { method: "PATCH", body: data });
  },

  async appointments(params = {}) {
    return adminRequest("/admin/appointments", { params });
  },

  async consultations(params = {}) {
    return adminRequest("/admin/consultations", { params });
  },

  async analyticsSummary() {
    return adminRequest("/admin/analytics/summary");
  },

  async analyticsTrends(params = {}) {
    return adminRequest("/admin/analytics/trends", { params });
  },

  async billingSummary() {
    return adminRequest("/admin/billing/summary");
  },

  async supportSummary() {
    return adminRequest("/admin/support/summary");
  },

  async notifications(params = {}) {
    return adminRequest("/admin/notifications/recent", { params });
  },

  async seedDoctor() {
    return adminRequest("/admin/seed-doctor", { method: "POST" });
  },

  async logout() {
    return adminRequest("/auth/logout", { method: "POST" });
  },
};
