from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import admin, public

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Quiz Management System API",
    description="A production-ready quiz management system with admin and public endpoints",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React dev server port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
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

