import React, { useState, useEffect } from 'react';
import AdminLayout from '../AdminLayout';
import { fetchApi } from '../../api/apiClient';

const AdminAiInsights = () => {
  const [testSkills, setTestSkills] = useState('Python, PyTorch, Docker, Machine Learning, SQL');
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState(null);

  const runPrediction = async () => {
    const skillList = testSkills.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
    if (skillList.length === 0) return;

    setLoading(true);
    try {
      const [fitRes, recRes] = await Promise.all([
        fetchApi('/role-fit', {
          method: 'POST',
          body: JSON.stringify({ resume_skills: [...new Set(skillList)] }),
        }),
        fetchApi('/recommendation', {
          method: 'POST',
          body: JSON.stringify({
            resume_skills: [...new Set(skillList)],
            target_domain: 'AI & Data Science',
          }),
        }),
      ]);
      setPrediction(fitRes);
      setRecommendation(recRes);
    } catch (err) {
      console.error('Failed to run AI prediction:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runPrediction();
  }, []);

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-6">
        <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">AI Platform Intelligence &amp; Inference</h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
          Evaluate machine learning role classifier models, skill gap algorithms, and inference telemetry.
        </p>
      </div>

      {/* Model Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-surface-container-lowest p-5 rounded-xl shadow-[2px_2px_6px_rgba(163,177,198,0.4),-2px_-2px_6px_rgba(255,255,255,0.9)]">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-data-sm text-xs font-bold text-secondary uppercase">Classifier Architecture</h3>
            <span className="material-symbols-outlined text-primary text-[20px]">smart_toy</span>
          </div>
          <div className="font-data-lg text-[18px] font-bold text-on-surface">Logistic Regression (L2)</div>
          <p className="font-data-sm text-xs text-success font-semibold mt-1">Status: Model Active &amp; Calibrated</p>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-xl shadow-[2px_2px_6px_rgba(163,177,198,0.4),-2px_-2px_6px_rgba(255,255,255,0.9)]">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-data-sm text-xs font-bold text-secondary uppercase">Inference Scope</h3>
            <span className="material-symbols-outlined text-waypoint text-[20px]">target</span>
          </div>
          <div className="font-data-lg text-[18px] font-bold text-on-surface">AI &amp; Data Science Domain</div>
          <p className="font-data-sm text-xs text-secondary mt-1">Specialized multiclass classifier</p>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-xl shadow-[2px_2px_6px_rgba(163,177,198,0.4),-2px_-2px_6px_rgba(255,255,255,0.9)]">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-data-sm text-xs font-bold text-secondary uppercase">Skill Extraction Engine</h3>
            <span className="material-symbols-outlined text-tertiary text-[20px]">text_snippet</span>
          </div>
          <div className="font-data-lg text-[18px] font-bold text-on-surface">Taxonomy Rule Engine v2.0</div>
          <p className="font-data-sm text-xs text-secondary mt-1">Case-insensitive boundary matching</p>
        </div>
      </div>

      {/* Interactive Inference Inspector */}
      <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[2px_2px_6px_rgba(163,177,198,0.4),-2px_-2px_6px_rgba(255,255,255,0.9)] mb-6">
        <h3 className="font-data-sm text-xs font-bold text-on-surface uppercase tracking-wider mb-3 border-b border-outline-variant/30 pb-2">
          Interactive AI Inference &amp; Prediction Tester
        </h3>
        <div className="flex flex-col sm:flex-row gap-3 items-center mb-6">
          <div className="flex-1 w-full bg-surface px-4 py-2 rounded-lg border border-outline-variant/40 shadow-[inset_2px_2px_5px_rgba(163,177,198,0.4)]">
            <input
              type="text"
              value={testSkills}
              onChange={(e) => setTestSkills(e.target.value)}
              placeholder="Enter comma-separated skills to test..."
              className="bg-transparent border-none outline-none font-data-sm text-sm w-full text-on-surface focus:ring-0 p-0"
            />
          </div>
          <button
            onClick={runPrediction}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-2 bg-primary text-white font-data-sm text-xs font-bold rounded-lg hover:bg-surface-tint transition-all shadow-[2px_2px_6px_rgba(163,177,198,0.4)] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                Running Inference...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                Run Live Prediction
              </>
            )}
          </button>
        </div>

        {/* Prediction Results */}
        {prediction && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 bg-surface-bright p-5 rounded-xl border border-outline-variant/30">
              <h4 className="font-data-sm text-xs font-bold text-secondary uppercase mb-2">Predicted Best-Fit Role</h4>
              <div className="text-headline-md font-bold text-primary mb-1">{prediction.predicted_role}</div>
              <div className="flex items-center gap-2 font-data-sm text-xs text-success font-semibold mb-4">
                <span className="w-2 h-2 rounded-full bg-success"></span>
                Confidence Score: {Math.round(prediction.confidence * 100)}%
              </div>

              <h5 className="font-data-sm text-xs font-bold text-on-surface uppercase tracking-wider mb-2 pt-3 border-t border-outline-variant/30">
                Probability Breakdown
              </h5>
              <div className="space-y-2">
                {Object.entries(prediction.all_probabilities || {})
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 5)
                  .map(([role, prob], idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs font-data-sm">
                      <span className="text-on-surface truncate">{role}</span>
                      <span className="font-bold text-primary">{Math.round(prob * 100)}%</span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="lg:col-span-7 bg-surface-bright p-5 rounded-xl border border-outline-variant/30">
              <h4 className="font-data-sm text-xs font-bold text-secondary uppercase mb-2">Recommended Gap Closures</h4>
              <div className="mb-4">
                <span className="font-data-sm text-xs text-on-surface">Target Domain: </span>
                <span className="font-data-sm text-xs font-bold text-primary">AI &amp; Data Science</span>
              </div>
              <div className="space-y-2.5">
                {recommendation?.missing_skills?.length > 0 ? (
                  recommendation.missing_skills.slice(0, 5).map((ms, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 bg-surface rounded-lg border border-outline-variant/20">
                      <div>
                        <div className="font-medium text-sm text-on-surface">{ms.skill}</div>
                        <div className="font-data-sm text-xs text-secondary">{ms.category} • {ms.skill_type}</div>
                      </div>
                      <span className="font-data-sm text-xs font-bold text-success bg-status-success/10 px-2 py-0.5 rounded">
                        +{ms.demand_count} jobs
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-secondary text-sm italic">No missing skills detected for this profile.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminAiInsights;
