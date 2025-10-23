/**
 * ✅ React 19 & TypeScript Best Practices
 * Centralized API type definitions for type-safe backend
 * Part of Issue #34: Migrate API to TypeScript
 */

// ============================================
// Chat Service Types
// ============================================

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
  parts?: Array<{ text: string }>;
}

export interface ChatRequest {
  message: string;
  context?: string;
  conversationHistory?: ChatMessage[];
  useCache?: boolean;
  userId?: string;
}

export interface ChatResponse {
  content: string;
  tokens?: {
    input: number;
    output: number;
    total: number;
  };
  cached?: boolean;
  model?: string;
  timestamp: number;
}

export interface StreamChunk {
  type: 'content' | 'metadata' | 'error' | 'done';
  data: string | ChatMetadata | ErrorInfo;
}

export interface ChatMetadata {
  model: string;
  tokens: {
    input: number;
    output: number;
  };
  cached: boolean;
  processingTime: number;
}

// ============================================
// Analytics Types
// ============================================

export interface AnalyticsEvent {
  eventType: 'page_view' | 'chat_interaction' | 'nft_action' | 'staking_action';
  userId?: string;
  sessionId: string;
  timestamp: number;
  metadata?: Record<string, string | number | boolean>;
}

export interface AnalyticsResponse {
  success: boolean;
  eventId?: string;
  error?: string;
}

// ============================================
// Embeddings Types
// ============================================

export interface EmbeddingRequest {
  text: string;
  model?: string;
}

export interface EmbeddingResponse {
  embedding: number[];
  dimensions: number;
  model: string;
}

export interface SemanticSearchRequest {
  query: string;
  topK?: number;
  threshold?: number;
}

export interface SemanticSearchResult {
  content: string;
  score: number;
  metadata?: Record<string, string | number | boolean>;
}

// ============================================
// Error Types
// ============================================

export interface ErrorInfo {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: number;
}

export interface ApiError extends Error {
  statusCode: number;
  code: string;
  details?: Record<string, unknown>;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
}

// ============================================
// Knowledge Base Types
// ============================================

export interface KnowledgeBaseContext {
  context: string;
  score: number;
  metadata?: Record<string, unknown>;
}

// ============================================
// Rate Limiting Types
// ============================================

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
}

export interface RateLimitResponse {
  allowed: boolean;
  info: RateLimitInfo;
}

// ============================================
// Health Check Types
// ============================================

export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: number;
  services: {
    [key: string]: {
      status: 'up' | 'down';
      latency?: number;
      error?: string;
    };
  };
}

// ============================================
// Type Guards
// ============================================

export function isChatRequest(obj: unknown): obj is ChatRequest {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as ChatRequest).message === 'string'
  );
}

export function isAnalyticsEvent(obj: unknown): obj is AnalyticsEvent {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as AnalyticsEvent).eventType === 'string' &&
    typeof (obj as AnalyticsEvent).timestamp === 'number'
  );
}

// ============================================
// Utility Types
// ============================================

// ✅ Express Request/Response types
export interface ExpressRequest {
  body: unknown;
  params: Record<string, string>;
  query: Record<string, string | string[]>;
  headers: Record<string, string | string[] | undefined>;
}

export interface ExpressResponse {
  status: (code: number) => ExpressResponse;
  json: (data: unknown) => void;
  send: (data: unknown) => void;
  setHeader: (name: string, value: string) => void;
}

export type AsyncHandler<T = unknown> = (
  req: ExpressRequest,
  res: ExpressResponse
) => Promise<T>;

export type Middleware = (
  req: ExpressRequest,
  res: ExpressResponse,
  next: () => void
) => void | Promise<void>;
