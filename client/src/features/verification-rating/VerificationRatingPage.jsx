import React from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ShieldCheck, Star, Award, CheckCircle, Clock } from 'lucide-react';

export const VerificationRatingPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Verification & Ratings Portal</h1>
        <p className="text-sm text-gray-500">
          Module 5 (SEU/IS/22/ICT/057) — Academic evaluations and reviewer trust metrics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Verification Status Card */}
        <Card className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Academic Reviewer Verification</h3>
              <p className="text-xs text-gray-500">Submit lecturer or supervisor credentials for approval</p>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Verified university lecturers can evaluate students' practical knowledge, soft skills, and endorse their portfolios.
          </p>
          <Button variant="secondary" size="sm" className="w-full">
            Submit Credentials Proof
          </Button>
        </Card>

        {/* Reputation Score Card */}
        <Card className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Star className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Reputation & Reviews</h3>
              <p className="text-xs text-gray-500">Verified multi-criteria rating system</p>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-gray-900">4.8</span>
            <span className="text-sm text-gray-500">/ 5.0 (12 verified reviews)</span>
          </div>
          <p className="text-xs text-gray-500">
            Reviews are verified by course coordinators to ensure integrity and prevent fraudulent claims.
          </p>
        </Card>
      </div>
    </div>
  );
};
