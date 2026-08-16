import axios from 'axios'

// Points at your REAL backend - no mocking, no fake data.
// Change this if your server runs on a different port.
const BASE_URL = 'http://127.0.0.1:8000'

const api = axios.create({ baseURL: BASE_URL })

// Attach the JWT token (if we have one) to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export async function signup(name, email, password) {
  // PENDING CONFIRMATION: latest report says this should be "signup"
  // (no typo), contradicting an earlier report that claimed "singup".
  // Verify against your live /docs page before trusting this.
  const res = await api.post('/api/v1/signup', { name, email, password })
  return res.data
}

export async function login(email, password) {
  const form = new URLSearchParams()
  form.append('username', email)
  form.append('password', password)

  const res = await api.post('/api/v1/login', form, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
  localStorage.setItem('access_token', res.data.access_token)
  return res.data
}

export function logout() {
  localStorage.removeItem('access_token')
}

export function isLoggedIn() {
  return !!localStorage.getItem('access_token')
}

export async function getDomains() {
  const res = await api.get('/api/v1/domains')
  return res.data
}

export async function getRecommendation(resumeSkills, targetDomain) {
  const res = await api.post('/api/v1/recommendation', {
    resume_skills: resumeSkills,
    target_domain: targetDomain,
  })
  return res.data
}

export async function getRoleFit(skills) {
  // Confirmed via real 422 response: backend currently requires
  // "resume_skills" here, not "skills" - this overrides an earlier
  // in-chat design decision that apparently didn't make it into the
  // real deployed backend. Matching actual runtime behavior.
  const res = await api.post('/api/v1/role-fit', { resume_skills: skills })
  return res.data
}

export async function uploadResume(file) {
  const formData = new FormData()
  formData.append('file', file)
  // BEST GUESS, NOT CONFIRMED - verify against your real /docs page.
  // Auth routes turned out to live under /api/v1/, so this follows the
  // same pattern, but this specific path has not been verified yet.
  const res = await api.post('/api/v1/resume-upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}

export default api
