import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { fetchApi } from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import { useDomain } from '../context/DomainContext';
import { isProfileComplete } from '../utils/profile';

const FIELD_OPTIONS = [
  'Artificial Intelligence / MLOps',
  'Data Science',
  'Data Engineering',
  'Software Engineering',
  'Cloud Architecture',
  'Cybersecurity',
  'Product Management',
  'Business Intelligence',
];

const Onboarding = () => {
  const { user, setUser } = useAuth();
  const { setDomain } = useDomain();
  const navigate = useNavigate();

  const [step, setStep] = useState('select'); // 'select' | 'review'
  const [selectedOption, setSelectedOption] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // Review form state for Option A (Resume extraction review)
  const [reviewForm, setReviewForm] = useState({
    name: '',
    education: '',
    experience_years: '',
    preferred_field: '',
    preferred_location: '',
    skills: [],
  });
  const [newSkillInput, setNewSkillInput] = useState('');
  const [validationError, setValidationError] = useState('');

  // Prefill review form with user's existing name if available
  useEffect(() => {
    if (user?.name) {
      setReviewForm((prev) => ({ ...prev, name: user.name }));
    }
  }, [user]);

  const handleSelect = (type) => {
    setSelectedOption(type);
    setError('');
  };

  const getHintText = () => {
    if (isLoading) return 'Uploading and extracting data with AI parser...';
    if (selectedOption === 'upload') return 'Ready to extract skills and structure from document.';
    if (selectedOption === 'manual') return 'Ready to launch manual profile builder.';
    return 'Select an option to proceed';
  };

  const handleContinue = () => {
    if (selectedOption === 'upload') {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    } else if (selectedOption === 'manual') {
      navigate('/profile/edit?from=onboarding');
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError('');
    setIsLoading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const result = await fetchApi('/resume-upload', {
        method: 'POST',
        headers: {
          'Content-Type': null,
        },
        body: formData,
      });

      if (!result.readable) {
        throw new Error(
          result.extraction_warnings?.join(', ') ||
            'Unable to extract text from this document. Please ensure it is a readable text PDF or DOCX, or enter details manually.'
        );
      }

      // Populate review state with extracted data
      const extractedSkills = Array.isArray(result.skills) ? result.skills : [];
      const extractedEducation =
        result.sections?.education?.split('\n')?.[0]?.trim() || '';
      
      setReviewForm({
        name: user?.name || '',
        education: extractedEducation || '',
        experience_years: '1',
        preferred_field: '',
        preferred_location: 'Remote',
        skills: extractedSkills,
      });

      // Save raw extraction result to localStorage for supplementary client models
      localStorage.setItem('extractedResume', JSON.stringify(result));

      // Advance to review step
      setStep('review');
    } catch (err) {
      setError(err.message || 'Failed to upload resume. Please try again.');
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAddSkill = () => {
    const trimmed = newSkillInput.trim();
    if (!trimmed) return;
    if (!reviewForm.skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setReviewForm((prev) => ({
        ...prev,
        skills: [...prev.skills, trimmed],
      }));
    }
    setNewSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setReviewForm((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }));
  };

  const handleSaveConfirmedProfile = async () => {
    setValidationError('');

    // Validate required fields
    const missing = [];
    if (!reviewForm.preferred_field) missing.push('Target Career Domain');
    if (!reviewForm.skills || reviewForm.skills.length === 0) missing.push('At least one Skill');
    if (!reviewForm.education?.trim()) missing.push('Education');
    if (reviewForm.experience_years === '' || isNaN(Number(reviewForm.experience_years))) missing.push('Experience in Years');
    if (!reviewForm.preferred_location?.trim()) missing.push('Preferred Location');

    if (missing.length > 0) {
      setValidationError(`Please complete all required fields: ${missing.join(', ')}.`);
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        name: reviewForm.name || user?.name || undefined,
        education: reviewForm.education.trim(),
        experience_years: Number(reviewForm.experience_years),
        preferred_location: reviewForm.preferred_location.trim(),
        preferred_field: reviewForm.preferred_field,
        skills: reviewForm.skills,
      };

      const updatedProfile = await fetchApi('/profile', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      // Update shared auth context and domain context
      if (setUser) setUser(updatedProfile);
      if (setDomain && reviewForm.preferred_field) {
        setDomain(reviewForm.preferred_field);
      }

      // Update local storage representation
      localStorage.setItem(
        'extractedResume',
        JSON.stringify({
          skills: reviewForm.skills,
          preferred_domain: reviewForm.preferred_field,
        })
      );

      // Successfully confirmed -> Navigate to personalized dashboard
      navigate('/dashboard');
    } catch (err) {
      setValidationError(err.message || 'Failed to save profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="text-on-surface font-body-md relative overflow-x-hidden min-h-screen"
      style={{
        backgroundColor: '#eef2f6',
        backgroundImage:
          'radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.05) 0%, transparent 70%)',
      }}
    >
      <div
        className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 opacity-15"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='contour' width='100' height='100' patternUnits='userSpaceOnUse'%3E%3Cpath d='M0 50 Q 25 25 50 50 T 100 50' fill='none' stroke='%236366f1' stroke-width='1'/%3E%3Cpath d='M0 70 Q 25 45 50 70 T 100 70' fill='none' stroke='%236366f1' stroke-width='0.5'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23contour)'/%3E%3C/svg%3E\")",
        }}
      ></div>

      <main className="container mx-auto px-margin-mobile md:px-margin-desktop max-w-container-max min-h-screen flex flex-col justify-center items-center py-12 relative z-10">
        <div className="w-full max-w-3xl flex flex-col items-center">
          {/* Progress Indicators */}
          <div className="flex items-center gap-4 mb-8">
            <span
              className={`w-3 h-3 rounded-full ${
                step === 'select'
                  ? 'bg-waypoint shadow-[0_0_10px_rgba(99,102,241,0.5)]'
                  : 'bg-primary'
              }`}
            ></span>
            <div
              className={`h-0.5 w-16 ${
                step === 'review' ? 'bg-primary' : 'bg-outline-variant'
              }`}
            ></div>
            <span
              className={`w-3 h-3 rounded-full ${
                step === 'review'
                  ? 'bg-waypoint shadow-[0_0_10px_rgba(99,102,241,0.5)]'
                  : 'bg-surface-dim'
              }`}
            ></span>
          </div>

          {/* STEP 1: SELECT ONBOARDING METHOD */}
          {step === 'select' && (
            <>
              <div className="text-center mb-12">
                <h1 className="font-headline-xl text-headline-xl text-on-surface mb-4">
                  Initialize Your Profile
                </h1>
                <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl mx-auto">
                  Select how you would like to establish your initial career baseline. Our AI will
                  construct your starting topography based on your real experience.
                </p>
                {isProfileComplete(user) && (
                  <div className="mt-4 inline-block bg-primary-fixed text-primary text-body-sm px-4 py-1.5 rounded-full font-medium">
                    Profile already complete •{' '}
                    <Link to="/dashboard" className="underline font-bold hover:text-primary-container">
                      Go to Dashboard
                    </Link>
                  </div>
                )}
              </div>

              {error && (
                <div className="w-full mb-6 p-4 bg-error-container text-on-error-container rounded-lg text-center elevation-1">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mb-12">
                {/* Option 1: Upload */}
                <div
                  className={`transition-all duration-300 cursor-pointer border-2 p-8 flex flex-col items-center text-center group rounded-xl elevation-1 ${
                    selectedOption === 'upload'
                      ? 'border-waypoint shadow-[inset_2px_2px_5px_rgba(163,177,198,0.4),inset_-2px_-2px_5px_rgba(255,255,255,0.7)] bg-surface-bright'
                      : 'border-transparent hover:-translate-y-0.5'
                  }`}
                  onClick={() => handleSelect('upload')}
                >
                  <div
                    className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-colors ${
                      selectedOption === 'upload'
                        ? 'bg-primary-fixed text-primary'
                        : 'bg-surface-container-highest'
                    }`}
                  >
                    <span className="material-symbols-outlined text-4xl text-primary" data-icon="upload_file">
                      upload_file
                    </span>
                  </div>
                  <h2 className="font-headline-md text-headline-md text-on-surface mb-2">
                    Upload Resume
                  </h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">
                    Automated structural extraction. Upload your PDF or DOCX and our AI will parse
                    your skills, education, and waypoints for instant review.
                  </p>
                  <div className="mt-auto pt-4 flex items-center text-waypoint font-data-sm text-data-sm">
                    <span className="material-symbols-outlined text-sm mr-1" data-icon="bolt">
                      bolt
                    </span>
                    Fastest Method
                  </div>
                </div>

                {/* Option 2: Manual */}
                <div
                  className={`transition-all duration-300 cursor-pointer border-2 p-8 flex flex-col items-center text-center group rounded-xl elevation-1 ${
                    selectedOption === 'manual'
                      ? 'border-waypoint shadow-[inset_2px_2px_5px_rgba(163,177,198,0.4),inset_-2px_-2px_5px_rgba(255,255,255,0.7)] bg-surface-bright'
                      : 'border-transparent hover:-translate-y-0.5'
                  }`}
                  onClick={() => handleSelect('manual')}
                >
                  <div
                    className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-colors ${
                      selectedOption === 'manual'
                        ? 'bg-primary-fixed text-primary'
                        : 'bg-surface-container-highest'
                    }`}
                  >
                    <span className="material-symbols-outlined text-4xl text-primary" data-icon="edit_document">
                      edit_document
                    </span>
                  </div>
                  <h2 className="font-headline-md text-headline-md text-on-surface mb-2">
                    Enter Manually
                  </h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">
                    Precision profile builder. Input your skills, domain, and career goals
                    step-by-step for absolute control over your baseline metrics.
                  </p>
                  <div className="mt-auto pt-4 flex items-center text-secondary font-data-sm text-data-sm">
                    <span className="material-symbols-outlined text-sm mr-1" data-icon="tune">
                      tune
                    </span>
                    High Precision
                  </div>
                </div>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".pdf,.docx"
                onChange={handleFileChange}
              />

              <button
                className={`elevation-1 bg-primary text-on-primary font-data-lg text-data-lg py-4 px-12 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-waypoint focus:ring-offset-2 focus:ring-offset-surface ${
                  isLoading || !selectedOption
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-surface-tint'
                }`}
                disabled={isLoading || !selectedOption}
                onClick={handleContinue}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined animate-spin text-xl">
                      progress_activity
                    </span>{' '}
                    Extracting Resume...
                  </span>
                ) : (
                  'Confirm and Continue'
                )}
              </button>
              <p className="mt-4 font-data-sm text-data-sm text-on-surface-variant">
                {getHintText()}
              </p>
            </>
          )}

          {/* STEP 2: REVIEW EXTRACTED RESUME DATA */}
          {step === 'review' && (
            <div className="w-full bg-surface rounded-2xl p-8 elevation-1 shadow-lg border border-outline-variant/30">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-success-container/30 text-success text-body-sm px-4 py-1.5 rounded-full font-bold mb-3">
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  Resume Extracted Successfully
                </div>
                <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">
                  Review &amp; Refine Your Profile
                </h1>
                <p className="font-body-md text-body-md text-on-surface-variant max-w-lg mx-auto">
                  Verify the extracted information below. Your personalized Career Dashboard and
                  Roadmap will be constructed directly from this data.
                </p>
              </div>

              {validationError && (
                <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-lg text-body-sm font-medium">
                  {validationError}
                </div>
              )}

              <div className="space-y-6">
                {/* Preferred Field / Target Domain */}
                <div>
                  <label className="block font-data-sm text-data-sm text-secondary uppercase tracking-widest mb-2">
                    Target Career Domain <span className="text-error">*</span>
                  </label>
                  <select
                    className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg py-3 px-4 font-body-sm text-body-sm text-on-surface focus:ring-2 focus:ring-waypoint focus:outline-none transition-shadow"
                    value={reviewForm.preferred_field}
                    onChange={(e) =>
                      setReviewForm({ ...reviewForm, preferred_field: e.target.value })
                    }
                  >
                    <option value="">Select your target domain...</option>
                    {FIELD_OPTIONS.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Extracted Skills */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="font-data-sm text-data-sm text-secondary uppercase tracking-widest">
                      Extracted Skills ({reviewForm.skills.length}) <span className="text-error">*</span>
                    </label>
                  </div>
                  <div className="flex flex-wrap gap-2 p-3 bg-surface-container-lowest rounded-lg border border-outline-variant/50 min-h-[52px] mb-3">
                    {reviewForm.skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1 bg-primary/10 text-primary border border-primary/20 text-data-sm font-data-sm px-3 py-1 rounded-full"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="hover:text-error transition-colors ml-1 focus:outline-none"
                          title="Remove skill"
                        >
                          <span className="material-symbols-outlined text-[14px]">close</span>
                        </button>
                      </span>
                    ))}
                    {reviewForm.skills.length === 0 && (
                      <span className="text-outline-variant text-body-sm italic self-center">
                        No skills listed yet. Add your skills below.
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 bg-surface-container-lowest border border-outline-variant/50 rounded-lg py-2.5 px-4 font-body-sm text-body-sm text-on-surface placeholder:text-outline-variant focus:ring-2 focus:ring-waypoint focus:outline-none"
                      placeholder="Add additional skill (e.g., PyTorch, Kubernetes)..."
                      value={newSkillInput}
                      onChange={(e) => setNewSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSkill();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      className="bg-secondary-container text-on-secondary-container px-4 py-2.5 rounded-lg font-data-sm text-data-sm hover:bg-secondary transition-colors"
                    >
                      + Add
                    </button>
                  </div>
                </div>

                {/* Education & Experience Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-data-sm text-data-sm text-secondary uppercase tracking-widest mb-2">
                      Education <span className="text-error">*</span>
                    </label>
                    <input
                      type="text"
                      className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg py-3 px-4 font-body-sm text-body-sm text-on-surface placeholder:text-outline-variant focus:ring-2 focus:ring-waypoint focus:outline-none"
                      placeholder="e.g. B.Tech Computer Science"
                      value={reviewForm.education}
                      onChange={(e) =>
                        setReviewForm({ ...reviewForm, education: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block font-data-sm text-data-sm text-secondary uppercase tracking-widest mb-2">
                      Experience (Years) <span className="text-error">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg py-3 px-4 font-body-sm text-body-sm text-on-surface placeholder:text-outline-variant focus:ring-2 focus:ring-waypoint focus:outline-none"
                      placeholder="e.g. 2"
                      value={reviewForm.experience_years}
                      onChange={(e) =>
                        setReviewForm({ ...reviewForm, experience_years: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* Preferred Location */}
                <div>
                  <label className="block font-data-sm text-data-sm text-secondary uppercase tracking-widest mb-2">
                    Preferred Work Location <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg py-3 px-4 font-body-sm text-body-sm text-on-surface placeholder:text-outline-variant focus:ring-2 focus:ring-waypoint focus:outline-none"
                    placeholder="e.g. Remote, San Francisco, New York"
                    value={reviewForm.preferred_location}
                    onChange={(e) =>
                      setReviewForm({ ...reviewForm, preferred_location: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => setStep('select')}
                  className="px-6 py-3 rounded-lg border border-outline-variant/50 text-secondary hover:text-on-surface hover:bg-surface-container-low transition-colors font-data-md text-data-md"
                >
                  Upload Different Resume
                </button>
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={handleSaveConfirmedProfile}
                  className="flex-1 bg-primary text-on-primary font-data-lg text-data-lg py-3.5 px-8 rounded-lg hover:bg-surface-tint transition-all elevation-1 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined animate-spin text-xl">
                        progress_activity
                      </span>{' '}
                      Saving Profile...
                    </span>
                  ) : (
                    <>
                      <span>Confirm &amp; Launch Dashboard</span>
                      <span className="material-symbols-outlined">arrow_forward</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Onboarding;

