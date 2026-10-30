import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  Briefcase,
  User,
  LogOut,
  Bell,
  MessageSquare,
  Search,
  LayoutDashboard,
  Building2,
  Users,
  Menu,
  X,
  ShieldCheck,
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isLinkActive = (to) => {
    if (to.includes('?')) {
      const [path, query] = to.split('?');
      return location.pathname === path && location.search.includes(query);
    }
    return location.pathname === to;
  };

  const getLinkClass = (to) => {
    const active = isLinkActive(to);
    return `px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 select-none ${
      active
        ? 'bg-indigo-50 text-indigo-700 font-bold'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
    }`;
  };

  const getMobileLinkClass = (to) => {
    const active = isLinkActive(to);
    return `px-3.5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2.5 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 select-none ${
      active
        ? 'bg-indigo-50 text-indigo-700 font-bold'
        : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
    }`;
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 transition-shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Desktop Nav */}
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="flex items-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg p-1"
            >
              <div className="bg-gradient-to-tr from-indigo-700 to-indigo-600 text-white p-2 rounded-xl shadow-xs">
                <Briefcase className="w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-700 via-indigo-800 to-purple-800 bg-clip-text text-transparent">
                InternBridge
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1 ml-6" aria-label="Main Navigation">
              <Link to="/search" className={getLinkClass('/search')}>
                <Search className="w-4 h-4 text-slate-400" />
                Find Internships
              </Link>

              {/* Accessible directly in demo/preview mode */}
              {!isAuthenticated && (
                <Link to="/applications" className={getLinkClass('/applications')}>
                  Applications
                </Link>
              )}

              {isAuthenticated && user?.role === 'student' && (
                <>
                  <Link to="/student/portfolio" className={getLinkClass('/student/portfolio')}>
                    My Portfolio
                  </Link>
                  <Link to="/applications" className={getLinkClass('/applications')}>
                    Applications
                  </Link>
                </>
              )}

              {isAuthenticated && user?.role === 'company' && (
                <>
                  <Link
                    to="/company/internships?tab=dashboard"
                    className={getLinkClass('/company/internships?tab=dashboard')}
                  >
                    <LayoutDashboard className="w-4 h-4 text-slate-400" />
                    Dashboard
                  </Link>
                  <Link
                    to="/company/internships?tab=internships"
                    className={getLinkClass('/company/internships?tab=internships')}
                  >
                    <Briefcase className="w-4 h-4 text-slate-400" />
                    Manage Internships
                  </Link>
                  <Link
                    to="/company/internships?tab=profile"
                    className={getLinkClass('/company/internships?tab=profile')}
                  >
                    <Building2 className="w-4 h-4 text-slate-400" />
                    Company Profile
                  </Link>
                  <Link to="/applications" className={getLinkClass('/applications')}>
                    <Users className="w-4 h-4 text-slate-400" />
                    Applicants
                  </Link>
                </>
              )}

              {isAuthenticated && (user?.role === 'reviewer' || user?.role === 'admin' || user?.role === 'company') && (
                <Link to="/verifications" className={getLinkClass('/verifications')}>
                  <ShieldCheck className="w-4 h-4 text-slate-400" />
                  {user.role === 'admin' ? 'Admin Moderation' : user?.role === 'reviewer' ? 'Reviewer Portal' : 'Verification & Ratings'}
                </Link>
              )}
            </nav>
          </div>

          {/* Right Section & Mobile Menu Button */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <Link
                  to="/chat"
                  className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  title="Messages & Chat"
                  aria-label="Messages & Chat"
                >
                  <MessageSquare className="w-5 h-5" />
                </Link>

                <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-slate-200">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-slate-900 leading-none">{user.name}</p>
                    <Badge
                      size="sm"
                      variant={user.role === 'company' ? 'purple' : 'info'}
                      className="mt-1 capitalize text-[10px]"
                    >
                      {user.role}
                    </Badge>
                  </div>
                  <Button
                    onClick={handleLogout}
                    variant="ghost"
                    size="sm"
                    className="text-slate-500 hover:text-rose-600 hover:bg-rose-50 p-2"
                    title="Sign Out"
                    aria-label="Sign Out"
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

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Panel */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-slate-200 space-y-1 animate-slide-up">
            <Link
              to="/search"
              onClick={closeMobileMenu}
              className={getMobileLinkClass('/search')}
            >
              <Search className="w-4 h-4 text-slate-400" />
              Find Internships
            </Link>

            {!isAuthenticated && (
              <Link
                to="/applications"
                onClick={closeMobileMenu}
                className={getMobileLinkClass('/applications')}
              >
                Applications
              </Link>
            )}

            {isAuthenticated && user?.role === 'student' && (
              <>
                <Link
                  to="/student/portfolio"
                  onClick={closeMobileMenu}
                  className={getMobileLinkClass('/student/portfolio')}
                >
                  My Portfolio
                </Link>
                <Link
                  to="/applications"
                  onClick={closeMobileMenu}
                  className={getMobileLinkClass('/applications')}
                >
                  Applications
                </Link>
              </>
            )}

            {isAuthenticated && user?.role === 'company' && (
              <>
                <Link
                  to="/company/internships?tab=dashboard"
                  onClick={closeMobileMenu}
                  className={getMobileLinkClass('/company/internships?tab=dashboard')}
                >
                  <LayoutDashboard className="w-4 h-4 text-slate-400" />
                  Dashboard
                </Link>
                <Link
                  to="/company/internships?tab=internships"
                  onClick={closeMobileMenu}
                  className={getMobileLinkClass('/company/internships?tab=internships')}
                >
                  <Briefcase className="w-4 h-4 text-slate-400" />
                  Manage Internships
                </Link>
                <Link
                  to="/company/internships?tab=profile"
                  onClick={closeMobileMenu}
                  className={getMobileLinkClass('/company/internships?tab=profile')}
                >
                  <Building2 className="w-4 h-4 text-slate-400" />
                  Company Profile
                </Link>
                <Link
                  to="/applications"
                  onClick={closeMobileMenu}
                  className={getMobileLinkClass('/applications')}
                >
                  <Users className="w-4 h-4 text-slate-400" />
                  Applicants
                </Link>
              </>
            )}

            {isAuthenticated && (user?.role === 'reviewer' || user?.role === 'admin' || user?.role === 'company') && (
              <Link
                to="/verifications"
                onClick={closeMobileMenu}
                className={getMobileLinkClass('/verifications')}
              >
                <ShieldCheck className="w-4 h-4 text-slate-400" />
                {user.role === 'admin' ? 'Admin Moderation' : user?.role === 'reviewer' ? 'Reviewer Portal' : 'Verification & Ratings'}
              </Link>
            )}

            {isAuthenticated && (
              <div className="pt-2 pb-1 px-3.5 border-t border-slate-100 mt-2 sm:hidden flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-900">{user.name}</p>
                  <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  size="sm"
                  className="text-rose-600 hover:bg-rose-50"
                >
                  Sign Out
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
