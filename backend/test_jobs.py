import sys
import os
sys.path.insert(0, os.path.abspath("."))
from services.job_service import get_jobs

try:
    jobs = get_jobs(domain="AI & Data Science")
    print(len(jobs))
except Exception as e:
    import traceback
    traceback.print_exc()
