# Quiz Management System

A production-ready quiz management system built with FastAPI, React, PostgreSQL, and Docker.

## Features

- **Admin Dashboard**: Create and manage quizzes with multiple question types (MCQ, True/False, Text)
- **Public Quiz Interface**: Clean and elegant interface for users to take quizzes
- **Automatic Scoring**: Backend calculates scores and returns detailed results
- **FastAPI Documentation**: Full Swagger/OpenAPI documentation at `/docs`
- **Dockerized**: Complete containerization for easy deployment and development

## Tech Stack

- **Backend**: FastAPI (Python 3.11)
- **Frontend**: React 18 with Tailwind CSS
- **Database**: PostgreSQL 15
- **Containerization**: Docker & Docker Compose

## Prerequisites

Before starting, ensure you have the following installed:

- **Docker** (version 20.10 or higher)
- **Docker Compose** (version 2.0 or higher)

To verify your installation:
```bash
docker --version
docker-compose --version
```

## Getting Started

### Step 1: Clone and Navigate

```bash
cd quiz_project
```

### Step 2: Start the Application

Start all services (database, backend, and frontend) using Docker Compose:

```bash
docker-compose up --build
```

**What this does:**
- Builds Docker images for backend and frontend
- Starts PostgreSQL database
- Starts FastAPI backend server
- Starts React frontend development server
- Sets up all necessary network connections

**First-time startup may take 2-3 minutes** as it downloads dependencies and builds images.

### Step 3: Verify Services are Running

You should see output indicating all three services are healthy:
- ✅ `quiz_db` - Database ready
- ✅ `quiz_backend` - Backend running on port 8000
- ✅ `quiz_frontend` - Frontend running on port 5173

### Step 4: Access the Application

Once all services are running, access:

- **Frontend Application**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation (Swagger)**: http://localhost:8000/docs
- **Alternative API Docs (ReDoc)**: http://localhost:8000/redoc
- **Database**: PostgreSQL on `localhost:5432`
  - Username: `quiz_user`
  - Password: `quiz_password`
  - Database: `quiz_db`

## Usage Guide

### Admin Authentication

**Default Credentials:**
- Username: `admin`
- Password: `admin`

**Important**: Change these credentials in production! See the `backend/app/auth.py` file.

### Creating Your First Quiz

1. **Login to Admin Dashboard**
   - Go to http://localhost:5173/admin/login
   - Or click "Admin Login" from the home page
   - Enter credentials: username `admin`, password `admin`
   - You'll be redirected to the admin dashboard

2. **Create a New Quiz**
   - Click the "+ New Quiz" button
   - Enter a title (required) and description (optional)
   - Click "Create"

3. **Add Questions**
   - Select your quiz from the list
   - Click "+ Add Question"
   - Choose question type:
     - **MCQ**: Multiple choice with options (select one correct answer)
     - **True/False**: Binary choice question
     - **Text**: Free-form text answer (case-insensitive matching)
   - Enter question text, points, and configure options/answers
   - Click "Create"

4. **Take the Quiz**
   - Copy the quiz ID from the admin dashboard
   - Navigate to: http://localhost:5173/quiz/[quiz-id]
   - Fill in your answers
   - Submit to see your score and detailed results

### Example Quiz Creation Flow

```
1. Admin Dashboard → Create Quiz "Python Basics"
2. Add Question 1: "What is Python?" (MCQ)
   - Option A: "A snake" (incorrect)
   - Option B: "A programming language" (correct) ✓
   - Option C: "A framework" (incorrect)
3. Add Question 2: "Python is dynamically typed" (True/False)
   - True (correct) ✓
4. Add Question 3: "What is PEP 8?" (Text)
   - Correct Answer: "Python Enhancement Proposal"
5. Share quiz link: /quiz/[quiz-id]
```

## Managing the Application

### Stop the Application

Press `Ctrl+C` in the terminal where Docker Compose is running, or:

```bash
docker-compose down
```

### Stop and Remove Volumes (Clean Slate)

