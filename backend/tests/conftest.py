"""
conftest.py — shared fixtures for the Hirit backend test suite.

Strategy
--------
* All Supabase I/O is mocked via unittest.mock.  Tests never hit a real DB.
* The FastAPI app is mounted on an httpx.AsyncClient with ASGITransport.
* JWT tokens are generated with the same algorithm / secret the app uses so
  that the real get_current_user dependency can be exercised (or overridden).
* Two helper fixtures produce pre-signed tokens: seeker_token / employer_token.
* The Supabase singleton uses @lru_cache — we reset the cache before every
  test so a fresh Mock is injected each time.
"""

import os
import uuid
from datetime import datetime, timedelta, timezone
from typing import AsyncGenerator
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient

# ── env vars must be set BEFORE any app module is imported ──────────────────
# The supabase client validates its API key against a JWT-shaped regex at
# construction time, so the placeholder below must look like a JWT even though
# it is cryptographically meaningless — all real Supabase calls are mocked.
_FAKE_JWT = (
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
    ".eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYwMDAwMDAwMH0"
    ".testsignaturetestsignaturetestsignature"
)
os.environ.setdefault("SUPABASE_URL", "https://test.supabase.co")
os.environ.setdefault("SUPABASE_ANON_KEY", _FAKE_JWT)
os.environ.setdefault("SUPABASE_SERVICE_KEY", _FAKE_JWT)
os.environ.setdefault("SECRET_KEY", "test-secret-key-that-is-at-least-32-chars-long!")
os.environ.setdefault("ALGORITHM", "HS256")
os.environ.setdefault("ACCESS_TOKEN_EXPIRE_MINUTES", "30")
os.environ.setdefault("FRONTEND_URL", "http://localhost:5173")

from jose import jwt  # noqa: E402 — must come after env setup

# ── constants ────────────────────────────────────────────────────────────────
SECRET_KEY = os.environ["SECRET_KEY"]
ALGORITHM = "HS256"

SEEKER_ID = str(uuid.uuid4())
EMPLOYER_ID = str(uuid.uuid4())
JOB_ID = str(uuid.uuid4())
COMPANY_ID = str(uuid.uuid4())
APPLICATION_ID = str(uuid.uuid4())
ALERT_ID = str(uuid.uuid4())

# Canonical profile dicts returned by the mocked Supabase profiles table
SEEKER_PROFILE = {
    "id": SEEKER_ID,
    "email": "seeker@example.com",
    "full_name": "Test Seeker",
    "phone": "9876543210",
    "role": "seeker",
    "headline": "Software Engineer",
    "bio": "Experienced developer",
    "location": "Bangalore",
    "experience_years": 3,
    "profile_photo_url": None,
    "resume_url": None,
    "linkedin_url": None,
    "profile_completion_pct": 60,
    "created_at": "2024-01-01T00:00:00",
    "updated_at": "2024-01-01T00:00:00",
}

EMPLOYER_PROFILE = {
    "id": EMPLOYER_ID,
    "email": "employer@example.com",
    "full_name": "Test Employer",
    "phone": "9876543211",
    "role": "employer",
    "headline": "HR Manager",
    "bio": None,
    "location": "Mumbai",
    "experience_years": 5,
    "profile_photo_url": None,
    "resume_url": None,
    "linkedin_url": None,
    "profile_completion_pct": 40,
    "created_at": "2024-01-01T00:00:00",
    "updated_at": "2024-01-01T00:00:00",
}

SAMPLE_JOB = {
    "id": JOB_ID,
    "title": "Senior Python Developer",
    "description": "Build APIs with FastAPI",
    "requirements": "5+ years Python",
    "responsibilities": "Write code",
    "location": "Bangalore",
    "job_type": "full-time",
    "category": "Engineering",
    "salary_min": 1200000.0,
    "salary_max": 1800000.0,
    "experience_min": 3,
    "experience_max": 8,
    "skills_required": ["Python", "FastAPI"],
    "education_required": "B.Tech",
    "openings": 2,
    "deadline": None,
    "is_remote": False,
    "status": "active",
    "views_count": 10,
    "applications_count": 3,
    "posted_by": EMPLOYER_ID,
    "company_id": COMPANY_ID,
    "company": {
        "id": COMPANY_ID,
        "name": "TechCorp India",
        "logo_url": None,
        "location": "Bangalore",
        "industry": "Technology",
    },
    "created_at": "2024-01-01T00:00:00",
    "updated_at": "2024-01-01T00:00:00",
}

SAMPLE_COMPANY = {
    "id": COMPANY_ID,
    "name": "TechCorp India",
    "description": "A great tech company",
    "industry": "Technology",
    "company_size": "51-200",
    "founded_year": 2015,
    "website": "https://techcorp.in",
    "location": "Bangalore",
    "logo_url": None,
    "cover_image_url": None,
    "linkedin_url": None,
    "twitter_url": None,
    "owner_id": EMPLOYER_ID,
    "average_rating": None,
    "total_reviews": 0,
    "reviews": [],
    "active_jobs_count": 0,
    "created_at": "2024-01-01T00:00:00",
    "updated_at": "2024-01-01T00:00:00",
}

