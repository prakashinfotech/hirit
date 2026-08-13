import { Code2, Palette, Megaphone, BarChart2, Briefcase, Database } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const TRACKS = [
  {
    icon: Code2,
    title: 'Programming & Development',
    courses: ['Full Stack Web Development', 'Python for Data Science', 'React & TypeScript Mastery'],
    color: 'bg-blue-50 text-blue-600',
    learners: '2.4L learners',
  },
  {
    icon: Database,
    title: 'Data Science & AI',
    courses: ['Machine Learning with Python', 'SQL & Database Design', 'Power BI & Tableau'],
    color: 'bg-blue-50 text-[#2563eb]',
    learners: '1.8L learners',
  },
  {
    icon: Palette,
    title: 'Design & UI/UX',
    courses: ['Figma for Beginners', 'UI/UX Design Principles', 'Adobe XD & Prototyping'],
    color: 'bg-pink-50 text-pink-600',
    learners: '95K learners',
  },
  {
    icon: Megaphone,
    title: 'Digital Marketing',
    courses: ['SEO & Content Strategy', 'Social Media Marketing', 'Google Ads & Analytics'],
    color: 'bg-teal-50 text-[#2563eb]',
    learners: '1.2L learners',
  },
  {
    icon: Briefcase,
    title: 'Business & Management',
    courses: ['Project Management (PMP)', 'Agile & Scrum', 'Business Communication'],
    color: 'bg-green-50 text-green-600',
    learners: '88K learners',
  },
  {
    icon: BarChart2,
    title: 'Finance & Accounting',
    courses: ['Financial Modelling', 'Tally ERP & GST', 'Investment Banking Basics'],
    color: 'bg-yellow-50 text-yellow-600',
    learners: '72K learners',
  },
];

const FEATURED = [
  { title: 'Full Stack Web Development Bootcamp', duration: '6 months', level: 'Beginner', rating: '4.8', students: '12,400' },
  { title: 'Machine Learning A–Z with Python', duration: '3 months', level: 'Intermediate', rating: '4.7', students: '9,800' },
  { title: 'UI/UX Design: Zero to Job-Ready', duration: '2 months', level: 'Beginner', rating: '4.9', students: '7,200' },
];

export default function Learn() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f5]">
      <Navbar />

      {/* Hero */}
      <div className="bg-white border-b border-[#e0e0e0] pt-[60px]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center">
          <span className="inline-block rounded-full bg-blue-50 px-4 py-1 text-xs font-semibold text-blue-600 mb-4">
            Learn & Upskill
          </span>
          <h1 className="text-4xl font-extrabold text-[#1a1a2e] mb-4">
            Skills That Get You Hired
          </h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Industry-relevant courses taught by top practitioners. Learn at your own pace and land your next role faster.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-12">

        {/* Featured Courses */}
        <div>
          <h2 className="text-xl font-bold text-[#1a1a2e] mb-6">Featured Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {FEATURED.map((c) => (
              <div
                key={c.title}
                className="bg-white rounded-xl border border-[#e0e0e0] overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                onClick={() => alert('Coming soon!')}
              >
                <div className="h-32 bg-gradient-to-br from-[#2563eb] to-[#2563eb] flex items-center justify-center">
                  <span className="text-white text-4xl font-black opacity-20">f</span>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-[#1a1a2e] text-sm mb-3 leading-snug">{c.title}</h3>
                  <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-3">
                    <span className="rounded-full bg-[#f5f5f5] px-2 py-0.5">{c.duration}</span>
                    <span className="rounded-full bg-[#f5f5f5] px-2 py-0.5">{c.level}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>⭐ {c.rating} · {c.students} students</span>
                  </div>
                  <button
                    type="button"
                    className="cursor-pointer mt-3 w-full rounded-lg bg-[#2563eb] py-2 text-xs font-semibold text-white hover:opacity-90 transition-opacity"
                  >
                    Enrol Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Learning Tracks */}
        <div>
          <h2 className="text-xl font-bold text-[#1a1a2e] mb-6">Browse by Track</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {TRACKS.map((t) => (
              <div
                key={t.title}
                className="bg-white rounded-xl border border-[#e0e0e0] p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                onClick={() => alert('Coming soon!')}
              >
                <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl ${t.color} mb-3`}>
                  <t.icon className="w-5 h-5" />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-[#1a1a2e] text-sm">{t.title}</h3>
                  <span className="text-xs text-gray-400">{t.learners}</span>
                </div>
                <ul className="space-y-1">
                  {t.courses.map((course) => (
                    <li key={course} className="text-xs text-gray-500 flex items-start gap-1.5">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-gray-300 shrink-0" />
                      {course}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

      </div>

      <Footer />
    </div>
  );
}
