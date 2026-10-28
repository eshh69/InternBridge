import React from 'react';
import { Badge } from '../../../components/ui/Badge';
import { ShieldCheck, Clock, XCircle, ShieldAlert } from 'lucide-react';

export const VerificationStatusBadge = ({ status = 'unverified', size = 'md' }) => {
  const configs = {
    approved: {
      variant: 'success',
      icon: <ShieldCheck className="w-3.5 h-3.5 mr-1" />,
      label: 'Verified',
    },
    verified: {
      variant: 'success',
      icon: <ShieldCheck className="w-3.5 h-3.5 mr-1" />,
      label: 'Verified',
    },
    pending: {
      variant: 'warning',
      icon: <Clock className="w-3.5 h-3.5 mr-1" />,
      label: 'Pending Review',
    },
    rejected: {
      variant: 'danger',
      icon: <XCircle className="w-3.5 h-3.5 mr-1" />,
      label: 'Rejected',
    },
    unverified: {
      variant: 'neutral',
      icon: <ShieldAlert className="w-3.5 h-3.5 mr-1" />,
      label: 'Unverified',
    },
  };

  const current = configs[status.toLowerCase()] || configs.unverified;

  return (
    <Badge variant={current.variant} size={size} className="inline-flex items-center">
      {current.icon}
      <span>{current.label}</span>
    </Badge>
  );
};
