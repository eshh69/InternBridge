import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { User, Award, BookOpen, ExternalLink, FileText } from 'lucide-react';

export const StudentPortfolioPage = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Career Portfolio</h1>
          <p className="text-sm text-gray-500">Manage your profile, projects, and skills</p>
        </div>
        <Button variant="primary" size="sm">
          Edit Portfolio
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile Card */}
        <Card className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-2xl">
              {user?.name?.charAt(0) || 'S'}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{user?.name}</h2>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <Badge variant="info" size="sm" className="mt-1 capitalize">
                {user?.role}
              </Badge>
            </div>
          </div>

          <div className="border-t pt-4 space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-gray-400" />
              <span>South Eastern University of Sri Lanka</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-400" />
              <span>BSc in Information & Communication Technology</span>
            </div>
          </div>
        </Card>

        {/* Right Column: Portfolio Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h3 className="text-md font-bold text-gray-900 mb-3">Skills & Expertise</h3>
            <div className="flex flex-wrap gap-2">
              {['React.js', 'Node.js', 'Express', 'MongoDB', 'Tailwind CSS', 'Git'].map((skill) => (
                <Badge key={skill} variant="neutral" size="md">
                  {skill}
                </Badge>
              ))}
            </div>
          </Card>

          <Card>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-md font-bold text-gray-900">Projects & Experience</h3>
              <Button variant="ghost" size="sm">+ Add Project</Button>
            </div>
            <p className="text-sm text-gray-500 italic">No projects added yet. Click above to showcase your work.</p>
          </Card>
        </div>
      </div>
    </div>
  );
};
