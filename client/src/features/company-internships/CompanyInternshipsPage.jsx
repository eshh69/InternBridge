import React from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { PlusCircle, Building2, MapPin, Calendar } from 'lucide-react';

export const CompanyInternshipsPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Company & Internship Management</h1>
          <p className="text-sm text-gray-500">Module 2 (SEU/IS/22/ICT/033) — Post and manage internship opportunities</p>
        </div>
        <Button variant="primary" size="sm" className="gap-2">
          <PlusCircle className="w-4 h-4" /> Post New Internship
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover:border-indigo-200 transition-colors">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Full-Stack Developer Intern</h3>
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5 text-gray-400" /> Colombo (Hybrid)
              </p>
            </div>
            <Badge variant="success">Published</Badge>
          </div>

          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
            Looking for an enthusiastic undergraduate intern to join our engineering squad working on MERN stack apps.
          </p>

          <div className="flex flex-wrap gap-1.5 mt-4">
            {['React', 'Node.js', 'MongoDB'].map((skill) => (
              <Badge key={skill} variant="neutral" size="sm">
                {skill}
              </Badge>
            ))}
          </div>

          <div className="border-t mt-4 pt-3 flex justify-between items-center text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Deadline: Nov 30, 2026
            </span>
            <div className="flex gap-2">
              <button className="text-indigo-600 hover:underline">Edit</button>
              <button className="text-red-600 hover:underline">Close</button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
