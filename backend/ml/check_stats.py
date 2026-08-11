import json

with open("jobs_with_skills.json", encoding="utf-8") as f:
    jobs = json.load(f)

total_jobs = len(jobs)
zero_skill_jobs = [j for j in jobs if j["skill_count"] == 0]

skill_counts = [j["skill_count"] for j in jobs]

print("=" * 40)
print(f"Total jobs: {total_jobs}")
print(f"Jobs with 0 skills: {len(zero_skill_jobs)}")
print(f"Average skills/job: {sum(skill_counts)/total_jobs:.2f}")
print(f"Minimum skills/job: {min(skill_counts)}")
print(f"Maximum skills/job: {max(skill_counts)}")
print("=" * 40)
