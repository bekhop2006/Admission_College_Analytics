"""ORM models for universities, programs, and admin users."""

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class User(Base):
    """Admin user for protected CRUD endpoints."""

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    full_name: Mapped[str] = mapped_column(String(255), default="Administrator")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class University(Base):
    """Higher-education institution with minimum ENT threshold."""

    __tablename__ = "universities"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(255), index=True)
    city: Mapped[str] = mapped_column(String(120), index=True)
    institution_type: Mapped[str] = mapped_column(String(50), default="university")
    min_ent_score: Mapped[int] = mapped_column(Integer, index=True)
    website: Mapped[str | None] = mapped_column(String(255), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    programs: Mapped[list["Program"]] = relationship(back_populates="university", cascade="all, delete-orphan")


class Program(Base):
    """Study program (specialty) with its own ENT threshold."""

    __tablename__ = "programs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    university_id: Mapped[int] = mapped_column(ForeignKey("universities.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String(255))
    specialty_code: Mapped[str | None] = mapped_column(String(32), nullable=True)
    language: Mapped[str] = mapped_column(String(32), default="kaz/ru")
    min_ent_score: Mapped[int] = mapped_column(Integer, index=True)
    grant_min_ent_score: Mapped[int | None] = mapped_column(Integer, nullable=True)

    university: Mapped["University"] = relationship(back_populates="programs")
