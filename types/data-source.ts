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

// ============================================================================
// Form State Types (following financial-document-analyzer pattern)
// ============================================================================

/**
 * State type for document upload form actions
 */
export type UploadDocumentState = {
  success?: boolean;
  message?: string;
  errors?: {
    file?: string[];
  };
  data?: {
    id?: string;
  };
};

/**
 * State type for URL submission form actions
 */
export type AddUrlState = {
  success?: boolean;
  message?: string;
  errors?: {
    url?: string[];
  };
  data?: {
    id?: string;
  };
};

/**
 * State type for delete operations
 */
export type DeleteDataSourceState = {
  success?: boolean;
  message?: string;
};
