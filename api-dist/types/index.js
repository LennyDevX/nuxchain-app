/**
 * ✅ React 19 & TypeScript Best Practices
 * Centralized API type definitions for type-safe backend
 * Part of Issue #34: Migrate API to TypeScript
 */
// ============================================
// Type Guards
// ============================================
export function isChatRequest(obj) {
    return (typeof obj === 'object' &&
        obj !== null &&
        typeof obj.message === 'string');
}
export function isAnalyticsEvent(obj) {
    return (typeof obj === 'object' &&
        obj !== null &&
        typeof obj.eventType === 'string' &&
        typeof obj.timestamp === 'number');
}
