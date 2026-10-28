import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Alert } from '../../components/ui/Alert';
import { SupabaseSignInButton } from '../../components/ui/SupabaseSignInButton';
import {
  Briefcase,
  GraduationCap,
  Building2,
  ShieldCheck,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Sparkles,
} from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const user = await login(email.trim().toLowerCase(), password);
      if (user.role === 'student') navigate('/student/portfolio');
      else if (user.role === 'company') navigate('/company/internships');
      else if (user.role === 'reviewer' || user.role === 'admin') navigate('/verifications');
      else navigate('/search');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick fill helper for dev testing
  const handleQuickFill = (demoEmail, demoRole) => {
    setEmail(demoEmail);
    setPassword('password123');
    setRole(demoRole);
    setError('');
  };

  return (
    <div className="max-w-md mx-auto py-10 px-4">
      <Card className="shadow-md rounded-[10px] p-6 md:p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-indigo-50 text-indigo-600 rounded-xl mb-3 shadow-2xs">
            <Briefcase className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Welcome Back</h1>
          <p className="text-xs text-gray-500 mt-1">Sign in to your verified InternBridge account</p>
        </div>

        {error && (
          <Alert type="danger" className="mb-5">
            {error}
          </Alert>
        )}

        {/* Role Tab Selector */}
        <div className="mb-5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
            Sign In As:
          </label>
          <div className="grid grid-cols-3 gap-2 p-1 bg-gray-100 rounded-[10px]">
            {[
              { id: 'student', label: 'Student', icon: GraduationCap },
              { id: 'company', label: 'Company', icon: Building2 },
              { id: 'reviewer', label: 'Reviewer', icon: ShieldCheck },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = role === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setRole(item.id)}
                  className={`py-2 px-2.5 rounded-[8px] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    isActive
                      ? 'bg-white text-indigo-600 shadow-2xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Supabase Google 1-Click Login */}
        <div className="mb-5">
          <SupabaseSignInButton
            role={role}
            intent="login"
            buttonText={`Continue with Google (${role.charAt(0).toUpperCase() + role.slice(1)})`}
            onError={(msg) => setError(msg)}
          />
        </div>

        {/* Divider */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-400 font-medium">Or enter credentials</span>
          </div>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@domain.com"
          />

          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full justify-center py-2.5 rounded-[10px] font-semibold"
            isLoading={isLoading}
          >
            Sign In with Email
          </Button>
        </form>

        {/* Demo Accounts Quick Fill Pill (Development Aid) */}
        <div className="mt-5 pt-4 border-t border-gray-100">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 block mb-2 text-center">
            Demo Test Accounts (Click to Fill)
          </span>
          <div className="flex flex-wrap gap-1.5 justify-center">
            <button
              type="button"
              onClick={() => handleQuickFill('student@internbridge.lk', 'student')}
              className="text-[11px] px-2 py-1 bg-gray-100 text-gray-600 rounded-[6px] hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
            >
              🎓 Student Demo
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('company@internbridge.lk', 'company')}
              className="text-[11px] px-2 py-1 bg-gray-100 text-gray-600 rounded-[6px] hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
            >
              🏢 Company Demo
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('reviewer@internbridge.lk', 'reviewer')}
              className="text-[11px] px-2 py-1 bg-gray-100 text-gray-600 rounded-[6px] hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
            >
              🛡️ Reviewer Demo
            </button>
          </div>
        </div>

        {/* Sign up link */}
        <div className="mt-6 text-center text-xs text-gray-600">
          Don&apos;t have an account yet?{' '}
          <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-500">
            Create an Account
          </Link>
        </div>
      </Card>
    </div>
  );
};
