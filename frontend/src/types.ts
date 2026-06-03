export interface Program {
  id: number
  university_id: number
  name: string
  specialty_code: string | null
  language: string
  min_ent_score: number
  grant_min_ent_score: number | null
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
}

export interface University extends UniversityListItem {
  description: string | null
  created_at: string
  programs: Program[]
}

export interface EntSearchResponse {
  ent_score: number
  total_matches: number
  universities: UniversityListItem[]
}

export interface DashboardStats {
  universities_count: number
  programs_count: number
  cities_count: number
  avg_min_ent: number
  top_cities: { city: string; count: number }[]
}

export interface TokenResponse {
  access_token: string
  token_type: string
}
