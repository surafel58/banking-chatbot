// Core Types for Banking Chatbot

// Intent Types
export enum Intent {
  BALANCE_INQUIRY = 'balance_inquiry',
  BRANCH_LOCATOR = 'branch_locator',
  CARD_LOST = 'card_lost',
  CARD_MANAGEMENT = 'card_management',
  TRANSACTION_INQUIRY = 'transaction_inquiry',
  FAQ = 'faq',
  HUMAN_HANDOFF = 'human_handoff',
  UNKNOWN = 'unknown',
}

export interface IntentPattern {
  intent: Intent;
  patterns: RegExp[];
  priority: number;
}

export interface IntentResult {
  type: Intent;
  confidence: number;
  entities?: Record<string, any>;
}

// Message Types
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt?: Date;
  intent?: string;
  confidence?: number;
  toolCalls?: ToolCall[];
}

export interface ToolCall {
  id: string;
  type: string;
  function: {
    name: string;
    arguments: string;
  };
  result?: any;
}

// Authentication Types
export type AuthLevel = 'none' | 'basic' | 'standard' | 'enhanced';

export interface SecurityContext {
  userId?: string;
  sessionId: string;
  authLevel: AuthLevel;
  lastVerified: Date;
  ipAddress: string;
}

// RAG Types
export interface KnowledgeDocument {
  id: string;
  content: string;
  embedding?: number[];
  metadata: {
    category: 'policy' | 'product' | 'faq' | 'procedure';
    source: string;
    lastUpdated: Date;
    tags: string[];
  };
}

export interface RetrievalOptions {
  threshold?: number;
  topK?: number;
  categoryFilter?: string;
}

export interface Document {
  id: string;
  content: string;
  metadata: Record<string, any>;
  similarity?: number;
}

// Conversation Types
export interface Conversation {
  id: string;
  userId?: string;
  sessionId: string;
  status: 'active' | 'ended' | 'transferred';
  startedAt: Date;
  endedAt?: Date;
  metadata?: Record<string, any>;
}

// Handoff Types
export interface HandoffRequest {
  conversationId: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  reason: string;
  customerSentiment: number;
  conversationSummary: string;
  suggestedDepartment: string;
}

export interface HandoffQueueItem {
  id: string;
  conversationId: string;
  priority: string;
  reason: string;
  status: 'waiting' | 'assigned' | 'completed';
  assignedAgentId?: string;
  createdAt: Date;
  handledAt?: Date;
}

// Banking Operation Types
export interface CardOperation {
  action: 'freeze' | 'unfreeze' | 'report_lost' | 'order_replacement' | 'activate';
  cardId?: string;
  cardLast4?: string;
  reason?: string;
}

export interface AccountBalance {
  accountType: 'checking' | 'savings' | 'credit';
  currentBalance: number;
  availableBalance: number;
  pending: number;
  currency: string;
}

export interface Transaction {
  id: string;
  date: Date;
  description: string;
  amount: number;
  type: 'debit' | 'credit';
  status: 'pending' | 'completed' | 'declined';
  category?: string;
}

export interface BranchLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  hours: Record<string, string>;
  services: string[];
  coordinates?: {
    lat: number;
    lng: number;
  };
  distance?: number;
}

// API Request/Response Types
export interface ChatRequest {
  messages: Message[];
  sessionId: string;
  authToken?: string;
}

export interface ChatResponse {
  response: string;
  toolCalls?: ToolCall[];
  requiresAuth?: boolean;
  handoffInitiated?: boolean;
}

export interface VerifyRequest {
  method: 'pin' | 'password' | '2fa';
  credential: string;
  sessionId: string;
}

export interface SessionResponse {
  sessionId: string;
  authLevel: AuthLevel;
  expiresAt: Date;
  userId?: string;
}

export interface IngestRequest {
  documents: Array<{
    content: string;
    category: string;
    metadata: Record<string, any>;
  }>;
}

// Audit Log Types
export interface AuditLog {
  timestamp: Date;
  userId?: string;
  sessionId: string;
  action: string;
  result: 'success' | 'failure';
  metadata: {
    ipAddress: string;
    userAgent: string;
    authLevel: AuthLevel;
    [key: string]: any;
  };
}

// Database Types
export interface DatabaseUser {
  id: string;
  email?: string;
  phone?: string;
  created_at: Date;
}

export interface DatabaseConversation {
  id: string;
  user_id?: string;
  session_id: string;
  status: string;
  started_at: Date;
  ended_at?: Date;
  metadata?: any;
}

export interface DatabaseMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  intent?: string;
  confidence?: number;
  tools_used?: any;
  created_at: Date;
}

export interface DatabaseDocument {
  id: string;
  content: string;
  embedding?: number[];
  category?: string;
  metadata?: any;
  source?: string;
  created_at: Date;
  updated_at: Date;
}

// Rate Limiting Types
export interface RateLimitConfig {
  requests: number;
  window: string;
}

export interface RateLimits {
  global: RateLimitConfig;
  perUser: RateLimitConfig;
  perIP: RateLimitConfig;
  sensitiveOps: RateLimitConfig;
}

// Metrics Types
export interface ConversationMetrics {
  sessionId: string;
  intentCounts: Record<string, number>;
  toolUsageCounts: Record<string, number>;
  averageConfidence: number;
  handoffRequested: boolean;
  userSatisfaction?: number;
  conversationLength: number;
  errors: number;
}

// Error Types
export class ChatbotError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'ChatbotError';
  }
}

export class AuthenticationError extends ChatbotError {
  constructor(message: string = 'Authentication required', details?: any) {
    super(message, 'AUTH_ERROR', 401, details);
    this.name = 'AuthenticationError';
  }
}

export class RateLimitError extends ChatbotError {
  constructor(message: string = 'Rate limit exceeded', details?: any) {
    super(message, 'RATE_LIMIT_ERROR', 429, details);
    this.name = 'RateLimitError';
  }
}
