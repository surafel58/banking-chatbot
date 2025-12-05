'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { History, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  category: string;
}

interface TransactionTableProps {
  data: {
    transactions: Transaction[];
  };
}

export function TransactionTable({ data }: TransactionTableProps) {
  if (!data || !data.transactions || data.transactions.length === 0) return null;

  return (
    <Card className="mt-3 bg-card/50 border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <History className="h-4 w-4 text-primary" />
          Recent Transactions
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(tx.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="font-medium text-sm">
                    {tx.description}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {tx.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div
                      className={`flex items-center justify-end gap-1 font-medium ${
                        tx.type === 'credit' ? 'text-green-500' : 'text-foreground'
                      }`}
                    >
                      {tx.type === 'credit' ? (
                        <ArrowDownLeft className="h-3 w-3" />
                      ) : (
                        <ArrowUpRight className="h-3 w-3" />
                      )}
                      {tx.type === 'credit' ? '+' : '-'}$
                      {Math.abs(tx.amount).toLocaleString()}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
