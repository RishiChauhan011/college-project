/**
 * Centralized profile completion validation helper.
 * Determines if an authenticated user has completed onboarding with all required fields.
 */
export const isProfileComplete = (user) => {
  if (!user) return false;
  // System administrators do not require student onboarding
  if (user.role === 'admin') return true;
  if (!user.profile) return false;

  const { preferred_field, skills, education, experience_years, preferred_location } = user.profile;

  const hasField = Boolean(
    preferred_field && typeof preferred_field === 'string' && preferred_field.trim().length > 0
  );
  const hasSkills = Boolean(Array.isArray(skills) && skills.length > 0);
  const hasEducation = Boolean(
    education && typeof education === 'string' && education.trim().length > 0
  );
  const hasExperience =
    experience_years !== null &&
    experience_years !== undefined &&
    experience_years !== '' &&
    !isNaN(Number(experience_years));
  const hasLocation = Boolean(
    preferred_location && typeof preferred_location === 'string' && preferred_location.trim().length > 0
  );

  return hasField && hasSkills && hasEducation && hasExperience && hasLocation;
};
