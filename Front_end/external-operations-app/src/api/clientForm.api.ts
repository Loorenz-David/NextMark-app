import type { ClientFormMeta } from '../features/clientForm/domain/clientForm.types'
import type { ClientFormData } from '../features/clientForm/domain/clientForm.types'

// In production, VITE_API_BASE_URL is the full origin (e.g. https://api.nextmark.app).
// In development the Vite dev-server proxy forwards /api_v2/* → http://localhost:5050,
// so an empty base string is correct and the path alone is sufficient.
const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? ''
const BASE = `${BASE_URL}/api_v2/public/client-form`

type ApiError = Error & { status?: number }

async function handleResponse(res: Response): Promise<unknown> {
  if (!res.ok) {
    const err: ApiError = new Error(`HTTP ${res.status}`)
    err.status = res.status
    throw err
  }
  return res.json()
}

export async function fetchClientForm(token: string): Promise<ClientFormMeta> {
  const res = await fetch(`${BASE}/${token}`)
  return handleResponse(res) as Promise<ClientFormMeta>
}

export async function submitClientForm(token: string, payload: ClientFormData): Promise<void> {
  const res = await fetch(`${BASE}/${token}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  await handleResponse(res)
}
