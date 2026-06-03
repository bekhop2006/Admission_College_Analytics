"""RNMC College Analytics — FastAPI application entry point."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, SessionLocal, engine
from app.routers import admin, auth, stats, universities
from app.seed import seed_database


@asynccontextmanager
async def lifespan(_: FastAPI):
    """Create tables and seed data on startup."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="RNMC College Analytics API",
    description="Подбор вузов и колледжей по баллу ЕНТ",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(universities.router)
app.include_router(admin.router)
app.include_router(stats.router)


@app.get("/api/health")
def health():
    """Simple health check for deployments."""
    return {"status": "ok", "service": "rnmc-college-analytics"}
