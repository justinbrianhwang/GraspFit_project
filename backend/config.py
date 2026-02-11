import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./modigrip.db")

# Neon/Heroku sometimes provides postgres:// which SQLAlchemy 2.x doesn't accept
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

CORS_ORIGINS = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173,http://localhost:3000",
).split(",")

ADMIN_CODE = os.getenv("ADMIN_CODE", "graspfit2026")
ROOT_CODE = os.getenv("ROOT_CODE", "")  # Must be set explicitly to enable root login
