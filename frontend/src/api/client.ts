const API_BASE = import.meta.env.VITE_API_URL ?? ''

/** Read JWT from localStorage for admin requests. */
function getToken(): string | null {
  return localStorage.getItem('rnmc_token')
}

/** Perform a JSON fetch with optional bearer auth. */
async function request<T>(
  path: string,
  options: RequestInit = {},
  auth = false,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  if (auth) {
    const token = getToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }
  const response = await fetch(`${API_BASE}${path}`, { ...options, headers })
  if (!response.ok) {
    const detail = await response.json().catch(() => ({ detail: response.statusText }))
    throw new Error(detail.detail ?? 'Request failed')
  }
  if (response.status === 204) return undefined as T
  return response.json()
}

/** Search universities matching the given ENT score and filters. */
export function searchUniversities(params: {
  ent_score: number
  city?: string
  institution_type?: string
  combination?: string
  specialty?: string
}) {
  const query = new URLSearchParams({ ent_score: String(params.ent_score) })
  if (params.city) query.set('city', params.city)
  if (params.institution_type) query.set('institution_type', params.institution_type)
  if (params.combination) query.set('combination', params.combination)
  if (params.specialty) query.set('specialty', params.specialty)
  return request<import('../types').EntSearchResponse>(`/api/universities/search?${query}`)
}

/** Fetch ENT profile subject combinations for filters. */
export function fetchCombinations() {
  return request<import('../types').FilterOption[]>('/api/universities/combinations')
}

/** Fetch specialty names for filters, optionally scoped to a subject combination. */
export function fetchSpecialties(combination?: string) {
  const suffix = combination ? `?combination=${encodeURIComponent(combination)}` : ''
  return request<string[]>(`/api/universities/specialties${suffix}`)
}

/** Fetch distinct cities for filters. */
export function fetchCities() {
  return request<string[]>('/api/universities/cities')
}

/** Fetch one university with optional ENT and filter params. */
export function fetchUniversity(
  id: number,
  params?: { entScore?: number; combination?: string; specialty?: string },
) {
  const query = new URLSearchParams()
  if (params?.entScore != null) query.set('ent_score', String(params.entScore))
  if (params?.combination) query.set('combination', params.combination)
  if (params?.specialty) query.set('specialty', params.specialty)
  const suffix = query.toString() ? `?${query}` : ''
  return request<import('../types').University>(`/api/universities/${id}${suffix}`)
}

/** Log in and receive JWT with user profile. */
export function loginUser(email: string, password: string) {
  return request<import('../types').TokenResponse>('/api/auth/login/json', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

/** Register a new user account. */
export function registerUser(email: string, password: string, full_name: string) {
  return request<import('../types').TokenResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, full_name }),
  })
}

/** Fetch the currently authenticated user profile. */
export function fetchMe() {
  return request<import('../types').UserProfile>('/api/auth/me', {}, true)
}

/** @deprecated Use loginUser instead */
export function loginAdmin(email: string, password: string) {
  return loginUser(email, password)
}

/** Fetch public stats for the landing page. */
export function fetchPublicStats() {
  return request<import('../types').PublicStats>('/api/stats/public')
}

/** Dashboard stats (admin). */
export function fetchDashboardStats() {
  return request<import('../types').DashboardStats>('/api/stats/dashboard', {}, true)
}

/** List all universities for admin CRUD. */
export function fetchAdminUniversities() {
  return request<import('../types').University[]>('/api/admin/universities', {}, true)
}

/** Create university (admin). */
export function createUniversity(payload: Record<string, unknown>) {
  return request<import('../types').University>(
    '/api/admin/universities',
    { method: 'POST', body: JSON.stringify(payload) },
    true,
  )
}

/** Delete university (admin). */
export function deleteUniversity(id: number) {
  return request<void>(`/api/admin/universities/${id}`, { method: 'DELETE' }, true)
}

/** Upload CSV import file (admin). */
export async function importCsv(file: File) {
  const form = new FormData()
  form.append('file', file)
  const token = getToken()
  const response = await fetch(`${API_BASE}/api/admin/import/csv`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  })
  if (!response.ok) throw new Error('Import failed')
  return response.json()
}
