from pydantic import BaseModel, Field
from typing import List, Optional

class JobSkill(BaseModel):
    id: str = Field(..., description="ID of the skill", example="T001")
    name: str = Field(..., description="Canonical name of the skill", example="Python")
    category: str = Field(..., description="Category category of the skill", example="Technical")
    matched_by: str = Field(..., description="The raw substring matched from job description", example="Python")

class JobSkillsGroup(BaseModel):
    technical: List[JobSkill] = Field(default=[], description="List of technical skills matched")
    domain: List[JobSkill] = Field(default=[], description="List of domain-specific skills matched")
    soft: List[JobSkill] = Field(default=[], description="List of soft skills matched")

class JobResponse(BaseModel):
    title: str = Field(..., description="Title of the job posting", example="Data Science Instructor")
    company: str = Field(..., description="Company posting the job", example="upGrad")
    city: str = Field(..., description="City of the posting", example="Bengaluru")
    state: str = Field(..., description="State of the posting", example="Karnataka")
    description: str = Field(..., description="Full text description of the job", example="Job description text...")
    career_domain: str = Field(..., description="Assigned career domain", example="AI & Data Science")
    adzuna_category: str = Field(..., description="Raw Adzuna category", example="IT Jobs")
    salary_min: Optional[float] = Field(None, description="Minimum salary if disclosed", example=600000.0)
    salary_max: Optional[float] = Field(None, description="Maximum salary if disclosed", example=1200000.0)
    posted_date: str = Field(..., description="ISO 8601 formatted posted date", example="2026-07-02T17:24:24Z")
    skills: JobSkillsGroup = Field(..., description="Grouped matched skills list")
    skill_count: int = Field(..., description="Number of skills extracted from description", example=3)
