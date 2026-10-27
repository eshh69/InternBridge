import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../services/apiClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('internbridge_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('internbridge_token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('internbridge_token');
      if (storedToken) {
        try {
          const res = await apiClient.get('/auth/me');
          setUser(res.data.user);
          localStorage.setItem('internbridge_user', JSON.stringify(res.data.user));
        } catch (err) {
          console.warn('Session verification failed:', err.message);
          logout();
        }
      }
      setIsLoading(false);
    };

    const handleUnauthorized = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    initAuth();

    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  const login = async (email, password) => {
    const res = await apiClient.post('/auth/login', { email, password });
    const { user: loggedInUser, token: authToken } = res.data;
    setUser(loggedInUser);
    setToken(authToken);
    localStorage.setItem('internbridge_token', authToken);
    localStorage.setItem('internbridge_user', JSON.stringify(loggedInUser));
    return loggedInUser;
  };

  const register = async (userData) => {
    const res = await apiClient.post('/auth/register', userData);
    const { user: registeredUser, token: authToken } = res.data;
    setUser(registeredUser);
    setToken(authToken);
    localStorage.setItem('internbridge_token', authToken);
    localStorage.setItem('internbridge_user', JSON.stringify(registeredUser));
    return registeredUser;
  };

  const loginWithSupabase = async (payload) => {
    const res = await apiClient.post('/auth/supabase-login', payload);
    const { user: loggedInUser, token: authToken } = res.data;
    setUser(loggedInUser);
    setToken(authToken);
    localStorage.setItem('internbridge_token', authToken);
    localStorage.setItem('internbridge_user', JSON.stringify(loggedInUser));
    return loggedInUser;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('internbridge_token');
    localStorage.removeItem('internbridge_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        loginWithSupabase,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
