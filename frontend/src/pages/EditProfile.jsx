import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDomain } from '../context/DomainContext';
import { fetchApi } from '../api/apiClient';
import Navbar from '../components/Navbar';
import SideNavBar from '../components/SideNavBar';

const DEFAULT_DOMAINS = [
  'AI & Data Science',
  'Software Development',
  'Business Analytics',
  'Graphic Design',
  'Digital Marketing',
  'Education',
];

const EditProfile = () => {
  const { user, setUser } = useAuth();
  const { setDomain } = useDomain();
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const fromOnboarding = searchParams.get('from') === 'onboarding';

  // Form state
  const [form, setForm] = useState({
    name: '',
    education: '',
    experience_years: '',
    preferred_field: '',
    preferred_location: 'Remote',
    skills: [],
  });
  const [originalForm, setOriginalForm] = useState(null);
  const [domainOptions, setDomainOptions] = useState(DEFAULT_DOMAINS);
  const [newSkill, setNewSkill] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [dirty, setDirty] = useState(false);

  // Load real profile data and live domains on mount
  useEffect(() => {
    const load = async () => {
      try {
        const [data, domains] = await Promise.all([
          fetchApi('/profile'),
          fetchApi('/domains').catch(() => DEFAULT_DOMAINS),
        ]);

        if (Array.isArray(domains) && domains.length > 0) {
          setDomainOptions(domains);
        }

        const initial = {
          name: data?.name || user?.name || '',
          education: data?.profile?.education || '',
          experience_years: data?.profile?.experience_years ?? '',
          preferred_field: data?.profile?.preferred_field || '',
          preferred_location: data?.profile?.preferred_location || 'Remote',
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
  }, [user]);

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

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddSkill = () => {
    const trimmed = newSkill.trim();
    if (!trimmed || form.skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) return;
    setForm((prev) => ({ ...prev, skills: [...prev.skills, trimmed] }));
    setNewSkill('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setForm((prev) => ({ ...prev, skills: prev.skills.filter((s) => s !== skillToRemove) }));
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
      navigate('/dashboard');
    } else {
      navigate('/profile');
    }
  };

  const handleSave = async () => {
    setError('');
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        education: form.education.trim(),
        experience_years: form.experience_years === '' ? 0 : Number(form.experience_years),
        preferred_location: form.preferred_location || 'Remote',
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

      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to save changes. Please try again.');
      setSaving(false);
    }
  };

  return (
    <div className="font-body-md text-body-md antialiased overflow-x-hidden min-h-screen bg-surface">
      <Navbar showNavLinks={false} />
      <SideNavBar />

      {/* Main Canvas */}
      <main className="lg:ml-64 pt-24 md:pt-28 pb-32 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-secondary">
            <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span>
            Loading your profile…
          </div>
        ) : (
          <>
            {/* Page Header */}
            <header className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10 border-b border-outline-variant/20 pb-6">
              <div>
                <h1 className="font-headline-lg text-headline-lg text-on-surface font-extrabold">Edit Profile</h1>
                <p className="font-body-md text-body-md text-on-surface-variant mt-2 max-w-2xl">
                  Update your personal information and career preferences.
                </p>
              </div>
            </header>

            {/* Error Banner */}
            {error && (
              <div className="mb-6 bg-error-container text-on-error-container px-4 py-3 rounded-xl flex items-center gap-3">
                <span className="material-symbols-outlined text-[18px]">error</span>
                {error}
              </div>
            )}

            {/* Profile Identity Row */}
            <section className="bg-surface rounded-xl p-6 mb-8 flex items-center gap-6 border border-outline-variant/20 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-primary-container text-on-primary-container font-bold text-2xl flex items-center justify-center border-2 border-primary/20 shrink-0">
                {form.name ? form.name.charAt(0).toUpperCase() : '?'}
              </div>
              <div className="flex-1">
                <h2 className="font-headline-md text-headline-md text-on-surface font-bold">{form.name || 'Your Name'}</h2>
                <p className="font-data-md text-data-md text-on-surface-variant mt-0.5">{user?.email || ''}</p>
              </div>
            </section>

            {/* Form Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-10">
              {/* Left Column */}
              <div className="flex flex-col gap-10">
                <section className="flex flex-col gap-5">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2 border-b border-outline-variant/30 pb-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">badge</span>
                    Personal Information
                  </h3>
                  <div className="flex flex-col gap-2">
                    <label className="font-label-caps text-label-caps text-on-surface-variant uppercase ml-1">Full Name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      className="bg-surface text-on-surface font-body-sm border border-outline-variant/30 focus:ring-1 focus:ring-primary outline-none rounded-lg py-3 px-4 w-full"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-label-caps text-label-caps text-on-surface-variant uppercase ml-1">Education Level</label>
                    <select
                      value={form.education}
                      onChange={(e) => handleChange('education', e.target.value)}
                      className="bg-surface text-on-surface font-body-sm border border-outline-variant/30 focus:ring-1 focus:ring-primary outline-none rounded-lg py-3 px-4 w-full appearance-none"
                    >
                      <option value="">Select education level…</option>
                      <option value="High School">High School</option>
                      <option value="Associate Degree">Associate Degree</option>
                      <option value="Bachelor's Degree">Bachelor's Degree</option>
                      <option value="Master's Degree">Master's Degree</option>
                      <option value="Doctorate (PhD)">Doctorate (PhD)</option>
                      <option value="Self-Taught / Bootcamp">Self-Taught / Bootcamp</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-label-caps text-label-caps text-on-surface-variant uppercase ml-1">Years of Experience</label>
                    <input
                      type="number"
                      value={form.experience_years}
                      onChange={(e) => handleChange('experience_years', e.target.value)}
                      className="bg-surface text-on-surface font-body-sm border border-outline-variant/30 focus:ring-1 focus:ring-primary outline-none rounded-lg py-3 px-4 w-full"
                    />
                  </div>
                </section>
              </div>

              {/* Right Column */}
              <div className="flex flex-col gap-10">
                <section className="flex flex-col gap-5">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2 border-b border-outline-variant/30 pb-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">explore</span>
                    Career Preferences
                  </h3>
                  <div className="flex flex-col gap-2">
                    <label className="font-label-caps text-label-caps text-on-surface-variant uppercase ml-1">Target Career Field</label>
                    <select
                      value={form.preferred_field}
                      onChange={(e) => handleChange('preferred_field', e.target.value)}
                      className="bg-surface text-on-surface font-body-sm border border-outline-variant/30 focus:ring-1 focus:ring-primary outline-none rounded-lg py-3 px-4 w-full appearance-none"
                    >
                      <option value="">Select target field…</option>
                      {domainOptions.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-label-caps text-label-caps text-on-surface-variant uppercase ml-1">Preferred Location</label>
                    <select
                      value={form.preferred_location}
                      onChange={(e) => handleChange('preferred_location', e.target.value)}
                      className="bg-surface text-on-surface font-body-sm border border-outline-variant/30 focus:ring-1 focus:ring-primary outline-none rounded-lg py-3 px-4 w-full appearance-none"
                    >
                      <option value="Remote">Remote</option>
                      <option value="On-site">On-site</option>
                    </select>
                  </div>
                </section>

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
