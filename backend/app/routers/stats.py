"""Dashboard statistics for administrators."""

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import Program, University, User
from app.schemas import DashboardStats

router = APIRouter(prefix="/api/stats", tags=["stats"])


@router.get("/dashboard", response_model=DashboardStats)
def dashboard_stats(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    """Aggregate counts and averages for the admin home page."""
    universities_count = db.query(func.count(University.id)).scalar() or 0
    programs_count = db.query(func.count(Program.id)).scalar() or 0
    cities_count = db.query(func.count(func.distinct(University.city))).scalar() or 0
    avg_min_ent = db.query(func.avg(University.min_ent_score)).scalar() or 0.0

    top_cities_rows = (
        db.query(University.city, func.count(University.id).label("count"))
        .group_by(University.city)
        .order_by(func.count(University.id).desc())
        .limit(5)
        .all()
    )
    top_cities = [{"city": row.city, "count": row.count} for row in top_cities_rows]

    return DashboardStats(
        universities_count=universities_count,
        programs_count=programs_count,
        cities_count=cities_count,
        avg_min_ent=round(float(avg_min_ent), 1),
        top_cities=top_cities,
    )
