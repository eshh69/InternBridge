import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Briefcase, User, LogOut, Bell, MessageSquare, Search } from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-indigo-600 text-white p-2 rounded-lg">
                <Briefcase className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent">
                InternBridge
              </span>
            </Link>

            {/* Navigation Links */}
            <nav className="hidden md:ml-8 md:flex md:space-x-4">
              <Link
                to="/search"
                className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1.5"
              >
                <Search className="w-4 h-4" />
                Find Internships
              </Link>

              {isAuthenticated && user?.role === 'student' && (
                <>
                  <Link
                    to="/student/portfolio"
                    className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    My Portfolio
                  </Link>
                  <Link
                    to="/applications"
                    className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Applications
                  </Link>
                </>
              )}

              {isAuthenticated && user?.role === 'company' && (
                <>
                  <Link
                    to="/company/internships"
                    className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Manage Internships
                  </Link>
                  <Link
                    to="/applications"
                    className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Applicants
                  </Link>
                </>
              )}

              {isAuthenticated && (user?.role === 'reviewer' || user?.role === 'admin') && (
                <Link
                  to="/verifications"
                  className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  {user.role === 'admin' ? 'Admin Moderation' : 'Reviewer Portal'}
                </Link>
              )}
            </nav>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/chat"
                  className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 rounded-lg relative"
                  title="Messages"
                >
                  <MessageSquare className="w-5 h-5" />
                </Link>

                <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-gray-900 leading-none">{user.name}</p>
                    <Badge size="sm" variant={user.role === 'company' ? 'purple' : 'info'} className="mt-1 capitalize">
                      {user.role}
                    </Badge>
                  </div>
                  <Button
                    onClick={handleLogout}
                    variant="ghost"
                    size="sm"
                    className="text-gray-500 hover:text-red-600"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Log In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
