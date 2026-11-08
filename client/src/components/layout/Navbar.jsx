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
import internbridgeLogo from '../../assets/internbridge-logo.png';

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
    return `px-3.5 py-1.5 rounded-md text-xs uppercase tracking-widest font-semibold flex items-center gap-1.5 transition-all focus:outline-none focus-visible:ring-1 focus-visible:ring-[#1E3B2F] select-none ${
      active
        ? 'bg-[#1E3B2F] text-[#F5F0E6] font-bold shadow-xs border border-[#1E3B2F]'
        : 'text-[#1E3B2F]/80 hover:text-[#1E3B2F] hover:bg-[#7F8C6A]/15 border border-transparent'
    }`;
  };

  const getMobileLinkClass = (to) => {
    const active = isLinkActive(to);
    return `px-3.5 py-2.5 rounded-lg text-xs uppercase tracking-widest font-semibold flex items-center gap-2.5 transition-all select-none ${
      active
        ? 'bg-[#1E3B2F] text-[#F5F0E6] font-bold'
        : 'text-[#1E3B2F]/80 hover:text-[#1E3B2F] hover:bg-[#7F8C6A]/15'
    }`;
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);
  const getDisplayName = () => {
    if (!user) return '';
    if (user.role === 'company' && user.company?.name) {
      return user.company.name;
    }
    const rawName = (user.name || '').trim();
    if (!rawName) return 'User';
    const firstWord = rawName.split(' ')[0];
    return firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase();
  };

  const getUserInitial = () => {
    const name = getDisplayName();
    return name.charAt(0).toUpperCase() || 'U';
  };

  const getProfileLink = () => {
    if (user?.role === 'student') return '/student/portfolio';
    if (user?.role === 'company') return '/company/internships?tab=profile';
    if (user?.role === 'reviewer' || user?.role === 'admin') return '/verifications';
    return '/student/portfolio';
  };


  return (
    <header className="bg-[#F5F0E6]/95 backdrop-blur-md border-b border-[#C8B48A]/40 sticky top-0 z-50 text-[#1E3B2F] transition-shadow">
      <div className="w-full lg:w-[80%] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Desktop Nav */}
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="flex items-center gap-2.5 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#1E3B2F] rounded-md p-1 group"
            >
              <img
                src={internbridgeLogo}
                alt="InternBridge logo"
                className="w-8 h-8 object-contain rounded-lg flex-shrink-0"
              />
              <span className="text-base font-extrabold uppercase tracking-widest text-[#1E3B2F]">
                InternBridge
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1.5 ml-8" aria-label="Main Navigation">
              <Link to="/search" className={getLinkClass('/search')}>
                <Search className="w-3.5 h-3.5 text-[#7F8C6A]" />
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
                    <LayoutDashboard className="w-3.5 h-3.5 text-[#7F8C6A]" />
                    Dashboard
                  </Link>
                  <Link
                    to="/company/internships?tab=internships"
                    className={getLinkClass('/company/internships?tab=internships')}
                  >
                    <Briefcase className="w-3.5 h-3.5 text-[#7F8C6A]" />
                    Manage Internships
                  </Link>
                  <Link
                    to="/company/internships?tab=profile"
                    className={getLinkClass('/company/internships?tab=profile')}
                  >
                    <Building2 className="w-3.5 h-3.5 text-[#7F8C6A]" />
                    Company Profile
                  </Link>
                  <Link to="/applications" className={getLinkClass('/applications')}>
                    <Users className="w-3.5 h-3.5 text-[#7F8C6A]" />
                    Applicants
                  </Link>
                </>
              )}

              {isAuthenticated && (user?.role === 'reviewer' || user?.role === 'admin' || user?.role === 'company') && (
                <Link to="/verifications" className={getLinkClass('/verifications')}>
                  <ShieldCheck className="w-3.5 h-3.5 text-[#7F8C6A]" />
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
                  className="p-2 text-[#1E3B2F]/80 hover:text-[#1E3B2F] hover:bg-[#7F8C6A]/15 rounded-lg transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#1E3B2F]"
                  title="Messages & Chat"
                  aria-label="Messages & Chat"
                >
                  <MessageSquare className="w-4 h-4" />
                </Link>

                <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-[#C8B48A]/40">
                  {/* Small Circular Profile Avatar & User Info linked to Profile */}
                  <Link
                    to={getProfileLink()}
                    className="flex items-center gap-2.5 p-1 -m-1 rounded-xl hover:bg-[#7F8C6A]/15 transition-all group focus:outline-none focus-visible:ring-1 focus-visible:ring-[#1E3B2F] cursor-pointer"
                    title="Go to Profile / Portfolio"
                  >
                    <div className="relative shrink-0 transition-transform group-hover:scale-105">
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={getDisplayName()}
                          className="w-8 h-8 rounded-full object-cover border border-[#C8B48A]/50 shadow-2xs"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[#1E3B2F] text-[#F5F0E6] text-xs font-black flex items-center justify-center border border-[#C8B48A]/50 shadow-2xs select-none">
                          {getUserInitial()}
                        </div>
                      )}
                    </div>

                    {/* Name & Role */}
                    <div className="text-left hidden sm:block leading-tight">
                      <p
                        className="text-xs font-bold text-[#1E3B2F] tracking-tight truncate max-w-[130px] group-hover:text-[#152A22] transition-colors"
                        title={user.name}
                      >
                        {getDisplayName()}
                      </p>
                      <span className="inline-block text-[9px] uppercase tracking-wider font-semibold text-[#7F8C6A]">
                        {user.role}
                      </span>
                    </div>
                  </Link>

                  {/* Compact Logout Icon Button */}
                  <button
                    onClick={handleLogout}
                    className="text-[#1E3B2F]/60 hover:text-rose-600 hover:bg-rose-50/70 p-1.5 rounded-lg transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#1E3B2F]"
                    title="Sign Out"
                    aria-label="Sign Out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link to="/login">
                  <button className="text-xs uppercase tracking-widest font-bold text-[#1E3B2F] hover:text-[#152A22] px-3 py-1.5 transition-colors focus:outline-none">
                    Log In
                  </button>
                </Link>
                <Link to="/register">
                  <button className="bg-[#1E3B2F] text-[#F5F0E6] hover:bg-[#152A22] font-extrabold text-xs uppercase tracking-widest px-4 py-2 rounded-md transition-all shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3B2F]">
                    Get Started
                  </button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-[#1E3B2F] hover:bg-[#7F8C6A]/15 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#1E3B2F] transition-colors"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Panel */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-[#C8B48A]/40 space-y-1 bg-[#F5F0E6] rounded-b-xl px-2 shadow-lg">
            <Link
              to="/search"
              onClick={closeMobileMenu}
              className={getMobileLinkClass('/search')}
            >
              <Search className="w-3.5 h-3.5 text-[#7F8C6A]" />
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
                  <LayoutDashboard className="w-3.5 h-3.5 text-[#7F8C6A]" />
                  Dashboard
                </Link>
                <Link
                  to="/company/internships?tab=internships"
                  onClick={closeMobileMenu}
                  className={getMobileLinkClass('/company/internships?tab=internships')}
                >
                  <Briefcase className="w-3.5 h-3.5 text-[#7F8C6A]" />
                  Manage Internships
                </Link>
                <Link
                  to="/company/internships?tab=profile"
                  onClick={closeMobileMenu}
                  className={getMobileLinkClass('/company/internships?tab=profile')}
                >
                  <Building2 className="w-3.5 h-3.5 text-[#7F8C6A]" />
                  Company Profile
                </Link>
                <Link
                  to="/applications"
                  onClick={closeMobileMenu}
                  className={getMobileLinkClass('/applications')}
                >
                  <Users className="w-3.5 h-3.5 text-[#7F8C6A]" />
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
                <ShieldCheck className="w-3.5 h-3.5 text-[#7F8C6A]" />
                {user.role === 'admin' ? 'Admin Moderation' : user?.role === 'reviewer' ? 'Reviewer Portal' : 'Verification & Ratings'}
              </Link>
            )}

            {isAuthenticated && (
              <div className="pt-2.5 pb-1 px-3 border-t border-[#C8B48A]/40 mt-2 sm:hidden flex items-center justify-between">
                <Link
                  to={getProfileLink()}
                  onClick={closeMobileMenu}
                  className="flex items-center gap-2.5 hover:opacity-85 transition-opacity"
                  title="Go to Profile / Portfolio"
                >
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={getDisplayName()}
                      className="w-8 h-8 rounded-full object-cover border border-[#C8B48A]/50"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#1E3B2F] text-[#F5F0E6] text-xs font-black flex items-center justify-center border border-[#C8B48A]/50">
                      {getUserInitial()}
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-bold text-[#1E3B2F]">{getDisplayName()}</p>
                    <p className="text-[9px] text-[#7F8C6A] uppercase tracking-wider font-semibold">{user.role}</p>
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-xs uppercase tracking-wider text-rose-600 hover:text-rose-700 font-bold px-2 py-1"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
