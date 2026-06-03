"""Protected CRUD and CSV import for administrators."""

import csv
import io

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import Program, University, User
from app.schemas import ProgramCreate, ProgramRead, ProgramUpdate, UniversityCreate, UniversityRead, UniversityUpdate

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/universities", response_model=list[UniversityRead])
def admin_list_universities(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    """List all universities with programs for the admin panel."""
    return db.query(University).order_by(University.name).all()


@router.post("/universities", response_model=UniversityRead, status_code=201)
def create_university(
    payload: UniversityCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Create a new university record."""
    university = University(**payload.model_dump())
    db.add(university)
    db.commit()
    db.refresh(university)
    return university


@router.put("/universities/{university_id}", response_model=UniversityRead)
def update_university(
    university_id: int,
    payload: UniversityUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Update fields on an existing university."""
    university = db.query(University).filter(University.id == university_id).first()
    if not university:
        raise HTTPException(status_code=404, detail="University not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(university, key, value)
    db.commit()
    db.refresh(university)
    return university


@router.delete("/universities/{university_id}", status_code=204)
def delete_university(
    university_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Remove a university and its programs."""
    university = db.query(University).filter(University.id == university_id).first()
    if not university:
        raise HTTPException(status_code=404, detail="University not found")
    db.delete(university)
    db.commit()


@router.post("/programs", response_model=ProgramRead, status_code=201)
def create_program(
    payload: ProgramCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Add a program under a university."""
    if not db.query(University).filter(University.id == payload.university_id).first():
        raise HTTPException(status_code=404, detail="University not found")
    program = Program(**payload.model_dump())
    db.add(program)
    db.commit()
    db.refresh(program)
    return program


@router.put("/programs/{program_id}", response_model=ProgramRead)
def update_program(
    program_id: int,
    payload: ProgramUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Update an existing program."""
    program = db.query(Program).filter(Program.id == program_id).first()
    if not program:
        raise HTTPException(status_code=404, detail="Program not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(program, key, value)
    db.commit()
    db.refresh(program)
    return program


@router.delete("/programs/{program_id}", status_code=204)
def delete_program(
    program_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Delete a program."""
    program = db.query(Program).filter(Program.id == program_id).first()
    if not program:
        raise HTTPException(status_code=404, detail="Program not found")
    db.delete(program)
    db.commit()


@router.post("/import/csv")
async def import_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Import universities/programs from CSV (name,city,min_ent_score,program_name,program_min_ent)."""
    content = (await file.read()).decode("utf-8-sig")
    reader = csv.DictReader(io.StringIO(content))
    required = {"name", "city", "min_ent_score"}
    if not reader.fieldnames or not required.issubset(set(reader.fieldnames)):
        raise HTTPException(
            status_code=400,
            detail="CSV must include columns: name, city, min_ent_score (optional: program_name, program_min_ent, institution_type, website)",
        )

    created_universities = 0
    created_programs = 0
    for row in reader:
        name = row.get("name", "").strip()
        city = row.get("city", "").strip()
        if not name or not city:
            continue
        min_ent = int(row.get("min_ent_score") or 0)
        university = db.query(University).filter(University.name == name, University.city == city).first()
        if not university:
            university = University(
                name=name,
                city=city,
                min_ent_score=min_ent,
                institution_type=row.get("institution_type") or "university",
                website=row.get("website") or None,
            )
            db.add(university)
            db.flush()
            created_universities += 1

        program_name = (row.get("program_name") or "").strip()
        if program_name:
            program_min = int(row.get("program_min_ent") or min_ent)
            db.add(
                Program(
                    university_id=university.id,
                    name=program_name,
                    min_ent_score=program_min,
                    specialty_code=row.get("specialty_code") or None,
                )
            )
            created_programs += 1

    db.commit()
    return {
        "message": "Import completed",
        "created_universities": created_universities,
        "created_programs": created_programs,
    }
