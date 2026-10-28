import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../hooks/useAuth';
import apiClient from '../../services/apiClient';
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

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (!session?.user) {
          throw new Error('No active Supabase user session detected.');
        }

        const role = searchParams.get('role') || 'student';
        const intent = searchParams.get('intent') || 'login';
        const { email, user_metadata, id: supabaseId } = session.user;
        const normalizedEmail = email.toLowerCase().trim();
        const displayName =
          user_metadata?.full_name || user_metadata?.name || normalizedEmail.split('@')[0];
        const avatarUrl = user_metadata?.avatar_url || null;

        // Check whether user already exists in MongoDB
        let exists = false;
        let existingRole = role;

        try {
          const checkRes = await apiClient.post('/auth/check-user', { email: normalizedEmail });
          if (checkRes.data?.data?.exists) {
            exists = true;
            existingRole = checkRes.data.data.role || role;
          }
        } catch {
          // If check fails, fallback
        }

        if (exists || intent === 'login') {
          // Existing user or direct login intent: Login immediately
          const user = await loginWithSupabase({
            email: normalizedEmail,
            name: displayName,
            avatarUrl,
            role: existingRole,
            supabaseId,
          });

          if (user.role === 'student') navigate('/student/portfolio');
          else if (user.role === 'company') navigate('/company/internships');
          else if (user.role === 'reviewer' || user.role === 'admin') navigate('/verifications');
          else navigate('/search');
        } else {
          // New user registering: Store Google details and route to complete onboarding
          const googleData = {
            email: normalizedEmail,
            name: displayName,
            avatarUrl,
            role,
            supabaseId,
          };
          sessionStorage.setItem('pending_google_reg', JSON.stringify(googleData));
          navigate('/register?step=details&auth=google');
        }
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
            Finalizing your secure Google session...
          </p>
        </>
      )}
    </div>
  );
};