To remove all data including the database:

```bash
docker-compose down -v
```

**Warning**: This will delete all quizzes and data!

### View Logs

View logs from all services:
```bash
docker-compose logs -f
```

View logs from a specific service:
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

### Restart a Specific Service

```bash
docker-compose restart backend
docker-compose restart frontend
docker-compose restart db
```

### Rebuild After Code Changes

If you make significant changes to dependencies:

```bash
docker-compose up --build
```

For frontend dependency changes:
```bash
docker-compose build frontend
docker-compose up frontend
```

For backend dependency changes:
```bash
docker-compose build backend
docker-compose up backend
```

## Project Structure

```
quiz_project/
├── backend/          # FastAPI application
│   ├── app/
│   │   ├── main.py  # FastAPI app entry point
│   │   ├── models.py # SQLAlchemy models
│   │   ├── schemas.py # Pydantic schemas
│   │   ├── database.py # Database configuration
│   │   └── routers/  # API route handlers
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/         # React application
│   ├── src/
│   │   ├── pages/    # Page components
│   │   ├── components/ # Reusable components
│   │   └── api.js    # API client
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
├── PLAN.md          # Detailed project plan
└── README.md
```

## API Endpoints

### Auth Endpoints

- `POST /api/auth/login` - Admin login (returns JWT token)
  - Requires: `username` and `password` (form data)
  - Returns: `access_token` and `token_type`

### Admin Endpoints

**All admin endpoints require authentication via Bearer token in Authorization header.**

- `POST /api/admin/quizzes` - Create a new quiz (🔒 Protected)
- `GET /api/admin/quizzes` - List all quizzes (🔒 Protected)
- `GET /api/admin/quizzes/{quiz_id}` - Get quiz details (🔒 Protected)
- `PUT /api/admin/quizzes/{quiz_id}` - Update quiz (🔒 Protected)
- `DELETE /api/admin/quizzes/{quiz_id}` - Delete quiz (🔒 Protected)
- `POST /api/admin/quizzes/{quiz_id}/questions` - Add question (🔒 Protected)
- `PUT /api/admin/questions/{question_id}` - Update question (🔒 Protected)
- `DELETE /api/admin/questions/{question_id}` - Delete question (🔒 Protected)

### Public Endpoints

- `GET /api/public/quizzes/{quiz_id}` - Get quiz for taking
- `POST /api/public/quizzes/{quiz_id}/submit` - Submit quiz and get score

## Development Mode

### Running Services Individually (Without Docker)

#### Backend Development

1. **Set up Python environment:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

2. **Set environment variable:**
```bash
export DATABASE_URL="postgresql://quiz_user:quiz_password@localhost:5432/quiz_db"
```

3. **Run the server:**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend Development

1. **Install dependencies:**
```bash
cd frontend
npm install
```

2. **Set environment variable:**
```bash
export VITE_API_URL="http://localhost:8000"
```

3. **Run the development server:**
```bash
npm run dev
```

**Note**: When running without Docker, ensure PostgreSQL is running separately.

## Troubleshooting

### Port Already in Use

If you get a "port already in use" error:

```bash
# Find process using the port
lsof -i :8000  # Backend
lsof -i :5173  # Frontend
lsof -i :5432  # Database

# Kill the process or change ports in docker-compose.yml
```

### Database Connection Issues

If the backend can't connect to the database:

1. Check if database container is running:
```bash
docker-compose ps
```

2. Check database logs:
```bash
docker-compose logs db
```

3. Restart the database:
```bash
docker-compose restart db
```

### Frontend Can't Connect to Backend

1. Verify backend is running:
   - Visit http://localhost:8000/docs
   - Should see Swagger documentation

2. Check CORS settings in `backend/app/main.py`

3. Verify environment variable:
```bash
docker-compose exec frontend env | grep VITE_API_URL
```

### Container Build Failures

1. **Clear Docker cache:**
```bash
docker-compose build --no-cache
```

