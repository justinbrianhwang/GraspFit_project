"""
Modigrip (GraspFit) Backend API
- 사용자 관리, 연습 기록 저장, 통계/연구자 대시보드
"""

from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from collections import defaultdict
import os

from database import engine, get_db, Base
from models import User, PracticeRecord, Feedback
from schemas import (
    UserCreate, UserResponse,
    RecordCreate, RecordResponse,
    UserStats, DailyStat,
    FeedbackCreate, FeedbackResponse,
)
from config import CORS_ORIGINS, ADMIN_CODE, ROOT_CODE

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Modigrip API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Helper: verify admin role ──────────────────────────────

def require_admin(admin_id: int, db: Session) -> User:
    user = db.query(User).filter(User.id == admin_id).first()
    if not user or user.role not in ("admin", "root"):
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


def require_root(root_id: int, db: Session) -> User:
    user = db.query(User).filter(User.id == root_id).first()
    if not user or user.role != "root":
        raise HTTPException(status_code=403, detail="Root access required")
    return user


# ── Users ──────────────────────────────────────────────────

@app.post("/api/users", response_model=UserResponse)
def create_user(data: UserCreate, db: Session = Depends(get_db)):
    # Determine role by priority: root > admin > student
    role = "student"
    if data.rootCode:
        if ROOT_CODE and data.rootCode == ROOT_CODE:
            role = "root"
        else:
            raise HTTPException(status_code=403, detail="잘못된 코드입니다")
    elif data.adminCode:
        if data.adminCode == ADMIN_CODE:
            role = "admin"
        else:
            raise HTTPException(status_code=403, detail="잘못된 관리자 코드입니다")

    role_priority = {"student": 0, "admin": 1, "root": 2}

    existing = db.query(User).filter(User.student_id == data.studentId).first()
    if existing:
        # Upgrade role if higher priority
        if role_priority.get(role, 0) > role_priority.get(existing.role, 0):
            existing.role = role
            db.commit()
            db.refresh(existing)
        return UserResponse.from_orm_model(existing)

    user = User(
        student_id=data.studentId,
        name=data.name,
        phone=data.phone,
        role=role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return UserResponse.from_orm_model(user)


@app.get("/api/users/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserResponse.from_orm_model(user)


@app.get("/api/users", response_model=list[UserResponse])
def list_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return [UserResponse.from_orm_model(u) for u in users]


# ── Records ──────────────────────────────────────────────────

@app.post("/api/records", response_model=RecordResponse)
def save_record(data: RecordCreate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == data.userId).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    record = PracticeRecord(
        user_id=data.userId,
        is_correct=data.isCorrect,
        mse_score=data.mseScore,
        confidence=data.confidence,
        duration_seconds=data.durationSeconds,
        correct_rate=data.correctRate,
        memo=data.memo,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return RecordResponse.from_orm_model(record)


@app.get("/api/records", response_model=list[RecordResponse])
def get_records(user_id: int = Query(...), db: Session = Depends(get_db)):
    records = (
        db.query(PracticeRecord)
        .filter(PracticeRecord.user_id == user_id)
        .order_by(PracticeRecord.created_at.desc())
        .all()
    )
    return [RecordResponse.from_orm_model(r) for r in records]


# ── Stats ──────────────────────────────────────────────────

def _build_user_stats(records: list[PracticeRecord]) -> UserStats:
    if not records:
        return UserStats(
            totalSessions=0, totalMinutes=0,
            correctRate=0, weeklyDays=0, dailyStats=[],
        )

    total_sessions = len(records)
    total_seconds = sum(r.duration_seconds for r in records)
    total_minutes = total_seconds / 60

    avg_correct_rate = sum(r.correct_rate for r in records) / total_sessions

    # Daily stats
    daily = defaultdict(lambda: {"seconds": 0, "sessions": 0, "rate_sum": 0.0})
    for r in records:
        day = r.created_at.strftime("%Y-%m-%d")
        daily[day]["seconds"] += r.duration_seconds
        daily[day]["sessions"] += 1
        daily[day]["rate_sum"] += r.correct_rate

    daily_stats = [
        DailyStat(
            date=day,
            totalMinutes=round(d["seconds"] / 60, 1),
            sessions=d["sessions"],
            correctRate=round(d["rate_sum"] / d["sessions"], 1) if d["sessions"] > 0 else 0,
        )
        for day, d in sorted(daily.items(), reverse=True)
    ]

    # Weekly days
    now = datetime.now(timezone.utc)
    week_start = now - timedelta(days=7)
    weekly_days = 0
    for day, d in daily.items():
        try:
            day_dt = datetime.strptime(day, "%Y-%m-%d").replace(tzinfo=timezone.utc)
            if day_dt >= week_start and d["seconds"] >= 1200:
                weekly_days += 1
        except ValueError:
            pass

    return UserStats(
        totalSessions=total_sessions,
        totalMinutes=round(total_minutes, 1),
        correctRate=round(avg_correct_rate, 1),
        weeklyDays=weekly_days,
        dailyStats=daily_stats,
    )


@app.get("/api/stats/{user_id}", response_model=UserStats)
def get_stats(user_id: int, db: Session = Depends(get_db)):
    records = (
        db.query(PracticeRecord)
        .filter(PracticeRecord.user_id == user_id)
        .order_by(PracticeRecord.created_at.desc())
        .all()
    )
    return _build_user_stats(records)


# ── Admin: Students Dashboard ──────────────────────────────

@app.get("/api/admin/students")
def admin_students(admin_id: int = Query(...), db: Session = Depends(get_db)):
    require_admin(admin_id, db)

    students = db.query(User).filter(User.role == "student").all()
    now = datetime.now(timezone.utc)

    result = []
    for student in students:
        records = db.query(PracticeRecord).filter(
            PracticeRecord.user_id == student.id
        ).all()
        stats = _build_user_stats(records)

        result.append({
            "userId": student.id,
            "studentId": student.student_id,
            "name": student.name,
            "phone": student.phone,
            "totalSessions": stats.totalSessions,
            "totalMinutes": stats.totalMinutes,
            "correctRate": stats.correctRate,
            "weeklyDays": stats.weeklyDays,
            "meetsWeeklyGoal": stats.weeklyDays >= 3,
        })

    return {"students": result, "generatedAt": now.isoformat()}


@app.get("/api/admin/students/{student_id}/records", response_model=list[RecordResponse])
def admin_student_records(
    student_id: int,
    admin_id: int = Query(...),
    db: Session = Depends(get_db),
):
    require_admin(admin_id, db)
    records = (
        db.query(PracticeRecord)
        .filter(PracticeRecord.user_id == student_id)
        .order_by(PracticeRecord.created_at.desc())
        .all()
    )
    return [RecordResponse.from_orm_model(r) for r in records]


# ── Feedback ──────────────────────────────────────────────

@app.post("/api/feedback", response_model=FeedbackResponse)
def create_feedback(data: FeedbackCreate, db: Session = Depends(get_db)):
    require_admin(data.adminId, db)

    student = db.query(User).filter(User.id == data.studentId).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    fb = Feedback(
        admin_id=data.adminId,
        student_id=data.studentId,
        content=data.content,
        week_label=data.weekLabel,
    )
    db.add(fb)
    db.commit()
    db.refresh(fb)
    return FeedbackResponse.from_orm_model(fb)


@app.get("/api/feedback", response_model=list[FeedbackResponse])
def get_feedback(student_id: int = Query(...), db: Session = Depends(get_db)):
    feedbacks = (
        db.query(Feedback)
        .filter(Feedback.student_id == student_id)
        .order_by(Feedback.created_at.desc())
        .all()
    )
    return [FeedbackResponse.from_orm_model(fb) for fb in feedbacks]


# ── Root Admin ──────────────────────────────────────────

@app.get("/api/root/users")
def root_list_users(root_id: int = Query(...), db: Session = Depends(get_db)):
    require_root(root_id, db)
    users = db.query(User).order_by(User.created_at.desc()).all()
    result = []
    for u in users:
        records = db.query(PracticeRecord).filter(PracticeRecord.user_id == u.id).all()
        stats = _build_user_stats(records)
        result.append({
            "userId": u.id,
            "studentId": u.student_id,
            "name": u.name,
            "phone": u.phone,
            "role": u.role,
            "totalSessions": stats.totalSessions,
            "totalMinutes": stats.totalMinutes,
            "correctRate": stats.correctRate,
            "createdAt": u.created_at.isoformat(),
        })
    return {"users": result}


@app.patch("/api/root/users/{user_id}/role")
def root_update_role(
    user_id: int,
    role: str = Query(...),
    root_id: int = Query(...),
    db: Session = Depends(get_db),
):
    require_root(root_id, db)
    if role not in ("student", "admin"):
        raise HTTPException(status_code=400, detail="Invalid role")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.role == "root":
        raise HTTPException(status_code=403, detail="Cannot change root user's role")
    user.role = role
    db.commit()
    db.refresh(user)
    return UserResponse.from_orm_model(user)


@app.delete("/api/root/users/{user_id}")
def root_delete_user(
    user_id: int,
    root_id: int = Query(...),
    db: Session = Depends(get_db),
):
    require_root(root_id, db)
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.role == "root":
        raise HTTPException(status_code=403, detail="Cannot delete root user")
    db.query(Feedback).filter(
        (Feedback.student_id == user_id) | (Feedback.admin_id == user_id)
    ).delete(synchronize_session=False)
    db.query(PracticeRecord).filter(PracticeRecord.user_id == user_id).delete(synchronize_session=False)
    db.delete(user)
    db.commit()
    return {"message": "User deleted", "userId": user_id}


# ── Serve frontend (production) ──────────────────────────

_base = os.path.dirname(os.path.abspath(__file__))
for _candidate in [
    os.path.join(_base, "..", "frontend", "dist"),
    os.path.join(_base, "static"),
]:
    if os.path.isdir(_candidate):
        app.mount("/", StaticFiles(directory=_candidate, html=True), name="frontend")
        break


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
