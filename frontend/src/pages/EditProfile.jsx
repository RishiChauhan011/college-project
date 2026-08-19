import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDomain } from '../context/DomainContext';
import { fetchApi } from '../api/apiClient';
import SideNavBar from '../components/SideNavBar';


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

const EditProfile = () => {
  const { user, setUser } = useAuth();
  const { setDomain } = useDomain();
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const fromOnboarding = searchParams.get('from') === 'onboarding';

  // Form state — mirrors the Stitch design fields
  const [form, setForm] = useState({
    name: '',
    education: '',
    experience_years: '',
    preferred_field: '',
    preferred_location: '',
    skills: [],
  });
  const [originalForm, setOriginalForm] = useState(null);
  const [newSkill, setNewSkill] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [dirty, setDirty] = useState(false);

  // Load real profile data on mount
  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchApi('/profile');
        const initial = {
          name: data?.name || '',
          education: data?.profile?.education || '',
          experience_years: data?.profile?.experience_years ?? '',
          preferred_field: data?.profile?.preferred_field || '',
          preferred_location: data?.profile?.preferred_location || '',
          skills: Array.isArray(data?.profile?.skills) ? [...data.profile.skills] : [],
        };
        setForm(initial);
        setOriginalForm(initial);
      } catch (err) {
        setError('Failed to load profile data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Track whether the form has been changed
  useEffect(() => {
    if (!originalForm) return;
    const changed =
      form.name !== originalForm.name ||
      form.education !== originalForm.education ||
      String(form.experience_years) !== String(originalForm.experience_years) ||
      form.preferred_field !== originalForm.preferred_field ||
      form.preferred_location !== originalForm.preferred_location ||
      JSON.stringify(form.skills) !== JSON.stringify(originalForm.skills);
    setDirty(changed);
  }, [form, originalForm]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [dirty]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddSkill = () => {
    const trimmed = newSkill.trim();
    if (!trimmed || form.skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) return;
    setForm((prev) => ({ ...prev, skills: [...prev.skills, trimmed] }));
    setNewSkill('');
  };

  const handleRemoveSkill = (skill) => {
    setForm((prev) => ({ ...prev, skills: prev.skills.filter((s) => s !== skill) }));
  };

  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleDiscard = () => {
    if (dirty) {
      const confirmed = window.confirm('You have unsaved changes. Discard them?');
      if (!confirmed) return;
    }
    if (fromOnboarding) {
      navigate('/onboarding');
    } else {
      navigate('/profile');
    }
  };

  const handleSave = async () => {
    setError('');

    // Strict validation of required fields
    const missing = [];
    if (!form.name?.trim()) missing.push('Full Name');
    if (!form.preferred_field) missing.push('Target Career Domain');
    if (!form.skills || form.skills.length === 0) missing.push('At least one Skill');
    if (!form.education?.trim()) missing.push('Education');
    if (form.experience_years === '' || isNaN(Number(form.experience_years))) missing.push('Years of Experience');
    if (!form.preferred_location?.trim()) missing.push('Preferred Location');

    if (missing.length > 0) {
      setError(`Please complete all required fields: ${missing.join(', ')}.`);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        education: form.education.trim(),
        experience_years: Number(form.experience_years),
        preferred_location: form.preferred_location.trim(),
        preferred_field: form.preferred_field,
        skills: form.skills,
      };

      const updatedProfile = await fetchApi('/profile', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      if (setUser) setUser(updatedProfile);
      if (setDomain && form.preferred_field) {
        setDomain(form.preferred_field);
      }

      localStorage.setItem(
        'extractedResume',
        JSON.stringify({
          skills: form.skills,
          preferred_domain: form.preferred_field,
        })
      );

      // Onboarding manual completion -> Go directly to Dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to save changes. Please try again.');
      setSaving(false);
    }
  };

  // Profile completion calculation based on filled fields
  const completionFields = [
    form.name,
    form.education,
    form.experience_years !== '',
    form.preferred_field,
    form.preferred_location,
    form.skills.length > 0,
  ];
  const completionPct = Math.round(
    (completionFields.filter(Boolean).length / completionFields.length) * 100
  );

  return (
    <div className="text-on-surface font-body-md antialiased min-h-screen flex">
      {/* Sidebar */}
      <SideNavBar />

      {/* Main Canvas */}
      <main className="w-full lg:ml-[260px] flex-1 flex flex-col pt-12 pb-24 px-6 lg:px-12 max-w-7xl">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-secondary">
            <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span>
            Loading your profile…
          </div>
        ) : (
          <>
            {/* Page Header */}
            <header className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10">
              <div>
                <h1 className="font-headline-lg text-headline-lg text-on-surface">Edit Profile</h1>
                <p className="font-body-md text-body-md text-on-surface-variant mt-2 max-w-2xl">
                  Update your personal information and career preferences.
                </p>
              </div>
              <button
                onClick={handleDiscard}
                className="flex items-center gap-2 text-primary font-data-md text-data-md hover:text-primary-container transition-colors py-2 px-4 rounded-lg hover:bg-primary-fixed/30 self-start"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                Back to Profile
              </button>
            </header>

            {/* Error Banner */}
            {error && (
              <div className="mb-6 bg-error-container text-on-error-container px-4 py-3 rounded-xl flex items-center gap-3">
                <span className="material-symbols-outlined text-[18px]">error</span>
                {error}
              </div>
            )}

            {/* Profile Identity Row */}
            <section className="bg-surface rounded-xl p-6 mb-8 flex flex-col md:flex-row items-center gap-8 border border-surface-bright shadow-[2px_2px_6px_rgba(163,177,198,0.4),-2px_-2px_6px_rgba(255,255,255,0.9)]">
              <div className="w-24 h-24 rounded-full bg-primary-container text-white font-bold text-3xl flex items-center justify-center shadow-[inset_2px_2px_5px_rgba(163,177,198,0.4)] border-4 border-surface">
                {form.name ? form.name.charAt(0).toUpperCase() : '?'}
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="font-headline-md text-headline-md text-on-surface">{form.name || 'Your Name'}</h2>
                <p className="font-data-md text-data-md text-on-surface-variant mt-1">{user?.email || ''}</p>
              </div>
              {/* Completion meter */}
              <div className="w-full md:w-64 bg-surface-container-low rounded-lg p-4 shadow-[inset_2px_2px_5px_rgba(163,177,198,0.4)] flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">
                    Profile Integrity
                  </span>
                  <span className="font-data-md text-data-md text-primary font-bold">{completionPct}%</span>
                </div>
                <div className="w-full h-2 bg-surface shadow-[inset_2px_2px_5px_rgba(163,177,198,0.4)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${completionPct}%` }}
                  />
                </div>
              </div>
            </section>

            {/* Form Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-10">
              {/* Left Column */}
              <div className="flex flex-col gap-10">
                {/* Personal Information */}
                <section className="flex flex-col gap-5">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2 border-b border-outline-variant/30 pb-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">badge</span>
                    Personal Information
                  </h3>
                  <div className="flex flex-col gap-2">
                    <label className="font-label-caps text-label-caps text-on-surface-variant uppercase ml-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder="Your full name"
                      className="bg-surface text-on-surface font-body-sm shadow-[inset_2px_2px_5px_rgba(163,177,198,0.4),-2px_-2px_5px_rgba(255,255,255,0.7)] border-none focus:ring-1 focus:ring-primary outline-none transition-shadow duration-200 rounded-lg px-4 py-3 w-full"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-label-caps text-label-caps text-on-surface-variant uppercase ml-1">
                      Primary Email (Read-Only)
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={user?.email || ''}
                        readOnly
                        className="bg-surface-container-low text-outline font-body-sm shadow-[inset_2px_2px_5px_rgba(163,177,198,0.4)] border-none outline-none rounded-lg px-4 py-3 pr-10 w-full cursor-not-allowed"
                      />
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                        lock
                      </span>
                    </div>
                  </div>
                </section>

                {/* Education & Experience */}
                <section className="flex flex-col gap-5">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2 border-b border-outline-variant/30 pb-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">school</span>
                    Education &amp; Experience
                  </h3>
                  <div className="flex flex-col gap-2">
                    <label className="font-label-caps text-label-caps text-on-surface-variant uppercase ml-1">
                      Highest Education Level
                    </label>
                    <input
                      type="text"
                      value={form.education}
                      onChange={(e) => handleChange('education', e.target.value)}
                      placeholder="e.g. Bachelor's in Computer Science"
                      className="bg-surface text-on-surface font-body-sm shadow-[inset_2px_2px_5px_rgba(163,177,198,0.4),-2px_-2px_5px_rgba(255,255,255,0.7)] border-none focus:ring-1 focus:ring-primary outline-none transition-shadow duration-200 rounded-lg px-4 py-3 w-full"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-label-caps text-label-caps text-on-surface-variant uppercase ml-1">
                      Years of Experience
                    </label>
                    <div className="relative flex items-center">
                      <button
                        type="button"
                        onClick={() =>
                          handleChange(
                            'experience_years',
                            Math.max(0, Number(form.experience_years || 0) - 1)
                          )
                        }
                        className="absolute left-1 w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors z-10"
                      >
                        <span className="material-symbols-outlined text-[18px]">remove</span>
                      </button>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={form.experience_years}
                        onChange={(e) => handleChange('experience_years', e.target.value)}
                        className="bg-surface text-on-surface text-center font-data-md shadow-[inset_2px_2px_5px_rgba(163,177,198,0.4),-2px_-2px_5px_rgba(255,255,255,0.7)] border-none focus:ring-1 focus:ring-primary outline-none rounded-lg py-3 w-full appearance-none"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          handleChange(
                            'experience_years',
                            Math.min(50, Number(form.experience_years || 0) + 1)
                          )
                        }
                        className="absolute right-1 w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors z-10"
                      >
                        <span className="material-symbols-outlined text-[18px]">add</span>
                      </button>
                    </div>
                  </div>
                </section>
              </div>

              {/* Right Column */}
              <div className="flex flex-col gap-10">
                {/* Career Preferences */}
                <section className="flex flex-col gap-5">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2 border-b border-outline-variant/30 pb-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">my_location</span>
                    Career Preferences
                  </h3>
                  <div className="flex flex-col gap-2">
                    <label className="font-label-caps text-label-caps text-on-surface-variant uppercase ml-1">
                      Preferred Career Field
                    </label>
                    <div className="relative">
                      <select
                        value={form.preferred_field}
                        onChange={(e) => handleChange('preferred_field', e.target.value)}
                        className="bg-surface text-on-surface font-body-sm shadow-[inset_2px_2px_5px_rgba(163,177,198,0.4),-2px_-2px_5px_rgba(255,255,255,0.7)] border-none focus:ring-1 focus:ring-primary outline-none rounded-lg px-4 py-3 pr-10 w-full appearance-none"
                      >
                        <option value="">Select a field…</option>
                        {FIELD_OPTIONS.map((f) => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[20px]">
                        expand_more
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-label-caps text-label-caps text-on-surface-variant uppercase ml-1">
                      Preferred Location
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                        location_on
                      </span>
                      <input
                        type="text"
                        value={form.preferred_location}
                        onChange={(e) => handleChange('preferred_location', e.target.value)}
                        placeholder="e.g. San Francisco, Remote"
                        className={`bg-surface text-on-surface font-body-sm shadow-[inset_2px_2px_5px_rgba(163,177,198,0.4),-2px_-2px_5px_rgba(255,255,255,0.7)] border focus:ring-1 focus:ring-primary outline-none rounded-lg py-3 pl-10 pr-4 w-full ${!form.preferred_location ? 'border-error/50' : 'border-transparent'}`}
                      />
                      {!form.preferred_location && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-status-error animate-pulse" />
                      )}
                    </div>
                    {!form.preferred_location && (
                      <p className="font-data-sm text-data-sm text-status-error mt-1 ml-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">warning</span>
                        Required for 100% profile integrity.
                      </p>
                    )}
                  </div>
                </section>

                {/* Skills Editor */}
                <section className="flex flex-col gap-5">
                  <div className="flex justify-between items-end border-b border-outline-variant/30 pb-2">
                    <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[20px]">psychology</span>
                      Technical Skills
                    </h3>
                    <span className="font-data-sm text-data-sm text-on-surface-variant bg-surface-container-high px-2 py-1 rounded shadow-[inset_2px_2px_5px_rgba(163,177,198,0.4)]">
                      {form.skills.length} added
                    </span>
                  </div>
                  {/* Skills Container */}
                  <div className="bg-surface-bright shadow-[inset_2px_2px_5px_rgba(163,177,198,0.4)] rounded-xl p-4 min-h-[120px] flex flex-wrap gap-3 items-start border border-outline-variant/20">
                    {form.skills.map((sk) => (
                      <div
                        key={sk}
                        className="bg-surface shadow-[2px_2px_6px_rgba(163,177,198,0.4),-2px_-2px_6px_rgba(255,255,255,0.9)] px-3 py-1.5 rounded-md flex items-center gap-2 border border-surface-bright hover:border-primary/50 transition-colors"
                      >
                        <span className="font-data-sm text-data-sm text-on-surface">{sk}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(sk)}
                          className="text-outline-variant hover:text-status-error focus:outline-none transition-colors"
                        >
                          <span className="material-symbols-outlined text-[14px]">close</span>
                        </button>
                      </div>
                    ))}
                    {/* Add skill input */}
                    <div className="relative w-full max-w-[220px] mt-1">
                      <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-primary text-[16px]">
                        add
                      </span>
                      <input
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyDown={handleSkillKeyDown}
                        onBlur={handleAddSkill}
                        placeholder="Add a skill…"
                        className="bg-surface shadow-[2px_2px_6px_rgba(163,177,198,0.4),-2px_-2px_6px_rgba(255,255,255,0.9)] rounded-md py-1.5 pl-8 pr-3 font-data-sm text-data-sm text-on-surface w-full focus:outline-none focus:ring-1 focus:ring-primary border border-transparent focus:border-primary/30 placeholder:text-outline-variant"
                      />
                    </div>
                  </div>
                  <p className="font-data-sm text-data-sm text-on-surface-variant ml-1">
                    Press Enter or click away to add a skill.
                  </p>
                </section>
              </div>
            </div>

            {/* Action Footer */}
            <div className="mt-16 pt-8 border-t border-outline-variant/30 flex justify-end items-center gap-4">
              <button
                type="button"
                onClick={handleDiscard}
                className="bg-surface text-on-surface font-data-md text-data-md px-6 py-3 rounded-lg shadow-[2px_2px_6px_rgba(163,177,198,0.4),-2px_-2px_6px_rgba(255,255,255,0.9)] hover:shadow-[inset_2px_2px_5px_rgba(163,177,198,0.4)] transition-all border border-surface-bright"
              >
                Discard Edits
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="bg-primary text-on-primary font-data-md text-data-md px-8 py-3 rounded-lg shadow-[2px_2px_6px_rgba(163,177,198,0.4),-2px_-2px_6px_rgba(255,255,255,0.9)] hover:brightness-110 transition-all flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <span className={`material-symbols-outlined text-[18px] ${saving ? 'animate-spin' : ''}`}>
                  {saving ? 'progress_activity' : 'save'}
                </span>
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default EditProfile;
