# AI Career Intelligence - Backend Summary

This document provides a comprehensive summary of the entire backend structure, components, database schema, API endpoints, and core business logic for the AI Career Intelligence Dashboard project.

## 1. Overview
- **Framework**: FastAPI
- **Language**: Python 3.x
- **Database**: SQLite (`career_dashboard.db`)
- **ORM**: SQLAlchemy
- **Authentication**: JWT-based Authentication (using `bcrypt` and `jose`)
- **Machine Learning**: Scikit-learn (Logistic Regression for Role Fit prediction)
- **LLM Integration**: Google Gemini API for natural language roadmap generation
- **Core Purpose**: Exposes job analytics, company data, skills metadata, career recommendations, and role fit predictions based on job market data and uploaded resumes.

## 2. Directory Structure (`backend/`)
The backend is organized into a modular structure:
- **`api/`**: Contains `routes/` (FastAPI router definitions) and `schemas/` (Pydantic models for request/response validation).
- **`db/`**: Database configuration (`database.py`), SQLAlchemy models (`models.py`), and initialization scripts (`init_db.py`).
- **`services/`**: Core business logic separating API routing from data access. Includes `analytics_service.py`, `job_service.py`, `recommendation_service.py`, `role_fit_service.py`, and `skill_service.py`.
- **`ml/`**: Machine learning scripts and models. Contains the pre-trained `role_classifier_model.joblib`, skill extraction logic (`extract_skills.py`), and datasets (`jobs_with_skills.json`, `master_skills.csv`).
- **`llm/`**: Contains `gemini_client.py` for interacting with the Google Gemini API to generate roadmap narratives.
- **`recommendation/`**: Houses the core mathematical recommendation engine (`recommendation.py`) for skill gap analysis.
- **`resume_parser/`**: Contains `parse_resume.py` which extracts text and skills from uploaded PDF/DOCX resumes using `pdfplumber`, `python-docx`, and `spacy`.
- **`data_pipeline/`**: Scripts for fetching, cleaning, and backfilling raw job data (`fetch_jobs_api.py`, `clean_data.py`).
- **`analytics/`**: Contains precomputed analytics JSON files (`analytics.json`) and scripts to generate them.
- **`utils/`**: Helper utilities, specifically `data_loader.py` which caches datasets in memory during application startup.
- **`tests/`**: Pytest test suite for backend functionality.

## 3. Database Schema
Defined in `db/models.py`.
- **`User`**: Core authentication table. Contains `id`, `name`, `email` (unique), `password_hash`, and `created_at`.
- **`UserProfile`**: Linked to User (1-to-1). Stores `skills` (JSON), `education`, `experience_years`, `preferred_location`, `preferred_field`, and `source` ("resume" or "manual").
- **`Job`**: Stores scraped job postings. Contains `title`, `company`, `location`, `skills_required` (JSON), `salary_min`, `salary_max`, and `posted_date`.
- **`SkillScore`**: Precomputed analytics for specific skills. Contains `skill_name`, `demand_score`, `avg_salary_impact`, and `roi_score`.

## 4. API Endpoints
The application uses the `/api/v1` prefix for main routes.

### System
- **`GET /`**: Health check endpoint returning system status and version.

### Authentication (`api/routes/routes_auth.py`)
- **`POST /api/v1/signup`**: Creates a new user with hashed password.
- **`POST /api/v1/login`**: OAuth2 login returning a JWT `access_token` (expires in 30 minutes by default).

### Profile & Resume (`api/routes/routes_profile.py`)
- **`GET /api/v1/profile`**: Placeholder for fetching user profile (requires auth).
- **`POST /api/v1/resume-upload`**: Accepts PDF or DOCX files (max 5MB), validates MIME type via `python-magic`, and delegates to `parse_resume()` to extract skills (requires auth).

### Analytics (`api/routes/analytics.py`)
- **`GET /api/v1/domains`**: Returns a list of dynamically fetched career domains.
- **`GET /api/v1/analytics`**: Returns precomputed overall statistics (total jobs, total skills, salary disclosure rate).
- **`GET /api/v1/analytics/domain/{domain_name}`**: Returns detailed analytics for a specific domain (job count, top skills, top companies, salary stats).

### Jobs & Companies (`api/routes/jobs.py`)
- **`GET /api/v1/companies`**: Returns a list of unique companies, optionally filtered by domain.
- **`GET /api/v1/jobs`**: Returns a list of jobs with pagination (`limit`, `offset`) and optional filtering by `domain`, `company`, and `skills`.

### Skills (`api/routes/skills.py`)
- **`GET /api/v1/skills`**: Returns the master list of skills from `master_skills.csv`, with optional filtering by `category`, `skill_type`, and `enabled` status.

### Recommendations (`api/routes/recommendation.py`)
- **`POST /api/v1/recommendation`**: Accepts resume skills and a target domain.
  - Computes match score, recognized skills, and missing skills prioritized by ROI.
  - Matches the user to qualified companies.
  - Uses Google Gemini to append a natural-language `roadmap_narrative` to the structured JSON response.

### Role Fit Prediction (`api/routes/role_fit.py`)
- **`POST /api/v1/role-fit`**: Accepts a list of skills and uses a scikit-learn Logistic Regression model (`role_classifier_model.joblib`) to predict the best-fit specific role (currently scoped strictly to the AI & Data Science domain).

## 5. Machine Learning & LLM Implementations
- **Role Classifier**: A pre-trained `scikit-learn` Logistic Regression model is loaded from disk. Features are one-hot encoded skills. The model outputs a predicted sub-role based on input skills.
- **LLM Integration**: `llm/gemini_client.py` takes structured mathematical output from the recommendation engine and crafts a personalized, natural-language learning roadmap using the `google-genai` SDK.
- **Resume Parsing**: Employs `pdfplumber` (for PDF) and `python-docx` (for DOCX) to extract raw text. Then, `spacy` or custom keyword matching against `master_skills.csv` is used to identify known skills.

## 6. Key Configuration & Setup
- **`config.py`**: Resolves core absolute paths for data files (`analytics.json`, `jobs_with_skills.json`, `master_skills.csv`, `role_classifier_model.joblib`).
- **`.env`**: Loads sensitive configuration like `DATABASE_URL`, `SECRET_KEY`, `ALGORITHM`, and `GEMINI_API_KEY`.
- **Application Startup (`main.py`)**: 
  - Uses FastAPI `@asynccontextmanager` `lifespan` to preload CSVs and JSONs into memory (`utils.data_loader.preload_data()`) so API calls are instantaneous.
  - Configures a global exception handler to prevent traceback leakage.
  - Currently has CORS globally un-restricted (`allow_origins=["*"]`) for local frontend development.
