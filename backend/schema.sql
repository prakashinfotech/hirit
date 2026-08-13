-- Schema definition for Hirit database tables in Supabase (PostgreSQL)

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES Table (Referencing Supabase auth.users)
create table if not exists public.profiles (
    id uuid references auth.users on delete cascade primary key,
    email text not null unique,
    full_name text,
    phone text,
    role text check (role in ('seeker', 'employer')),
    headline text,
    bio text,
    location text,
    experience_years integer,
    profile_photo_url text,
    resume_url text,
    linkedin_url text,
    github_url text,
    profile_completion_pct integer default 0,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- 2. COMPANIES Table
create table if not exists public.companies (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    logo_url text,
    website text,
    industry text,
    size text check (size in ('1-10', '11-50', '51-200', '201-500', '500+')),
    description text,
    location text,
    founded_year integer,
    is_verified boolean default false,
    owner_id uuid references public.profiles(id) on delete set null,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- 3. JOBS Table
create table if not exists public.jobs (
    id uuid default gen_random_uuid() primary key,
    title text not null,
    description text not null,
    requirements text,
    responsibilities text,
    company_id uuid references public.companies(id) on delete cascade,
    employer_id uuid references public.profiles(id) on delete cascade,
    location text not null,
    job_type text check (job_type in ('full-time', 'part-time', 'contract', 'internship', 'freelance', 'remote')),
    category text not null,
    salary_min numeric,
    salary_max numeric,
    experience_min integer,
    experience_max integer,
    skills_required text[],
    education_required text,
    openings integer default 1,
    deadline timestamp with time zone,
    is_remote boolean default false,
    status text default 'active' check (status in ('active', 'closed', 'draft', 'expired')),
    views_count integer default 0,
    applications_count integer default 0,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- 4. EDUCATION Table
create table if not exists public.education (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    institution text not null,
    degree text not null,
    field_of_study text,
    start_year integer not null,
    end_year integer,
    is_current boolean default false,
    grade text,
    created_at timestamp with time zone default now()
);

-- 5. WORK EXPERIENCE Table
create table if not exists public.work_experience (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    company_name text not null,
    title text not null,
    location text,
    start_date text not null,
    end_date text,
    is_current boolean default false,
    description text,
    created_at timestamp with time zone default now()
);

-- 6. APPLICATIONS Table
create table if not exists public.applications (
    id uuid default gen_random_uuid() primary key,
    job_id uuid references public.jobs(id) on delete cascade not null,
    applicant_id uuid references public.profiles(id) on delete cascade not null,
    status text default 'applied' check (status in ('applied', 'shortlisted', 'interviewed', 'offered', 'rejected', 'hired', 'withdrawn')),
    cover_letter text,
    resume_url text,
    applied_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    ai_generated boolean default false,
    unique(job_id, applicant_id)
);

-- 7. SAVED JOBS Table
create table if not exists public.saved_jobs (
    id uuid default gen_random_uuid() primary key,
    job_id uuid references public.jobs(id) on delete cascade not null,
    user_id uuid references public.profiles(id) on delete cascade not null,
    saved_at timestamp with time zone default now(),
    unique(job_id, user_id)
);

-- 8. JOB ALERTS Table
create table if not exists public.job_alerts (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    keywords text,
    location text,
    job_type text,
    experience_min integer,
    experience_max integer,
    salary_min numeric,
    frequency text default 'daily' check (frequency in ('daily', 'weekly')),
    is_active boolean default true,
    created_at timestamp with time zone default now()
);

-- 9. SKILLS Table (Autocomplete seed)
create table if not exists public.skills (
    id uuid default gen_random_uuid() primary key,
    name text not null unique,
    category text
);

-- 10. USER SKILLS Table
create table if not exists public.user_skills (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    skill_name text not null,
    proficiency text check (proficiency in ('beginner', 'intermediate', 'expert')),
    unique(user_id, skill_name)
);

-- 11. COMPANY REVIEWS Table
create table if not exists public.company_reviews (
    id uuid default gen_random_uuid() primary key,
    company_id uuid references public.companies(id) on delete cascade not null,
    reviewer_id uuid references public.profiles(id) on delete cascade not null,
    rating integer not null check (rating >= 1 and rating <= 5),
    review_text text,
    pros text,
    cons text,
    is_anonymous boolean default false,
    created_at timestamp with time zone default now()
);