2. **Remove old containers and images:**
```bash
docker-compose down
docker system prune -a
docker-compose up --build
```

### Database Schema Not Created

The database tables are created automatically on first startup. If they're missing:

1. Check backend logs for errors:
```bash
docker-compose logs backend
```

2. Manually trigger table creation (if needed):
```bash
docker-compose exec backend python -c "from app.database import Base, engine; Base.metadata.create_all(bind=engine)"
```

## Environment Variables

### Backend Environment Variables

- `DATABASE_URL`: PostgreSQL connection string
  - Default: `postgresql://quiz_user:quiz_password@db:5432/quiz_db`
  - Format: `postgresql://user:password@host:port/database`

- `ALLOWED_ORIGINS`: Comma-separated list of allowed CORS origins
  - Default: `http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000`
  - Example for production: `https://yourdomain.com,https://www.yourdomain.com`
  - **Important**: Must include your frontend URL when deployed

- `ALLOW_ALL_ORIGINS`: Set to `"true"` to allow all origins (NOT recommended for production)
  - Default: `false`
  - Use only for development/testing

### Frontend Environment Variables

- `VITE_API_URL`: Backend API URL
  - Default: `http://localhost:8000`
  - Used for API calls from frontend
  - **For production**: Set to your backend URL (e.g., `https://api.yourdomain.com`)

To modify these, edit `docker-compose.yml` or create a `.env` file.

## Database Management

### Access PostgreSQL Database

```bash
# Using Docker
docker-compose exec db psql -U quiz_user -d quiz_db

# Common SQL commands
\dt              # List all tables
\d quizzes       # Describe quizzes table
SELECT * FROM quizzes;
\q               # Quit
```

### Backup Database

```bash
docker-compose exec db pg_dump -U quiz_user quiz_db > backup.sql
```

### Restore Database

```bash
docker-compose exec -T db psql -U quiz_user quiz_db < backup.sql
```

### Reset Database

```bash
# Stop services
docker-compose down -v

# Start fresh
docker-compose up --build
```

## API Testing

### Using Swagger UI

1. Navigate to http://localhost:8000/docs
2. Use the interactive API documentation to test endpoints
3. Click "Try it out" on any endpoint
4. Fill in parameters and click "Execute"

### Using cURL Examples

**Login and get token:**
```bash
TOKEN=$(curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin&password=admin" | jq -r '.access_token')
```

**Create a quiz (with authentication):**
```bash
curl -X POST "http://localhost:8000/api/admin/quizzes" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title": "Test Quiz", "description": "A test quiz"}'
```

**Get all quizzes (with authentication):**
```bash
curl "http://localhost:8000/api/admin/quizzes" \
  -H "Authorization: Bearer $TOKEN"
```

**Get a quiz for taking:**
```bash
curl "http://localhost:8000/api/public/quizzes/{quiz-id}"
```

## Project Structure

```
quiz_project/
├── backend/              # FastAPI application
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py       # FastAPI app entry point
│   │   ├── models.py     # SQLAlchemy database models
│   │   ├── schemas.py    # Pydantic request/response schemas
│   │   ├── database.py   # Database connection and session
│   │   └── routers/      # API route handlers
│   │       ├── admin.py  # Admin endpoints
│   │       └── public.py # Public endpoints
│   ├── requirements.txt  # Python dependencies
│   └── Dockerfile        # Backend container definition
├── frontend/             # React application
│   ├── src/
│   │   ├── pages/        # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   └── QuizPage.jsx
│   │   ├── components/   # Reusable components
│   │   │   ├── QuizForm.jsx
│   │   │   ├── QuizList.jsx
│   │   │   └── QuestionForm.jsx
│   │   ├── api.js        # API client (axios)
│   │   ├── App.jsx       # Main app component
│   │   ├── main.jsx      # React entry point
│   │   └── index.css     # Tailwind CSS imports
│   ├── package.json      # Node dependencies
│   ├── vite.config.js    # Vite configuration
│   ├── tailwind.config.js # Tailwind CSS configuration
│   └── Dockerfile        # Frontend container definition
├── docker-compose.yml    # Multi-container orchestration
├── PLAN.md              # Detailed project plan and design decisions
├── README.md            # This file
└── .gitignore          # Git ignore rules
```

