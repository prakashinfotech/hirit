import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock, User, Phone, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import type { RegisterData } from '../types';

const schema = z
  .object({
    first_name: z.string().min(2, 'First name must be at least 2 characters'),
    last_name: z.string().min(1, 'Last name is required'),
    email: z.string().regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Please enter a valid email address'),
    phone: z.string().optional(),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain an uppercase letter')
      .regex(/\d/, 'Must contain a number'),
    password_confirm: z.string().min(1, 'Please confirm your password'),
    role: z.enum([UserRole.SEEKER, UserRole.EMPLOYER]),
    company_name: z.string().optional(),
    terms: z.literal(true, { errorMap: () => ({ message: 'You must accept the terms' }) }),
  })
  .refine((d) => d.password === d.password_confirm, {
    message: "Passwords don't match",
    path: ['password_confirm'],
  });

type FormData = z.infer<typeof schema>;

const LEFT_BULLETS = [
  'Access 800K+ active job listings',
  'Get noticed by top companies',
  'One-click apply with your profile',
  'Set up instant job alerts',
];

/** Returns 0–4 based on password strength */
function getStrength(pw: string): number {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const STRENGTH_COLORS = ['', 'bg-red-400', 'bg-yellow-400', 'bg-blue-400', 'bg-green-500'];
const STRENGTH_TEXT_COLORS = ['', 'text-red-500', 'text-yellow-500', 'text-blue-500', 'text-green-600'];

export default function Register() {
  const { register: authRegister } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: UserRole.SEEKER },
  });

  const role = watch('role');
  const passwordValue = watch('password') ?? '';
  const strength = getStrength(passwordValue);

  const onSubmit = async (data: FormData) => {
    try {
      const payload: RegisterData = {
        email: data.email,
        password: data.password,
        password_confirm: data.password_confirm,
        first_name: data.first_name,
        last_name: data.last_name,
        role: data.role,
        phone: data.phone || undefined,
      };
      await authRegister(payload);
      toast.success('Account created! Welcome to Hirit.');
      if (data.role === UserRole.EMPLOYER) {
        navigate('/employer/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err: any) {
      const apiErrors = err?.response?.data;
      if (apiErrors && typeof apiErrors === 'object') {
        const firstError = Object.values(apiErrors)[0];
        if (Array.isArray(firstError)) {
          toast.error(firstError[0] as string);
          return;
        }
        if (typeof firstError === 'string') {
          toast.error(firstError);
          return;
        }
      }
      toast.error(err?.response?.data?.detail ?? 'Registration failed. Please try again.');
    }
  };

  const inputClass = (hasError: boolean) =>
    `w-full border rounded-xl py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all ${
      hasError
        ? 'border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-100'
        : 'border-gray-300 focus:border-[#2563eb] focus:ring-2 focus:ring-blue-100'
    }`;

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel ── */}
      <div
        className="hidden lg:flex lg:w-5/12 xl:w-1/2 flex-col justify-between p-12"
        style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' }}
      >
        {/* Logo */}
        <Link to="/" className="inline-flex items-center gap-1 select-none">
          <span className="text-3xl font-black text-white">hir</span>
          <span className="text-3xl font-black text-blue-200">it</span>
          <span className="text-sm font-bold text-blue-300 ml-0.5 mt-1">.in</span>
        </Link>

        {/* Hero text */}
        <div className="flex-1 flex flex-col justify-center">
          <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight mb-4">
            Join 10M+<br />professionals
          </h1>
          <p className="text-blue-200 text-lg mb-10 leading-relaxed">
            India's most trusted platform for your next career move
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

        <p className="text-blue-400 text-sm">
          India's #1 job portal — trusted by millions
        </p>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex items-start justify-center px-6 py-10 bg-white overflow-y-auto">
        <div className="w-full max-w-lg">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-1">
              <span className="text-3xl font-black text-[#1a1a2e]">found</span>
              <span className="text-3xl font-black" style={{ color: '#2563eb' }}>it</span>
              <span className="text-sm font-bold text-gray-400 ml-0.5 mt-1">.in</span>
            </Link>
          </div>

          {/* Heading */}
          <div className="mb-7">
            <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
            <p className="text-gray-500 mt-1.5 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-[#2563eb] hover:underline">
                Sign In
              </Link>
            </p>
          </div>

          {/* Role toggle */}
          <div className="flex rounded-xl border border-gray-200 p-1 mb-7 gap-1">
            <button
              type="button"
              onClick={() => setValue('role', UserRole.SEEKER)}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                role === UserRole.SEEKER
                  ? 'text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 bg-transparent'
              }`}
              style={role === UserRole.SEEKER ? { background: '#2563eb' } : {}}
            >
              Job Seeker
            </button>
            <button
              type="button"
              onClick={() => setValue('role', UserRole.EMPLOYER)}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                role === UserRole.EMPLOYER
                  ? 'text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 bg-transparent'
              }`}
              style={role === UserRole.EMPLOYER ? { background: '#2563eb' } : {}}
            >
              Employer
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            {/* Name row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="first_name" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  First Name <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    {...register('first_name')}
                    id="first_name"
                    type="text"
                    placeholder="Rahul"
                    className={inputClass(!!errors.first_name) + ' pl-10 pr-4'}
                  />
                </div>
                {errors.first_name && (
                  <p className="mt-1.5 text-xs text-red-500">{errors.first_name.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="last_name" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Last Name <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    {...register('last_name')}
                    id="last_name"
                    type="text"
                    placeholder="Sharma"
                    className={inputClass(!!errors.last_name) + ' pl-10 pr-4'}
                  />
                </div>
                {errors.last_name && (
                  <p className="mt-1.5 text-xs text-red-500">{errors.last_name.message}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Email Address <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  {...register('email')}
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className={inputClass(!!errors.email) + ' pl-10 pr-4'}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  {...register('phone')}
                  id="phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  className={inputClass(false) + ' pl-10 pr-4'}
                />
              </div>
            </div>

            {/* Company Name (employer only) */}
            {role === UserRole.EMPLOYER && (
              <div>
                <label htmlFor="company_name" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Company Name <span className="text-red-400">*</span>
                </label>
                <input
                  {...register('company_name')}
                  id="company_name"
                  type="text"
                  placeholder="Acme Technologies Pvt. Ltd."
                  className={inputClass(!!errors.company_name) + ' px-4'}
                />
                {errors.company_name && (
                  <p className="mt-1.5 text-xs text-red-500">{errors.company_name.message}</p>
                )}
              </div>
            )}

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  {...register('password')}
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Min 8 chars, 1 uppercase, 1 number"
                  className={inputClass(!!errors.password) + ' pl-10 pr-11'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Strength bar */}
              {passwordValue && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-all ${
                          i <= strength ? STRENGTH_COLORS[strength] : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs font-medium ${STRENGTH_TEXT_COLORS[strength]}`}>
                    {STRENGTH_LABELS[strength]}
                  </p>
                </div>
              )}
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="password_confirm" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Confirm Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  {...register('password_confirm')}
                  id="password_confirm"
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Repeat your password"
                  className={inputClass(!!errors.password_confirm) + ' pl-10 pr-11'}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password_confirm && (
                <p className="mt-1.5 text-xs text-red-500">{errors.password_confirm.message}</p>
              )}
            </div>

            {/* Terms checkbox */}
            <div className="flex items-start gap-3 pt-1">
              <input
                {...register('terms')}
                id="terms"
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-[#2563eb] cursor-pointer shrink-0"
              />
              <label htmlFor="terms" className="text-sm text-gray-600 leading-snug cursor-pointer">
                I agree to the{' '}
                <Link to="/terms" className="text-[#2563eb] font-medium hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy-policy" className="text-[#2563eb] font-medium hover:underline">
                  Privacy Policy
                </Link>
              </label>
            </div>
            {errors.terms && (
              <p className="text-xs text-red-500 -mt-2">{errors.terms.message}</p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full text-white font-semibold py-3.5 rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-md hover:shadow-lg hover:opacity-90 mt-2"
              style={{ background: '#2563eb' }}
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Sign in link */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-[#2563eb] hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
