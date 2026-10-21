import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../../services/supabaseClient';
import { Modal } from './Modal';
import { Input } from './Input';
import { Button } from './Button';

export const SupabaseSignInButton = ({ role = 'student', onError }) => {
  const { loginWithSupabase } = useAuth();
  const navigate = useNavigate();
  const [isDevModalOpen, setIsDevModalOpen] = useState(false);
  const [devEmail, setDevEmail] = useState('');
  const [devName, setDevName] = useState('');
  const [devRole, setDevRole] = useState(role);
  const [isLoading, setIsLoading] = useState(false);

  const handleNavigation = (user) => {
    if (user.role === 'student') navigate('/student/portfolio');
    else if (user.role === 'company') navigate('/company/internships');
    else if (user.role === 'reviewer' || user.role === 'admin') navigate('/verifications');
    else navigate('/search');
  };

  const handleSupabaseClick = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        setIsLoading(true);
        // Supabase OAuth with Google provider
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback?role=${encodeURIComponent(role)}`,
          },
        });
        if (error) throw error;
      } catch (err) {
        if (onError) onError(err.message || 'Supabase Google sign-in failed');
        setIsLoading(false);
      }
    } else {
      // In development when Supabase URL/key not yet in client .env:
      // Open developer quick-connect modal
      setDevRole(role);
      setIsDevModalOpen(true);
    }
  };

  const handleDevSubmit = async (e) => {
    e.preventDefault();
    if (!devEmail) return;

    try {
      setIsLoading(true);
      const user = await loginWithSupabase({
        email: devEmail.trim().toLowerCase(),
        name: devName.trim() || devEmail.split('@')[0],
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${devEmail}`,
        role: devRole,
        supabaseId: `sb_oauth_${Date.now()}`,
      });
      setIsDevModalOpen(false);
      handleNavigation(user);
    } catch (err) {
      if (onError) onError(err.message || 'Supabase authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPreset = async (presetEmail, presetName, presetRole) => {
    try {
      setIsLoading(true);
      const user = await loginWithSupabase({
        email: presetEmail,
        name: presetName,
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${presetEmail}`,
        role: presetRole,
        supabaseId: `sb_oauth_${presetEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
      });
      setIsDevModalOpen(false);
      handleNavigation(user);
    } catch (err) {
      if (onError) onError(err.message || 'Supabase authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleSupabaseClick}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 rounded-lg shadow-2xs bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50"
      >
        {/* Google 'G' Logo SVG */}
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>Continue with Google via Supabase</span>
      </button>

      {/* Development Quick-Connect Modal */}
      <Modal
        isOpen={isDevModalOpen}
        onClose={() => setIsDevModalOpen(false)}
        title="Supabase Google Auth (Dev Simulator)"
        footer={
          <Button variant="secondary" onClick={() => setIsDevModalOpen(false)}>
            Close
          </Button>
        }
      >
        <div className="space-y-4">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800">
            <span className="font-semibold">Supabase Auth Ready:</span> In production, set{' '}
            <code className="bg-emerald-100 px-1 py-0.5 rounded">VITE_SUPABASE_URL</code> and{' '}
            <code className="bg-emerald-100 px-1 py-0.5 rounded">VITE_SUPABASE_ANON_KEY</code>.
            For development, pick a role preset below to test instant authentication:
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Instant 1-Click Role Presets:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() =>
                  handleQuickPreset('student.google@seu.ac.lk', 'Student Kamal', 'student')
                }
                disabled={isLoading}
                className="p-3 rounded-lg border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100 text-left transition-colors"
              >
                <div className="text-xs font-bold text-indigo-900">🎓 Student</div>
                <div className="text-[11px] text-indigo-600 truncate">student.google@seu.ac.lk</div>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleQuickPreset('hr@virtusa.google.com', 'Virtusa Recruiter', 'company')
                }
                disabled={isLoading}
                className="p-3 rounded-lg border border-purple-200 bg-purple-50/50 hover:bg-purple-100 text-left transition-colors"
              >
                <div className="text-xs font-bold text-purple-900">🏢 Company</div>
                <div className="text-[11px] text-purple-600 truncate">hr@virtusa.com</div>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleQuickPreset('dr.perera.google@seu.ac.lk', 'Dr. Perera', 'reviewer')
                }
                disabled={isLoading}
                className="p-3 rounded-lg border border-amber-200 bg-amber-50/50 hover:bg-amber-100 text-left transition-colors"
              >
                <div className="text-xs font-bold text-amber-900">👨‍🏫 Reviewer</div>
                <div className="text-[11px] text-amber-600 truncate">dr.perera@seu.ac.lk</div>
              </button>
            </div>
          </div>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2 text-gray-500">or enter custom test identity</span>
            </div>
          </div>

          <form onSubmit={handleDevSubmit} className="space-y-3">
            <Input
              label="Google Account Email"
              type="email"
              value={devEmail}
              onChange={(e) => setDevEmail(e.target.value)}
              placeholder="you@gmail.com"
              required
            />
            <Input
              label="Full Name"
              type="text"
              value={devName}
              onChange={(e) => setDevName(e.target.value)}
              placeholder="Your Name"
            />
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Assign System Role
              </label>
              <select
                value={devRole}
                onChange={(e) => setDevRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="student">Student (Module 1)</option>
                <option value="company">Company (Module 2)</option>
                <option value="reviewer">Reviewer (Module 5)</option>
              </select>
            </div>
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isLoading}
            >
              Sign In with Custom Google Identity
            </Button>
          </form>
        </div>
      </Modal>
    </>
  );
};
