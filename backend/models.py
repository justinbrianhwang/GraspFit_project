from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=False)
    role = Column(String(20), nullable=False, default="student")  # "student" | "admin"
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    records = relationship("PracticeRecord", back_populates="user")


class PracticeRecord(Base):
    __tablename__ = "practice_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    is_correct = Column(Boolean, nullable=False)
    mse_score = Column(Float, nullable=False)
    confidence = Column(Float, nullable=False)
    duration_seconds = Column(Integer, nullable=False, default=0)
    correct_rate = Column(Float, nullable=False, default=0.0)
    memo = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="records")


class Feedback(Base):
    __tablename__ = "feedbacks"

    id = Column(Integer, primary_key=True, index=True)
    admin_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    content = Column(String(1000), nullable=False)
    week_label = Column(String(20), nullable=True)  # e.g. "2026-W07"
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    admin = relationship("User", foreign_keys=[admin_id])
    student = relationship("User", foreign_keys=[student_id])


class AppSetting(Base):
    __tablename__ = "app_settings"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(100), unique=True, nullable=False, index=True)
    value = Column(String(500), nullable=False)
    updated_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
