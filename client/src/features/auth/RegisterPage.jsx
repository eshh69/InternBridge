import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Alert } from '../../components/ui/Alert';
import { SupabaseSignInButton } from '../../components/ui/SupabaseSignInButton';
import { Briefcase } from 'lucide-react';

export const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const user = await register({ name, email, password, role });
      if (user.role === 'student') navigate('/student/portfolio');
      else if (user.role === 'company') navigate('/company/internships');
      else if (user.role === 'reviewer') navigate('/verifications');
      else navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto pt-6">
      <Card className="shadow-md">
        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-indigo-50 text-indigo-600 rounded-xl mb-3">
            <Briefcase className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Create an Account</h2>
          <p className="text-sm text-gray-500 mt-1">Join InternBridge as a Student, Company, or Reviewer</p>
        </div>

        {error && <Alert type="danger" className="mb-4">{error}</Alert>}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            1. Select Your Role <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { id: 'student', label: 'Student' },
              { id: 'company', label: 'Company' },
              { id: 'reviewer', label: 'Reviewer' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setRole(item.id)}
                className={`py-2 px-3 text-sm font-medium rounded-lg border text-center transition-colors ${
                  role === item.id
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-semibold'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Supabase OAuth Option */}
        <div className="mb-4">
          <SupabaseSignInButton role={role} onError={(msg) => setError(msg)} />
        </div>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500 font-medium">Or register with email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name / Organization"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Kamal Perera or Tech Corp"
          />

          <Input
            label="Email Address"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@domain.com"
          />

          <Input
            label="Password (min 6 characters)"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />

          <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
            Register with Email
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
            Sign In
          </Link>
        </div>
      </Card>
    </div>
  );
};
