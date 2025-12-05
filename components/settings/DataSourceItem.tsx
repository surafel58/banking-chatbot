'use client';

import { FileText, Link, Trash2, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { DataSource } from '@/types/data-source';

interface DataSourceItemProps {
  source: DataSource;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

const statusConfig = {
  processing: {
    icon: Loader2,
    label: 'Processing',
    className: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
    iconClassName: 'animate-spin',
  },
  ready: {
    icon: CheckCircle,
    label: 'Ready',
    className: 'bg-green-500/20 text-green-500 border-green-500/30',
    iconClassName: '',
  },
  error: {
    icon: XCircle,
    label: 'Error',
    className: 'bg-red-500/20 text-red-500 border-red-500/30',
    iconClassName: '',
  },
};

export function DataSourceItem({ source, onDelete, isDeleting }: DataSourceItemProps) {
  const config = statusConfig[source.status];
  const StatusIcon = config.icon;

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 group">
      <div className="p-2 rounded-lg bg-background">
        {source.type === 'document' ? (
          <FileText className="h-4 w-4 text-muted-foreground" />
        ) : (
          <Link className="h-4 w-4 text-muted-foreground" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{source.name}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
          <span>{formatDate(source.createdAt)}</span>
          {source.metadata?.fileSize && (
            <>
              <span>•</span>
              <span>{formatFileSize(source.metadata.fileSize)}</span>
            </>
          )}
          {source.metadata?.url && (
            <>
              <span>•</span>
              <span className="truncate max-w-[150px]">{source.metadata.url}</span>
            </>
          )}
        </div>
        {source.status === 'error' && source.metadata?.errorMessage && (
          <p className="text-xs text-red-500 mt-1 truncate">
            {source.metadata.errorMessage}
          </p>
        )}
      </div>

      <Badge variant="outline" className={`shrink-0 ${config.className}`}>
        <StatusIcon className={`h-3 w-3 mr-1 ${config.iconClassName}`} />
        {config.label}
      </Badge>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
        onClick={() => onDelete(source.id)}
        disabled={isDeleting}
      >
        {isDeleting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
