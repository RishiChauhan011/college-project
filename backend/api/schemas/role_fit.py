from pydantic import BaseModel, Field, field_validator


class RoleFitRequest(BaseModel):
    resume_skills: list[str] = Field(
        ...,
        description="List of the user's skills (e.g. from resume parsing or manual entry).",
        min_length=1,
    )

    @field_validator("resume_skills")
    @classmethod
    def no_duplicate_skills(cls, value: list[str]) -> list[str]:
        seen = set()
        for skill in value:
            key = skill.strip().lower()
            if key in seen:
                raise ValueError(f"Duplicate skill in request: '{skill}'")
            seen.add(key)
        return value


class RoleFitResponse(BaseModel):
    predicted_role: str = Field(..., description="The best-fit role predicted for this skill set.")
    confidence: float = Field(..., description="Model confidence for the predicted role (0-1).")
    all_probabilities: dict[str, float] = Field(
        ..., description="Full probability breakdown across all supported roles."
    )
    domain: str = Field(
        default="AI & Data Science",
        description="The career domain this classifier is scoped to.",
    )
    note: str = Field(
        default=(
            "This model is scoped to the AI & Data Science domain only. "
            "See project documentation for known limitations."
        ),
        description="Context note about model scope and limitations.",
    )