'use client';

import { Settings, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

interface ChatHeaderProps {
  onSettingsClick?: () => void;
  onClose?: () => void;
}

export function ChatHeader({ onSettingsClick, onClose }: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-primary text-primary-foreground">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10 border-2 border-primary-foreground/20">
          <AvatarImage src="/bank-logo.png" alt="SecureBank" />
          <AvatarFallback className="bg-primary-foreground text-primary font-bold text-sm">
            SB
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-lg font-semibold">SecureBank Assistant</h1>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs px-2 py-0 bg-primary-foreground/20 text-primary-foreground border-0">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-1.5 animate-pulse"></span>
              Online
            </Badge>
            <span className="text-xs text-primary-foreground/70">24/7 Support</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <ThemeToggle />
        {onSettingsClick && (
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 hover:bg-primary-foreground/10"
            onClick={onSettingsClick}
          >
            <Settings className="h-4 w-4" />
            <span className="sr-only">Settings</span>
          </Button>
        )}
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 hover:bg-primary-foreground/10"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close chat</span>
          </Button>
        )}
      </div>
    </div>
  );
}
