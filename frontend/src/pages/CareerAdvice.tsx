import { useState } from 'react';
import { Clock, User, ArrowRight } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

type Category = 'All' | 'Interview Tips' | 'Resume' | 'Salary' | 'Career Growth' | 'Remote Work';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  category: Exclude<Category, 'All'>;
  author: string;
  readTime: string;
  date: string;
  thumbnail: string;
  featured?: boolean;
}

const ARTICLES: Article[] = [
  {
    id: '1',
    title: '10 Most Common Interview Questions and How to Answer Them',
    excerpt: 'Ace your next interview with these proven strategies for the most frequently asked questions by top companies in India.',
    category: 'Interview Tips',
    author: 'Priya Sharma',
    readTime: '8 min read',
    date: 'May 2, 2026',
    thumbnail: 'https://images.unsplash.com/photo-1573497620053-ea5300f94f21?w=400&h=250&fit=crop',
    featured: true,
  },
  {
    id: '2',
    title: 'How to Write a Resume That Gets You Shortlisted',
    excerpt: 'A step-by-step guide to crafting a resume that stands out to recruiters and passes ATS systems.',
    category: 'Resume',
    author: 'Rahul Verma',
    readTime: '6 min read',
    date: 'Apr 28, 2026',
    thumbnail: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=250&fit=crop',
    featured: true,
  },
  {
    id: '3',
    title: 'How to Negotiate Your Salary Like a Pro',
    excerpt: 'Learn the art of salary negotiation with data-backed tactics that help you earn what you deserve.',
    category: 'Salary',
    author: 'Neha Kapoor',
    readTime: '7 min read',
    date: 'Apr 20, 2026',
    thumbnail: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&h=250&fit=crop',
  },
  {
    id: '4',
    title: 'From Junior to Senior: Accelerating Your Career Growth',
    excerpt: 'Practical steps to fast-track your career progression in tech, finance, and other industries.',
    category: 'Career Growth',
    author: 'Arjun Nair',
    readTime: '10 min read',
    date: 'Apr 15, 2026',
    thumbnail: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&h=250&fit=crop',
  },
  {
    id: '5',
    title: 'The Ultimate Guide to Remote Work in 2026',
    excerpt: 'Everything you need to know about finding, securing, and excelling in remote positions.',
    category: 'Remote Work',
    author: 'Meera Joshi',
    readTime: '9 min read',
    date: 'Apr 10, 2026',
    thumbnail: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400&h=250&fit=crop',
  },
  {
    id: '6',
    title: '5 Red Flags to Watch Out for in Job Interviews',
    excerpt: 'Protect yourself from toxic workplaces by recognizing these warning signs during your interview.',
    category: 'Interview Tips',
    author: 'Priya Sharma',
    readTime: '5 min read',
    date: 'Apr 5, 2026',
    thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=250&fit=crop',
  },
  {
    id: '7',
    title: 'ATS-Proof Your Resume: The Complete Guide',
    excerpt: 'Most resumes never reach human eyes. Here is how to beat the robots and land the interview.',
    category: 'Resume',
    author: 'Rahul Verma',
    readTime: '8 min read',
    date: 'Mar 28, 2026',
    thumbnail: 'https://images.unsplash.com/photo-1456406644174-8ddd4cd52a06?w=400&h=250&fit=crop',
  },
  {
    id: '8',
    title: 'Average Tech Salaries in India for 2026',
    excerpt: 'Comprehensive salary data across software engineering, product, data science and more.',
    category: 'Salary',
    author: 'Vikram Singh',
    readTime: '6 min read',
    date: 'Mar 22, 2026',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop',
  },
  {
    id: '9',
    title: 'Building a Personal Brand on LinkedIn That Attracts Recruiters',
    excerpt: 'Optimize your LinkedIn profile and content strategy to get headhunted for your dream role.',
    category: 'Career Growth',
    author: 'Anita Bose',
    readTime: '7 min read',
    date: 'Mar 15, 2026',
    thumbnail: 'https://images.unsplash.com/photo-1611944212129-29977ae1398c?w=400&h=250&fit=crop',
  },
];

