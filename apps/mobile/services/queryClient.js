import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      refetchOnReconnect: true,
      retry: (failureCount, error) => {
        if ([401, 403, 404].includes(error?.status)) return false
        return failureCount < 2
      },
    },
    mutations: {
      retry: false,
    },
  },
})

export const queryKeys = {
  me: ['me'],
  myDashboard: ['me', 'dashboard'],
  notifications: ['notifications'],
  patientContext: (patientProfileId) => ['patient-context', patientProfileId],
  patientReports: (patientProfileId) => ['patient-reports', patientProfileId],
  consultation: (consultationId) => ['consultation', consultationId],
  soapReport: (reportId) => ['soap-report', reportId],
  radiologyReport: (reportId) => ['radiology-report', reportId],
  appointments: (scope = 'mine') => ['appointments', scope],
  drugSafety: (patientProfileId) => ['drug-safety', patientProfileId],
}

export function invalidateRealtimePayload(payload = {}) {
  const eventPayload = payload.payload ?? payload

  queryClient.invalidateQueries({ queryKey: queryKeys.notifications })

  if (eventPayload.patientProfileId) {
    queryClient.invalidateQueries({ queryKey: queryKeys.patientContext(eventPayload.patientProfileId) })
    queryClient.invalidateQueries({ queryKey: queryKeys.patientReports(eventPayload.patientProfileId) })
  }

  if (eventPayload.consultationId) {
    queryClient.invalidateQueries({ queryKey: queryKeys.consultation(eventPayload.consultationId) })
  }

  if (eventPayload.reportId) {
    queryClient.invalidateQueries({ queryKey: queryKeys.soapReport(eventPayload.reportId) })
    queryClient.invalidateQueries({ queryKey: queryKeys.radiologyReport(eventPayload.reportId) })
  }

  if (eventPayload.radiologyReportId) {
    queryClient.invalidateQueries({ queryKey: queryKeys.radiologyReport(eventPayload.radiologyReportId) })
  }
}
