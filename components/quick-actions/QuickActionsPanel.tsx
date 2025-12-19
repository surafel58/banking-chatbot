'use client';

import { useState } from 'react';
import { ChevronUp, ChevronDown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { QuickActionButton } from './QuickActionButton';
import { quickActions } from './quick-actions-data';

interface QuickActionsPanelProps {
  onAction: (message: string) => void;
  isLoading: boolean;
  visible: boolean;
}

export function QuickActionsPanel({ onAction, isLoading, visible }: QuickActionsPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!visible) return null;

  return (
    <div className="fixed bottom-28 right-4 z-50 md:right-8">
      <TooltipProvider>
        <div className="flex flex-col items-end gap-2">
          {isExpanded && (
            <Card className="p-2 shadow-xl animate-in slide-in-from-bottom-5 fade-in duration-300">
              <div className="grid grid-cols-2 gap-1 md:grid-cols-3">
                {quickActions.map((action) => (
                  <QuickActionButton
                    key={action.id}
                    action={action}
                    onClick={() => {
                      if (!action.disabled) {
                        onAction(action.message);
                        setIsExpanded(false);
                      }
                    }}
                    disabled={isLoading || action.disabled}
                  />
                ))}
              </div>
            </Card>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="lg"
                className="rounded-full h-14 w-14 shadow-xl"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? (
                  <ChevronDown className="h-6 w-6" />
                ) : (
                  <Sparkles className="h-6 w-6" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Quick Actions</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  );
}
