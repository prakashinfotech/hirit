import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Building2, Users, ExternalLink, Globe, Star, MapPin, CheckCircle } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import JobCard from '../components/jobs/JobCard';
import { getCompanyById, getCompanyJobs } from '../api/companies';
import { getInitials } from '../lib/utils';

// Static review data since there's no reviews API endpoint
const STATIC_REVIEWS = [
  {
    id: '1',
    author: 'Software Engineer',
    rating: 4,
    title: 'Great work culture and growth opportunities',
    body: 'The team is collaborative and the management supports professional development. Work-life balance is good for most teams.',
    date: '2024-03-15',
    pros: 'Good pay, flexible hours, learning opportunities',
    cons: 'Some processes could be streamlined',
  },
  {
    id: '2',
    author: 'Product Manager',
    rating: 5,
    title: 'Excellent place to grow your career',
    body: 'Amazing culture with brilliant colleagues. The company genuinely cares about employee wellbeing.',
    date: '2024-02-20',
    pros: 'Great benefits, smart team, good management',
    cons: 'Sometimes fast-paced but that keeps things interesting',
  },
  {
    id: '3',
    author: 'Data Analyst',
    rating: 3,
    title: 'Decent company with room for improvement',
    body: 'The work is interesting and pays well, but there could be better communication between departments.',
    date: '2024-01-10',
    pros: 'Competitive salary, interesting projects',
    cons: 'Inter-team communication needs work',
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`}
        />
      ))}
    </div>
  );
}

export default function CompanyProfile() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'jobs' | 'reviews' | 'about'>('jobs');

  const { data: company, isLoading: companyLoading } = useQuery({
    queryKey: ['company', id],
    queryFn: () => getCompanyById(id!),
    enabled: !!id,
  });

  const { data: jobsData, isLoading: jobsLoading } = useQuery({
    queryKey: ['company-jobs', id],
    queryFn: () => getCompanyJobs(id!, { is_active: true, page_size: 20 }),
    enabled: !!id && activeTab === 'jobs',
    staleTime: 2 * 60 * 1000,
  });

  const jobs = jobsData?.results ?? [];
  const avgRating = STATIC_REVIEWS.reduce((acc, r) => acc + r.rating, 0) / STATIC_REVIEWS.length;

  if (companyLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f5f5f5]">
        <Navbar />
        <div className="pt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full animate-pulse">
          <div className="h-32 bg-gray-200 rounded-xl mb-5" />
          <div className="h-10 bg-gray-100 rounded w-1/3" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f5f5f5]">
        <Navbar />
        <div className="pt-20 flex-1 flex flex-col items-center justify-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">Company not found</h2>
          <Link to="/jobs" className="text-[#2563eb] hover:underline">Browse jobs</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const tabs = [
    { key: 'jobs' as const, label: `Jobs (${jobsData?.count ?? 0})` },
    { key: 'reviews' as const, label: `Reviews (${STATIC_REVIEWS.length})` },
    { key: 'about' as const, label: 'About' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f5]">
      <Navbar />

      <div className="pt-20">
        {/* Company Header */}
        <div className="bg-[#1a1a2e] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center text-[#1a1a2e] font-extrabold text-2xl overflow-hidden flex-shrink-0">
                {company.logo_url ? (
                  <img src={company.logo_url} alt={company.name} className="w-full h-full object-contain" />
                ) : (
                  getInitials(company.name)
                )}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-1">
                  <h1 className="text-2xl md:text-3xl font-extrabold">{company.name}</h1>
                  {company.is_verified && (
                    <span className="inline-flex items-center gap-1 text-xs text-blue-300 bg-blue-900/40 border border-blue-700/40 px-2.5 py-0.5 rounded-full">
                      <CheckCircle className="w-3.5 h-3.5" /> Verified
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
                  {company.industry && (
                    <span className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5" /> {company.industry}
                    </span>
                  )}
                  {company.company_size && (
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" /> {company.company_size} employees
                    </span>
                  )}
                  {company.headquarters && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" /> {company.headquarters}
                    </span>
                  )}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <StarRating rating={Math.round(avgRating)} />
                    <span className="text-sm font-semibold">{avgRating.toFixed(1)}</span>
                    <span className="text-xs text-gray-400">({STATIC_REVIEWS.length} reviews)</span>
                  </div>
                  {company.website && (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm text-teal-400 hover:text-teal-300 transition-colors"
                    >
                      <Globe className="w-4 h-4" /> Website <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {company.linkedin_url && (
                    <a href={company.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                      <Globe className="w-5 h-5" />
                    </a>
                  )}
                  {company.twitter_url && (
                    <a href={company.twitter_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                      <Globe className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Tabs */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
            <div className="flex border-b border-gray-200">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-6 py-4 text-sm font-semibold transition-colors ${
                    activeTab === tab.key
                      ? 'border-b-2 border-[#2563eb] text-[#2563eb]'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-6">
              {/* Jobs Tab */}
              {activeTab === 'jobs' && (
                <div>
                  {jobsLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[1, 2, 3, 4].map((i) => <div key={i} className="h-40 bg-gray-100 rounded-xl animate-pulse" />)}
                    </div>
                  ) : jobs.length === 0 ? (
                    <p className="text-center text-gray-500 py-10">No active jobs from this company.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {jobs.map((job) => <JobCard key={job.id} job={job} />)}
                    </div>
                  )}
                </div>
              )}

              {/* Reviews Tab */}
              {activeTab === 'reviews' && (
                <div>
                  {/* Rating Summary */}
                  <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 pb-6 border-b border-gray-100">
                    <div className="text-center">
                      <div className="text-5xl font-extrabold text-[#1a1a2e]">{avgRating.toFixed(1)}</div>
                      <StarRating rating={Math.round(avgRating)} />
                      <p className="text-xs text-gray-500 mt-1">{STATIC_REVIEWS.length} reviews</p>
                    </div>
                    <div className="flex-1 w-full">
                      {[5, 4, 3, 2, 1].map((star) => {
                        const count = STATIC_REVIEWS.filter((r) => r.rating === star).length;
                        const pct = (count / STATIC_REVIEWS.length) * 100;
                        return (
                          <div key={star} className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-gray-500 w-3">{star}</span>
                            <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-xs text-gray-500 w-4">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-5">
                    {STATIC_REVIEWS.map((review) => (
                      <div key={review.id} className="border border-gray-100 rounded-xl p-5">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <StarRating rating={review.rating} />
                            <h4 className="font-semibold text-gray-900 mt-1">{review.title}</h4>
                            <p className="text-xs text-gray-500 mt-0.5">{review.author}</p>
                          </div>
                          <span className="text-xs text-gray-400">{review.date}</span>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed mb-3">{review.body}</p>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="bg-green-50 rounded-lg p-2.5">
                            <p className="font-semibold text-green-700 mb-1">Pros</p>
                            <p className="text-green-600">{review.pros}</p>
                          </div>
                          <div className="bg-red-50 rounded-lg p-2.5">
                            <p className="font-semibold text-red-700 mb-1">Cons</p>
                            <p className="text-red-600">{review.cons}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* About Tab */}
              {activeTab === 'about' && (
                <div className="space-y-6">
                  {company.description && (
                    <div>
                      <h3 className="font-bold text-[#1a1a2e] text-base mb-3">About {company.name}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{company.description}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    {company.founded_year && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Founded</p>
                        <p className="font-bold text-[#1a1a2e]">{company.founded_year}</p>
                      </div>
                    )}
                    {company.company_size && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Company Size</p>
                        <p className="font-bold text-[#1a1a2e]">{company.company_size} employees</p>
                      </div>
                    )}
                    {company.industry && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Industry</p>
                        <p className="font-bold text-[#1a1a2e]">{company.industry}</p>
                      </div>
                    )}
                    {company.headquarters && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Headquarters</p>
                        <p className="font-bold text-[#1a1a2e]">{company.headquarters}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {company.website && (
                      <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-[#2563eb] border border-teal-200 bg-teal-50 rounded-lg px-4 py-2 hover:bg-teal-100 transition-colors">
                        <Globe className="w-4 h-4" /> Website
                      </a>
                    )}
                    {company.linkedin_url && (
                      <a href={company.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-600 border border-blue-200 bg-blue-50 rounded-lg px-4 py-2 hover:bg-blue-100 transition-colors">
                        <Globe className="w-4 h-4" /> LinkedIn
                      </a>
                    )}
                    {company.twitter_url && (
                      <a href={company.twitter_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-sky-600 border border-sky-200 bg-sky-50 rounded-lg px-4 py-2 hover:bg-sky-100 transition-colors">
                        <Globe className="w-4 h-4" /> Twitter
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
