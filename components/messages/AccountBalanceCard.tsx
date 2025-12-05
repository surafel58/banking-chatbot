'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';

interface Account {
  name: string;
  type: string;
  balance: number;
  currency: string;
  change?: number;
}

interface AccountBalanceData {
  accounts: Account[];
  totalBalance: number;
  currency: string;
}

interface AccountBalanceCardProps {
  data: AccountBalanceData;
}

export function AccountBalanceCard({ data }: AccountBalanceCardProps) {
  if (!data || !data.accounts) return null;

  return (
    <Card className="mt-3 bg-card/50 border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Wallet className="h-4 w-4 text-primary" />
          Account Balances
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.accounts.map((account, index) => (
          <div key={index}>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-sm">{account.name}</p>
                <Badge variant="secondary" className="text-xs mt-1">
                  {account.type}
                </Badge>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">
                  {account.currency} {account.balance.toLocaleString()}
                </p>
                {account.change !== undefined && (
                  <div
                    className={`flex items-center justify-end text-xs ${
                      account.change >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}
                  >
                    {account.change >= 0 ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    )}
                    {account.change >= 0 ? '+' : ''}
                    {account.change}%
                  </div>
                )}
              </div>
            </div>
            {index < data.accounts.length - 1 && <Separator className="mt-3" />}
          </div>
        ))}
        <Separator />
        <div className="flex justify-between items-center pt-2">
          <p className="font-semibold">Total Balance</p>
          <p className="font-bold text-xl text-primary">
            {data.currency} {data.totalBalance.toLocaleString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
