# Quiz Management System - Project Plan

## Overview
A production-ready Quiz Management System with an admin panel for quiz creation/editing and a public interface for taking quizzes.

## Tech Stack
- **Backend**: FastAPI (Python)
- **Frontend**: React with Tailwind CSS
- **Database**: PostgreSQL
- **Containerization**: Docker & Docker Compose

## Database Schema

### Tables

#### `quizzes`
- `id` (UUID, Primary Key)
- `title` (VARCHAR, NOT NULL)
- `description` (TEXT, nullable)
- `created_at` (TIMESTAMP, default: now())
- `updated_at` (TIMESTAMP, default: now())

#### `questions`
- `id` (UUID, Primary Key)
- `quiz_id` (UUID, Foreign Key → quizzes.id, ON DELETE CASCADE)
- `question_text` (TEXT, NOT NULL)
- `question_type` (ENUM: 'mcq', 'true_false', 'text', NOT NULL)
- `points` (INTEGER, default: 1)
- `order` (INTEGER, NOT NULL) - for ordering questions within a quiz
- `created_at` (TIMESTAMP, default: now())
- `updated_at` (TIMESTAMP, default: now())

#### `question_options` (for MCQ and True/False)
- `id` (UUID, Primary Key)
- `question_id` (UUID, Foreign Key → questions.id, ON DELETE CASCADE)
- `option_text` (TEXT, NOT NULL)
- `is_correct` (BOOLEAN, NOT NULL, default: false)
- `order` (INTEGER, NOT NULL) - for ordering options

#### `quiz_attempts`
- `id` (UUID, Primary Key)
- `quiz_id` (UUID, Foreign Key → quizzes.id)
- `user_name` (VARCHAR, nullable) - optional identifier
- `score` (INTEGER, NOT NULL)
- `total_points` (INTEGER, NOT NULL)
- `percentage` (DECIMAL(5,2), NOT NULL)
- `submitted_at` (TIMESTAMP, default: now())

#### `quiz_responses`
- `id` (UUID, Primary Key)
- `attempt_id` (UUID, Foreign Key → quiz_attempts.id, ON DELETE CASCADE)
- `question_id` (UUID, Foreign Key → questions.id)
- `selected_option_id` (UUID, Foreign Key → question_options.id, nullable) - for MCQ/TrueFalse
- `text_response` (TEXT, nullable) - for text questions
- `is_correct` (BOOLEAN, NOT NULL)
- `points_earned` (INTEGER, NOT NULL)

## API Endpoints

### Admin Endpoints
- `POST /api/admin/quizzes` - Create a new quiz
- `GET /api/admin/quizzes` - List all quizzes
- `GET /api/admin/quizzes/{quiz_id}` - Get quiz details with questions
- `PUT /api/admin/quizzes/{quiz_id}` - Update quiz
- `DELETE /api/admin/quizzes/{quiz_id}` - Delete quiz
- `POST /api/admin/quizzes/{quiz_id}/questions` - Add question to quiz
- `PUT /api/admin/questions/{question_id}` - Update question
- `DELETE /api/admin/questions/{question_id}` - Delete question

### Public Endpoints
- `GET /api/public/quizzes/{quiz_id}` - Get quiz for taking (without correct answers)
- `POST /api/public/quizzes/{quiz_id}/submit` - Submit quiz answers and get score

## Assumptions

1. **Authentication**: For MVP, admin endpoints are unprotected. In production, add authentication/authorization.
2. **Question Types**:
   - **MCQ**: Multiple choice with one or more correct answers (we'll support single correct answer for simplicity)
   - **True/False**: Binary choice question
   - **Text**: Free-form text answer (graded as correct if matches expected answer exactly, case-insensitive)
3. **Scoring**: 
   - Each question has a `points` value
   - MCQ/TrueFalse: Full points if correct, 0 if incorrect
   - Text: Full points if matches (case-insensitive), 0 otherwise
4. **Quiz Taking**: Users can take a quiz once (no attempt tracking for same user - simplified for MVP)
5. **Frontend Routing**: 
   - `/admin` - Admin dashboard
   - `/quiz/:quizId` - Public quiz taking page
6. **CORS**: Backend will allow CORS from frontend origin

## Trade-offs

1. **No User Authentication**: Simplified for MVP. Production would need user accounts, JWT tokens, etc.
2. **Text Answer Matching**: Simple exact match (case-insensitive). Production might use fuzzy matching or manual grading.
3. **Single Correct Answer for MCQ**: Simplified. Could extend to multiple correct answers later.
4. **No Quiz Attempt Limits**: Users can retake quizzes. Production might limit attempts.
5. **No Time Limits**: No timer functionality. Could be added later.
6. **No Question Randomization**: Questions appear in order. Could randomize later.
7. **No Partial Credit**: Binary scoring (correct/incorrect). Could implement partial credit later.

## Project Structure

```
quiz_project/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── database.py
│   │   └── routers/
│   │       ├── __init__.py
│   │       ├── admin.py
│   │       └── public.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── Dockerfile
├── docker-compose.yml
└── PLAN.md
```

## Implementation Order

1. ✅ Create PLAN.md and docker-compose.yml
2. Backend: Database models and connection
3. Backend: Pydantic schemas
4. Backend: Admin API routers
5. Backend: Public API routers with scoring logic
6. Frontend: Setup React + Tailwind + Routing
7. Frontend: Admin dashboard UI
8. Frontend: Public quiz-taking UI
9. Testing and refinement