const CATEGORIES: Category[] = ['All', 'Interview Tips', 'Resume', 'Salary', 'Career Growth', 'Remote Work'];

const CATEGORY_COLORS: Record<Exclude<Category, 'All'>, string> = {
  'Interview Tips': 'bg-blue-100 text-blue-700',
  'Resume': 'bg-green-100 text-green-700',
  'Salary': 'bg-yellow-100 text-yellow-700',
  'Career Growth': 'bg-blue-100 text-blue-700',
  'Remote Work': 'bg-teal-100 text-teal-700',
};

export default function CareerAdvice() {
  const [activeCategory, setActiveCategory] = useState<Category>('All');

  const filtered = activeCategory === 'All'
    ? ARTICLES
    : ARTICLES.filter((a) => a.category === activeCategory);

  const featured = ARTICLES.filter((a) => a.featured);
  const nonFeatured = filtered.filter((a) => !a.featured || activeCategory !== 'All');
  const displayedArticles = activeCategory === 'All' ? nonFeatured : filtered;

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f5]">
      <Navbar />

      {/* Hero */}
      <div className="bg-[#1a1a2e] pt-24 pb-12 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3">
            Career <span className="text-[#2563eb]">Advice</span>
          </h1>
          <p className="text-gray-300 text-lg">Expert tips, guides and insights to help you land your dream job</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-10">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                activeCategory === cat
                  ? 'bg-[#2563eb] text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-teal-300 hover:text-teal-500'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Featured Articles (only on All tab) */}
        {activeCategory === 'All' && featured.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-bold text-[#1a1a2e] mb-5">Featured</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featured.map((article) => (
                <div
                  key={article.id}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md hover:border-teal-300 transition-all cursor-pointer group"
                >
                  <div className="h-48 overflow-hidden">
                    <img
                      src={article.thumbnail}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x250/f5f5f5/1a1a2e?text=Article';
                      }}
                    />
                  </div>
                  <div className="p-5">
                    <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full mb-3 ${CATEGORY_COLORS[article.category]}`}>
                      {article.category}
                    </span>
                    <h3 className="font-bold text-[#1a1a2e] text-lg leading-snug mb-2 group-hover:text-[#2563eb] transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-2">{article.excerpt}</p>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> {article.author}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {article.readTime}</span>
                      </div>
                      <span>{article.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Articles Grid */}
        <div>
          {activeCategory !== 'All' && (
            <h2 className="text-xl font-bold text-[#1a1a2e] mb-5">{activeCategory}</h2>
          )}
          {displayedArticles.length === 0 ? (
            <p className="text-center text-gray-500 py-12">No articles in this category yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {displayedArticles.map((article) => (
                <div
                  key={article.id}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md hover:border-teal-300 transition-all cursor-pointer group"
                >
                  <div className="h-36 overflow-hidden">
                    <img
                      src={article.thumbnail}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200/f5f5f5/1a1a2e?text=Article';
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-2 ${CATEGORY_COLORS[article.category]}`}>
                      {article.category}
                    </span>
                    <h3 className="font-semibold text-[#1a1a2e] text-sm leading-snug mb-2 group-hover:text-[#2563eb] transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2">{article.excerpt}</p>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {article.readTime}</span>
                      <span className="flex items-center gap-1 text-[#2563eb] font-medium">
                        Read <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Newsletter CTA */}
        <div className="mt-16 bg-[#1a1a2e] rounded-2xl p-8 md:p-10 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Get Career Tips Delivered to Your Inbox</h2>
          <p className="text-gray-400 mb-6 text-sm">Weekly insights, job market trends, and expert advice — free forever.</p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-sm text-gray-900 bg-white outline-none focus:ring-2 focus:ring-[#2563eb]"
            />
            <button className="bg-[#2563eb] hover:bg-teal-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors text-sm whitespace-nowrap">
              Subscribe Free
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
