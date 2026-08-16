# Backend Test Console (Demo Frontend)

This is NOT the final UI. It's a plain, functional page whose only job is
proving your real backend works end-to-end from an actual browser. No
styling effort was spent on purpose - once this proves everything works,
build the real UI separately (this file can be thrown away).

## Setup

1. Make sure your FastAPI backend is running first:
   ```
   cd backend
   python -m uvicorn main:app
   ```
   Confirm it's reachable at http://127.0.0.1:8000/docs

2. In a NEW terminal, install and run this frontend:
   ```
   cd frontend-demo
   npm install
   npm run dev
   ```

3. Open the URL it prints (usually http://localhost:5173)

## What to test, in order

1. Sign up with a test account (or log in if you already made one)
2. Try uploading a real resume (PDF/DOCX) - skills should auto-fill below
3. Or just type skills directly into the text box
4. Pick a target domain
5. Click "Get Recommendation" - should show match score, learning priority,
   companies, and the Gemini roadmap narrative (or "Gemini unavailable" -
   that's expected/correct behavior, not a bug)
6. Click "Get Role Fit" - only meaningful for "AI & Data Science" domain

## Known assumption to verify

`src/api.js`'s `getRecommendation()` sends `target_domain` as the JSON
field name for the domain. This was NEVER CONFIRMED against your actual
`RecommendationRequest` schema file (only `resume_skills` was confirmed,
via an error message seen earlier). **If the recommendation call fails
with a 422 error, this field name is the first thing to check** - open
your real `RecommendationRequest` schema and confirm the actual field
name, then update `src/api.js` accordingly.

## Backend was NOT modified for this

This frontend only makes HTTP calls to your existing, already-tested
backend. Nothing on the backend side needs to change for this to work.
