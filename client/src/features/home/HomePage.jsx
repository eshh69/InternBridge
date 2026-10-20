import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Briefcase, UserCheck, ShieldCheck, Sparkles, MessageSquare, ArrowRight } from 'lucide-react';

export const HomePage = () => {
  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="text-center max-w-3xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-700 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          Connecting Undergraduates with Industry Leaders
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
          Launch Your Tech Career with <span className="text-indigo-600">InternBridge</span>
        </h1>
        <p className="text-lg text-gray-600">
          Move beyond traditional paper CVs. Build a rich technical portfolio, match with verified internship opportunities, and showcase lecturer-verified endorsements.
        </p>
        <div className="flex flex-wrap justify-center gap-4 pt-2">
          <Link to="/search">
            <Button size="lg" variant="primary" className="gap-2">
              Explore Internships <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link to="/register">
            <Button size="lg" variant="secondary">
              Create Student Profile
            </Button>
          </Link>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="hover:border-indigo-300 transition-colors">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl w-fit mb-4">
            <Briefcase className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Smart Matching Score</h3>
          <p className="text-sm text-gray-600">
            Our automated matching engine pairs student skills and qualifications directly with employer requirements for precision hiring.
          </p>
        </Card>

        <Card className="hover:border-indigo-300 transition-colors">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl w-fit mb-4">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Verified Reviews & Ratings</h3>
          <p className="text-sm text-gray-600">
            University lecturers and industry supervisors provide official evaluations, building authentic trust between students and recruiters.
          </p>
        </Card>

        <Card className="hover:border-indigo-300 transition-colors">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl w-fit mb-4">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Real-time Communication</h3>
          <p className="text-sm text-gray-600">
            Direct 1-on-1 messaging and real-time alerts powered by Socket.IO keep applicants and hiring managers in sync.
          </p>
        </Card>
      </section>
    </div>
  );
};
