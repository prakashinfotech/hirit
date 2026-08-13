import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Phone,
  Mail,
  Download,
  ChevronDown,
} from 'lucide-react';

interface AccordionItem {
  label: string;
  hasChevron: boolean;
  links?: { label: string; to: string }[];
}

const ACCORDION_ITEMS: AccordionItem[] = [
  {
    label: 'Job Categories',
    hasChevron: true,
    links: [
      { label: 'IT Jobs', to: '/jobs?category=IT' },
      { label: 'Banking Jobs', to: '/jobs?category=Banking' },
      { label: 'Sales Jobs', to: '/jobs?category=Sales' },
      { label: 'HR Jobs', to: '/jobs?category=HR' },
      { label: 'Marketing Jobs', to: '/jobs?category=Marketing' },
    ],
  },
  {
    label: 'Employers',
    hasChevron: true,
    links: [
      { label: 'Post a Job', to: '/employer/post-job' },
      { label: 'My Job Listings', to: '/employer/jobs' },
      { label: 'View Applicants', to: '/employer/dashboard' },
    ],
  },
  {
    label: 'Job Seekers',
    hasChevron: true,
    links: [
      { label: 'Search Jobs', to: '/jobs' },
      { label: 'Job Alerts', to: '/dashboard/alerts' },
      { label: 'Saved Jobs', to: '/dashboard/saved' },
      { label: 'Applied Jobs', to: '/dashboard/applied' },
      { label: 'Resume Manager', to: '/dashboard/resume' },
    ],
  },
  {
    label: 'Career Advice',
    hasChevron: false,
  },
  {
    label: 'Company Info',
    hasChevron: true,
    links: [
      { label: 'About Hirit', to: '/about' },
      { label: 'Press & Media', to: '/press' },
      { label: 'Careers at Hirit', to: '/careers' },
      { label: 'Contact Us', to: '/contact' },
    ],
  },
  {
    label: 'IT Jobs',
    hasChevron: true,
    links: [
      { label: 'Python Developer', to: '/jobs?category=Python+Developer' },
      { label: 'React Developer', to: '/jobs?category=React+Developer' },
      { label: 'Java Developer', to: '/jobs?category=Java+Developer' },
      { label: 'DevOps', to: '/jobs?category=DevOps' },
      { label: 'Data Science', to: '/jobs?category=Data+Science' },
    ],
  },
  {
    label: 'Non IT Jobs',
    hasChevron: true,
    links: [
      { label: 'Accounting Jobs', to: '/jobs?category=Accounting' },
      { label: 'Sales Jobs', to: '/jobs?category=Sales' },
      { label: 'HR Jobs', to: '/jobs?category=HR' },
      { label: 'Banking Jobs', to: '/jobs?category=Banking' },
      { label: 'Customer Support', to: '/jobs?category=Customer+Support' },
    ],
  },
];

// SVG social icons inline — lucide-react doesn't include brand icons
const SocialIcons = {
  Facebook: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  ),
  Twitter: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  ),
  LinkedIn: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  ),
  Instagram: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
    </svg>
  ),
  YouTube: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  ),
};

const SOCIAL_LINKS = [
  { Icon: SocialIcons.Facebook, href: 'https://facebook.com/Hirit', label: 'Facebook' },
  { Icon: SocialIcons.Twitter, href: 'https://twitter.com/Hirit', label: 'Twitter' },
  { Icon: SocialIcons.LinkedIn, href: 'https://linkedin.com/company/Hirit', label: 'LinkedIn' },
  { Icon: SocialIcons.Instagram, href: 'https://instagram.com/Hirit', label: 'Instagram' },
  { Icon: SocialIcons.YouTube, href: 'https://youtube.com/Hirit', label: 'YouTube' },
];

