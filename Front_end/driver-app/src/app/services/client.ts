import { createApiClient } from '@shared-api'
import { sessionStorage } from '../storage/sessionStorage'

export const driverApiClient = createApiClient({
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api_v2',
  refreshPath: '/auths/refresh_token',
  sessionAccessor: sessionStorage,
})
