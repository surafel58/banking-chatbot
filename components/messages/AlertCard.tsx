'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertTriangle,
  CheckCircle,
  Info,
  XCircle,
} from 'lucide-react';

interface AlertData {
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
}

interface AlertCardProps {
  data: AlertData;
}

const alertConfig = {
  success: {
    icon: CheckCircle,
    className: 'border-green-500/50 bg-green-500/10 text-green-500',
  },
  warning: {
    icon: AlertTriangle,
    className: 'border-orange-500/50 bg-orange-500/10 text-orange-500',
  },
  error: {
    icon: XCircle,
    className: 'border-red-500/50 bg-red-500/10 text-red-500',
  },
  info: {
    icon: Info,
    className: 'border-blue-500/50 bg-blue-500/10 text-blue-500',
  },
};

export function AlertCard({ data }: AlertCardProps) {
  if (!data) return null;

  const config = alertConfig[data.type] || alertConfig.info;
  const Icon = config.icon;

  return (
    <Alert className={`mt-3 ${config.className}`}>
      <Icon className="h-4 w-4" />
      <AlertTitle>{data.title}</AlertTitle>
      <AlertDescription className="text-foreground/80">
        {data.message}
      </AlertDescription>
    </Alert>
  );
}