function AccordionSection({ item }: { item: AccordionItem }) {
  const [open, setOpen] = useState(false);

  if (!item.hasChevron) {
    return (
      <Link
        to="/career-advice"
        className="block border-b border-white/10 py-3.5 text-sm font-medium text-gray-300 hover:text-white"
      >
        {item.label}
      </Link>
    );
  }

  return (
    <div className="border-b border-white/10">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between py-3.5 text-sm font-medium text-gray-300 hover:text-white"
      >
        <span>{item.label}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-gray-500 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      {open && item.links && (
        <div className="pb-3 pl-2 flex flex-col gap-1.5">
          {item.links.map(({ label, to }) => (
            <Link
              key={label}
              to={to}
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="bg-[#1a1a2e] text-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 lg:flex-row">
          {/* LEFT COLUMN — Responsive Mobile Accordion & Desktop Columns */}
          <div className="flex-1 lg:max-w-[62%]">
            {/* Mobile View: Accordion */}
            <div className="lg:hidden">
              {ACCORDION_ITEMS.map((item) => (
                <AccordionSection key={item.label} item={item} />
              ))}
            </div>

            {/* Desktop View: Grid Columns */}
            <div className="hidden lg:grid lg:grid-cols-4 gap-x-8 gap-y-6">
              {/* Col 1 */}
              <div>
                <h3 className="text-sm font-bold text-gray-200 mb-4">Job Seekers</h3>
                <ul className="flex flex-col gap-2.5">
                  <li><Link to="/jobs" className="text-xs text-gray-400 hover:text-white transition-colors">Search Jobs</Link></li>
                  <li><Link to="/dashboard/alerts" className="text-xs text-gray-400 hover:text-white transition-colors">Job Alerts</Link></li>
                  <li><Link to="/dashboard/saved" className="text-xs text-gray-400 hover:text-white transition-colors">Saved Jobs</Link></li>
                  <li><Link to="/dashboard/applied" className="text-xs text-gray-400 hover:text-white transition-colors">Applied Jobs</Link></li>
                  <li><Link to="/dashboard/resume" className="text-xs text-gray-400 hover:text-white transition-colors">Resume Manager</Link></li>
                  <li><Link to="/career-advice" className="text-xs text-gray-400 hover:text-white transition-colors">Career Advice</Link></li>
                </ul>
              </div>

              {/* Col 2 */}
              <div>
                <h3 className="text-sm font-bold text-gray-200 mb-4">Employers</h3>
                <ul className="flex flex-col gap-2.5">
                  <li><Link to="/employer/post-job" className="text-xs text-gray-400 hover:text-white transition-colors">Post a Job</Link></li>
                  <li><Link to="/employer/jobs" className="text-xs text-gray-400 hover:text-white transition-colors">My Job Listings</Link></li>
                  <li><Link to="/employer/dashboard" className="text-xs text-gray-400 hover:text-white transition-colors">View Applicants</Link></li>
                </ul>
              </div>

              {/* Col 3 */}
              <div>
                <h3 className="text-sm font-bold text-gray-200 mb-4">IT Jobs</h3>
                <ul className="flex flex-col gap-2.5">
                  <li><Link to="/jobs?category=Python+Developer" className="text-xs text-gray-400 hover:text-white transition-colors">Python Developer</Link></li>
                  <li><Link to="/jobs?category=React+Developer" className="text-xs text-gray-400 hover:text-white transition-colors">React Developer</Link></li>
                  <li><Link to="/jobs?category=Java+Developer" className="text-xs text-gray-400 hover:text-white transition-colors">Java Developer</Link></li>
                  <li><Link to="/jobs?category=DevOps" className="text-xs text-gray-400 hover:text-white transition-colors">DevOps</Link></li>
                  <li><Link to="/jobs?category=Data+Science" className="text-xs text-gray-400 hover:text-white transition-colors">Data Science</Link></li>
                </ul>
              </div>

              {/* Col 4 */}
              <div>
                <h3 className="text-sm font-bold text-gray-200 mb-4">Company Info</h3>
                <ul className="flex flex-col gap-2.5">
                  <li><Link to="/about" className="text-xs text-gray-400 hover:text-white transition-colors">About Hirit</Link></li>
                  <li><Link to="/press" className="text-xs text-gray-400 hover:text-white transition-colors">Press & Media</Link></li>
                  <li><Link to="/careers" className="text-xs text-gray-400 hover:text-white transition-colors">Careers at Hirit</Link></li>
                  <li><Link to="/contact" className="text-xs text-gray-400 hover:text-white transition-colors">Contact Us</Link></li>
                </ul>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (~40%) */}
          <div className="w-full lg:w-[38%] flex flex-col gap-0">
            {/* Selected Country */}
            <div className="pb-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Selected Country
              </p>
              <select className="rounded-md border border-white/20 bg-[#1a1a2e] px-3 py-2 text-sm text-gray-300 outline-none focus:border-[#2563eb]">
                <option value="india">India</option>
                <option value="uae">UAE</option>
                <option value="singapore">Singapore</option>
                <option value="gulf">Gulf</option>
              </select>
            </div>

            <div className="border-t border-white/10 pt-4 pb-4">
              <div className="flex items-start gap-2">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-300">
                    Toll No: <span className="font-medium">+91 80 6985 7811</span>
                    {' | '}
                    Toll Free No: <span className="font-medium">1800-419-6666</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 pt-4 pb-4">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-gray-400" />
                <a
                  href="mailto:info@Hirit.in"
                  className="text-xs text-gray-300 hover:text-white transition-colors"
                >
                  info@Hirit.in
                </a>
              </div>
            </div>

            <div className="border-t border-white/10 pt-4 pb-4">
              <div className="flex items-center gap-2 mb-3">
                <Download className="h-4 w-4 shrink-0 text-gray-400" />
                <span className="text-xs font-medium text-gray-300">Download The App</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <a
                  href="#"
                  aria-label="Download on the App Store"
                  className="flex items-center gap-1.5 rounded-md border border-white/20 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:border-[#2563eb] hover:text-[#2563eb]"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  App Store
                </a>
                <a
                  href="#"
                  aria-label="Get it on Google Play"
                  className="flex items-center gap-1.5 rounded-md border border-white/20 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:border-[#2563eb] hover:text-[#2563eb]"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
                    <path d="M3.18 23.76c.3.17.64.24.99.19l12.6-7.26-2.75-2.75-10.84 9.82zM.5 1.1C.19 1.42 0 1.9 0 2.52v18.96c0 .62.19 1.1.5 1.42l.08.07L10.67 12.5v-.23L.58 1.03.5 1.1zM20.55 10.3L17.3 8.44l-3.08 3.08 3.08 3.08 3.27-1.88c.93-.54.93-1.42 0-1.96l.01.01-.03.53zM4.17.19L16.77 7.44l-2.75 2.75L3.18.36C3.52.14 3.88.05 4.17.19z"/>
                  </svg>
                  Google Play
                </a>
              </div>
            </div>

            <div className="border-t border-white/10 pt-4">
              <p className="mb-3 text-xs font-medium text-gray-300">Stay Connected</p>
              <div className="flex gap-2">
                {SOCIAL_LINKS.map(({ Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-gray-400 transition-all hover:border-[#2563eb] hover:bg-[#2563eb]/20 hover:text-white"
                  >
                    <Icon />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10 bg-[#12122a]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-4 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 sm:justify-start text-[11px] text-gray-500">
            <Link to="/security" className="hover:text-gray-300 transition-colors">Security &amp; Fraud</Link>
            <span>|</span>
            <Link to="/privacy-policy" className="hover:text-gray-300 transition-colors">Privacy Notice</Link>
            <span>|</span>
            <Link to="/terms" className="hover:text-gray-300 transition-colors">Terms of Use</Link>
            <span>|</span>
            <Link to="/beware" className="hover:text-gray-300 transition-colors">Beware of Fraudsters</Link>
            <span>|</span>
            <Link to="/complaints" className="hover:text-gray-300 transition-colors">Be Safe Complaints</Link>
            <span>|</span>
          </div>
          <p className="text-[11px] text-gray-500 whitespace-nowrap">
            &copy; 2026 Hirit | All rights Reserved
          </p>
        </div>
      </div>
    </footer>
  );
}
