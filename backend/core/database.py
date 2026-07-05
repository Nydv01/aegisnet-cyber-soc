"""
AegisNet - Database Module
============================
SQLAlchemy ORM models and database session management for persistent
storage of security events, scan results, and user sessions.

Skills Showcased:
- SQLAlchemy ORM with declarative base
- Async database operations (aiosqlite)
- Pydantic schema integration
- Database session lifecycle management
"""

import os
from datetime import datetime
from typing import Optional

from sqlalchemy import (
    create_engine,
    Column,
    Integer,
    String,
    Float,
    DateTime,
    Text,
    Boolean,
)
from sqlalchemy.orm import declarative_base, sessionmaker, Session


# ---------------------------------------------------------------------------
# Database Setup
# ---------------------------------------------------------------------------

DB_DIR = os.path.dirname(os.path.dirname(__file__))
DATABASE_URL = f"sqlite:///{os.path.join(DB_DIR, 'aegisnet.db')}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# ---------------------------------------------------------------------------
# ORM Models
# ---------------------------------------------------------------------------

class SecurityEvent(Base):
    """Persistent security event log entry."""
    __tablename__ = "security_events"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    event_id = Column(String(20), unique=True, index=True)
    severity = Column(String(20), index=True)  # info, warning, critical, alert
    event_type = Column(String(20), index=True)  # traffic, attack, defense, system
    source_ip = Column(String(50))
    destination_ip = Column(String(50))
    message = Column(Text)
    details_json = Column(Text, default="{}")


class URLScanResult(Base):
    """Persistent URL scan result."""
    __tablename__ = "url_scan_results"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    url = Column(String(2048))
    is_phishing = Column(Boolean)
    confidence = Column(Float)
    threat_score = Column(Float)
    features_json = Column(Text, default="{}")


class AgentAction(Base):
    """Log of actions taken by the autonomous defense agent."""
    __tablename__ = "agent_actions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    state_id = Column(Integer)
    action = Column(String(50))
    threat_level = Column(String(20))
    attack_type = Column(String(30))
    system_health = Column(Float)
    q_values_json = Column(Text, default="{}")


class UserSession(Base):
    """User session tracking for JWT auth."""
    __tablename__ = "user_sessions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String(100), unique=True, index=True)
    hashed_password = Column(String(256))
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)


# ---------------------------------------------------------------------------
# Database Helpers
# ---------------------------------------------------------------------------

def init_db():
    """Create all tables."""
    Base.metadata.create_all(bind=engine)
    print("[Database] Tables created successfully.")

    # Create default admin user if none exists
    db = SessionLocal()
    try:
        existing = db.query(UserSession).filter_by(username="admin").first()
        if not existing:
            from passlib.context import CryptContext
            pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
            admin = UserSession(
                username="admin",
                hashed_password=pwd_context.hash("aegisnet2024"),
            )
            db.add(admin)
            db.commit()
            print("[Database] Default admin user created (admin / aegisnet2024)")
    except Exception as e:
        print(f"[Database] Warning creating default user: {e}")
    finally:
        db.close()


def get_db():
    """Dependency injection for database sessions."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
