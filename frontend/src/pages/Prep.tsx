import { Brain, Code2, BarChart2, Building2, Zap, BookOpen } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const TOPICS = [
  {
    icon: Brain,
    title: 'Behavioural & HR',
    questions: ['Tell me about yourself', 'Where do you see yourself in 5 years?', 'What is your greatest weakness?'],
    color: 'bg-blue-50 text-[#2563eb]',
    count: '120+ questions',
  },
  {
    icon: Code2,
    title: 'Technical & Coding',
    questions: ['Explain OOP concepts', 'What is time complexity?', 'Reverse a linked list'],
    color: 'bg-blue-50 text-blue-600',
    count: '200+ problems',
  },
  {
    icon: BarChart2,
    title: 'Aptitude & Reasoning',
    questions: ['Number series', 'Logical deduction', 'Data interpretation'],
    color: 'bg-green-50 text-green-600',
    count: '300+ questions',
  },
  {
    icon: Building2,
    title: 'Company-Specific Prep',
    questions: ['TCS, Infosys, Wipro patterns', 'Google, Amazon, Flipkart', 'Startup interview rounds'],
    color: 'bg-teal-50 text-[#2563eb]',
    count: '50+ companies',
  },
  {
    icon: Zap,
    title: 'Mock Interviews',
    questions: ['Full interview simulation', 'Instant AI feedback', 'Video recording & review'],
    color: 'bg-yellow-50 text-yellow-600',
    count: 'Live sessions',
  },
  {
    icon: BookOpen,
    title: 'Case Studies',
    questions: ['Consulting case frameworks', 'Product management cases', 'Business problem solving'],
    color: 'bg-pink-50 text-pink-600',
    count: '80+ cases',
  },
];

const TIPS = [
  { step: '01', title: 'Research the Company', body: 'Spend 30 minutes on the company website, recent news, and their products before any interview.' },
  { step: '02', title: 'Use the STAR Method', body: 'Structure behavioural answers: Situation, Task, Action, Result. Keeps answers clear and concise.' },
  { step: '03', title: 'Practice Out Loud', body: 'Reading answers isn\'t enough. Speak them out loud — in front of a mirror or record yourself.' },
  { step: '04', title: 'Ask Great Questions', body: 'Prepare 2–3 thoughtful questions for the interviewer. It shows genuine interest and curiosity.' },
];

export default function Prep() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f5]">
      <Navbar />

      {/* Hero */}
      <div className="bg-white border-b border-[#e0e0e0] pt-[60px]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center">
          <span className="inline-block rounded-full bg-blue-50 px-4 py-1 text-xs font-semibold text-[#2563eb] mb-4">
            Interview Prep
          </span>
          <h1 className="text-4xl font-extrabold text-[#1a1a2e] mb-4">
            Crack Every Interview with Confidence
          </h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Practice with 500+ curated questions, mock interviews, and company-specific prep kits.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-12">

        {/* Topic Cards */}
        <div>
          <h2 className="text-xl font-bold text-[#1a1a2e] mb-6">Prep by Category</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {TOPICS.map((t) => (
              <div
                key={t.title}
                className="bg-white rounded-xl border border-[#e0e0e0] p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                onClick={() => alert('Coming soon!')}
              >
                <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl ${t.color} mb-3`}>
                  <t.icon className="w-5 h-5" />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-[#1a1a2e]">{t.title}</h3>
                  <span className="text-xs text-gray-400">{t.count}</span>
                </div>
                <ul className="space-y-1">
                  {t.questions.map((q) => (
                    <li key={q} className="text-xs text-gray-500 flex items-start gap-1.5">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-gray-300 shrink-0" />
                      {q}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  className="cursor-pointer mt-4 w-full rounded-lg bg-[#2563eb] py-2 text-xs font-semibold text-white hover:opacity-90 transition-opacity"
                >
                  Start Practising
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div>
          <h2 className="text-xl font-bold text-[#1a1a2e] mb-6">Quick Interview Tips</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {TIPS.map((tip) => (
              <div key={tip.step} className="bg-white rounded-xl border border-[#e0e0e0] p-5 flex gap-4 shadow-sm">
                <span className="text-3xl font-black text-[#e0e0e0] shrink-0">{tip.step}</span>
                <div>
                  <h4 className="font-bold text-[#1a1a2e] mb-1">{tip.title}</h4>
                  <p className="text-sm text-gray-500">{tip.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <Footer />
    </div>
  );
}
