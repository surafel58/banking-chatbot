'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart as PieChartIcon } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface SpendingCategory {
  name: string;
  amount: number;
  percentage: number;
  [key: string]: string | number;
}

interface SpendingData {
  categories: SpendingCategory[];
}

interface SpendingChartProps {
  data: SpendingData;
}

const COLORS = [
  'hsl(215, 80%, 55%)',  // Primary blue
  'hsl(142, 70%, 45%)',  // Green
  'hsl(38, 92%, 60%)',   // Orange
  'hsl(199, 89%, 55%)',  // Cyan
  'hsl(280, 65%, 65%)',  // Purple
];

export function SpendingChart({ data }: SpendingChartProps) {
  if (!data || !data.categories || data.categories.length === 0) return null;

  return (
    <Card className="mt-3 bg-card/50 border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <PieChartIcon className="h-4 w-4 text-primary" />
          Spending Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.categories}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                dataKey="amount"
                nameKey="name"
                paddingAngle={2}
              >
                {data.categories.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Amount']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-4">
          {data.categories.map((cat, index) => (
            <div key={index} className="flex items-center gap-2 text-xs">
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-muted-foreground truncate">{cat.name}</span>
              <span className="ml-auto font-medium">${cat.amount.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
