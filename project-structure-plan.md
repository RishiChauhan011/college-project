# AI Career Intelligence Dashboard — Full Project Structure Plan

## 1. Project Summary

A dashboard where a user (student) provides their profile — either by uploading
a resume or filling a form manually — and receives:
- Real demand data for skills/companies (from scraped/API job data)
- An ML-predicted role-fit and/or salary estimate
- An ROI-ranked skill list (which skill to learn next)
- A Gemini-generated personalized roadmap (grounded in the structured data above)
- A chatbot (RAG-style, grounded in the user's profile + dataset) for follow-up questions

**Core principle to remember throughout:** ML models produce the numbers/predictions.
Gemini only explains those numbers in natural language. Nothing is ever invented by the LLM.

---

## 2. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | React + Tailwind CSS | Common, fast to build, well-documented |
| Backend | Python + FastAPI | Same language as your ML work, auto-generates API docs |
| Database | PostgreSQL (or SQLite for simplicity) | Structured storage for users, jobs, skills |
| Data collection | Adzuna API (primary) + optional scraping (BeautifulSoup/requests) | API avoids scraping breakage risk |
| ML/NLP | spaCy (custom NER + PhraseMatcher), scikit-learn (role-fit classifier) | Explainable, lightweight, well-supported |
| LLM layer | Gemini API | Roadmap generation + chatbot responses (grounded only) |
| Vector store (for chatbot RAG) | ChromaDB | Free, simple local setup |
| Resume parsing | pdfplumber / PyMuPDF (PDF), python-docx (DOCX) | Standard, reliable text extraction |
| Auth | FastAPI + JWT (or simple session-based auth) | Lightweight, no need for a full auth service |

---

## 3. Folder Structure

### Backend (`/backend`)
```
backend/
├── main.py                    # FastAPI app entrypoint
├── api/
│   ├── routes_profile.py      # /profile, /resume-upload endpoints
│   ├── routes_dashboard.py    # /skills, /companies, /roi endpoints
│   ├── routes_roadmap.py      # /roadmap (Gemini call)
│   ├── routes_chat.py         # /chat (RAG chatbot)
│   └── routes_auth.py         # /signup, /login
├── ml/
│   ├── ner_model/              # trained spaCy NER model files
│   ├── train_ner.py            # NER training script
│   ├── role_classifier.py      # Option D: role-fit classifier (train + predict)
│   ├── roi_scoring.py          # ROI formula logic
│   └── skill_matcher.py        # PhraseMatcher setup + master skill list
├── resume_parser/
│   ├── extract_text.py         # PDF/DOCX → raw text
│   ├── segment_sections.py     # Stage 3: section segmentation
│   └── parse_resume.py         # Orchestrates full resume → JSON pipeline
├── data_pipeline/
│   ├── fetch_jobs_api.py       # Adzuna API calls
│   ├── scrape_jobs.py          # optional scraper
│   └── clean_data.py           # cleaning/structuring into DB
├── rag/
│   ├── build_vector_store.py   # embeds job/skill data into ChromaDB
│   └── retrieve.py             # retrieval logic for chatbot
├── db/
│   ├── models.py                # SQLAlchemy models
│   └── database.py              # DB connection setup
├── llm/
│   └── gemini_client.py         # wraps Gemini API calls, prompt templates
└── requirements.txt
```

### Frontend (`/frontend`)
```
frontend/
├── src/
│   ├── pages/
│   │   ├── Landing.jsx
│   │   ├── SignupLogin.jsx
│   │   ├── Onboarding.jsx        # resume upload OR manual form choice
│   │   ├── Dashboard.jsx
│   │   ├── SkillDetail.jsx
│   │   ├── Roadmap.jsx
│   │   └── About.jsx
│   ├── components/
│   │   ├── ChatWidget.jsx        # persistent chatbot widget
│   │   ├── SkillChipEditor.jsx   # editable extracted-skill list
│   │   ├── SkillChart.jsx
│   │   └── Navbar.jsx
│   ├── api/
│   │   └── apiClient.js          # calls to FastAPI backend
│   └── App.jsx
└── package.json
```

---

## 4. Database Schema (core tables)

**users**
| column | type |
|---|---|
| id | PK |
| name, email, password_hash | text |
| created_at | timestamp |

**user_profiles**
| column | type |
|---|---|
| id | PK |
| user_id | FK → users |
| skills | JSON |
| education | text |
| experience_years | int |
| preferred_location | text |
| preferred_field | text |
| source | text (`resume` / `manual`) |

**jobs** (from scraping/API)
| column | type |
|---|---|
| id | PK |
| title, company, location | text |
| skills_required | JSON |
| salary_min, salary_max | int |
| posted_date | date |

**skill_scores** (precomputed ROI table)
| column | type |
|---|---|
| skill_name | text |
| demand_score | float |
| avg_salary_impact | float |
| roi_score | float |

---

## 5. Pages (final list, from earlier discussion)

1. Landing
2. Signup/Login
3. Onboarding (resume upload / manual — user's choice)
4. Dashboard (demand, companies, salary, ROI list)
5. Skill Detail (why this skill is ranked here)
6. Roadmap (Gemini-generated)
7. About / How it works (methodology explanation — doubles as viva prep)
8. Chatbot — persistent widget on Dashboard + Roadmap, not a standalone page

---

## 6. ML/NLP Components Map

| Component | Type | Where it lives |
|---|---|---|
| Skill extraction (PhraseMatcher) | Rule-based | `ml/skill_matcher.py` |
| Skill extraction (custom NER) | Trained ML (spaCy) | `ml/ner_model/`, `ml/train_ner.py` |
| Role-fit classifier | Trained ML (scikit-learn) | `ml/role_classifier.py` |
| ROI scoring | Deterministic formula (not ML — be clear about this in report) | `ml/roi_scoring.py` |
| Roadmap generation | LLM (Gemini), grounded in above outputs | `llm/gemini_client.py` |
| Chatbot | RAG (retrieval from ChromaDB + Gemini generation) | `rag/`, `api/routes_chat.py` |

---

## 7. Suggested 2-Person Work Split

Split by **layer**, not by page — this avoids merge conflicts and lets each person go deep on their half.

**Person A — Data + ML/Backend Core**
- Data pipeline (Adzuna API / scraping, cleaning)
- Master skill list + PhraseMatcher
- Custom NER model (training data prep, training, evaluation)
- Role-fit classifier (Option D)
- ROI scoring logic
- Database schema + models

**Person B — Resume Pipeline + Frontend + Integration**
- Resume text extraction (PDF/DOCX)
- Section segmentation (Stage 3)
- FastAPI routes (wiring everything together)
- Gemini integration (roadmap + chatbot prompts)
- RAG/ChromaDB setup for chatbot
- Full frontend (all pages + chat widget)
- Auth

**Shared / done together:**
- API contract design (what JSON shape each endpoint sends/receives) — do this *first*, together, before splitting off, so you don't integrate two mismatched halves later
- Final testing + viva prep + report writing

---

## 8. Suggested Timeline (adjust to your actual deadline)

| Week | Person A | Person B |
|---|---|---|
| 1 | Data collection (API/scraping) + DB schema | Resume text extraction + PDF/DOCX handling |
| 2 | Master skill list + PhraseMatcher | Section segmentation (Stage 3) |
| 3 | NER training data prep + training | FastAPI route skeletons + auth |
| 4 | NER evaluation + role-fit classifier data prep | Gemini integration (roadmap prompt) |
| 5 | Role-fit classifier training + evaluation | RAG/ChromaDB setup for chatbot |
| 6 | ROI scoring + backend integration testing | Frontend: Landing, Onboarding, Dashboard |
| 7 | Support integration/debugging | Frontend: Roadmap, Skill Detail, Chat widget |
| 8 | Joint: testing, bug fixes, report, viva prep | Joint: testing, bug fixes, report, viva prep |

---

## 9. What to lock in before writing any code

1. **API contract** — exact JSON shape for `/profile`, `/dashboard`, `/roadmap`, `/chat` (do this together, on paper/doc, first)
2. **Master skill list** — needed by both the resume pipeline and the job-data pipeline
3. **Dataset source decision** — Adzuna API as base, confirmed

---

*This is a living plan — update it as you make decisions in later stages (e.g., once role-fit classifier features are finalized, or once chatbot grounding format is set).*
