'use client';

import { useState } from 'react';
import { User, LogOut, CreditCard, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/lib/auth/context';
import { AuthModal } from './AuthModal';

export function UserButton() {
  const { user, isAuthenticated, signOut, isLoading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  if (isLoading) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
      </Button>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAuthModal(true)}
          className="gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
        >
          <User className="h-4 w-4" />
          Sign In
        </Button>
        <AuthModal
          open={showAuthModal}
          onOpenChange={setShowAuthModal}
          defaultTab="login"
        />
      </>
    );
  }

  // Get user initials for avatar
  const getInitials = () => {
    const name = user?.user_metadata?.full_name || user?.email || '';
    if (name.includes('@')) {
      return name.charAt(0).toUpperCase();
    }
    return name
      .split(' ')
      .map((n: string) => n.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>
          <CreditCard className="mr-2 h-4 w-4" />
          <span>My Accounts</span>
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => signOut()}
          className="text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
