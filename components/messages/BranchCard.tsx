'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Phone } from 'lucide-react';

interface Branch {
  name: string;
  address: string;
  distance?: string;
  hours: string;
  phone?: string;
  isOpen?: boolean;
}

interface BranchCardProps {
  data: {
    branches: Branch[];
  };
}

export function BranchCard({ data }: BranchCardProps) {
  if (!data || !data.branches || data.branches.length === 0) return null;

  return (
    <Card className="mt-3 bg-card/50 border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          Nearby Branches
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.branches.map((branch, index) => (
          <div
            key={index}
            className="p-3 rounded-lg bg-muted/50 space-y-2"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-sm">{branch.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {branch.address}
                </p>
              </div>
              {branch.distance && (
                <Badge variant="secondary" className="text-xs shrink-0">
                  {branch.distance}
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{branch.hours}</span>
                {branch.isOpen !== undefined && (
                  <Badge
                    variant={branch.isOpen ? 'default' : 'secondary'}
                    className={`ml-1 text-[10px] ${
                      branch.isOpen
                        ? 'bg-green-500/20 text-green-500 border-green-500/30'
                        : ''
                    }`}
                  >
                    {branch.isOpen ? 'Open' : 'Closed'}
                  </Badge>
                )}
              </div>
              {branch.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  <span>{branch.phone}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
