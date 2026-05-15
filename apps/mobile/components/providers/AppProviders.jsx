import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '../../services/queryClient'
import { useRealtimeSync } from '../../hooks/useRealtimeSync'

function RealtimeBridge({ children }) {
  useRealtimeSync()
  return children
}

export function AppProviders({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <RealtimeBridge>{children}</RealtimeBridge>
    </QueryClientProvider>
  )
}
