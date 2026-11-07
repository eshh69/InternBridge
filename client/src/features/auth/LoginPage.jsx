import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
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
  ChevronRight,
  ArrowLeft,
  Eye,
  EyeOff,
} from 'lucide-react';

export const LoginPage = () => {
  const [searchParams] = useSearchParams();
  const [selectedRole, setSelectedRole] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // If a role is passed in query params (e.g. /login?role=company), pre-select it
  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam && ['student', 'company', 'reviewer'].includes(roleParam.toLowerCase())) {
      setSelectedRole(roleParam.toLowerCase());
    }
  }, [searchParams]);

  const roleConfigs = {
    student: {
      id: 'student',
      label: 'Student',
      desc: 'Undergraduate looking for internship opportunities',
      icon: GraduationCap,
      bgClass: 'bg-[#7F8C6A]/15',
      textClass: 'text-[#1E3B2F]',
      borderHover: 'hover:border-[#7F8C6A]',
    },
    company: {
      id: 'company',
      label: 'Company',
      desc: 'Employer & HR recruiter hiring verified talent',
      icon: Building2,
      bgClass: 'bg-[#C8B48A]/25',
      textClass: 'text-[#1E3B2F]',
      borderHover: 'hover:border-[#C8B48A]',
    },
    reviewer: {
      id: 'reviewer',
      label: 'Reviewer',
      desc: 'Academic supervisor & faculty evaluator',
      icon: ShieldCheck,
      bgClass: 'bg-[#7F8C6A]/20',
      textClass: 'text-[#1E3B2F]',
      borderHover: 'hover:border-[#7F8C6A]',
    },
  };

  const handleSelectRole = (roleKey) => {
    setError('');
    setSelectedRole(roleKey);
  };

  const handleBackToRoles = () => {
    setError('');
    setSelectedRole(null);
  };

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
  const handleQuickFill = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
    setError('');
  };

  const currentRole = selectedRole ? roleConfigs[selectedRole] : null;
  const CurrentRoleIcon = currentRole ? currentRole.icon : null;

  return (
    <div className="max-w-md mx-auto py-10 px-4">
      {/* ========================================================
          WINDOW 1: Role Selection ("Sign In As" with 3 options)
         ======================================================== */}
      {!selectedRole ? (
        <Card className="shadow-xs hover:shadow-md transition-all duration-200 rounded-2xl border border-[#C8B48A]/40 bg-white p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex p-3 bg-[#7F8C6A]/15 text-[#1E3B2F] border border-[#7F8C6A]/30 rounded-2xl mb-3 shadow-xs">
              <Briefcase className="w-7 h-7" />
            </div>
            <p className="font-serif italic text-sm text-[#7F8C6A] mb-0.5">
              Welcome to InternBridge
            </p>
            <h1 className="text-2xl font-black uppercase tracking-tight text-[#1E3B2F]">
              Sign In As
            </h1>
          </div>

          {/* 3 Role Options Only */}
          <div className="space-y-3">
            {Object.values(roleConfigs).map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectRole(item.id)}
                  className={`w-full p-4 rounded-xl border border-[#C8B48A]/35 ${item.borderHover} hover:bg-[#F5F0E6]/50 transition-all flex items-center justify-between group text-left shadow-2xs hover:shadow-xs`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`p-2.5 rounded-xl ${item.bgClass} ${item.textClass} transition-transform group-hover:scale-105`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#1E3B2F] group-hover:text-[#183026] transition-colors">
                        {item.label}
                      </h3>
                      <p className="text-xs text-[#1E3B2F]/65">{item.desc}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#7F8C6A] group-hover:text-[#1E3B2F] group-hover:translate-x-0.5 transition-all" />
                </button>
              );
            })}
          </div>

          {/* Subtle bottom text */}
          <p className="text-xs text-[#1E3B2F]/50 text-center mt-6">
            Select your role to continue
          </p>

          {/* Create Account Link */}
          <div className="mt-4 pt-4 border-t border-[#C8B48A]/25 text-center text-xs text-[#1E3B2F]/70">
            Don&apos;t have an account yet?{' '}
            <Link to="/register" className="font-bold text-[#1E3B2F] hover:underline">
              Create an Account
            </Link>
          </div>
        </Card>
      ) : (
        /* ========================================================
            WINDOW 2: Authentication Options (Google & JWT)
           ======================================================== */
        <Card className="shadow-xs hover:shadow-md transition-all duration-200 rounded-2xl border border-[#C8B48A]/40 bg-white p-6 sm:p-8">
          {/* Back Button to return to Window 1 */}
          <button
            type="button"
            onClick={handleBackToRoles}
            className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-[#7F8C6A] hover:text-[#1E3B2F] mb-4 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Change Role
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <div className={`inline-flex p-3 ${currentRole.bgClass} ${currentRole.textClass} rounded-2xl mb-3 shadow-xs border border-[#C8B48A]/30`}>
              <CurrentRoleIcon className="w-7 h-7" />
            </div>
            <p className="font-serif italic text-sm text-[#7F8C6A] mb-0.5">
              Verified Portal Access
            </p>
            <h1 className="text-2xl font-black uppercase tracking-tight text-[#1E3B2F]">
              Sign In as {currentRole.label}
            </h1>
            <p className="text-xs text-[#1E3B2F]/70 mt-1">
              Sign in to your verified InternBridge account
            </p>
          </div>

          {error && (
            <Alert type="danger" className="mb-5 rounded-xl">
              {error}
            </Alert>
          )}

          {/* 1. JWT Email & Password Form (Credentials First) */}
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
                className="absolute right-3 top-9 text-[#7F8C6A] hover:text-[#1E3B2F]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full justify-center py-3.5 px-4 bg-[#1E3B2F] hover:bg-[#152A22] text-[#F5F0E6] font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all shadow-xs flex items-center disabled:opacity-50"
            >
              {isLoading ? 'Signing In...' : `Sign In as ${currentRole.label}`}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#C8B48A]/35" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-[10px] uppercase tracking-widest font-semibold text-[#1E3B2F]/60">
                Or continue with Google
              </span>
            </div>
          </div>

          {/* 2. Supabase Google 1-Click Sign In (Student Only) */}
          <div className="space-y-3">
            <SupabaseSignInButton
              role={selectedRole}
              intent="login"
              buttonText={`Continue with Google (${currentRole.label})`}
              onError={(msg) => setError(msg)}
            />
          </div>

          {/* 3. Demo Credentials Helper */}
          <div className="mt-6 pt-4 border-t border-[#C8B48A]/25">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#7F8C6A] mb-2">
              Demo Credentials:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {selectedRole === 'student' && (
                <button
                  type="button"
                  onClick={() => handleQuickFill('student@example.com')}
                  className="px-2.5 py-1 text-xs bg-[#F5F0E6] text-[#1E3B2F] border border-[#C8B48A]/40 rounded-lg hover:bg-[#EAE2D2] font-semibold transition-colors"
                >
                  student@example.com
                </button>
              )}
              {selectedRole === 'company' && (
                <button
                  type="button"
                  onClick={() => handleQuickFill('techcorp@example.com')}
                  className="px-2.5 py-1 text-xs bg-[#F5F0E6] text-[#1E3B2F] border border-[#C8B48A]/40 rounded-lg hover:bg-[#EAE2D2] font-semibold transition-colors"
                >
                  techcorp@example.com
                </button>
              )}
              {selectedRole === 'reviewer' && (
                <button
                  type="button"
                  onClick={() => handleQuickFill('reviewer@example.com')}
                  className="px-2.5 py-1 text-xs bg-[#F5F0E6] text-[#1E3B2F] border border-[#C8B48A]/40 rounded-lg hover:bg-[#EAE2D2] font-semibold transition-colors"
                >
                  reviewer@example.com
                </button>
              )}
            </div>
          </div>

          {/* Footer Link */}
          <div className="mt-4 text-center text-xs text-[#1E3B2F]/70">
            Don&apos;t have an account yet?{' '}
            <Link to="/register" className="font-bold text-[#1E3B2F] hover:underline">
              Create an Account
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
};