## Database Schema

See `PLAN.md` for detailed database schema, relationships, and design decisions.

Key tables:
- `quizzes` - Quiz metadata
- `questions` - Quiz questions with types
- `question_options` - Options for MCQ/TrueFalse questions
- `quiz_attempts` - User quiz submissions
- `quiz_responses` - Individual question responses

## Security Notes

### Authentication

- **Default Credentials**: The system comes with default admin credentials (`admin`/`admin`)
- **JWT Tokens**: Authentication uses JWT tokens with 30-minute expiration
- **Token Storage**: Frontend stores tokens in localStorage
- **Password Hashing**: Passwords are hashed using bcrypt

### Changing Default Credentials

To change the default admin credentials, edit `backend/app/auth.py`:

```python
ADMIN_USERNAME = "your_username"
ADMIN_PASSWORD_HASH = pwd_context.hash("your_password")
```

**For production**, consider:
- Storing credentials in environment variables
- Using a database to store admin users
- Implementing password reset functionality
- Adding rate limiting to login endpoint

## Production Deployment

### CORS Configuration for Production

When deploying to a server, you **must** configure CORS to allow your frontend origin:

1. **Set ALLOWED_ORIGINS environment variable** with your frontend URL(s):
   ```bash
   # In docker-compose.yml or .env file
   ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
   ```

2. **Update frontend API URL**:
   ```bash
   # In frontend/.env or docker-compose.yml
   VITE_API_URL=https://api.yourdomain.com
   ```

3. **Example docker-compose.yml for production**:
   ```yaml
   backend:
     environment:
       - ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
   
   frontend:
     environment:
       - VITE_API_URL=https://api.yourdomain.com
   ```

### Fixing "strict-origin-when-cross-origin" Error

If you see this error, it means CORS is blocking the request. Fix it by:

1. **Check your frontend URL** - What URL is your frontend running on?
2. **Add it to ALLOWED_ORIGINS**:
   ```bash
   # If frontend is at http://your-server-ip:5173
   ALLOWED_ORIGINS=http://your-server-ip:5173,http://localhost:5173
   
   # If frontend is at https://yourdomain.com
   ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
   ```

3. **Restart backend** after changing CORS settings:
   ```bash
   docker-compose restart backend
   ```

4. **For quick testing** (NOT for production), you can temporarily allow all origins:
   ```bash
   ALLOW_ALL_ORIGINS=true
   ```

### Complete Production Checklist

1. **Environment Variables**: Use `.env` files or secrets management
   - Change `SECRET_KEY` in `backend/app/auth.py` to a strong random string
   - Set `ALLOWED_ORIGINS` to your actual frontend domain(s)
   - Set `VITE_API_URL` to your backend URL
   - Store credentials securely

2. **Database**: Use managed PostgreSQL service

3. **Security**: 
   - ✅ Authentication/authorization (implemented)
   - ✅ CORS configuration (configurable via environment)
   - Change default admin credentials
   - Use strong JWT secret key
   - Implement HTTPS

4. **HTTPS**: Configure SSL/TLS certificates for both frontend and backend

5. **CORS**: 
   - ✅ Restrict allowed origins to your domain (via ALLOWED_ORIGINS)
   - Never use `ALLOW_ALL_ORIGINS=true` in production

6. **Database Migrations**: Use Alembic for schema migrations

7. **Logging**: Set up proper logging and monitoring

8. **Backup**: Configure automated database backups

9. **Rate Limiting**: Add rate limiting to prevent brute force attacks

10. **Token Refresh**: Consider implementing refresh tokens for better security

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues, questions, or contributions:
- Check `PLAN.md` for design decisions
- Review API documentation at `/docs`
- Check Docker logs for debugging

