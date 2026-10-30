import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Alert } from '../../components/ui/Alert';
import { SupabaseSignInButton } from '../../components/ui/SupabaseSignInButton';
import { Briefcase } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'student') navigate('/student/portfolio');
      else if (user.role === 'company') navigate('/company/internships');
      else if (user.role === 'reviewer' || user.role === 'admin') navigate('/verifications');
      else navigate('/search');
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto pt-8">
      <Card className="shadow-md">
        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-indigo-50 text-indigo-600 rounded-xl mb-3">
            <Briefcase className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
          <p className="text-sm text-gray-500 mt-1">Sign in to your InternBridge account</p>
        </div>

        {error && <Alert type="danger" className="mb-4">{error}</Alert>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@university.ac.lk"
          />

          <Input
            label="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />

          <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
            Sign In with Email
          </Button>
        </form>

        {/* Quick Demo Credentials for Local Testing */}
        <div className="mt-5 pt-4 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 text-center">
            Demo Test Accounts (1-Click Fill)
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setEmail('student@internbridge.lk');
                setPassword('password123');
              }}
              className="p-2 text-xs border border-indigo-200 bg-indigo-50/60 rounded-md hover:bg-indigo-100 text-left transition-colors cursor-pointer"
            >
              <div className="font-semibold text-indigo-900">🎓 Student</div>
              <div className="text-[11px] text-indigo-600 truncate">student@internbridge.lk</div>
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail('company@internbridge.lk');
                setPassword('password123');
              }}
              className="p-2 text-xs border border-purple-200 bg-purple-50/60 rounded-md hover:bg-purple-100 text-left transition-colors cursor-pointer"
            >
              <div className="font-semibold text-purple-900">🏢 Company</div>
              <div className="text-[11px] text-purple-600 truncate">company@internbridge.lk</div>
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail('reviewer@internbridge.lk');
                setPassword('password123');
              }}
              className="p-2 text-xs border border-amber-200 bg-amber-50/60 rounded-md hover:bg-amber-100 text-left transition-colors cursor-pointer"
            >
              <div className="font-semibold text-amber-900">👨‍🏫 Reviewer</div>
              <div className="text-[11px] text-amber-600 truncate">reviewer@internbridge.lk</div>
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail('admin@internbridge.lk');
                setPassword('password123');
              }}
              className="p-2 text-xs border border-emerald-200 bg-emerald-50/60 rounded-md hover:bg-emerald-100 text-left transition-colors cursor-pointer"
            >
              <div className="font-semibold text-emerald-900">🛡️ Admin</div>
              <div className="text-[11px] text-emerald-600 truncate">admin@internbridge.lk</div>
            </button>
          </div>
        </div>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500 font-medium">Or continue with</span>
          </div>
        </div>

        <SupabaseSignInButton role="student" onError={(msg) => setError(msg)} />

        <div className="mt-6 text-center text-sm text-gray-600">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-500">
            Create an account
          </Link>
        </div>
      </Card>
    </div>
  );
};
