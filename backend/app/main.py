from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import admin, public, auth
import os

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Quiz Management System API",
    description="A production-ready quiz management system with admin and public endpoints",
    version="1.0.0"
)

# CORS configuration - environment-aware
# Get allowed origins from environment variable or use defaults
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000"
).split(",")

# In production, you can also set ALLOWED_ORIGINS to "*" to allow all origins
# (less secure, but sometimes needed for development/testing)
if os.getenv("ALLOW_ALL_ORIGINS", "false").lower() == "true":
    ALLOWED_ORIGINS = ["*"]

# Clean up origins (remove whitespace)
ALLOWED_ORIGINS = [origin.strip() for origin in ALLOWED_ORIGINS if origin.strip()]

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(public.router)


@app.get("/")
def root():
    return {
        "message": "Quiz Management System API",
        "docs": "/docs",
        "version": "1.0.0"
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}

