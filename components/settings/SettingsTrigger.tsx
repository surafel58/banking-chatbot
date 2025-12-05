'use client';

import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface SettingsTriggerProps {
  onClick: () => void;
}

export function SettingsTrigger({ onClick }: SettingsTriggerProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 hover:bg-primary-foreground/10"
            onClick={onClick}
          >
            <Settings className="h-4 w-4" />
            <span className="sr-only">Settings</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Data Sources</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
