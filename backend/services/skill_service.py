import logging
from utils.data_loader import get_skills_data

logger = logging.getLogger(__name__)

def get_skills(category: str = None, skill_type: str = None, enabled: bool = None) -> list:
    """Retrieve and filter skills from master_skills.csv."""
    skills = get_skills_data()
    
    filtered_skills = []
    for skill in skills:
        # Filter by category (case-insensitive)
        if category and skill.get("category", "").strip().lower() != category.strip().lower():
            continue
            
        # Filter by skill_type (case-insensitive)
        if skill_type and skill.get("skill_type", "").strip().lower() != skill_type.strip().lower():
            continue
            
        # Filter by enabled state
        if enabled is not None and skill.get("enabled") != enabled:
            continue
            
        filtered_skills.append(skill)
        
    return filtered_skills
