import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import {
  Briefcase,
  ShieldCheck,
  Sparkles,
  MessageSquare,
  ArrowRight,
  Search,
  CheckCircle2,
  TrendingUp,
  Building2,
  Award,
  Users,
  Code2,
  ChevronDown
} from 'lucide-react';
import heroCityscape from '../../assets/hero-cityscape.jpg';

export const HomePage = () => {
  return (
    <div className="w-full">
      {/* 100% Width & 100vh Height Luxury Forest Hero Section */}
      <section className="relative w-full min-h-[calc(100vh-4rem)] h-[calc(100vh-4rem)] bg-[#1E3B2F] text-[#F5F0E6] flex items-center overflow-hidden border-b border-[#7F8C6A]/30">
        {/* Full-width Cityscape Background with Forest Amber Grading */}
        <div
          className="absolute inset-0 bg-cover bg-right md:bg-center bg-no-repeat opacity-55 sm:opacity-75 transform scale-105 transition-transform duration-1000 contrast-110"
          style={{ backgroundImage: `url(${heroCityscape})` }}
        />

        {/* Ambient Overlays: Deep opaque forest on left for crisp readability, highly transparent on right for vivid Lotus Tower view */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#1E3B2F] via-[#1E3B2F]/75 md:via-[#1E3B2F]/60 to-[#1E3B2F]/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1E3B2F]/80 via-transparent to-[#1E3B2F]/20" />

        {/* Hero Content Aligned with Container */}
        <div className="w-full lg:w-[80%] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-12 flex flex-col justify-center">
          <div className="max-w-4xl space-y-6">
            {/* Serif Eyebrow in Warm Sand (#C8B48A) */}
            <p className="font-serif italic text-lg sm:text-2xl text-[#C8B48A] font-normal tracking-wide">
              The Official Undergraduate Internship & Career Platform
            </p>

            {/* High-Impact Massive Bold Uppercase Headline in Cream (#F5F0E6) */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-black uppercase tracking-tight text-[#F5F0E6] leading-[0.92]">
              POWERING THE NEXT<br className="hidden sm:inline" /> GENERATION OF TECH TALENT
            </h1>

            {/* Subtitle in Soft Cream */}
            <p className="text-sm sm:text-base text-[#F5F0E6]/80 max-w-2xl leading-relaxed">
              Move beyond traditional paper CVs. Build a verifiable technical portfolio, match instantly with premier IT internships, and showcase lecturer-certified endorsements.
            </p>

            {/* Action Buttons with Sand (#C8B48A) & Forest Accent */}
            <div className="flex flex-wrap items-center gap-3 pt-4">
              <Link to="/search">
                <button className="bg-[#C8B48A] hover:bg-[#B39B6D] text-[#1E3B2F] font-extrabold text-xs sm:text-sm uppercase tracking-widest px-7 py-4 rounded-xl transition-all shadow-lg flex items-center gap-2">
                  Explore Internships <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link to="/register">
                <button className="bg-transparent text-[#F5F0E6] border border-[#C8B48A]/60 hover:bg-[#C8B48A]/15 font-bold text-xs sm:text-sm uppercase tracking-widest px-7 py-4 rounded-xl transition-all shadow-xs">
                  Create Student Profile
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Subtle Bottom Scroll Indicator in Sand */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10 flex flex-col items-center gap-1 opacity-70 hover:opacity-100 transition-opacity">
          <span className="text-[10px] uppercase tracking-widest font-semibold text-[#C8B48A]">Scroll Down</span>
          <ChevronDown className="w-4 h-4 text-[#C8B48A] animate-bounce" />
        </div>
      </section>

      {/* Main Content Sections (Constrained to 80% Container) */}
      <div className="w-full lg:w-[80%] mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
        {/* 4 Live Platform Metrics */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-6 bg-white rounded-2xl border border-[#C8B48A]/35 shadow-xs hover:border-[#7F8C6A] transition-all">
            <p className="text-3xl sm:text-4xl font-black text-[#1E3B2F] tracking-tight">100%</p>
            <p className="text-xs font-bold uppercase tracking-wider text-[#7F8C6A] mt-1">Verified Openings</p>
          </div>
          <div className="p-6 bg-white rounded-2xl border border-[#C8B48A]/35 shadow-xs hover:border-[#7F8C6A] transition-all">
            <p className="text-3xl sm:text-4xl font-black text-[#1E3B2F] tracking-tight">SMART</p>
            <p className="text-xs font-bold uppercase tracking-wider text-[#7F8C6A] mt-1">Skill Match Score</p>
          </div>
          <div className="p-6 bg-white rounded-2xl border border-[#C8B48A]/35 shadow-xs hover:border-[#7F8C6A] transition-all">
            <p className="text-3xl sm:text-4xl font-black text-[#1E3B2F] tracking-tight">FACULTY</p>
            <p className="text-xs font-bold uppercase tracking-wider text-[#7F8C6A] mt-1">Verified Ratings</p>
          </div>
          <div className="p-6 bg-white rounded-2xl border border-[#C8B48A]/35 shadow-xs hover:border-[#7F8C6A] transition-all">
            <p className="text-3xl sm:text-4xl font-black text-[#1E3B2F] tracking-tight">REAL-TIME</p>
            <p className="text-xs font-bold uppercase tracking-wider text-[#7F8C6A] mt-1">Recruiter Chat</p>
          </div>
        </section>

        {/* 4 Feature Pillars Grid */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <p className="font-serif italic text-lg sm:text-xl text-[#7F8C6A] font-normal">
              Built for Academic Rigor & Industry Standards
            </p>
            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-[#1E3B2F]">
              An Integrated Ecosystem for Higher Education
            </h2>
            <p className="text-xs sm:text-sm text-[#1E3B2F]/70 max-w-xl mx-auto">
              A cohesive full-stack platform uniting undergraduates, faculty reviewers, and hiring companies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Module 3: Search & Matching Engine */}
            <Card className="hover:border-[#7F8C6A] hover:shadow-md transition-all duration-200 flex flex-col justify-between p-6 bg-white border border-[#C8B48A]/35">
              <div>
                <div className="p-3 bg-[#7F8C6A]/15 text-[#1E3B2F] rounded-xl w-fit mb-4">
                  <Search className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#1E3B2F] mb-2">Smart Matching Engine</h3>
                <p className="text-xs text-[#1E3B2F]/70 leading-relaxed">
                  Automated matching algorithms compare your skill tags and GPA directly against company requirements, calculating precise compatibility percentages.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-[#C8B48A]/25 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#1E3B2F]">
                <span>Explore matching</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Card>

            {/* Module 1: Student Portfolio & Real-time Chat */}
            <Card className="hover:border-[#7F8C6A] hover:shadow-md transition-all duration-200 flex flex-col justify-between p-6 bg-white border border-[#C8B48A]/35">
              <div>
                <div className="p-3 bg-[#7F8C6A]/15 text-[#1E3B2F] rounded-xl w-fit mb-4">
                  <Code2 className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#1E3B2F] mb-2">Digital Portfolio & Chat</h3>
                <p className="text-xs text-[#1E3B2F]/70 leading-relaxed">
                  Showcase GitHub repos, technical project highlights, and verified credentials. Communicate directly with recruiters via Socket.IO messaging.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-[#C8B48A]/25 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#1E3B2F]">
                <span>View portfolio tools</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Card>

            {/* Module 2 & 4: Company & Application Recruitment */}
            <Card className="hover:border-[#7F8C6A] hover:shadow-md transition-all duration-200 flex flex-col justify-between p-6 bg-white border border-[#C8B48A]/35">
              <div>
                <div className="p-3 bg-[#7F8C6A]/15 text-[#1E3B2F] rounded-xl w-fit mb-4">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#1E3B2F] mb-2">Corporate Recruitment</h3>
                <p className="text-xs text-[#1E3B2F]/70 leading-relaxed">
                  Employers publish structured internship postings, review candidate pipelines, track application statuses, and schedule technical evaluations.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-[#C8B48A]/25 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#1E3B2F]">
                <span>Employer portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Card>

            {/* Module 5: Verification & Rating System */}
            <Card className="hover:border-[#7F8C6A] hover:shadow-md transition-all duration-200 flex flex-col justify-between p-6 bg-white border border-[#C8B48A]/35">
              <div>
                <div className="p-3 bg-[#7F8C6A]/15 text-[#1E3B2F] rounded-xl w-fit mb-4">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#1E3B2F] mb-2">Verified Endorsements</h3>
                <p className="text-xs text-[#1E3B2F]/70 leading-relaxed">
                  University mentors and company supervisors rate student skills with immutable verification badges, establishing trusted industry credibility.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-[#C8B48A]/25 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#1E3B2F]">
                <span>Learn about verification</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Card>
          </div>
        </section>

        {/* How it Works / Workflow Guide */}
        <section className="bg-white rounded-3xl border border-[#C8B48A]/35 p-8 sm:p-12 shadow-xs space-y-10">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <p className="font-serif italic text-lg sm:text-xl text-[#7F8C6A] font-normal">
              The Placement Roadmap
            </p>
            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-[#1E3B2F]">
              How InternBridge Works
            </h2>
            <p className="text-xs sm:text-sm text-[#1E3B2F]/70">
              A simple 3-step journey from university coursework to your dream internship.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#1E3B2F] text-[#F5F0E6] font-black text-sm flex items-center justify-center shadow-xs">
                01
              </div>
              <h4 className="text-sm font-extrabold uppercase tracking-wider text-[#1E3B2F]">Build Your Verified Profile</h4>
              <p className="text-xs sm:text-sm text-[#1E3B2F]/70 leading-relaxed">
                Add your tech stack, academic transcript, and project links. Have university lecturers endorse your proficiencies.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#1E3B2F] text-[#F5F0E6] font-black text-sm flex items-center justify-center shadow-xs">
                02
              </div>
              <h4 className="text-sm font-extrabold uppercase tracking-wider text-[#1E3B2F]">Discover High-Match Roles</h4>
              <p className="text-xs sm:text-sm text-[#1E3B2F]/70 leading-relaxed">
                Our automated matching algorithm highlights roles where your skill overlap is strongest, saving you hours of searching.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#1E3B2F] text-[#F5F0E6] font-black text-sm flex items-center justify-center shadow-xs">
                03
              </div>
              <h4 className="text-sm font-extrabold uppercase tracking-wider text-[#1E3B2F]">Apply & Chat Direct</h4>
              <p className="text-xs sm:text-sm text-[#1E3B2F]/70 leading-relaxed">
                Submit structured applications with 1 click, track real-time hiring status updates, and coordinate interviews via live chat.
              </p>
            </div>
          </div>
        </section>

        {/* Call to Action Banner (Forest #1E3B2F Accent with Sand #C8B48A) */}
        <section className="relative rounded-3xl overflow-hidden p-8 sm:p-14 text-[#F5F0E6] text-center space-y-6 shadow-2xl bg-[#1E3B2F] border border-[#7F8C6A]/40">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-25"
            style={{ backgroundImage: `url(${heroCityscape})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1E3B2F] via-[#1E3B2F]/85 to-[#1E3B2F]/65" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-5">
            <p className="font-serif italic text-lg sm:text-xl text-[#C8B48A] font-normal">
              Take the Next Step in Your Career
            </p>
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-[#F5F0E6] leading-tight">
              Ready to Elevate Your Internship Experience?
            </h2>
            <p className="text-xs sm:text-sm text-[#F5F0E6]/80 leading-relaxed max-w-xl mx-auto">
              Join hundreds of undergraduates and top tech companies on the premier verified tech internship platform.
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-3">
              <Link to="/register">
                <button className="bg-[#C8B48A] text-[#1E3B2F] hover:bg-[#B39B6D] font-extrabold text-xs sm:text-sm uppercase tracking-widest px-7 py-4 rounded-xl transition-all shadow-lg">
                  Get Started Now
                </button>
              </Link>
              <Link to="/search">
                <button className="bg-transparent text-[#F5F0E6] border border-[#C8B48A]/60 hover:bg-[#C8B48A]/15 font-bold text-xs sm:text-sm uppercase tracking-widest px-7 py-4 rounded-xl transition-all">
                  Browse All Openings
                </button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
