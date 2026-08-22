import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchApi } from '../api/apiClient';
import Navbar from '../components/Navbar';
import SideNavBar from '../components/SideNavBar';

const Profile = () => {
  const { user, logout, setUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const load = async () => {
    try {
      const data = await fetchApi('/profile');
      setProfile(data);
      if (setUser) setUser(data);
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError('');
    setUploadSuccess(false);

    try {
      const formData = new FormData();
      formData.append('file', file);
      await fetchApi('/resume/upload', {
        method: 'POST',
        body: formData,
      });
      setUploadSuccess(true);
      await load();
    } catch (err) {
      setUploadError(err.message || 'Failed to upload resume');
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const displayName = profile?.name || user?.name || 'User';
  const displayEmail = profile?.email || user?.email || '';
  const skills = profile?.profile?.skills || [];
  const education = profile?.profile?.education || '';
  const experience = profile?.profile?.experience_years || '';
  const preferredField = profile?.profile?.preferred_field || '';
  const preferredLocation = profile?.profile?.preferred_location || '';

  return (
    <div className="font-body-md text-body-md antialiased overflow-x-hidden min-h-screen bg-surface">
      <Navbar showNavLinks={false} />
      <SideNavBar />

      {/* Main Content */}
      <main className="lg:ml-64 pt-24 md:pt-28 pb-32 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-secondary">
            <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span>
            Loading profile...
          </div>
        ) : (
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="font-headline-lg text-headline-lg text-on-surface">My Profile</h1>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                  Manage your professional identity and career preferences.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  to="/profile/edit"
                  className="bg-surface text-primary px-4 py-2 rounded-lg font-data-sm text-data-sm hover:bg-surface-container-low transition-all flex items-center gap-2 shadow-[2px_2px_6px_rgba(163,177,198,0.4),-2px_-2px_6px_rgba(255,255,255,0.9)]"
                >
                  <span className="material-symbols-outlined text-[18px]">edit</span> Edit Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-surface text-error border border-error/20 px-4 py-2 rounded-lg font-data-sm text-data-sm hover:bg-error/10 transition-all flex items-center gap-2 shadow-[2px_2px_6px_rgba(163,177,198,0.4),-2px_-2px_6px_rgba(255,255,255,0.9)]"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span> Logout
                </button>
              </div>
            </div>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Left: Identity Card */}
              <div className="md:col-span-4 space-y-6">
                <div className="bg-surface rounded-xl p-6 shadow-[2px_2px_6px_rgba(163,177,198,0.4),-2px_-2px_6px_rgba(255,255,255,0.9)] flex flex-col items-center text-center">
                  <div className="w-24 h-24 rounded-full bg-primary-container text-white font-headline-lg font-bold flex items-center justify-center shadow-[inset_2px_2px_5px_rgba(163,177,198,0.4)] mb-4">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface">{displayName}</h2>
                  <p className="font-data-sm text-data-sm text-primary uppercase tracking-widest mt-1">
                    {preferredField || 'Career Professional'}
                  </p>
                  <div className="w-full mt-6 space-y-3 text-left">
                    <div className="flex items-center gap-3 font-body-sm text-body-sm text-on-surface-variant">
                      <span className="material-symbols-outlined text-[18px] text-outline">mail</span>
                      {displayEmail}
                    </div>
                    {preferredLocation && (
                      <div className="flex items-center gap-3 font-body-sm text-body-sm text-on-surface-variant">
                        <span className="material-symbols-outlined text-[18px] text-outline">location_on</span>
                        {preferredLocation}
                      </div>
                    )}
                  </div>
                </div>

                {/* Profile Source */}
                {profile?.profile?.source && (
                  <div className="bg-surface rounded-xl p-6 shadow-[2px_2px_6px_rgba(163,177,198,0.4),-2px_-2px_6px_rgba(255,255,255,0.9)] border border-outline-variant/30">
                    <h3 className="font-label-caps text-label-caps text-on-surface-variant mb-4">Profile Source</h3>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-surface-container-low shadow-[inset_2px_2px_5px_rgba(163,177,198,0.4)]">
                        <span className="material-symbols-outlined text-primary">
                          {profile.profile.source === 'resume' ? 'description' : 'edit_note'}
                        </span>
                      </div>
                      <div>
                        <div className="font-data-md text-data-md text-on-surface">
                          {profile.profile.source === 'resume' ? 'Resume Upload' : 'Manual Entry'}
                        </div>
                        <div className="font-body-sm text-body-sm text-on-surface-variant text-xs">
                          {profile.profile.source === 'resume' ? 'Parsed & stored from document' : 'Self-reported profile'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Resume Upload Section */}
                <div className="bg-surface rounded-xl p-6 shadow-[2px_2px_6px_rgba(163,177,198,0.4),-2px_-2px_6px_rgba(255,255,255,0.9)] border border-outline-variant/30">
                  <h3 className="font-label-caps text-label-caps text-on-surface-variant mb-4">Resume</h3>
                  {uploadError && (
                    <div className="mb-4 text-error text-data-sm font-data-sm bg-error-container/50 px-3 py-2 rounded">
                      {uploadError}
                    </div>
                  )}
                  {uploadSuccess && (
                    <div className="mb-4 text-success text-data-sm font-data-sm bg-success/10 px-3 py-2 rounded flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px]">check_circle</span>
                      Resume processed successfully!
                    </div>
                  )}
                  
                  <div className="border-2 border-dashed border-outline-variant rounded-xl p-6 text-center hover:bg-surface-container-lowest transition-colors relative">
                    <input
                      type="file"
                      accept=".pdf,.docx"
                      onChange={handleResumeUpload}
                      disabled={uploading}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                    <div className="flex flex-col items-center gap-2">
                      <span className="material-symbols-outlined text-3xl text-primary">
                        {uploading ? 'hourglass_empty' : 'upload_file'}
                      </span>
                      <div className="font-body-md text-body-md text-on-surface">
                        {uploading ? 'Processing...' : (profile?.profile?.source === 'resume' ? 'Replace Resume' : 'Upload Resume')}
                      </div>
                      <div className="font-data-sm text-data-sm text-on-surface-variant text-xs">
                        {uploading ? 'Extracting skills...' : 'PDF or DOCX up to 5MB'}
                      </div>
                    </div>
                  </div>
                  
                  {profile?.profile?.source === 'resume' && !uploading && (
                    <div className="mt-4 flex items-center gap-2 text-data-sm font-data-sm text-on-surface-variant bg-surface-container-low px-3 py-2 rounded-lg shadow-[inset_2px_2px_5px_rgba(163,177,198,0.4)]">
                      <span className="material-symbols-outlined text-[16px] text-success">task_alt</span>
                      Resume active and parsed
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Details */}
              <div className="md:col-span-8 space-y-6">
                {/* Experience & Education */}
                <div className="bg-surface rounded-xl p-6 shadow-[2px_2px_6px_rgba(163,177,198,0.4),-2px_-2px_6px_rgba(255,255,255,0.9)]">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface mb-6 border-b border-outline-variant pb-2">
                    Experience &amp; Education
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {experience !== '' && experience !== null && experience !== undefined && (
                      <div className="space-y-1">
                        <span className="font-label-caps text-label-caps text-on-surface-variant">Total Experience</span>
                        <div className="font-body-md text-body-md text-on-surface font-medium">
                          {experience} {Number(experience) === 1 ? 'Year' : 'Years'}
                        </div>
                      </div>
                    )}
                    {education && (
                      <div className="space-y-1 md:col-span-2">
                        <span className="font-label-caps text-label-caps text-on-surface-variant">Highest Education</span>
                        <div className="font-body-md text-body-md text-on-surface font-medium">{education}</div>
                      </div>
                    )}
                    {!experience && !education && (
                      <p className="text-secondary font-body-sm text-body-sm col-span-2">
                        No education or experience data yet. Upload a resume to populate your profile.
                      </p>
                    )}
                  </div>
                </div>

                {/* Career Preferences */}
                <div className="bg-surface rounded-xl p-6 shadow-[2px_2px_6px_rgba(163,177,198,0.4),-2px_-2px_6px_rgba(255,255,255,0.9)]">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface mb-6 border-b border-outline-variant pb-2">
                    Career Preferences
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {preferredField && (
                      <div className="space-y-1">
                        <span className="font-label-caps text-label-caps text-on-surface-variant">Preferred Field</span>
                        <div className="font-body-md text-body-md text-on-surface font-medium">{preferredField}</div>
                      </div>
                    )}
                    {preferredLocation && (
                      <div className="space-y-1">
                        <span className="font-label-caps text-label-caps text-on-surface-variant">Preferred Location</span>
                        <div className="font-body-md text-body-md text-on-surface font-medium">{preferredLocation}</div>
                      </div>
                    )}
                    {!preferredField && !preferredLocation && (
                      <p className="text-secondary font-body-sm text-body-sm col-span-2">
                        No career preferences set yet.
                      </p>
                    )}
                  </div>
                </div>

                {/* Skills */}
                <div className="bg-surface rounded-xl p-6 shadow-[2px_2px_6px_rgba(163,177,198,0.4),-2px_-2px_6px_rgba(255,255,255,0.9)]">
                  <div className="flex justify-between items-center mb-6 border-b border-outline-variant pb-2">
                    <h3 className="font-headline-sm text-headline-sm text-on-surface">My Skills</h3>
                  </div>
                  {skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {skills.map((sk, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 shadow-[inset_2px_2px_5px_rgba(163,177,198,0.4)] bg-surface-container-low border border-outline-variant/50 rounded-lg font-data-sm text-data-sm text-on-surface"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-secondary font-body-sm text-body-sm">
                      No skills identified yet. Upload your resume on the Dashboard to extract skills automatically.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Profile;
