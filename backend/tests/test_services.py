import unittest
import sys
import os
from fastapi import HTTPException

# Add backend directory to path so tests can run from anywhere
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.data_loader import preload_data
from services.analytics_service import get_domains, get_analytics_summary, get_domain_analytics
from services.job_service import get_companies, get_jobs
from services.skill_service import get_skills
from services.recommendation_service import get_recommendation

class TestServices(unittest.TestCase):
    
    @classmethod
    def setUpClass(cls):
        # Preload the in-memory caches once for all unit tests
        preload_data()

    def test_get_domains(self):
        """Test retrieving available career domains from cached analytics."""
        domains = get_domains()
        self.assertIsInstance(domains, list)
        self.assertIn("AI & Data Science", domains)
        self.assertIn("Software Development", domains)

    def test_get_analytics_summary(self):
        """Test retrieving the overall analytics summary matching expected schemas."""
        summary = get_analytics_summary()
        self.assertIsInstance(summary, dict)
        self.assertIn("total_jobs", summary)
        self.assertIn("total_skills", summary)
        self.assertIn("salary_disclosure_rate", summary)
        self.assertIn("domain_count", summary)
        self.assertIn("available_domains", summary)
        self.assertEqual(summary["total_jobs"], 2986)
        self.assertEqual(summary["domain_count"], len(summary["available_domains"]))

    def test_get_domain_analytics_valid(self):
        """Test retrieving domain specific analytics for a valid domain."""
        stats = get_domain_analytics("AI & Data Science")
        self.assertIsInstance(stats, dict)
        self.assertEqual(stats["jobs"], 722)
        self.assertIn("average_skills", stats)
        self.assertIn("top_skills", stats)
        self.assertIn("top_companies", stats)
        self.assertIn("salary_statistics", stats)
        
        salary_stats = stats["salary_statistics"]
        self.assertIsInstance(salary_stats, dict)
        self.assertEqual(salary_stats["total_jobs"], 722)
        self.assertIsNotNone(salary_stats["disclosure_rate_percent"])

    def test_get_domain_analytics_case_insensitive(self):
        """Test retrieving domain specific analytics with mixed casing."""
        stats = get_domain_analytics("ai & data science")
        self.assertEqual(stats["jobs"], 722)

    def test_get_domain_analytics_invalid(self):
        """Test that invalid domains raise HTTP 404 Not Found exception."""
        with self.assertRaises(HTTPException) as ctx:
            get_domain_analytics("InvalidDomainName")
        self.assertEqual(ctx.exception.status_code, 404)

    def test_get_companies(self):
        """Test retrieving unique company names."""
        companies = get_companies()
        self.assertIsInstance(companies, list)
        self.assertGreater(len(companies), 0)
        self.assertNotIn("Unknown", companies)

    def test_get_companies_filtered(self):
        """Test retrieving unique companies filtered by domain."""
        companies_domain = get_companies(domain="AI & Data Science")
        companies_all = get_companies()
        self.assertLess(len(companies_domain), len(companies_all))

    def test_get_companies_invalid_domain(self):
        """Test retrieving unique companies with an invalid domain filter raises HTTP 404."""
        with self.assertRaises(HTTPException) as ctx:
            get_companies(domain="InvalidDomainName")
        self.assertEqual(ctx.exception.status_code, 404)

    def test_get_jobs_pagination(self):
        """Test filtering jobs with offset and limit pagination."""
        jobs_first_page = get_jobs(limit=5, offset=0)
        jobs_second_page = get_jobs(limit=5, offset=5)
        
        self.assertEqual(len(jobs_first_page), 5)
        self.assertEqual(len(jobs_second_page), 5)
        self.assertNotEqual(jobs_first_page[0]["title"], jobs_second_page[0]["title"])

    def test_get_jobs_skill_filtering(self):
        """Test filtering jobs by matching multiple required skills."""
        jobs = get_jobs(skills=["Python", "SQL"])
        for job in jobs:
            skills_set = set()
            for cat in ("technical", "domain", "soft"):
                for s in job["skills"][cat]:
                    skills_set.add(s["name"].lower())
            self.assertTrue({"python", "sql"}.issubset(skills_set))

    def test_get_skills_filtering(self):
        """Test filtering the skills master database."""
        framework_skills = get_skills(category="Technical", skill_type="Framework", enabled=True)
        self.assertGreater(len(framework_skills), 0)
        for s in framework_skills:
            self.assertEqual(s["category"], "Technical")
            self.assertEqual(s["skill_type"], "Framework")
            self.assertTrue(s["enabled"])

    def test_get_recommendation_valid(self):
        """Test recommendation computation against a valid domain."""
        rec = get_recommendation(resume_skills=["Python", "SQL", "Excel"], target_domain="AI & Data Science")
        self.assertIn("match_score", rec)
        self.assertIn("recognized_skills", rec)
        self.assertIn("missing_skills", rec)
        self.assertIn("learning_priority", rec)
        self.assertIn("estimated_learning_weeks", rec)
        self.assertIn("qualified_companies", rec)

    def test_get_recommendation_invalid_domain(self):
        """Test recommendation query raises HTTP 404 Not Found if target domain is invalid."""
        with self.assertRaises(HTTPException) as ctx:
            get_recommendation(resume_skills=["Python"], target_domain="InvalidDomainName")
        self.assertEqual(ctx.exception.status_code, 404)

    def test_domain_salary_stats_match_analytics_json(self):
        """Golden test: assert that get_domain_salary_stats("AI & Data Science")
        returns the exact same dict as analytics_json["by_domain"]["AI & Data Science"]["salary"]."""
        from utils.data_loader import get_analytics_data, get_domain_salary_stats
        analytics_json = get_analytics_data()
        domain = "AI & Data Science"
        
        loader_stats = get_domain_salary_stats(domain)
        json_stats = analytics_json.get("by_domain", {}).get(domain, {}).get("salary")
        
        self.assertIsNotNone(loader_stats)
        self.assertEqual(loader_stats, json_stats)

if __name__ == "__main__":
    unittest.main()

