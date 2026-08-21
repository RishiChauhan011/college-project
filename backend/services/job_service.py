import logging
from fastapi import HTTPException
from utils.data_loader import get_jobs_data, get_domain_names

logger = logging.getLogger(__name__)

def normalize_domain(domain_name: str) -> str:
    """Helper to case-insensitively match domain and return its canonical form."""
    if not domain_name:
        return None
        
    available_domains = get_domain_names()
    domain_name_lower = domain_name.strip().lower()
    
    for d in available_domains:
        if d.lower() == domain_name_lower:
            return d
            
    raise HTTPException(
        status_code=404,
        detail=f"Domain '{domain_name}' not found. Valid options: {available_domains}"
    )

def get_companies(domain: str = None) -> list:
    """Retrieve unique company names hiring in the dashboard, optionally filtered by career domain."""
    jobs = get_jobs_data()
    canonical_domain = normalize_domain(domain) if domain else None
    
    unique_companies = set()
    for job in jobs:
        comp = job.get("company")
        if not comp:
            continue
        comp_clean = comp.strip()
        if not comp_clean or comp_clean.lower() == "unknown":
            continue
            
        if canonical_domain and job.get("career_domain") != canonical_domain:
            continue
            
        unique_companies.add(comp_clean)
        
    return sorted(list(unique_companies))

def get_jobs(domain: str = None, company: str = None, skills: list[str] = None, limit: int = 20, offset: int = 0) -> list:
    """Retrieve list of jobs filtered by domain, company, and skills, with support for pagination (limit/offset)."""
    jobs = get_jobs_data()
    
    # 1. Domain Filtering (with validation)
    canonical_domain = normalize_domain(domain) if domain else None
    
    # 2. Parse skill filters (strip, lowercase)
    skills_lower = []
    if skills:
        for s in skills:
            # Handle comma-separated skills in a single query parameter
            skills_lower.extend([item.strip().lower() for item in s.split(",") if item.strip()])
            
    filtered_jobs = []
    for job in jobs:
        # Filter by Domain
        if canonical_domain and job.get("career_domain") != canonical_domain:
            continue
            
        # Filter by Company (case-insensitive)
        if company and job.get("company", "").strip().lower() != company.strip().lower():
            continue
            
        # Filter by Skills (subset match)
        if skills_lower:
            job_skills = set()
            for cat in ("technical", "domain", "soft"):
                for skill_dict in job.get("skills", {}).get(cat, []):
                    name = skill_dict.get("name")
                    if name:
                        job_skills.add(name.lower())
            
            if not set(skills_lower).issubset(job_skills):
                continue
                
        filtered_jobs.append(job)
        
    # 3. Apply pagination
    total_matches = len(filtered_jobs)
    paginated_jobs = filtered_jobs[offset : offset + limit]
    
    logger.info(f"Jobs query returned {len(paginated_jobs)} out of {total_matches} total matching jobs.")
    return paginated_jobs

def get_admin_jobs(search: str = None, domain: str = None, limit: int = 20, offset: int = 0) -> dict:
    jobs = get_jobs_data()
    
    search_lower = search.strip().lower() if search else None
    canonical_domain = normalize_domain(domain) if domain else None
    
    filtered_jobs = []
    for job in jobs:
        if canonical_domain and job.get("career_domain") != canonical_domain:
            continue
            
        if search_lower:
            title = job.get("title", "").lower()
            company = job.get("company", "").lower()
            skills_str = ""
            for cat in ("technical", "domain", "soft"):
                for skill_dict in job.get("skills", {}).get(cat, []):
                    skills_str += skill_dict.get("name", "").lower() + " "
                    
            if search_lower not in title and search_lower not in company and search_lower not in skills_str:
                continue
                
        filtered_jobs.append(job)
        
    total = len(filtered_jobs)
    items = filtered_jobs[offset : offset + limit]
    
    return {
        "items": items,
        "total": total,
        "has_more": offset + limit < total
    }

def get_admin_companies(search: str = None, limit: int = 20, offset: int = 0) -> dict:
    jobs = get_jobs_data()
    
    search_lower = search.strip().lower() if search else None
    
    unique_companies = set()
    for job in jobs:
        comp = job.get("company")
        if not comp:
            continue
        comp_clean = comp.strip()
        if not comp_clean or comp_clean.lower() == "unknown":
            continue
            
        if search_lower and search_lower not in comp_clean.lower():
            continue
            
        unique_companies.add(comp_clean)
        
    sorted_companies = sorted(list(unique_companies))
    
    total = len(sorted_companies)
    items = sorted_companies[offset : offset + limit]
    
    return {
        "items": items,
        "total": total,
        "has_more": offset + limit < total
    }
