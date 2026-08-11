from pydantic import BaseModel, Field, field_validator
from typing import List

class RecommendationRequest(BaseModel):
    target_domain: str = Field(..., description="Target career domain", example="AI & Data Science")
    resume_skills: List[str] = Field(..., description="List of skills extracted from resume", example=["Python", "SQL", "Excel"])

    @field_validator("resume_skills")
    @classmethod
    def validate_resume_skills(cls, v: List[str]) -> List[str]:
        # 1. Validate empty skill list
        if not v:
            raise ValueError("resume_skills list cannot be empty")
        
        # 2. Validate empty strings/whitespaces in skills and check for duplicate skills (case-insensitive)
        seen = set()
        duplicates = []
        cleaned_skills = []
        
        for skill in v:
            skill_stripped = skill.strip()
            if not skill_stripped:
                raise ValueError("Skill names cannot be empty or contain only whitespace")
            
            skill_lower = skill_stripped.lower()
            if skill_lower in seen:
                duplicates.append(skill_stripped)
            seen.add(skill_lower)
            cleaned_skills.append(skill_stripped)
            
        if duplicates:
            raise ValueError(f"Duplicate resume skills are not allowed: {list(set(duplicates))}")
            
        return cleaned_skills

class MissingSkillInfo(BaseModel):
    skill: str = Field(..., description="Name of the missing skill", example="Data Analysis")
    category: str = Field(..., description="High-level category", example="Domain")
    demand_count: int = Field(..., description="Number of jobs requiring this skill", example=177)
    estimated_learning_weeks: int = Field(..., description="Estimated learning time in weeks", example=4)
    roi_score: float = Field(..., description="Return on Investment score (demand / weeks)", example=44.25)

class RecommendationResponse(BaseModel):
    match_score: float = Field(..., description="Weighted match score percentage", example=78.0)
    recognized_skills: List[str] = Field(..., description="Normalized resume skills recognized in master list", example=["Python", "SQL", "Excel"])
    missing_skills: List[MissingSkillInfo] = Field(..., description="Details of top missing skills ordered by ROI")
    learning_priority: List[str] = Field(..., description="Top 3 recommended skills to learn first", example=["Data Analysis", "Machine Learning", "Cloud Computing"])
    estimated_learning_weeks: int = Field(..., description="Estimated learning time in weeks to close key gaps", example=12)
    qualified_companies: List[str] = Field(..., description="Real companies posting jobs in domain that matches these skills", example=["Google", "Microsoft"])
