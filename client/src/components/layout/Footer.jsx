import React from 'react';
import { Link } from 'react-router-dom';
import internbridgeLogo from '../../assets/internbridge-logo.png';
import { ShieldCheck } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-[#1E3B2F] border-t border-[#7F8C6A]/30 mt-auto pt-12 pb-8 text-[#F5F0E6]/80">
      <div className="w-full lg:w-[80%] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Col 1: Brand & Mission */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <img
                src={internbridgeLogo}
                alt="InternBridge Logo"
                className="w-8 h-8 object-contain rounded-lg"
              />
              <span className="text-base font-extrabold uppercase tracking-widest text-[#F5F0E6]">
                InternBridge
              </span>
            </div>
            <p className="text-xs text-[#F5F0E6]/70 max-w-md leading-relaxed">
              The premier undergraduate career and internship placement platform. Connecting verified talent with industry-leading technology employers through smart skill-matching and authentic endorsements.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#152A22] border border-[#7F8C6A]/40 rounded-md text-[11px] font-medium text-[#C8B48A]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#C8B48A]" />
              <span>Verified Talent & Industry Endorsed</span>
            </div>
          </div>

          {/* Col 2: For Students */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#C8B48A]">For Candidates</h4>
            <ul className="space-y-2 text-xs uppercase tracking-wider">
              <li>
                <Link to="/search" className="hover:text-[#F5F0E6] transition-colors">
                  Find Internships
                </Link>
              </li>
              <li>
                <Link to="/applications" className="hover:text-[#F5F0E6] transition-colors">
                  Track Applications
                </Link>
              </li>
              <li>
                <Link to="/student/portfolio" className="hover:text-[#F5F0E6] transition-colors">
                  Digital Portfolio
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-[#F5F0E6] transition-colors">
                  Candidate Sign Up
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: For Employers & Reviewers */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#C8B48A]">For Employers</h4>
            <ul className="space-y-2 text-xs uppercase tracking-wider">
              <li>
                <Link to="/company/internships" className="hover:text-[#F5F0E6] transition-colors">
                  Employer Dashboard
                </Link>
              </li>
              <li>
                <Link to="/search" className="hover:text-[#F5F0E6] transition-colors">
                  Candidate Matching
                </Link>
              </li>
              <li>
                <Link to="/verifications" className="hover:text-[#F5F0E6] transition-colors">
                  Verification Portal
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-[#F5F0E6] transition-colors">
                  Recruiter Sign In
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-[#7F8C6A]/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#F5F0E6]/50">
          <p>© {new Date().getFullYear()} InternBridge Platform. All rights reserved.</p>
          <p className="tracking-wide text-[#C8B48A]/80">
            Next-Generation Career & Placement Ecosystem
          </p>
        </div>
      </div>
    </footer>
  );
};
