from pydantic import BaseModel, Field
from typing import List

class SkillResponse(BaseModel):
    id: str = Field(..., description="Unique skill identifier", example="T001")
    skill: str = Field(..., description="Canonical name of the skill", example="Python")
    category: str = Field(..., description="High-level category (Technical, Domain, Soft Skill)", example="Technical")
    source: str = Field(..., description="Data source that provided the skill", example="from_frequency_data")
    enabled: bool = Field(..., description="Whether skill is actively used in matching", example=True)
    synonyms: List[str] = Field(..., description="Known synonyms for the skill", example=["Python3", "Py"])
    skill_type: str = Field(..., description="Subtype of the skill (Language, Framework, Tool, Knowledge Area, Broad Domain, Soft Skill)", example="Language")
