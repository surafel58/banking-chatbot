'use client';

import { DataSourceItem } from './DataSourceItem';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { FileX, Trash2 } from 'lucide-react';
import type { DataSource } from '@/types/data-source';

interface DataSourceListProps {
  sources: DataSource[];
  isLoading: boolean;
  onDelete: (id: string) => void;
  onDeleteAll?: () => void;
  deletingId: string | null;
  isDeletingAll?: boolean;
  emptyMessage: string;
}

export function DataSourceList({
  sources,
  isLoading,
  onDelete,
  onDeleteAll,
  deletingId,
  isDeletingAll,
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
      {sources.length > 1 && onDeleteAll && (
        <div className="flex justify-end mb-2">
          <Button
            variant="destructive"
            size="sm"
            onClick={onDeleteAll}
            disabled={isDeletingAll}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            {isDeletingAll ? 'Deleting...' : 'Delete All'}
          </Button>
        </div>
      )}
      {sources.map((source) => (
        <DataSourceItem
          key={source.id}
          source={source}
          onDelete={onDelete}
          isDeleting={deletingId === source.id || isDeletingAll === true}
        />
      ))}
    </div>
  );
}
