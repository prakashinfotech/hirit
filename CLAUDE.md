# Hirit — Project Context for Claude Agents

## Project Goal
Production-grade exact replica of foundit.in, branded as Hirit — India's leading job portal.

## Tech Stack
- **Backend**: FastAPI (Python 3.11) — runs on port 8000
- **Frontend**: React 18 + TypeScript + Tailwind CSS + shadcn/ui — runs on port 5173
- **Database**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **State**: TanStack Query (React Query v5) + AuthContext (React Context API for auth state)
- **Forms**: React Hook Form + Zod validation
- **HTTP Client**: Axios with JWT interceptors
- **Icons**: Lucide React
- **Deployment**: Local development only

## Brand Colors (Exact Foundit Values)
```
Primary Orange : #f04e23
Dark Navy      : #1a1a2e
Text Dark      : #333333
Text Muted     : #666666
Border         : #e0e0e0
Background     : #f5f5f5
Success        : #28a745
Warning        : #ffc107
Danger         : #dc3545
White          : #ffffff
```

## Environment Variables

### Backend (.env)
```
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
SECRET_KEY=your_jwt_secret_key_min_32_chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:8000
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Supabase Database Schema (16 Tables)

### profiles
- id (uuid, FK auth.users), full_name, email, phone
- role: 'seeker' | 'employer'
- headline, location, experience_years, bio
- profile_photo_url, resume_url, linkedin_url
- profile_completion_pct (int), created_at, updated_at

### companies
- id, name, logo_url, website, industry
- size: '1-10'|'11-50'|'51-200'|'201-500'|'500+'
- description, location, founded_year, is_verified
- owner_id (FK profiles)

### jobs
- id, title, description (text), company_id (FK)
- location, is_remote (bool)
- job_type: 'full-time'|'part-time'|'contract'|'internship'
- experience_min, experience_max (int, years)
- salary_min, salary_max (int), salary_currency (default INR)
- category (text), openings_count (int)
- status: 'active'|'closed'|'draft'
- views_count (int), posted_by (FK profiles)
- created_at, expires_at

### skills
- id, name (unique), category

### job_skills
- id, job_id (FK jobs), skill_name (text)

### user_skills
- id, user_id (FK profiles), skill_name
- proficiency: 'beginner'|'intermediate'|'expert'

### education
- id, user_id (FK profiles), degree, institution
- field_of_study, start_year, end_year, is_current (bool)

### work_experience
- id, user_id (FK profiles), title, company_name
- location, start_date, end_date, is_current (bool), description

### applications
- id, job_id (FK jobs), applicant_id (FK profiles)
- status: 'applied'|'shortlisted'|'interviewed'|'offered'|'rejected'
- cover_letter (text), resume_url, applied_at, updated_at
- ai_generated (bool, default false) — indexed

### saved_jobs
- id, job_id (FK jobs), user_id (FK profiles), saved_at

### job_alerts
- id, user_id (FK profiles), keywords (text), location
- job_type, experience_min, experience_max
- salary_min, frequency: 'daily'|'weekly', is_active (bool)

### notifications
- id, user_id (FK profiles), type, title, message
- is_read (bool), link, created_at

### company_reviews
- id, company_id (FK), reviewer_id (FK profiles)
- rating (1-5), review_text, pros, cons
- is_anonymous (bool), created_at

### career_articles
- id, title, content (text), category, tags (text[])
- thumbnail_url, author_name, published_at, read_time_mins

### job_views
- id, job_id (FK), viewer_id (FK profiles, nullable), viewed_at

### profile_views
- id, profile_id (FK), viewer_id (FK profiles), viewed_at

## API Base URL
- Development: http://localhost:8000/api

## Frontend Routes (17 Pages)
- / → Home
- /jobs → JobSearch (filters + results)
- /jobs/:id → JobDetail
- /company/:id → CompanyProfile
- /career-advice → CareerAdvice
- /salary-insights → SalaryInsights
- /login → Login (guest only)
- /register → Register (guest only)
- /dashboard → Seeker Dashboard Overview
- /dashboard/applied → Applied Jobs
- /dashboard/saved → Saved Jobs
- /dashboard/profile → Edit Profile
- /dashboard/resume → Resume Manager
- /dashboard/alerts → Job Alerts
- /employer/dashboard → Employer Overview
- /employer/post-job → Post a Job
- /employer/jobs → My Posted Jobs
- /employer/jobs/:id/applicants → View Applicants

## Key Rules for Agents
1. ALWAYS use Supabase Python client for all DB operations (never raw SQL strings in routes)
2. ALWAYS validate with Pydantic models on backend, Zod on frontend
3. ALWAYS handle loading + error states in every React component
4. NEVER hardcode secrets — use environment variables
5. ALL protected routes must check JWT token via dependencies.py
6. Match Foundit.in UI layout exactly, branded as Hirit
7. Use TanStack Query for all data fetching on frontend
8. Commit after every completed feature
