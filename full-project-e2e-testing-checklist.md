# Full Project End-to-End Testing Checklist

Purpose: systematically test the ENTIRE stack (backend + frontend
together) and produce one clear report of what works and what doesn't.
Go through every section in order. Don't skip sections because
"that probably works" - several real bugs in this project were found
exactly that way.

**Rule: do not fix anything while testing.** Just record results. Fixing
happens after, once the full picture is known - fixing mid-test risks
missing other real issues or accidentally masking one bug with another.

---

## 0. Setup

- [ ] Backend running (`cd backend && python -m uvicorn main:app`)
- [ ] Confirm `/docs` loads at `http://127.0.0.1:8000/docs`
- [ ] Frontend running (`cd frontend && npm run dev`)
- [ ] Open browser DevTools BEFORE starting - keep Console and Network
      tabs visible throughout. Most real bugs show up there first, not
      as a visibly broken page.
- [ ] Use a FRESH browser session (incognito/private window) - stale
      localStorage tokens have caused false results before

---

## 1. Authentication

- [ ] Sign up with a brand-new email - confirm success, correct
      transition to logged-in state (no repeat of the earlier
      first-signup race bug)
- [ ] Try signing up with the SAME email again - should fail clearly
      (409), not silently succeed or crash
- [ ] Log out, log in with correct credentials - success
- [ ] Log in with WRONG password - clear error shown, not a blank page
      or console crash
- [ ] Log in with an email that doesn't exist - same, clear error
- [ ] Refresh the page while logged in - session should persist (not
      bounce back to login)
- [ ] Log out - confirm you're redirected and can no longer access
      protected pages by typing the URL directly

---

## 2. Navigation & Shell

- [ ] Visit `/` directly - redirects to `/dashboard`
- [ ] Click through all 7 nav items in the sidebar - each loads the
      correct page, active state highlights correctly
- [ ] Resize browser to mobile width - hamburger menu appears, sidebar
      becomes a drawer, opens/closes correctly
- [ ] Resize to tablet width - sidebar collapses to icon-only
- [ ] Check browser console after EVERY page load in this section -
      note any red errors or yellow warnings, even if the page looks
      fine visually

---

## 3. Manual Skill Entry -> Recommendation

Test with this EXACT input first, since it has a known correct answer:
```
Skills: Python, SQL, Excel, Communication
Domain: AI & Data Science
```
- [ ] Match score shows **8.4%** exactly (known golden-test value - if
      this differs, something regressed)
- [ ] Learning priority shows: Data Analysis, Machine Learning, Cloud
      Computing (in that order)
- [ ] Qualified companies: 15

Then test with DIFFERENT inputs to confirm it's not hardcoded/static:
- [ ] A richer skill set (8-10 skills) in the same domain - confirm the
      match score is meaningfully different from 8.4%
- [ ] Switch to at least 2 OTHER domains (e.g. Business Analytics,
      Software Development) with the same skill list - confirm results
      actually change per domain, not just the domain label

For each test above, also check:
- [ ] `roadmap_narrative` displays as properly rendered text (bold
      etc.), NOT literal `**asterisks**` on screen
- [ ] Open the Network tab, inspect the raw `/api/v1/recommendation`
      response - confirm every number shown on screen matches the raw
      JSON exactly (catches silent frontend display bugs)

---

## 4. Resume Upload

- [ ] Upload a real, text-based PDF resume - confirm `readable: true`
      and a real skill list appears
- [ ] Upload a real DOCX resume - same checks
- [ ] Upload a SCANNED/image-only PDF (or a blank PDF) - confirm the
      UI shows a clear "couldn't read this, try manual entry" message,
      not a crash or silent empty result
- [ ] Try uploading a `.txt` or `.jpg` file - confirm it's rejected with
      a clear message (not a raw server error dumped on screen)
- [ ] Try a file over 5MB - confirm it's rejected with a clear size
      error
- [ ] After a successful upload, confirm the extracted skills correctly
      feed into the recommendation flow (same as Section 3, but with
      resume-derived skills instead of typed ones)

---

## 5. Role-Fit Classifier

- [ ] With a skill list that includes "Machine Learning" - confirm
      ML Engineer is predicted with high confidence (known model
      behavior)
- [ ] With a skill list WITHOUT "Machine Learning" but with other ML
      tools (TensorFlow, PyTorch, Docker) - note what's predicted; per
      known model behavior this may predict Data Scientist instead of
      ML Engineer - this is EXPECTED, not a bug (see
      documentation-checklist.md)
- [ ] Confirm the probability breakdown is shown, and the four
      percentages sum to ~100%
- [ ] Try submitting an empty skill list - confirm a clear validation
      error (422), not a broken request
- [ ] Confirm role-fit is either hidden or clearly labeled as
      "AI & Data Science only" when a different domain is selected
      elsewhere in the app - it should not be presented as working
      for all domains

---

## 6. Gemini Roadmap

- [ ] Confirm a real narrative renders with proper text formatting
- [ ] Confirm narrative length looks like 3 short paragraphs, not one
      giant block or a single sentence
- [ ] If a `roadmap_narrative: null` case occurs naturally (don't force
      it by breaking your API key - per the non-destructive testing
      rule), confirm the UI shows a sensible fallback message, not a
      blank space or crash

---

## 7. Cross-Cutting Error States

- [ ] Stop the backend server, try using the app - confirm the frontend
      shows a clear "can't reach server" type message, not a silent
      hang or raw browser network error
- [ ] Restart the backend, confirm the app recovers without needing a
      full page reload (or note if a reload IS required)

---

## 8. Known-Issue Regression Re-Checks

These are bugs that were found and supposedly fixed earlier - confirm
they're actually still fixed, not reintroduced:

- [ ] Signup uses the CORRECT confirmed path (verify against `/docs`
      one more time, given this was previously reported two different
      ways)
- [ ] First signup click works immediately - no need to click twice
- [ ] Role-fit request uses `resume_skills` as the field name (not
      `skills`) - check the Network tab request payload directly
- [ ] Resume upload path is `/api/v1/resume-upload`
- [ ] An empty/failed Gemini response never displays as an empty
      string on screen - either real text or a clear "unavailable"
      state

---

## 9. Report Format

For EVERY item above, record:
```
[PASS] or [FAIL] or [BLOCKED - explain why]
```

For every FAIL, include:
1. Exact steps to reproduce
2. What you expected vs. what actually happened
3. The exact error text (from the screen, browser console, AND network
   tab if relevant - all three, not just one)
4. Screenshot if the issue is visual/layout-related

Do not summarize failures vaguely ("recommendation page has issues") -
be as specific as every prior test report in this project has been
(exact numbers, exact error strings, exact request/response bodies).

Group the final report the same way this checklist is grouped (Auth,
Navigation, Recommendation, Resume, Role-Fit, Gemini, Error States,
Regressions) so it's easy to map findings back to root cause.
