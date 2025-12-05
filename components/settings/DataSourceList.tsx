'use client';

import { DataSourceItem } from './DataSourceItem';
import { Skeleton } from '@/components/ui/skeleton';
import { FileX } from 'lucide-react';
import type { DataSource } from '@/types/data-source';

interface DataSourceListProps {
  sources: DataSource[];
  isLoading: boolean;
  onDelete: (id: string) => void;
  deletingId: string | null;
  emptyMessage: string;
}

export function DataSourceList({
  sources,
  isLoading,
  onDelete,
  deletingId,
  emptyMessage,
}: DataSourceListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (sources.length === 0) {
    return (
      <div className="text-center py-8">
        <FileX className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sources.map((source) => (
        <DataSourceItem
          key={source.id}
          source={source}
          onDelete={onDelete}
          isDeleting={deletingId === source.id}
        />
      ))}
    </div>
  );
}
