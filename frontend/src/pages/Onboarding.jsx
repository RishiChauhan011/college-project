import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchApi } from '../api/apiClient';

const Onboarding = () => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleSelect = (type) => {
    setSelectedOption(type);
    setError('');
  };

  const getHintText = () => {
    if (isLoading) return "Uploading and extracting data...";
    if (selectedOption === 'upload') return "Ready to extract data from document.";
    if (selectedOption === 'manual') return "Ready to launch manual builder.";
    return "Select an option to proceed";
  };

  const handleContinue = () => {
    if (selectedOption === 'upload') {
      fileInputRef.current.click();
    } else {
      navigate('/dashboard');
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
        // Let fetch automatically set the Content-Type boundary for FormData
        headers: {
          'Content-Type': null,
        },
        body: formData,
      });
      
      // Successfully extracted skills, save them to local storage or context
      localStorage.setItem('extractedResume', JSON.stringify(result));
      navigate('/dashboard'); // or to a review screen if one exists
    } catch (err) {
      setError(err.message || 'Failed to upload resume. Please try again.');
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="text-on-surface font-body-md relative overflow-x-hidden min-h-screen" style={{ backgroundColor: '#eef2f6', backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.05) 0%, transparent 70%)' }}>
      <div 
        className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 opacity-15"
        style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='contour' width='100' height='100' patternUnits='userSpaceOnUse'%3E%3Cpath d='M0 50 Q 25 25 50 50 T 100 50' fill='none' stroke='%236366f1' stroke-width='1'/%3E%3Cpath d='M0 70 Q 25 45 50 70 T 100 70' fill='none' stroke='%236366f1' stroke-width='0.5'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23contour)'/%3E%3C/svg%3E\")"
        }}
      ></div>
      
      <main className="container mx-auto px-margin-mobile md:px-margin-desktop max-w-container-max min-h-screen flex flex-col justify-center items-center py-12 relative z-10">
        <div className="w-full max-w-3xl flex flex-col items-center">
          <div className="flex items-center gap-4 mb-8">
            <span className="w-3 h-3 bg-waypoint rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)] cursor-pointer"></span>
            <div className="h-0.5 w-16 bg-outline-variant"></div>
            <span className="w-3 h-3 rounded-full bg-surface-dim shadow-none cursor-pointer"></span>
            <div className="h-0.5 w-16 bg-outline-variant"></div>
            <span className="w-3 h-3 rounded-full bg-surface-dim shadow-none cursor-pointer"></span>
          </div>

          <div className="text-center mb-12">
            <h1 className="font-headline-xl text-headline-xl text-on-surface mb-4">Initialize Your Profile</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl mx-auto">
              Select how you would like to establish your initial career baseline. Our AI will construct your starting topography based on this data.
            </p>
          </div>

          {error && (
            <div className="w-full mb-6 p-4 bg-error-container text-on-error-container rounded-lg text-center elevation-1">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mb-12">
            {/* Option 1: Upload */}
            <div 
              className={`transition-all duration-300 cursor-pointer border-2 p-8 flex flex-col items-center text-center group rounded-xl elevation-1 ${selectedOption === 'upload' ? 'border-waypoint shadow-[inset_2px_2px_5px_rgba(163,177,198,0.4),inset_-2px_-2px_5px_rgba(255,255,255,0.7)] bg-surface-bright' : 'border-transparent hover:-translate-y-0.5'}`}
              onClick={() => handleSelect('upload')}
            >
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-colors ${selectedOption === 'upload' ? 'bg-primary-fixed text-primary' : 'bg-surface-container-highest'}`}>
                <span className="material-symbols-outlined text-4xl text-primary" data-icon="upload_file">upload_file</span>
              </div>
              <h2 className="font-headline-md text-headline-md text-on-surface mb-2">Upload Resume</h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">
                Automated structural extraction. Upload your PDF or DOCX and our AI will parse your experience into measurable waypoints.
              </p>
              <div className="mt-auto pt-4 flex items-center text-waypoint font-data-sm text-data-sm">
                <span className="material-symbols-outlined text-sm mr-1" data-icon="bolt">bolt</span>
                Fastest Method
              </div>
            </div>

            {/* Option 2: Manual */}
            <div 
              className={`transition-all duration-300 cursor-pointer border-2 p-8 flex flex-col items-center text-center group rounded-xl elevation-1 ${selectedOption === 'manual' ? 'border-waypoint shadow-[inset_2px_2px_5px_rgba(163,177,198,0.4),inset_-2px_-2px_5px_rgba(255,255,255,0.7)] bg-surface-bright' : 'border-transparent hover:-translate-y-0.5'}`}
              onClick={() => handleSelect('manual')}
            >
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-colors ${selectedOption === 'manual' ? 'bg-primary-fixed text-primary' : 'bg-surface-container-highest'}`}>
                <span className="material-symbols-outlined text-4xl text-primary" data-icon="edit_document">edit_document</span>
              </div>
              <h2 className="font-headline-md text-headline-md text-on-surface mb-2">Enter Manually</h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">
                Precision profile builder. Input your skills and roles step-by-step for absolute control over your baseline metrics.
              </p>
              <div className="mt-auto pt-4 flex items-center text-secondary font-data-sm text-data-sm">
                <span className="material-symbols-outlined text-sm mr-1" data-icon="tune">tune</span>
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
            className={`elevation-1 bg-primary text-on-primary font-data-lg text-data-lg py-4 px-12 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-waypoint focus:ring-offset-2 focus:ring-offset-surface ${(isLoading || !selectedOption) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-surface-tint'}`}
            disabled={isLoading || !selectedOption}
            onClick={handleContinue}
          >
            {isLoading ? 'Processing...' : 'Confirm and Continue'}
          </button>
          <p className="mt-4 font-data-sm text-data-sm text-on-surface-variant">
            {getHintText()}
          </p>
        </div>
      </main>
    </div>
  );
};

export default Onboarding;
