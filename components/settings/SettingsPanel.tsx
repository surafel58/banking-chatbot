'use client';

import { useState, useEffect, useCallback } from 'react';
import { Database, X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { AddDocumentForm } from './AddDocumentForm';
import { AddUrlForm } from './AddUrlForm';
import { DataSourceList } from './DataSourceList';
import type { DataSource } from '@/types/data-source';

interface SettingsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsPanel({ open, onOpenChange }: SettingsPanelProps) {
  const [sources, setSources] = useState<DataSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isAddingUrl, setIsAddingUrl] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeletingAllDocs, setIsDeletingAllDocs] = useState(false);
  const [isDeletingAllUrls, setIsDeletingAllUrls] = useState(false);

  const fetchSources = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      const response = await fetch('/api/data-sources');
      if (response.ok) {
        const data = await response.json();
        setSources(data.sources || []);
        return data.sources || [];
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch data sources:', error);
      return [];
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, []);

  // Initial fetch when drawer opens
  useEffect(() => {
    if (open) {
      fetchSources();
    }
  }, [open, fetchSources]);

  // Poll for updates when there are items with "processing" status
  useEffect(() => {
    if (!open) return;

    const hasProcessing = sources.some((s) => s.status === 'processing');
    if (!hasProcessing) return;

    const pollInterval = setInterval(() => {
      fetchSources(false); // Don't show loading spinner during polling
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(pollInterval);
  }, [open, sources, fetchSources]);

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/data-sources/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
      }

      await fetchSources();
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddUrl = async (url: string) => {
    setIsAddingUrl(true);
    try {
      const response = await fetch('/api/data-sources/url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add URL');
      }

      await fetchSources();
    } finally {
      setIsAddingUrl(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const response = await fetch(`/api/data-sources/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSources((prev) => prev.filter((s) => s.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete source:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteAllDocs = async () => {
    setIsDeletingAllDocs(true);
    try {
      for (const source of documentSources) {
        await fetch(`/api/data-sources/${source.id}`, { method: 'DELETE' });
      }
      setSources((prev) => prev.filter((s) => s.type !== 'document'));
    } catch (error) {
      console.error('Failed to delete all documents:', error);
    } finally {
      setIsDeletingAllDocs(false);
    }
  };

  const handleDeleteAllUrls = async () => {
    setIsDeletingAllUrls(true);
    try {
      for (const source of urlSources) {
        await fetch(`/api/data-sources/${source.id}`, { method: 'DELETE' });
      }
      setSources((prev) => prev.filter((s) => s.type !== 'url'));
    } catch (error) {
      console.error('Failed to delete all URLs:', error);
    } finally {
      setIsDeletingAllUrls(false);
    }
  };

  const documentSources = sources.filter((s) => s.type === 'document');
  const urlSources = sources.filter((s) => s.type === 'url');

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Sources
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 px-4">
          <Tabs defaultValue="documents" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="documents">
                Documents ({documentSources.length})
              </TabsTrigger>
              <TabsTrigger value="urls">
                URLs ({urlSources.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="documents" className="mt-4 space-y-4">
              <AddDocumentForm onUpload={handleUpload} isUploading={isUploading} />
              <Separator />
              <DataSourceList
                sources={documentSources}
                isLoading={isLoading}
                onDelete={handleDelete}
                onDeleteAll={handleDeleteAllDocs}
                deletingId={deletingId}
                isDeletingAll={isDeletingAllDocs}
                emptyMessage="No documents uploaded yet"
              />
            </TabsContent>

            <TabsContent value="urls" className="mt-4 space-y-4">
              <AddUrlForm onAdd={handleAddUrl} isAdding={isAddingUrl} />
              <Separator />
              <DataSourceList
                sources={urlSources}
                isLoading={isLoading}
                onDelete={handleDelete}
                onDeleteAll={handleDeleteAllUrls}
                deletingId={deletingId}
                isDeletingAll={isDeletingAllUrls}
                emptyMessage="No URLs added yet"
              />
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}
