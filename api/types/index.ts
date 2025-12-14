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

export interface KnowledgeBaseMetadata {
  type: string;
  category?: string;
  topic?: string;
  [key: string]: string | undefined;
}

export interface KnowledgeBaseItem {
  content: string;
  metadata: KnowledgeBaseMetadata;
  commands: string[];
}

export interface SearchQuery {
  query: string;
  limit?: number;
  docs?: KnowledgeBaseItem[];
}

export interface ScoredKnowledgeItem extends KnowledgeBaseItem {
  score: number;
}

// ============================================
// Query Classifier Types
// ============================================

export interface ClassificationOptions {
  includeContext?: boolean;
  debugMode?: boolean;
}

export interface ConversationContext {
  lastQueryWasAboutNuxchain: boolean;
  previousTopics: string[];
}

export interface SimpleClassificationResult {
  needsKB: boolean;
  reason: string;
  score: number;
}

export interface DetailedClassificationResult extends SimpleClassificationResult {
  reasoning: string[];
  keywordMatches: number;
  matchedKeywords: string[];
  isCapabilityQuestion: boolean;
  hasNumericPattern: boolean;
  hasNuxchainContext: boolean;
}

export type ClassificationResult = SimpleClassificationResult | DetailedClassificationResult;

// ============================================
// Semantic Streaming Types
// ============================================

export interface StreamingTimings {
  chunkDelay: number;
  sentenceDelay: number;
}

export interface ContentAnalysis {
  totalLength: number;
  sentences: number;
  codeBlocks: number;
  inlineCode: number;
  formulas: number;
  lists: number;
  headers: number;
  complexConcepts: number;
  complexity: 'simple' | 'medium' | 'high';
}

export interface SemanticChunk {
  content: string;
  type: 'simple' | 'complex' | 'code' | 'formula' | 'list' | 'header' | 'separator';
  position: number;
  timing: StreamingTimings;
}

export interface StreamConfig {
  enableSemanticChunking?: boolean;
  enableContextualPauses?: boolean;
  enableVariableSpeed?: boolean;
  clientInfo?: {
    ip?: string;
    userAgent?: string;
  };
  chunkSize?: number;
  delayMs?: number;
  fastMode?: boolean;
}

export interface StreamResponse {
  setHeader(name: string, value: string | string[]): void;
  write(chunk: string): boolean;
  end(chunk?: string): void;
  destroyed: boolean;
  writableEnded: boolean;
}

// ========================================
// Analytics Service Types (Phase 2)
// ========================================
export interface RequestMetrics {
  id: string;
  service: string;
  operation: string;
  startTime: number;
  startMemory: number;
  endTime?: number;
  duration?: number;
  endMemory?: number;
  memoryDelta?: number;
  success?: boolean;
  error?: ErrorInfo;
}

export interface ErrorInfo {
  message: string;
  name: string;
  stack?: string;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata: Record<string, unknown>;
}

export interface ServiceStats {
  service: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  successRate: number;
  averageDuration: number;
  averageMemoryDelta: number;
  lastRequest?: RequestMetrics;
}

export interface PerformanceMetricSummary {
  count: number;
  latest: PerformanceMetric;
  average: number;
}

export interface AllStats {
  services: ServiceStats[];
  totalRequests: number;
  performanceMetrics: Record<string, PerformanceMetricSummary>;
  memoryUsage: number;
}

// ========================================
// System Instruction Types (Phase 2)
// ========================================
export interface SystemInstructionPart {
  text: string;
}

export interface SystemInstruction {
  parts: SystemInstructionPart[];
}

// ========================================
// Context Cache Service Types (Phase 3)
// ========================================
export interface CacheEntry<T = unknown> {
  value: T;
  expiresAt: number;
  createdAt: number;
}

export interface CacheStats {
  totalEntries: number;
  validEntries: number;
  expiredEntries: number;
  maxSize: number;
}

// ========================================
// URL Context Service Types (Phase 3)
// ========================================
export interface UrlContextOptions {
  maxContentLength?: number;
  timeout?: number;
}

export interface ScrapedContent {
  success: boolean;
  url: string;
  title?: string;
  content?: string;
  metadata?: Record<string, unknown>;
  error?: string;
}

export interface UrlContentMetadata {
  domain: string;
  extractedAt: string;
  contentLength: number;
  originalLength: number;
  [key: string]: unknown;
}

export interface ProcessedUrlContent {
  url: string;
  title: string;
  content: string;
  metadata: UrlContentMetadata;
  summary: string;
}

export interface CachedUrlData {
  data: ProcessedUrlContent;
  timestamp: number;
}

// ========================================
// Web Scraper Service Types (Phase 3)
// ========================================
export interface WebScraperOptions {
  maxContentLength?: number;
  timeout?: number;
}

export interface ExtractedHtmlData {
  title: string;
  content: string;
  metadata: {
    description?: string;
    hasContent: boolean;
    wordCount: number;
  };
}

export interface WebScraperResult {
  success: boolean;
  url: string;
  title?: string;
  content?: string;
  error?: string;
  metadata: {
    domain: string;
    extractedAt: string;
    contentLength?: number;
    failed?: boolean;
    description?: string;
    hasContent?: boolean;
    wordCount?: number;
  };
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
