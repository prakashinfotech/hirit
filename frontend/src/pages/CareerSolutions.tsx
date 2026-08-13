import { Briefcase, FileText, MessageSquare, TrendingUp, Users, Award } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const SOLUTIONS = [
  {
    icon: FileText,
    title: 'Resume Writing',
    description: 'Get a professionally crafted resume that beats ATS filters and grabs recruiter attention. Our experts tailor every line to your target role.',
    badge: 'Most Popular',
    color: 'bg-teal-50 text-[#2563eb]',
  },
  {
    icon: Users,
    title: 'LinkedIn Profile Optimization',
    description: 'Turn your LinkedIn into a job magnet. We optimize headlines, summaries, and keywords so recruiters find you first.',
    badge: 'Top Rated',
    color: 'bg-blue-50 text-[#2563eb]',
  },
  {
    icon: MessageSquare,
    title: 'Interview Coaching',
    description: '1-on-1 mock interviews with industry experts. Get real feedback on your answers, body language, and confidence.',
    badge: null,
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: TrendingUp,
    title: 'Salary Negotiation',
    description: 'Stop leaving money on the table. Learn proven negotiation tactics backed by real market data for your role and location.',
    badge: null,
    color: 'bg-green-50 text-green-600',
  },
  {
    icon: Briefcase,
    title: 'Career Counselling',
    description: 'Confused about your next move? Our certified career counsellors help you map a clear, achievable path to your dream job.',
    badge: null,
    color: 'bg-yellow-50 text-yellow-600',
  },
  {
    icon: Award,
    title: 'Personal Branding',
    description: 'Build a standout personal brand across all platforms. From portfolio sites to GitHub profiles — we make you unforgettable.',
    badge: 'New',
    color: 'bg-pink-50 text-pink-600',
  },
];

export default function CareerSolutions() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f5]">
      <Navbar />

      {/* Hero */}
      <div className="bg-white border-b border-[#e0e0e0] pt-[60px]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center">
          <span className="inline-block rounded-full bg-teal-50 px-4 py-1 text-xs font-semibold text-[#2563eb] mb-4">
            Career Solutions
          </span>
          <h1 className="text-4xl font-extrabold text-[#1a1a2e] mb-4">
            Accelerate Your Career Growth
          </h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Expert-led services designed to help you land your dream job faster — from resume writing to salary negotiation.
          </p>
        </div>
      </div>

      {/* Cards */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SOLUTIONS.map((s) => (
            <div
              key={s.title}
              className="bg-white rounded-xl border border-[#e0e0e0] p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${s.color} mb-4`}>
                <s.icon className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-bold text-[#1a1a2e] text-lg">{s.title}</h3>
                {s.badge && (
                  <span className="rounded-full bg-teal-50 border border-teal-200 px-2 py-0.5 text-xs font-semibold text-[#2563eb]">
                    {s.badge}
                  </span>
                )}
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">{s.description}</p>
              <button
                type="button"
                className="cursor-pointer mt-5 w-full rounded-lg border border-[#2563eb] py-2 text-sm font-semibold text-[#2563eb] hover:bg-blue-50 transition-colors"
                onClick={() => alert('Coming soon!')}
              >
                Learn More
              </button>
            </div>
          ))}
        </div>

        {/* CTA banner */}
        <div className="mt-12 rounded-2xl bg-gradient-to-r from-[#2563eb] to-[#2563eb] p-8 text-center text-white">
          <h2 className="text-2xl font-extrabold mb-2">Not sure where to start?</h2>
          <p className="text-blue-100 mb-6">Talk to a career expert for free. No commitments.</p>
          <button
            type="button"
            className="cursor-pointer inline-block rounded-full bg-white px-8 py-3 text-sm font-bold text-[#2563eb] hover:bg-blue-50 transition-colors"
            onClick={() => alert('Coming soon!')}
          >
            Book a Free Consultation
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
