'use client';

import { Button } from '@/components/ui/button';
import type { QuickAction } from './quick-actions-data';

interface QuickActionButtonProps {
  action: QuickAction;
  onClick: () => void;
  disabled: boolean;
}

export function QuickActionButton({ action, onClick, disabled }: QuickActionButtonProps) {
  const Icon = action.icon;

  return (
    <Button
      variant="ghost"
      className="flex flex-col items-center gap-1 h-auto py-3 px-4 hover:bg-accent"
      onClick={onClick}
      disabled={disabled}
    >
      <Icon className={`h-5 w-5 ${action.color}`} />
      <span className="text-xs font-medium">{action.label}</span>
    </Button>
  );
}