SAMPLE_APPLICATION = {
    "id": APPLICATION_ID,
    "job_id": JOB_ID,
    "applicant_id": SEEKER_ID,
    "status": "applied",
    "cover_letter": "I am very interested in this role.",
    "resume_url": None,
    "expected_salary": None,
    "notice_period": None,
    "applied_at": "2024-01-02T00:00:00",
    "updated_at": "2024-01-02T00:00:00",
    "job": SAMPLE_JOB,
}


# ── JWT token helpers ────────────────────────────────────────────────────────

def make_token(user_id: str, email: str, role: str, expired: bool = False) -> str:
    if expired:
        exp = datetime.now(timezone.utc) - timedelta(hours=1)
    else:
        exp = datetime.now(timezone.utc) + timedelta(hours=1)
    payload = {"sub": user_id, "email": email, "role": role, "exp": exp}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


@pytest.fixture
def seeker_token() -> str:
    return make_token(SEEKER_ID, "seeker@example.com", "seeker")


@pytest.fixture
def employer_token() -> str:
    return make_token(EMPLOYER_ID, "employer@example.com", "employer")


@pytest.fixture
def expired_token() -> str:
    return make_token(SEEKER_ID, "seeker@example.com", "seeker", expired=True)


def auth_headers(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


# ── Supabase mock builder ────────────────────────────────────────────────────

def _chain(*args, **kwargs):
    """Return a MagicMock that chains .select().eq()... and ends with .execute()"""
    m = MagicMock()
    m.select.return_value = m
    m.eq.return_value = m
    m.neq.return_value = m
    m.or_.return_value = m
    m.ilike.return_value = m
    m.gte.return_value = m
    m.lte.return_value = m
    m.in_.return_value = m
    m.order.return_value = m
    m.range.return_value = m
    m.limit.return_value = m
    m.single.return_value = m
    m.insert.return_value = m
    m.update.return_value = m
    m.delete.return_value = m
    m.upsert.return_value = m
    m.execute.return_value = MagicMock(data=None, count=0)
    return m


def make_supabase_mock():
    """Build a fully-chaining Supabase client mock."""
    client = MagicMock()
    table_mock = _chain()
    client.table.return_value = table_mock

    # Auth admin sub-mock
    auth_admin = MagicMock()
    client.auth.admin = auth_admin
    client.auth.sign_in_with_password = MagicMock()
    client.auth.reset_password_email = MagicMock()

    # Storage sub-mock
    storage_bucket = MagicMock()
    storage_bucket.upload = MagicMock(return_value=MagicMock())
    storage_bucket.get_public_url = MagicMock(return_value="https://storage.example.com/resume.pdf")
    storage_bucket.remove = MagicMock(return_value=MagicMock())
    client.storage.from_ = MagicMock(return_value=storage_bucket)

    return client


# ── App + AsyncClient fixture ────────────────────────────────────────────────

@pytest_asyncio.fixture
async def client() -> AsyncGenerator[AsyncClient, None]:
    """
    Yield an httpx AsyncClient wired to the FastAPI app.
    The Supabase singleton is monkey-patched on every test.
    The lru_cache on get_supabase is cleared between tests.
    """
    # Clear the lru_cache so a fresh mock is used
    from app.services.supabase import get_supabase
    get_supabase.cache_clear()

    mock_sb = make_supabase_mock()

    with patch("app.services.supabase.get_supabase", return_value=mock_sb), \
         patch("app.routers.auth.get_supabase", return_value=mock_sb), \
         patch("app.routers.jobs.get_supabase", return_value=mock_sb), \
         patch("app.routers.applications.get_supabase", return_value=mock_sb), \
         patch("app.routers.saved_jobs.get_supabase", return_value=mock_sb), \
         patch("app.routers.job_alerts.get_supabase", return_value=mock_sb), \
         patch("app.routers.users.get_supabase", return_value=mock_sb), \
         patch("app.routers.companies.get_supabase", return_value=mock_sb), \
         patch("app.routers.dashboard.get_supabase", return_value=mock_sb), \
         patch("app.routers.skills.get_supabase", return_value=mock_sb), \
         patch("app.dependencies.get_supabase", return_value=mock_sb):

        from app.main import app
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as ac:
            ac._mock_sb = mock_sb  # expose for per-test customisation
            yield ac


@pytest_asyncio.fixture
async def authed_client_seeker(client: AsyncClient, seeker_token: str) -> AsyncClient:
    """AsyncClient pre-loaded with a seeker Bearer token and a mocked profile."""
    sb = client._mock_sb

    # The get_current_user dependency calls supabase.table("profiles").select("*").eq().single().execute()
    # We need that chain to return SEEKER_PROFILE
    profiles_chain = _chain()
    profiles_chain.execute.return_value = MagicMock(data=SEEKER_PROFILE, count=1)
    sb.table.return_value = profiles_chain

    client.headers = {**client.headers, "Authorization": f"Bearer {seeker_token}"}
    return client


@pytest_asyncio.fixture
async def authed_client_employer(client: AsyncClient, employer_token: str) -> AsyncClient:
    """AsyncClient pre-loaded with an employer Bearer token and a mocked profile."""
    sb = client._mock_sb

    profiles_chain = _chain()
    profiles_chain.execute.return_value = MagicMock(data=EMPLOYER_PROFILE, count=1)
    sb.table.return_value = profiles_chain

    client.headers = {**client.headers, "Authorization": f"Bearer {employer_token}"}
    return client
