export interface DataSource {
  id: string;
  type: 'document' | 'url';
  name: string;
  status: 'processing' | 'ready' | 'error';
  createdAt: Date;
  metadata?: {
    fileSize?: number;
    fileType?: string;
    url?: string;
    errorMessage?: string;
  };
}

export interface DataSourcesState {
  sources: DataSource[];
  isLoading: boolean;
  error: string | null;
}
