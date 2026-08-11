from pydantic import BaseModel, Field
from typing import List, Optional

class HealthResponse(BaseModel):
    status: str = Field(..., description="Server status indicator", example="running")
    project: str = Field(..., description="Project name", example="AI Career Intelligence Dashboard")
    version: str = Field(..., description="API Version", example="1.0")

class AnalyticsSummaryResponse(BaseModel):
    total_jobs: int = Field(..., description="Total number of jobs in database", example=2986)
    total_skills: int = Field(..., description="Total unique skills matched", example=112)
    salary_disclosure_rate: float = Field(..., description="Percentage of jobs with disclosed salary", example=31.4)
    domain_count: int = Field(..., description="Number of unique career domains", example=6)
    available_domains: List[str] = Field(..., description="List of all available career domains", example=[
        "AI & Data Science", "Software Development", "Business Analytics",
        "Graphic Design", "Digital Marketing", "Education"
    ])

class SkillFrequency(BaseModel):
    skill: str = Field(..., description="Name of the skill", example="Python")
    count: int = Field(..., description="Frequency count in job descriptions", example=78)

class CompanyFrequency(BaseModel):
    company: str = Field(..., description="Name of the company", example="Google")
    count: int = Field(..., description="Number of job listings", example=15)

class DomainSalaryStats(BaseModel):
    total_jobs: int = Field(..., description="Total jobs within this career domain", example=722)
    jobs_with_salary_disclosed: int = Field(..., description="Jobs with salary information disclosed", example=200)
    jobs_without_salary_disclosed: int = Field(..., description="Jobs without salary information disclosed", example=522)
    disclosure_rate_percent: float = Field(..., description="Percentage of postings disclosing salary", example=27.7)
    average_salary_min: Optional[float] = Field(None, description="Average minimum salary if disclosed", example=650000.0)
    average_salary_max: Optional[float] = Field(None, description="Average maximum salary if disclosed", example=1200000.0)
    note: Optional[str] = Field(None, description="Explaining salary statistics source", example="Based only on postings that disclosed salary - not estimated for others.")

class DomainAnalyticsResponse(BaseModel):
    jobs: int = Field(..., description="Total jobs in this career domain", example=722)
    average_skills: float = Field(..., description="Average number of skills per job", example=2.81)
    top_skills: List[SkillFrequency] = Field(..., description="Top skills in this domain ordered by popularity")
    top_companies: List[CompanyFrequency] = Field(..., description="Top companies hiring in this domain")
    salary_statistics: DomainSalaryStats = Field(..., description="Salary statistics specifically for this domain")
