'use client';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { QuickAction } from './quick-actions-data';

interface QuickActionButtonProps {
  action: QuickAction;
  onClick: () => void;
  disabled: boolean;
}

export function QuickActionButton({ action, onClick, disabled }: QuickActionButtonProps) {
  const Icon = action.icon;
  const isActionDisabled = action.disabled;

  const button = (
    <Button
      variant="ghost"
      className={`flex flex-col items-center gap-1 h-auto py-3 px-4 hover:bg-accent ${
        isActionDisabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      onClick={onClick}
      disabled={disabled}
    >
      <Icon className={`h-5 w-5 ${isActionDisabled ? 'text-muted-foreground' : action.color}`} />
      <span className="text-xs font-medium">{action.label}</span>
    </Button>
  );

  if (isActionDisabled && action.disabledReason) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {button}
        </TooltipTrigger>
        <TooltipContent>
          <p>{action.disabledReason}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return button;
}
