import type { PropsWithChildren } from 'react'
import { useEffect } from 'react'
import { BrowserRouter, useNavigate } from 'react-router-dom'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { apiClient } from '@/lib/api/ApiClient'
import { MessageHandlerProvider } from '@/shared/message-handler/MessageHandlerContext'
import { MobileProvider } from '@/app/providers/MobileProvider'
import { useBootstrap } from '@/features/bootstrap/bootstrap.hook'

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
          <MessageHandlerProvider>
            <ApiAuthBridge />
            {children}
          </MessageHandlerProvider>
        </MobileProvider>
      </LocalizationProvider>
    </BrowserRouter>
  )
}
