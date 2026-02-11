from pydantic import BaseModel
from datetime import datetime
from typing import Optional


# ── User
class UserCreate(BaseModel):
    studentId: str
    name: str
    phone: str
    adminCode: Optional[str] = None
    rootCode: Optional[str] = None


class UserResponse(BaseModel):
    id: int
    studentId: str
    name: str
    phone: str
    role: str
    createdAt: datetime

    class Config:
        from_attributes = True

    @classmethod
    def from_orm_model(cls, user):
        return cls(
            id=user.id,
            studentId=user.student_id,
            name=user.name,
            phone=user.phone,
            role=user.role,
            createdAt=user.created_at,
        )


# ── Practice Record
class RecordCreate(BaseModel):
    userId: int
    isCorrect: bool
    mseScore: float
    confidence: float
    durationSeconds: int = 0
    correctRate: float = 0.0
    memo: Optional[str] = None


class RecordResponse(BaseModel):
    id: int
    userId: int
    isCorrect: bool
    mseScore: float
    confidence: float
    durationSeconds: int
    correctRate: float
    memo: Optional[str]
    createdAt: datetime

    class Config:
        from_attributes = True

    @classmethod
    def from_orm_model(cls, rec):
        return cls(
            id=rec.id,
            userId=rec.user_id,
            isCorrect=rec.is_correct,
            mseScore=rec.mse_score,
            confidence=rec.confidence,
            durationSeconds=rec.duration_seconds,
            correctRate=rec.correct_rate,
            memo=rec.memo,
            createdAt=rec.created_at,
        )


# ── Stats
class DailyStat(BaseModel):
    date: str
    totalMinutes: float
    sessions: int
    correctRate: float


class UserStats(BaseModel):
    totalSessions: int
    totalMinutes: float
    correctRate: float
    weeklyDays: int
    dailyStats: list[DailyStat]


# ── Feedback
class FeedbackCreate(BaseModel):
    adminId: int
    studentId: int
    content: str
    weekLabel: Optional[str] = None


class FeedbackResponse(BaseModel):
    id: int
    adminId: int
    studentId: int
    content: str
    weekLabel: Optional[str]
    adminName: str
    createdAt: datetime

    class Config:
        from_attributes = True

    @classmethod
    def from_orm_model(cls, fb):
        return cls(
            id=fb.id,
            adminId=fb.admin_id,
            studentId=fb.student_id,
            content=fb.content,
            weekLabel=fb.week_label,
            adminName=fb.admin.name if fb.admin else "관리자",
            createdAt=fb.created_at,
        )
