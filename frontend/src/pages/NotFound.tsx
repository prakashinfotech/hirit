import { Link, useNavigate } from 'react-router-dom';
import { Search, Home as HomeIcon, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f5f5f5] px-4 py-16">
      <div className="w-full max-w-lg rounded-2xl bg-white p-10 text-center shadow-sm">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#fff1ec] text-[#2563eb]">
          <Search className="h-9 w-9" strokeWidth={2.2} />
        </div>

        <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#2563eb]">
          404 — Page Not Found
        </p>
        <h1 className="mb-3 text-3xl font-bold text-[#1a1a2e]">
          We couldn't find that page
        </h1>
        <p className="mb-8 text-sm leading-relaxed text-[#666666]">
          The page you're looking for may have moved, expired, or never existed.
          Try heading back to the homepage or searching for your next role.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-[#e0e0e0] bg-white px-5 py-2.5 text-sm font-medium text-[#1a1a2e] transition-colors hover:bg-[#f5f5f5] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Go back
          </button>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-[#2563eb] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-2"
          >
            <HomeIcon className="h-4 w-4" />
            Back to home
          </Link>
          <Link
            to="/jobs"
            className="inline-flex items-center justify-center gap-2 rounded-md border border-[#2563eb] bg-white px-5 py-2.5 text-sm font-medium text-[#2563eb] transition-colors hover:bg-[#fff1ec] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-2"
          >
            <Search className="h-4 w-4" />
            Browse jobs
          </Link>
        </div>
      </div>
    </div>
  );
}
