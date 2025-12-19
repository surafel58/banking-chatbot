import {
  Wallet,
  Send,
  History,
  AlertTriangle,
  MapPin,
  PiggyBank,
  type LucideIcon,
} from 'lucide-react';

export interface QuickAction {
  id: string;
  icon: LucideIcon;
  label: string;
  message: string;
  color: string;
  disabled?: boolean;
  disabledReason?: string;
}

export const quickActions: QuickAction[] = [
  {
    id: 'balance',
    icon: Wallet,
    label: 'Balance',
    message: 'Check my account balance',
    color: 'text-green-500',
    disabled: true,
    disabledReason: 'Coming soon',
  },
  {
    id: 'transfer',
    icon: Send,
    label: 'Transfer',
    message: 'I want to transfer money',
    color: 'text-blue-500',
    disabled: true,
    disabledReason: 'Coming soon',
  },
  {
    id: 'transactions',
    icon: History,
    label: 'History',
    message: 'Show my recent transactions',
    color: 'text-purple-500',
    disabled: true,
    disabledReason: 'Coming soon',
  },
  {
    id: 'lost-card',
    icon: AlertTriangle,
    label: 'Lost Card',
    message: 'I lost my credit card',
    color: 'text-red-500',
  },
  {
    id: 'branches',
    icon: MapPin,
    label: 'Branches',
    message: 'Find nearby branches',
    color: 'text-orange-500',
  },
  {
    id: 'savings',
    icon: PiggyBank,
    label: 'Savings',
    message: 'Tell me about savings accounts',
    color: 'text-pink-500',
  },
];
