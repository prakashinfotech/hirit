import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  User,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn, getInitials } from '../../lib/utils';

const NAV_LINKS = [
  { label: 'Jobs', to: '/jobs' },
  { label: 'Career Solutions', to: '/career-solutions' },
  { label: 'Prep', to: '/prep' },
  { label: 'Learn', to: '/learn' },
  { label: 'Career Advice', to: '/career-advice' },
];

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    setMobileOpen(false);
    await logout();
    navigate('/');
  };

  const fullName = user ? `${user.first_name} ${user.last_name}`.trim() : '';

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-white border-b border-[#e0e0e0]">
      <div className="mx-auto flex h-[60px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          to="/"
          className="flex shrink-0 items-center focus:outline-none mr-4"
          onClick={() => setMobileOpen(false)}
        >
          <span className="text-2xl font-black tracking-tight" style={{ color: '#2563eb' }}>h</span>
          <span
            className="text-2xl font-black tracking-tight"
            style={{
              background: 'linear-gradient(90deg, #2563eb 0%, #3b82f6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            ir
          </span>
          <span className="text-2xl font-black tracking-tight text-brand-dark">it</span>
          <span className="inline-block h-2 w-2 translate-y-[-8px] rounded-full bg-[#2563eb]" />
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden items-center gap-2 md:flex flex-1 ml-4">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.label}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  'px-3 py-2 text-[15px] font-bold transition-colors hover:text-[#2563eb]',
                  isActive ? 'text-[#2563eb]' : 'text-[#333333]',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Desktop Right Side */}
        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated && user ? (
            <>
              {/* User dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-full border border-[#e0e0e0] px-3 py-1.5 text-sm font-medium text-[#333333] transition-colors hover:border-[#2563eb] hover:text-[#2563eb] focus:outline-none"
                >
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={fullName}
                      className="h-7 w-7 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2563eb] text-xs font-bold text-white">
                      {getInitials(fullName)}
                    </span>
                  )}
                  <span className="max-w-[100px] truncate">{fullName}</span>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 transition-transform',
                      dropdownOpen && 'rotate-180',
                    )}
                  />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-lg border border-[#e0e0e0] bg-white py-1 shadow-xl">
                    <div className="border-b border-[#e0e0e0] px-4 py-3">
                      <p className="truncate text-sm font-semibold text-[#1a1a2e]">{fullName}</p>
                      <p className="truncate text-xs text-[#666666]">{user.email}</p>
                    </div>
                    <Link
                      to="/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#333333] transition-colors hover:bg-[#f5f5f5] hover:text-[#2563eb]"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      My Dashboard
                    </Link>
                    <Link
                      to="/dashboard/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#333333] transition-colors hover:bg-[#f5f5f5] hover:text-[#2563eb]"
                    >
                      <User className="h-4 w-4" />
                      My Profile
                    </Link>
                    <Link
                      to="/dashboard/applied"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#333333] transition-colors hover:bg-[#f5f5f5] hover:text-[#2563eb]"
                    >
                      <Briefcase className="h-4 w-4" />
                      Applied Jobs
                    </Link>
                    <div className="border-t border-[#e0e0e0] mt-1 pt-1">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 transition-colors hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Login button — outline, purple text, user icon */}
              <Link
                to="/login"
                className="flex items-center gap-1.5 rounded-full border border-[#2563eb] px-5 py-2 text-[14px] font-semibold text-[#2563eb] transition-colors hover:bg-blue-50"
              >
                <User className="h-4 w-4" />
                Login
              </Link>
              {/* Register button — orange fill with icon */}
              <Link
                to="/register"
                className="flex items-center gap-1.5 rounded-full bg-[#2563eb] px-5 py-2 text-[14px] font-semibold text-white transition-opacity hover:opacity-90 shadow-sm"
              >
                <User className="h-4 w-4" />
                Register
              </Link>
              {/* Employers Login — plain text link */}
              <a
                href="/employer/dashboard"
                className="text-[14px] font-bold text-[#333333] transition-colors hover:text-[#2563eb] ml-2 border-l border-gray-300 pl-4"
              >
                Employers Login
              </a>
            </>
          )}
        </div>

        {/* Hamburger (mobile) */}
        <button
          type="button"
          className="rounded-md p-2 text-[#333333] transition-colors hover:bg-[#f5f5f5] md:hidden"
          aria-label="Toggle menu"
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="border-t border-[#e0e0e0] bg-white px-4 pb-5 pt-3 md:hidden">
          <nav className="mb-4 flex flex-col gap-0.5">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.label}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-blue-50 text-[#2563eb]'
                      : 'text-[#333333] hover:bg-[#f5f5f5]',
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
            <a
              href="/employer/dashboard"
              onClick={() => setMobileOpen(false)}
              className="rounded-md px-3 py-2.5 text-sm font-medium text-[#333333] hover:bg-[#f5f5f5]"
            >
              Employers Login
            </a>
          </nav>

          {isAuthenticated && user ? (
            <div className="flex flex-col gap-0.5 border-t border-[#e0e0e0] pt-3">
              <div className="mb-3 flex items-center gap-3 px-3">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={fullName}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2563eb] text-sm font-bold text-white">
                    {getInitials(fullName)}
                  </span>
                )}
                <div>
                  <p className="text-sm font-semibold text-[#1a1a2e]">{fullName}</p>
                  <p className="text-xs text-[#666666]">{user.email}</p>
                </div>
              </div>
              <Link
                to="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm text-[#333333] hover:bg-[#f5f5f5]"
              >
                <LayoutDashboard className="h-4 w-4" />
                My Dashboard
              </Link>
              <Link
                to="/dashboard/profile"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm text-[#333333] hover:bg-[#f5f5f5]"
              >
                <User className="h-4 w-4" />
                My Profile
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm text-red-500 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 border-t border-[#e0e0e0] pt-3">
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-1.5 rounded-md border border-[#2563eb] px-4 py-2.5 text-center text-sm font-semibold text-[#2563eb] hover:bg-blue-50"
              >
                <User className="h-4 w-4" />
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileOpen(false)}
                className="rounded-md bg-[#2563eb] px-4 py-2.5 text-center text-sm font-semibold text-white hover:opacity-90"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
