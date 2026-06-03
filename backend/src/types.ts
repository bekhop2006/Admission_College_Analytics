/** Shared TypeScript types for database rows and API payloads. */

export interface UserRow {
  id: number
  email: string
  hashed_password: string
  full_name: string
  role: 'user' | 'admin'
  created_at: string
}

/** Public user profile returned by auth API (no password hash). */
export interface UserPublic {
  id: number
  email: string
  full_name: string
  role: 'user' | 'admin'
  created_at: string
}

export interface UniversityRow {
  id: number
  name: string
  short_name: string | null
  legal_name: string | null
  city: string
  region: string | null
  institution_type: string
  min_ent_score: number
  website: string | null
  description: string | null
  address: string | null
  founded_year: number | null
  email: string | null
  rector_name: string | null
  rector_contacts: string | null
  nct_code: number | null
  created_at: string
}

export interface ProgramRow {
  id: number
  university_id: number
  name: string
  specialty_code: string | null
  gop_code: string | null
  education_field_code: string | null
  education_field_name: string | null
  study_form: string | null
  language: string
  min_ent_score: number
  grant_min_ent_score: number | null
  source_year: number | null
}

export interface UniversityWithPrograms extends UniversityRow {
  programs: ProgramRow[]
}

export interface UniversityMetadata {
  match: string[]
  shortName: string
  city: string
  address?: string
  foundedYear?: number
  email?: string
  rector?: string
  rectorContacts?: string
  website?: string
}
