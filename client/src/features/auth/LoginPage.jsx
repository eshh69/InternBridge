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
      bgClass: 'bg-indigo-50',
      textClass: 'text-indigo-600',
      borderHover: 'hover:border-indigo-500',
    },
    company: {
      id: 'company',
      label: 'Company',
      desc: 'Employer & HR recruiter hiring verified talent',
      icon: Building2,
      bgClass: 'bg-blue-50',
      textClass: 'text-blue-600',
      borderHover: 'hover:border-blue-500',
    },
    reviewer: {
      id: 'reviewer',
      label: 'Reviewer',
      desc: 'Academic supervisor & faculty evaluator',
      icon: ShieldCheck,
      bgClass: 'bg-emerald-50',
      textClass: 'text-emerald-600',
      borderHover: 'hover:border-emerald-500',
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
        <Card className="shadow-md rounded-[10px] p-6 md:p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex p-3 bg-indigo-50 text-indigo-600 rounded-xl mb-3 shadow-2xs">
              <Briefcase className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Sign In As</h1>
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
                  className={`w-full p-4 rounded-[10px] border border-gray-200 ${item.borderHover} hover:bg-slate-50/70 transition-all flex items-center justify-between group text-left shadow-2xs hover:shadow-xs`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`p-2.5 rounded-lg ${item.bgClass} ${item.textClass} transition-transform group-hover:scale-105`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {item.label}
                      </h3>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                </button>
              );
            })}
          </div>

          {/* Subtle bottom text */}
          <p className="text-xs text-gray-400 text-center mt-6">
            Select your role to continue
          </p>

          {/* Create Account Link */}
          <div className="mt-4 pt-4 border-t border-gray-100 text-center text-xs text-gray-600">
            Don&apos;t have an account yet?{' '}
            <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-500">
              Create an Account
            </Link>
          </div>
        </Card>
      ) : (
        /* ========================================================
            WINDOW 2: Authentication Options (Google & JWT)
           ======================================================== */
        <Card className="shadow-md rounded-[10px] p-6 md:p-8">
          {/* Back Button to return to Window 1 */}
          <button
            type="button"
            onClick={handleBackToRoles}
            className="inline-flex items-center text-xs font-semibold text-gray-500 hover:text-indigo-600 mb-4 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Change Role
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <div className={`inline-flex p-3 ${currentRole.bgClass} ${currentRole.textClass} rounded-xl mb-3 shadow-2xs`}>
              <CurrentRoleIcon className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Sign In as {currentRole.label}
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Sign in to your verified InternBridge account
            </p>
          </div>

          {error && (
            <Alert type="danger" className="mb-5">
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
              Sign In as {currentRole.label}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-400 font-medium">Or continue with</span>
            </div>
          </div>

          {/* 2. Google OAuth Sign-in */}
          <div>
            <SupabaseSignInButton
              role={selectedRole}
              intent="login"
              buttonText={`Continue with Google (${currentRole.label})`}
              onError={(msg) => setError(msg)}
            />
          </div>

          {/* Demo Account Quick-Fill for this selected role */}
          <div className="mt-5 pt-4 border-t border-gray-100 text-center">
            <button
              type="button"
              onClick={() => handleQuickFill(`${selectedRole}@internbridge.lk`)}
              className="text-[11px] px-2.5 py-1.5 bg-gray-100 text-gray-600 rounded-[6px] hover:bg-indigo-50 hover:text-indigo-600 transition-colors font-medium"
            >
              ⚡ Fill Demo {currentRole.label} Account
            </button>
          </div>

          {/* Sign up link */}
          <div className="mt-6 text-center text-xs text-gray-600">
            Don&apos;t have an account yet?{' '}
            <Link
              to={`/register?role=${selectedRole}`}
              className="font-semibold text-indigo-600 hover:text-indigo-500"
            >
              Create {currentRole.label} Account
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
};
