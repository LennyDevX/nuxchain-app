/**
 * Audit Logging Service
 * Persistent logging for security events and fraud detection
 * Stores logs in Firestore for investigation and analysis
 */

import { getDb } from './firebase-admin.js';
import type { Query } from 'firebase-admin/firestore';

const db = getDb();
const AUDIT_LOG_COLLECTION = 'auditLogs';

export enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

export enum EventType {
  REGISTRATION_ATTEMPT = 'REGISTRATION_ATTEMPT',
  REGISTRATION_SUCCESS = 'REGISTRATION_SUCCESS',
  REGISTRATION_FAILED = 'REGISTRATION_FAILED',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  IP_FARM_DETECTED = 'IP_FARM_DETECTED',
  BOT_DETECTED = 'BOT_DETECTED',
  DUPLICATE_DETECTED = 'DUPLICATE_DETECTED',
  CEX_WALLET_APPROVED = 'CEX_WALLET_APPROVED',
  WALLET_TOO_NEW = 'WALLET_TOO_NEW',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
}

interface AuditLogData {
  level: LogLevel;
  eventType: EventType;
  message: string;
  timestamp: Date;
  ipAddress?: string;
  email?: string;
  wallet?: string;
  fingerprint?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Log an audit event to Firestore
 */
export async function logAuditEvent(data: Omit<AuditLogData, 'timestamp'>): Promise<void> {
  try {
    const logEntry: AuditLogData = {
      ...data,
      timestamp: new Date(),
    };
    
    // Add to Firestore
    await db.collection(AUDIT_LOG_COLLECTION).add(logEntry);
    
    // Also log to console for immediate visibility in Vercel logs
    const emoji = data.level === LogLevel.CRITICAL ? '🚨' :
                  data.level === LogLevel.ERROR ? '❌' :
                  data.level === LogLevel.WARN ? '⚠️' : 'ℹ️';
    
    const metadataOutput = data.metadata || {};
    console.log(`${emoji} [${data.eventType}] ${data.message}`, metadataOutput);
  } catch (error) {
    // Fail gracefully - don't block the main flow if logging fails
    console.error('Failed to write audit log:', error);
  }
}

/**
 * Log registration attempt
 */
export async function logRegistrationAttempt(
  email: string,
  wallet: string,
  ipAddress: string,
  success: boolean,
  reason?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  await logAuditEvent({
    level: success ? LogLevel.INFO : LogLevel.WARN,
    eventType: success ? EventType.REGISTRATION_SUCCESS : EventType.REGISTRATION_FAILED,
    message: success 
      ? `Registration successful for ${email}`
      : `Registration failed: ${reason}`,
    email,
    wallet,
    ipAddress,
    metadata: {
      ...metadata,
      reason,
    },
  });
}

/**
 * Log security violation
 */
export async function logSecurityViolation(
  eventType: EventType,
  message: string,
  ipAddress: string,
  email?: string,
  wallet?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  await logAuditEvent({
    level: LogLevel.CRITICAL,
    eventType,
    message,
    ipAddress,
    email,
    wallet,
    metadata,
  });
}

/**
 * Query audit logs (for admin dashboard or investigation)
 */
export async function queryAuditLogs(
  filters: {
    eventType?: EventType;
    email?: string;
    wallet?: string;
    ipAddress?: string;
    startTime?: Date;
    endTime?: Date;
    limit?: number;
  }
): Promise<AuditLogData[]> {
  try {
    let query: Query = db.collection(AUDIT_LOG_COLLECTION) as Query;
    
    if (filters.eventType) {
      query = query.where('eventType', '==', filters.eventType);
    }
    if (filters.email) {
      query = query.where('email', '==', filters.email);
    }
    if (filters.wallet) {
      query = query.where('wallet', '==', filters.wallet);
    }
    if (filters.ipAddress) {
      query = query.where('ipAddress', '==', filters.ipAddress);
    }
    if (filters.startTime) {
      query = query.where('timestamp', '>=', filters.startTime);
    }
    if (filters.endTime) {
      query = query.where('timestamp', '<=', filters.endTime);
    }
    
    query = query.orderBy('timestamp', 'desc');
    
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    
    const snapshot = await query.get();
    const logs: AuditLogData[] = [];
    
    snapshot.forEach((doc) => {
      logs.push(doc.data() as AuditLogData);
    });
    
    return logs;
  } catch (error) {
    console.error('Error querying audit logs:', error);
    return [];
  }
}
