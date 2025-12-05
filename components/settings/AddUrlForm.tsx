'use client';

import { useState } from 'react';
import { Link, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AddUrlFormProps {
  onAdd: (url: string) => Promise<void>;
  isAdding: boolean;
}

export function AddUrlForm({ onAdd, isAdding }: AddUrlFormProps) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  const validateUrl = (value: string): string | null => {
    if (!value.trim()) {
      return 'URL is required';
    }
    try {
      new URL(value);
      return null;
    } catch {
      return 'Please enter a valid URL';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateUrl(url);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      await onAdd(url);
      setUrl('');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add URL');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="url"
              placeholder="https://example.com/docs"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError(null);
              }}
              className="pl-10"
              disabled={isAdding}
            />
          </div>
          <Button type="submit" disabled={isAdding || !url.trim()}>
            {isAdding ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </Button>
        </div>
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        Add a URL to index its content into the knowledge base. The content will be
        fetched and processed for the AI assistant to reference.
      </p>
    </form>
  );
}
