import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const schema = z.object({
  email: z.string().regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type FormData = z.infer<typeof schema>;

type Role = 'seeker' | 'employer';

const LEFT_BULLETS = [
  '800K+ active jobs',
  'Top companies hiring',
  'Instant job alerts',
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [role, setRole] = useState<Role>('seeker');
  const [showPassword, setShowPassword] = useState(false);

  const from = (location.state as { from?: string })?.from;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await login(data.email, data.password);
      toast.success('Welcome back!');
      if (from) {
        navigate(from, { replace: true });
      } else if (role === 'employer') {
        navigate('/employer/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err: any) {
      const msg = err?.message ?? err?.detail ?? 'Invalid credentials. Please try again.';
      toast.error(msg);
    }
  };

  const handleSocialLogin = (provider: string) => {
    toast(`${provider} login coming soon!`, { icon: 'ℹ️' });
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 flex-col justify-between p-12"
           style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' }}>
        {/* Logo */}
        <Link to="/" className="inline-flex items-center gap-1 select-none">
          <span className="text-3xl font-black text-white">hir</span>
          <span className="text-3xl font-black text-blue-200">it</span>
          <span className="text-sm font-bold text-blue-300 ml-0.5 mt-1">.in</span>
        </Link>

        {/* Hero text */}
        <div className="flex-1 flex flex-col justify-center">
          <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight mb-4">
            Welcome Back!
          </h1>
          <p className="text-blue-200 text-lg mb-10 leading-relaxed">
            Your dream job is just a login away
          </p>

          <ul className="space-y-4">
            {LEFT_BULLETS.map((item) => (
              <li key={item} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-blue-300 shrink-0" />
                <span className="text-blue-100 font-medium">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom decoration */}
        <p className="text-blue-400 text-sm">
          India's #1 job portal — trusted by millions
        </p>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-1">
              <span className="text-3xl font-black text-[#1a1a2e]">found</span>
              <span className="text-3xl font-black" style={{ color: '#2563eb' }}>it</span>
              <span className="text-sm font-bold text-gray-400 ml-0.5 mt-1">.in</span>
            </Link>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Sign In</h2>
            <p className="text-gray-500 mt-1.5 text-sm">
              New here?{' '}
              <Link to="/register" className="font-semibold text-[#2563eb] hover:underline">
                Create account
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  {...register('email')}
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className={`w-full border rounded-xl pl-10 pr-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all ${
                    errors.email
                      ? 'border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                      : 'border-gray-300 focus:border-[#2563eb] focus:ring-2 focus:ring-blue-100'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="text-sm font-semibold text-gray-700">Password</label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-[#2563eb] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  {...register('password')}
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className={`w-full border rounded-xl pl-10 pr-11 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all ${
                    errors.password
                      ? 'border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                      : 'border-gray-300 focus:border-[#2563eb] focus:ring-2 focus:ring-blue-100'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full cursor-pointer text-white font-semibold py-3.5 rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-md hover:shadow-lg hover:opacity-90"
              style={{ background: '#2563eb' }}
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">or continue with</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Social login */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleSocialLogin('Google')}
              className="flex items-center justify-center gap-2.5 border border-gray-300 rounded-xl py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Google</span>
            </button>
            <button
              type="button"
              onClick={() => handleSocialLogin('LinkedIn')}
              className="flex items-center justify-center gap-2.5 border border-gray-300 rounded-xl py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5 shrink-0 text-[#0077B5]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              <span>LinkedIn</span>
            </button>
          </div>

          {/* Employer sign-in link */}
          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={() => setRole(role === 'employer' ? 'seeker' : 'employer')}
              className="text-sm text-gray-500 hover:text-[#2563eb] transition-colors"
            >
              {role === 'employer' ? (
                <>Looking for a job?{' '}
                  <span className="font-semibold text-[#2563eb]">Sign in as Job Seeker</span>
                </>
              ) : (
                <>Hiring?{' '}
                  <span className="font-semibold text-[#2563eb]">Sign in as Employer</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
