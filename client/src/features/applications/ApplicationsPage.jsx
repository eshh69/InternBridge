import React from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Clock, CheckCircle2, XCircle, FileText } from 'lucide-react';

export const ApplicationsPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Application & Recruitment Tracker</h1>
        <p className="text-sm text-gray-500">
          Track submission history and recruitment stages
        </p>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="text-xs uppercase bg-gray-50 text-gray-500 border-b">
              <tr>
                <th className="px-4 py-3">Internship Position</th>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Applied Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="px-4 py-3 font-medium text-gray-900">Frontend Engineering Intern</td>
                <td className="px-4 py-3">Virtusa Corp</td>
                <td className="px-4 py-3">2026-10-18</td>
                <td className="px-4 py-3">
                  <Badge variant="warning" className="flex items-center gap-1 w-fit">
                    <Clock className="w-3 h-3" /> Under Review
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <button className="text-indigo-600 hover:underline text-xs font-medium">
                    View Details
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
