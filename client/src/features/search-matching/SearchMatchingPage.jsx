import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Search, Filter, Sparkles, MapPin, Briefcase } from 'lucide-react';

export const SearchMatchingPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Explore & Match Internships</h1>
        <p className="text-sm text-gray-500">
          Algorithmic skills matching and opportunity discovery
        </p>
      </div>

      {/* Search Bar & Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, required skills, or company..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <Button variant="secondary" className="gap-2">
            <Filter className="w-4 h-4" /> Filters
          </Button>
          <Button variant="primary">Search</Button>
        </div>
      </Card>

      {/* Results List */}
      <div className="space-y-4">
        <Card className="hover:border-indigo-200 transition-colors">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-gray-900">Frontend Engineering Intern</h3>
                <Badge variant="purple" className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-600" /> 92% Match
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mt-1">Virtusa Corporation • Colombo (Hybrid)</p>
            </div>
            <Button variant="primary" size="sm">
              Apply Now
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            <Badge variant="info">React</Badge>
            <Badge variant="info">JavaScript</Badge>
            <Badge variant="info">Tailwind CSS</Badge>
            <Badge variant="neutral">6 Months</Badge>
          </div>
        </Card>
      </div>
    </div>
  );
};
