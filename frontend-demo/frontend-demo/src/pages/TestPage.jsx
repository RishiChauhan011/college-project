import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { logout, getDomains, getRecommendation, getRoleFit, uploadResume } from '../api.js'

export default function TestPage() {
  const navigate = useNavigate()
  const [domains, setDomains] = useState([])
  const [targetDomain, setTargetDomain] = useState('AI & Data Science')
  const [skillsInput, setSkillsInput] = useState('Python, SQL, Excel, Communication')

  const [recResult, setRecResult] = useState(null)
  const [roleFitResult, setRoleFitResult] = useState(null)
  const [resumeResult, setResumeResult] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(null) // tracks WHICH action is loading

  useEffect(() => {
    getDomains()
      .then(setDomains)
      .catch((err) => setError(`Failed to load domains - is the backend running? ${err.message}`))
  }, [])

  function parseSkills() {
    return skillsInput
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
  }

  async function handleGetRecommendation() {
    setError(null)
    setLoading('recommendation')
    try {
      const result = await getRecommendation(parseSkills(), targetDomain)
      setRecResult(result)
    } catch (err) {
      setError(`Recommendation call failed: ${JSON.stringify(err.response?.data) || err.message}`)
    } finally {
      setLoading(null)
    }
  }

  async function handleGetRoleFit() {
    setError(null)
    setLoading('rolefit')
    try {
      const result = await getRoleFit(parseSkills())
      setRoleFitResult(result)
    } catch (err) {
      setError(`Role-fit call failed: ${JSON.stringify(err.response?.data) || err.message}`)
    } finally {
      setLoading(null)
    }
  }

  async function handleResumeUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    setError(null)
    setLoading('resume')
    try {
      const result = await uploadResume(file)
      setResumeResult(result)
      if (result.skills && result.skills.length > 0) {
        setSkillsInput(result.skills.join(', ')) // feed straight into the skill box below
      }
    } catch (err) {
      setError(`Resume upload failed: ${JSON.stringify(err.response?.data) || err.message}`)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div style={{ maxWidth: 800, margin: '40px auto', fontFamily: 'sans-serif', padding: '0 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Backend Test Console</h2>
        <button onClick={() => { logout(); navigate('/login') }}>Log out</button>
      </div>

      {error && (
        <div style={{ background: '#fee', padding: 12, borderRadius: 4, marginBottom: 16 }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* --- Resume upload --- */}
      <section style={{ border: '1px solid #ccc', padding: 16, marginBottom: 16, borderRadius: 8 }}>
        <h3>1. Resume Upload (optional)</h3>
        <p style={{ fontSize: 14, color: '#555' }}>
          Upload a real PDF/DOCX resume. Extracted skills will auto-fill the box below.
        </p>
        <input type="file" accept=".pdf,.docx" onChange={handleResumeUpload} />
        {loading === 'resume' && <p>Parsing resume...</p>}
        {resumeResult && (
          <pre style={{ background: '#f5f5f5', padding: 12, overflow: 'auto', fontSize: 12 }}>
            {JSON.stringify(resumeResult, null, 2)}
          </pre>
        )}
      </section>

      {/* --- Skills + domain input --- */}
      <section style={{ border: '1px solid #ccc', padding: 16, marginBottom: 16, borderRadius: 8 }}>
        <h3>2. Skills (comma-separated) - or use the ones from your uploaded resume above</h3>
        <textarea
          value={skillsInput}
          onChange={(e) => setSkillsInput(e.target.value)}
          rows={2}
          style={{ width: '100%', padding: 8 }}
        />

        <h3>Target Domain</h3>
        <select value={targetDomain} onChange={(e) => setTargetDomain(e.target.value)} style={{ padding: 8 }}>
          {(domains.length > 0 ? domains : ['AI & Data Science']).map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </section>

      {/* --- Actions --- */}
      <section style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <button onClick={handleGetRecommendation} disabled={loading === 'recommendation'} style={{ padding: '10px 16px' }}>
          {loading === 'recommendation' ? 'Calling...' : 'Get Recommendation'}
        </button>
        <button onClick={handleGetRoleFit} disabled={loading === 'rolefit'} style={{ padding: '10px 16px' }}>
          {loading === 'rolefit' ? 'Calling...' : 'Get Role Fit (AI & Data Science only)'}
        </button>
      </section>

      {/* --- Results --- */}
      {recResult && (
        <section style={{ border: '1px solid #4caf50', padding: 16, marginBottom: 16, borderRadius: 8 }}>
          <h3>Recommendation Result</h3>
          <p><strong>Match Score:</strong> {recResult.match_score}%</p>
          <p><strong>Learning Priority:</strong> {(recResult.learning_priority || []).join(', ')}</p>
          <p><strong>Qualified Companies:</strong> {(recResult.qualified_companies || []).length} found</p>
          <p><strong>Roadmap Narrative:</strong></p>
          <p style={{ fontStyle: recResult.roadmap_narrative ? 'normal' : 'italic', color: recResult.roadmap_narrative ? 'black' : '#888' }}>
            {recResult.roadmap_narrative || '(Gemini unavailable - narrative is null, this is expected/handled)'}
          </p>
          <details>
            <summary>Full raw response</summary>
            <pre style={{ background: '#f5f5f5', padding: 12, overflow: 'auto', fontSize: 12 }}>
              {JSON.stringify(recResult, null, 2)}
            </pre>
          </details>
        </section>
      )}

      {roleFitResult && (
        <section style={{ border: '1px solid #2196f3', padding: 16, marginBottom: 16, borderRadius: 8 }}>
          <h3>Role Fit Result</h3>
          <p><strong>Predicted Role:</strong> {roleFitResult.predicted_role} ({(roleFitResult.confidence * 100).toFixed(1)}% confidence)</p>
          <pre style={{ background: '#f5f5f5', padding: 12, overflow: 'auto', fontSize: 12 }}>
            {JSON.stringify(roleFitResult.all_probabilities, null, 2)}
          </pre>
        </section>
      )}
    </div>
  )
}
