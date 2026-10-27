import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../hooks/useAuth';
import { Spinner } from '../../components/ui/Spinner';
import { Alert } from '../../components/ui/Alert';

export const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loginWithSupabase } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        if (!supabase) {
          throw new Error('Supabase client is not configured.');
        }

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (!session?.user) {
          throw new Error('No active Supabase user session detected.');
        }

        const role = searchParams.get('role') || 'student';
        const { email, user_metadata, id: supabaseId } = session.user;

        const user = await loginWithSupabase({
          email,
          name: user_metadata?.full_name || user_metadata?.name || email.split('@')[0],
          avatarUrl: user_metadata?.avatar_url || null,
          role,
          supabaseId,
        });

        if (user.role === 'student') navigate('/student/portfolio');
        else if (user.role === 'company') navigate('/company/internships');
        else if (user.role === 'reviewer' || user.role === 'admin') navigate('/verifications');
        else navigate('/search');
      } catch (err) {
        setError(err.message || 'Authentication synchronization failed.');
      }
    };

    handleAuthCallback();
  }, [navigate, searchParams, loginWithSupabase]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
      {error ? (
        <div className="max-w-md w-full px-4">
          <Alert type="danger" title="Authentication Error">
            {error}
          </Alert>
          <div className="text-center mt-4">
            <button
              onClick={() => navigate('/login')}
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-500"
            >
              Return to Login
            </button>
          </div>
        </div>
      ) : (
        <>
          <Spinner size="lg" />
          <p className="text-sm font-medium text-gray-600">
            Finalizing your secure Supabase login...
          </p>
        </>
      )}
    </div>
  );
};
