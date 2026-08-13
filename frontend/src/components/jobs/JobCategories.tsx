import { Link } from 'react-router-dom';
import {
  Banknote,
  Home,
  Users,
  TrendingUp,
  Calculator,
  Headphones,
  CalendarDays,
  Monitor,
  Database,
  Server,
  Palette,
  Megaphone,
  BarChart2,
  Code2,
  Coffee,
  Layers,
  Settings,
  Brain,
} from 'lucide-react';

interface Category {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  slug: string;
}

const CATEGORIES: Category[] = [
  { name: 'Banking', icon: Banknote, slug: 'Banking' },
  { name: 'Work From Home', icon: Home, slug: 'Work+From+Home' },
  { name: 'HR', icon: Users, slug: 'HR' },
  { name: 'Sales', icon: TrendingUp, slug: 'Sales' },
  { name: 'Accounting', icon: Calculator, slug: 'Accounting' },
  { name: 'Customer Support', icon: Headphones, slug: 'Customer+Support' },
  { name: 'Event Management', icon: CalendarDays, slug: 'Event+Management' },
  { name: 'IT', icon: Monitor, slug: 'IT' },
  { name: 'SQL', icon: Database, slug: 'SQL' },
  { name: 'Oracle', icon: Server, slug: 'Oracle' },
  { name: 'Graphic Design', icon: Palette, slug: 'Graphic+Design' },
  { name: 'Digital Marketing', icon: Megaphone, slug: 'Digital+Marketing' },
  { name: 'Data Science', icon: BarChart2, slug: 'Data+Science' },
  { name: 'Python Developer', icon: Code2, slug: 'Python+Developer' },
  { name: 'Java Developer', icon: Coffee, slug: 'Java+Developer' },
  { name: 'React Developer', icon: Layers, slug: 'React+Developer' },
  { name: 'DevOps', icon: Settings, slug: 'DevOps' },
  { name: 'Machine Learning', icon: Brain, slug: 'Machine+Learning' },
];

export default function JobCategories() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {CATEGORIES.map(({ name, icon: Icon, slug }) => (
        <Link
          key={name}
          to={`/jobs?category=${slug}`}
          className="group flex items-center gap-2.5 rounded-lg border border-[#e5e7eb] bg-white px-3 py-3 text-sm font-medium text-[#333333] transition-all duration-200 hover:border-[#2563eb] hover:text-[#2563eb] hover:shadow-sm"
        >
          <Icon className="h-4 w-4 shrink-0 text-[#2563eb] transition-colors group-hover:text-[#2563eb]" />
          <span className="leading-tight">{name}</span>
        </Link>
      ))}
    </div>
  );
}
