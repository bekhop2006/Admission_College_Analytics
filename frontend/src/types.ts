export interface Program {
  id: number
  university_id: number
  name: string
  specialty_code: string | null
  gop_code?: string | null
  education_field_code?: string | null
  education_field_name?: string | null
  study_form?: string | null
  language: string
  min_ent_score: number
  grant_min_ent_score: number | null
  source_year?: number | null
}

export interface UniversityListItem {
  id: number
  name: string
  city: string
  institution_type: string
  min_ent_score: number
  website: string | null
  program_count: number
  matching_programs: number
  email?: string | null
  rector_name?: string | null
  address?: string | null
}

export interface University extends UniversityListItem {
  description: string | null
  created_at: string
  programs: Program[]
}

export interface EntSearchResponse {
  ent_score: number
  combination: string | null
  specialty: string | null
  total_matches: number
  universities: UniversityListItem[]
}

export interface FilterOption {
  id: string
  label: string
}

export interface DashboardStats {
  universities_count: number
  programs_count: number
  cities_count: number
  avg_min_ent: number
  top_cities: { city: string; count: number }[]
}

export interface PublicStats {
  universities_count: number
  programs_count: number
  cities_count: number
  combinations_count: number
  source_year: number
}

export interface TokenResponse {
  access_token: string
  token_type: string
  user: UserProfile
}

export interface UserProfile {
  id: number
  email: string
  full_name: string
  role: 'user' | 'admin'
  created_at: string
}
