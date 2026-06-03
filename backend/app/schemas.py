"""Pydantic schemas for API request and response bodies."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class Token(BaseModel):
    """JWT access token returned after login."""

    access_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    """Credentials for admin authentication."""

    email: str
    password: str


class ProgramBase(BaseModel):
    """Shared fields for program create/update."""

    name: str
    specialty_code: str | None = None
    language: str = "kaz/ru"
    min_ent_score: int = Field(ge=0, le=140)
    grant_min_ent_score: int | None = Field(default=None, ge=0, le=140)


class ProgramCreate(ProgramBase):
    """Payload to create a program under a university."""

    university_id: int


class ProgramUpdate(BaseModel):
    """Partial update for an existing program."""

    name: str | None = None
    specialty_code: str | None = None
    language: str | None = None
    min_ent_score: int | None = Field(default=None, ge=0, le=140)
    grant_min_ent_score: int | None = Field(default=None, ge=0, le=140)


class ProgramRead(ProgramBase):
    """Program returned to clients."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    university_id: int


class UniversityBase(BaseModel):
    """Shared fields for university create/update."""

    name: str
    city: str
    institution_type: str = "university"
    min_ent_score: int = Field(ge=0, le=140)
    website: str | None = None
    description: str | None = None


class UniversityCreate(UniversityBase):
    """Payload to create a university."""

    pass


class UniversityUpdate(BaseModel):
    """Partial update for an existing university."""

    name: str | None = None
    city: str | None = None
    institution_type: str | None = None
    min_ent_score: int | None = Field(default=None, ge=0, le=140)
    website: str | None = None
    description: str | None = None


class UniversityRead(UniversityBase):
    """University with nested programs."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    programs: list[ProgramRead] = []


class UniversityListItem(BaseModel):
    """Lightweight university row for search results."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    city: str
    institution_type: str
    min_ent_score: int
    website: str | None
    program_count: int = 0
    matching_programs: int = 0


class EntSearchResponse(BaseModel):
    """Response for public ENT-based university search."""

    ent_score: int
    total_matches: int
    universities: list[UniversityListItem]


class DashboardStats(BaseModel):
    """Summary metrics for the admin dashboard."""

    universities_count: int
    programs_count: int
    cities_count: int
    avg_min_ent: float
    top_cities: list[dict[str, int | str]]
