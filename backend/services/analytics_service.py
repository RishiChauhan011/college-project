import logging
from fastapi import HTTPException
from utils.data_loader import get_analytics_data, get_domain_salary_stats, get_domain_names

logger = logging.getLogger(__name__)

def get_domains() -> list:
    """Return all available career domains dynamically from cached analytics."""
    return get_domain_names()

def get_analytics_summary() -> dict:
    """Retrieve precomputed overall analytics summary."""
    analytics = get_analytics_data()
    overall = analytics.get("overall", {})
    salary = analytics.get("salary", {})
    by_domain = analytics.get("by_domain", {})
    
    return {
        "total_jobs": overall.get("total_jobs", 0),
        "total_skills": overall.get("total_unique_skills_matched", 0),
        "salary_disclosure_rate": salary.get("disclosure_rate_percent", 0.0),
        "domain_count": len(by_domain),
        "available_domains": list(by_domain.keys())
    }

def get_domain_analytics(domain_name: str) -> dict:
    """Retrieve precalculated stats and salary statistics for a specific career domain.
    
    Performs case-insensitive domain matching and raises HTTPException(404) if not found.
    """
    available_domains = get_domain_names()
    
    # 1. Normalize domain name (case-insensitive search)
    canonical_domain = None
    domain_name_lower = domain_name.strip().lower()
    for d in available_domains:
        if d.lower() == domain_name_lower:
            canonical_domain = d
            break
            
    if canonical_domain is None:
        logger.warning(f"Requested domain '{domain_name}' not found.")
        raise HTTPException(
            status_code=404, 
            detail=f"Domain '{domain_name}' not found. Valid options: {available_domains}"
        )
        
    # 2. Retrieve statistics from cache
    analytics = get_analytics_data()
    domain_data = analytics.get("by_domain", {}).get(canonical_domain, {})
    salary_stats = get_domain_salary_stats(canonical_domain)
    
    return {
        "jobs": domain_data.get("total_jobs", 0),
        "average_skills": domain_data.get("average_skills_per_job", 0.0),
        "top_skills": domain_data.get("top_skills", []),
        "top_companies": domain_data.get("top_companies", []),
        "salary_statistics": salary_stats
    }
