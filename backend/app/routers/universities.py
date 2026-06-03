"""Public university search by ENT score."""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import Program, University
from app.schemas import EntSearchResponse, ProgramRead, UniversityListItem, UniversityRead

router = APIRouter(prefix="/api/universities", tags=["universities"])


def _build_list_item(university: University, ent_score: int | None) -> UniversityListItem:
    """Map a university ORM row to a list item with program match counts."""
    program_count = len(university.programs)
    matching_programs = 0
    if ent_score is not None:
        matching_programs = sum(1 for program in university.programs if program.min_ent_score <= ent_score)
    return UniversityListItem(
        id=university.id,
        name=university.name,
        city=university.city,
        institution_type=university.institution_type,
        min_ent_score=university.min_ent_score,
        website=university.website,
        program_count=program_count,
        matching_programs=matching_programs,
    )


@router.get("/search", response_model=EntSearchResponse)
def search_by_ent(
    ent_score: int = Query(..., ge=0, le=140, description="Балл ЕНТ абитуриента"),
    city: str | None = Query(default=None, description="Фильтр по городу"),
    institution_type: str | None = Query(default=None, description="university или college"),
    db: Session = Depends(get_db),
):
    """Return universities and colleges where the user ENT meets minimum thresholds."""
    query = db.query(University).options(joinedload(University.programs))
    if city:
        query = query.filter(func.lower(University.city) == city.lower())
    if institution_type:
        query = query.filter(University.institution_type == institution_type)

    universities = query.order_by(University.min_ent_score.desc()).all()
    matches: list[UniversityListItem] = []
    for university in universities:
        has_matching_program = any(program.min_ent_score <= ent_score for program in university.programs)
        university_ok = university.min_ent_score <= ent_score
        if university_ok or has_matching_program:
            matches.append(_build_list_item(university, ent_score))

    return EntSearchResponse(ent_score=ent_score, total_matches=len(matches), universities=matches)


@router.get("/cities", response_model=list[str])
def list_cities(db: Session = Depends(get_db)):
    """Return distinct cities for filter dropdowns."""
    rows = db.query(University.city).distinct().order_by(University.city).all()
    return [row[0] for row in rows]


@router.get("/{university_id}", response_model=UniversityRead)
def get_university(
    university_id: int,
    ent_score: int | None = Query(default=None, ge=0, le=140),
    db: Session = Depends(get_db),
):
    """Return one university with programs; optionally highlight ENT eligibility."""
    university = (
        db.query(University)
        .options(joinedload(University.programs))
        .filter(University.id == university_id)
        .first()
    )
    if not university:
        raise HTTPException(status_code=404, detail="University not found")

    data = UniversityRead.model_validate(university)
    if ent_score is not None:
        data.programs = [program for program in data.programs if program.min_ent_score <= ent_score]
    return data


@router.get("/{university_id}/programs", response_model=list[ProgramRead])
def list_programs(university_id: int, db: Session = Depends(get_db)):
    """List all programs for a university."""
    programs = db.query(Program).filter(Program.university_id == university_id).order_by(Program.min_ent_score).all()
    return programs
