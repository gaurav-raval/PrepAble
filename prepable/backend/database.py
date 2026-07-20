"""
Database models for PrepAble.

Defines SQLAlchemy models for the resume-based interview feature MVP.
Only the resume_uploads table is implemented for MVP scope.
"""

import os
from datetime import datetime
from pathlib import Path

from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

Base = declarative_base()


class ResumeUpload(Base):
    """Resume upload model for resume-based interview feature."""
    __tablename__ = 'resume_uploads'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, nullable=True)
    filename = Column(Text, nullable=False)
    file_path = Column(Text, nullable=False)
    file_type = Column(Text, nullable=False)  # 'pdf', 'docx', 'txt'
    extracted_text = Column(Text)
    uploaded_at = Column(DateTime, default=datetime.utcnow)


def get_database_url() -> str:
    """Get the database URL from environment variables.
    
    If DATABASE_URL is set, use PostgreSQL (Neon).
    If DATABASE_URL is not set, use SQLite for local development.
    """
    database_url = os.environ.get("DATABASE_URL")
    if database_url:
        return database_url
    
    # Fallback to SQLite for local development
    # Use absolute path based on database.py location to ensure consistency
    db_dir = Path(__file__).resolve().parent
    db_path = db_dir / "prepable.db"
    return f"sqlite:///{db_path}"


def get_engine():
    """Create and return the SQLAlchemy engine."""
    database_url = get_database_url()
    return create_engine(database_url)


def get_session():
    """Create and return a SQLAlchemy session."""
    engine = get_engine()
    SessionLocal = sessionmaker(bind=engine)
    return SessionLocal()


def init_db():
    """Initialize the database by creating all tables."""
    engine = get_engine()
    Base.metadata.create_all(bind=engine)
