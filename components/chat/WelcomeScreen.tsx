'use client';

import { Wallet, MapPin, AlertTriangle, HelpCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface WelcomeScreenProps {
  onQuickAction: (message: string) => void;
  isLoading: boolean;
}

const quickActions = [
  {
    id: 'balance',
    icon: Wallet,
    title: 'Check Balance',
    description: 'View your account balance',
    message: 'Check my account balance',
    iconColor: 'text-green-500',
  },
  {
    id: 'branch',
    icon: MapPin,
    title: 'Find Branch',
    description: 'Locate branches and ATMs',
    message: 'Find nearby branches',
    iconColor: 'text-blue-500',
  },
  {
    id: 'lost-card',
    icon: AlertTriangle,
    title: 'Lost Card',
    description: 'Report a lost or stolen card',
    message: 'I lost my credit card',
    iconColor: 'text-red-500',
  },
  {
    id: 'help',
    icon: HelpCircle,
    title: 'Information',
    description: 'General banking questions',
    message: 'What are your branch hours?',
    iconColor: 'text-purple-500',
  },
];

export function WelcomeScreen({ onQuickAction, isLoading }: WelcomeScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-8 px-4">
      <div className="text-center mb-8">
        <div className="mb-4 text-5xl">
          <span role="img" aria-label="wave">👋</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Welcome to SecureBank!
        </h2>
        <p className="text-muted-foreground text-base md:text-lg">
          How can I assist you today?
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Card
              key={action.id}
              className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] hover:border-primary/50 active:scale-[0.98]"
              onClick={() => !isLoading && onQuickAction(action.message)}
            >
              <CardContent className="p-4">
                <button
                  disabled={isLoading}
                  className="w-full text-left disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg bg-muted ${action.iconColor}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">
                        {action.title}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {action.description}
                      </div>
                    </div>
                  </div>
                </button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
