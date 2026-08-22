from pydantic import BaseModel, Field, field_validator


class RoleFitRequest(BaseModel):
    resume_skills: list[str] = Field(
        ...,
        description="List of the user's skills (e.g. from resume parsing or manual entry).",
        min_length=1,
    )
    target_domain: str = Field(
        ...,
        description="The career domain to predict a role within (must match one of the supported domains from /api/v1/domains).",
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
    predicted_role: str = Field(..., description="The best-fit role predicted for this skill set, within the requested domain.")
    confidence: float = Field(..., description="Model confidence for the predicted role, relative to other roles in the same domain (0-1).")
    all_probabilities: dict[str, float] = Field(
        ..., description="Probability breakdown across roles within the requested domain."
    )
    domain: str = Field(
        ...,
        description="The career domain this prediction was scoped to (echoes the request's target_domain).",
    )