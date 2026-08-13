import { type ComponentType, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Bell,
  BookMarked,
  Briefcase,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  PlusCircle,
  User,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { cn, getInitials } from '../../lib/utils';
import ProfileProgress from '../ui/ProfileProgress';

interface SidebarLink {
  label: string;
  to: string;
  icon: ComponentType<{ className?: string }>;
}

const SEEKER_LINKS: SidebarLink[] = [
  { label: 'Overview', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Applied Jobs', to: '/dashboard/applied', icon: Briefcase },
  { label: 'Saved Jobs', to: '/dashboard/saved', icon: BookMarked },
  { label: 'My Profile', to: '/dashboard/profile', icon: User },
  { label: 'Resume', to: '/dashboard/resume', icon: FileText },
  { label: 'Job Alerts', to: '/dashboard/alerts', icon: Bell },
];

const EMPLOYER_LINKS: SidebarLink[] = [
  { label: 'Overview', to: '/employer/dashboard', icon: LayoutDashboard },
  { label: 'Post a Job', to: '/employer/post-job', icon: PlusCircle },
  { label: 'My Jobs', to: '/employer/jobs', icon: Briefcase },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);

  const isEmployer = user?.role === UserRole.EMPLOYER;
  const links = isEmployer ? EMPLOYER_LINKS : SEEKER_LINKS;
  const fullName = user ? `${user.first_name} ${user.last_name}`.trim() : '';
  const roleBadgeLabel = isEmployer ? 'Employer' : user?.role === UserRole.ADMIN ? 'Admin' : 'Job Seeker';

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* User info */}
      <div className="border-b border-[#e0e0e0] p-5">
        <div className="mb-3 flex flex-col items-center gap-2 text-center">
          {user?.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={fullName}
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#2563eb] text-xl font-semibold text-white">
              {getInitials(fullName)}
            </span>
          )}
          <div>
            <p className="text-sm font-semibold text-[#1a1a2e]">{fullName || 'User'}</p>
            <span
              className={cn(
                'mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium',
                isEmployer
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-teal-100 text-[#2563eb]',
              )}
            >
              {roleBadgeLabel}
            </span>
          </div>
        </div>

        {/* Profile progress (seekers only) */}
        {!isEmployer && (
          <ProfileProgress percentage={72} />
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="flex flex-col gap-0.5">
          {links.map(({ label, to, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/dashboard'}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-[#2563eb] text-white'
                      : 'text-[#1a1a2e] hover:bg-[#f5f5f5]',
                  )
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom: Logout */}
      <div className="border-t border-[#e0e0e0] p-3">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-50"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#f5f5f5]">
      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden shrink-0 border-r border-[#e0e0e0] bg-white transition-all duration-300 lg:block overflow-hidden",
        desktopSidebarOpen ? "w-60" : "w-0 border-none"
      )}>
        {/* Sidebar logo */}
        <div className="flex h-16 items-center justify-between border-b border-[#e0e0e0] px-5">
          <Link to="/" className="flex items-center gap-0 focus:outline-none">
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
          <button
            type="button"
            onClick={() => setDesktopSidebarOpen(false)}
            className="rounded-md p-1 text-gray-500 hover:bg-[#f5f5f5]"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-60 bg-white shadow-xl transition-transform duration-300 lg:hidden',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-[#e0e0e0] px-5">
          <Link to="/" className="flex items-center gap-0 focus:outline-none">
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
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-md p-1 text-gray-500 hover:bg-[#f5f5f5]"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <SidebarContent />
      </aside>

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile / Collapsed Desktop topbar */}
        <div className={cn(
          "flex h-16 items-center gap-4 border-b border-[#e0e0e0] bg-white px-4",
          desktopSidebarOpen ? "lg:hidden" : ""
        )}>
          <button
            type="button"
            onClick={() => {
              setSidebarOpen(true);
              setDesktopSidebarOpen(true);
            }}
            className="rounded-md p-2 text-[#1a1a2e] hover:bg-[#f5f5f5]"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link to="/" className="flex items-center gap-0 focus:outline-none">
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
        </div>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
