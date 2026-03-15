import type { PropsWithChildren } from 'react'
import { useEffect } from 'react'
import { BrowserRouter, useNavigate } from 'react-router-dom'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { apiClient } from '@/lib/api/ApiClient'
import { MessageHandlerProvider } from '@shared-message-handler'
import { MobileProvider } from '@/app/providers/MobileProvider'
import { useBootstrap } from '@/features/bootstrap/bootstrap.hook'
import { AdminBusinessRealtimeProvider } from '@/realtime/business'
import { DriverLiveRealtimeProvider } from '@/realtime/driverLive'
import { AdminNotificationsProvider } from '@/realtime/notifications'

function ApiAuthBridge() {
  const navigate = useNavigate()
  const { fetchBootstrap } = useBootstrap()

  useEffect(() => {
    apiClient.setUnauthenticatedHandler(() => {
      navigate('/auth/login', { replace: true })
    })
  }, [navigate])

  useEffect(() => {
    if (apiClient.getAccessToken()) {
      void fetchBootstrap()
    }
  }, [fetchBootstrap])

  return null
}

export function AppProviders({ children }: PropsWithChildren) {

  
  return (
    <BrowserRouter>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <MobileProvider>
          <MessageHandlerProvider
            defaultMessageDurationMs={8000}
            maxMessages={2}
          >
            <AdminNotificationsProvider>
              <AdminBusinessRealtimeProvider>
                <DriverLiveRealtimeProvider>
                  <ApiAuthBridge />
                  {children}
                </DriverLiveRealtimeProvider>
              </AdminBusinessRealtimeProvider>
            </AdminNotificationsProvider>
          </MessageHandlerProvider>
        </MobileProvider>
      </LocalizationProvider>
    </BrowserRouter>
  )
}
