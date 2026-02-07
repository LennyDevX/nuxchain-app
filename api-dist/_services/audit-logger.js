/**
 * Audit Logging Service
 * Persistent logging for security events and fraud detection
 * Stores logs in Firestore for investigation and analysis
 */
import { getDb } from './firebase-admin.js';
const db = getDb();
const AUDIT_LOG_COLLECTION = 'auditLogs';
export var LogLevel;
(function (LogLevel) {
    LogLevel["INFO"] = "INFO";
    LogLevel["WARN"] = "WARN";
    LogLevel["ERROR"] = "ERROR";
    LogLevel["CRITICAL"] = "CRITICAL";
})(LogLevel || (LogLevel = {}));
export var EventType;
(function (EventType) {
    EventType["REGISTRATION_ATTEMPT"] = "REGISTRATION_ATTEMPT";
    EventType["REGISTRATION_SUCCESS"] = "REGISTRATION_SUCCESS";
    EventType["REGISTRATION_FAILED"] = "REGISTRATION_FAILED";
    EventType["VALIDATION_FAILED"] = "VALIDATION_FAILED";
    EventType["RATE_LIMIT_EXCEEDED"] = "RATE_LIMIT_EXCEEDED";
    EventType["IP_FARM_DETECTED"] = "IP_FARM_DETECTED";
    EventType["BOT_DETECTED"] = "BOT_DETECTED";
    EventType["DUPLICATE_DETECTED"] = "DUPLICATE_DETECTED";
    EventType["CEX_WALLET_APPROVED"] = "CEX_WALLET_APPROVED";
    EventType["WALLET_TOO_NEW"] = "WALLET_TOO_NEW";
    EventType["SUSPICIOUS_ACTIVITY"] = "SUSPICIOUS_ACTIVITY";
})(EventType || (EventType = {}));
/**
 * Log an audit event to Firestore
 */
export async function logAuditEvent(data) {
    try {
        const logEntry = {
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
    }
    catch (error) {
        // Fail gracefully - don't block the main flow if logging fails
        console.error('Failed to write audit log:', error);
    }
}
/**
 * Log registration attempt
 */
export async function logRegistrationAttempt(email, wallet, ipAddress, success, reason, metadata) {
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
export async function logSecurityViolation(eventType, message, ipAddress, email, wallet, metadata) {
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
export async function queryAuditLogs(filters) {
    try {
        let query = db.collection(AUDIT_LOG_COLLECTION);
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
        const logs = [];
        snapshot.forEach((doc) => {
            logs.push(doc.data());
        });
        return logs;
    }
    catch (error) {
        console.error('Error querying audit logs:', error);
        return [];
    }
}
