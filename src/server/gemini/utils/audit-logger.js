/**
 * 📋 Audit Logger — Local Dev Server
 * ====================================
 * Non-blocking fire-and-forget audit event logger.
 * Writes to Firestore 'auditLogs' collection, mirroring api/_services/audit-logger.ts
 *
 * Usage:
 *   import { logAuditEvent } from '../utils/audit-logger.js';
 *   logAuditEvent({ eventType: 'DAILY_LIMIT_REACHED', message: '...', wallet: '0x...' });
 *
 * @module audit-logger
 */

// ── Firestore lazy init ───────────────────────────────────────────────────────
let _db = null;

async function getFirestoreDb() {
  if (_db) return _db;
  try {
    const { initializeApp, getApps, cert } = await import('firebase-admin/app');
    const { getFirestore } = await import('firebase-admin/firestore');
    if (getApps().length === 0) {
      const svcAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
      if (svcAccount) {
        let parsed = null;
        let raw = svcAccount.trim();
        if ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))) {
          raw = raw.slice(1, -1);
        }
        try { parsed = JSON.parse(raw); }
        catch {
          let inString = false, wasBackslash = false, fixed = '';
          for (const ch of raw) {
            if (wasBackslash) { fixed += ch; wasBackslash = false; }
            else if (ch === '\\' && inString) { fixed += ch; wasBackslash = true; }
            else if (ch === '"') { inString = !inString; fixed += ch; }
            else if (inString && ch === '\n') { fixed += '\\n'; }
            else if (inString && ch === '\r') { /* skip */ }
            else { fixed += ch; }
          }
          parsed = JSON.parse(fixed);
        }
        initializeApp({ credential: cert(parsed) });
      } else {
        const { readFileSync, existsSync } = await import('fs');
        const { resolve } = await import('path');
        const candidates = [
          resolve(process.cwd(), 'serviceAccountKey.json'),
          resolve(process.cwd(), 'nuxchain1-firebase-adminsdk-fbsvc-23b890c5e2.json'),
        ];
        let key = null;
        for (const p of candidates) {
          if (existsSync(p)) { key = JSON.parse(readFileSync(p, 'utf8')); break; }
        }
        if (key) initializeApp({ credential: cert(key) });
        else return null;
      }
    }
    _db = getFirestore();
    return _db;
  } catch {
    return null; // Fail silently — audit logging is best-effort
  }
}

const AUDIT_LOG_COLLECTION = 'auditLogs';

const LEVEL_EMOJI = {
  INFO: 'ℹ️',
  WARN: '⚠️',
  ERROR: '❌',
  CRITICAL: '🚨',
};

/**
 * Log an audit event.
 * Fire-and-forget — never throws, never blocks the main request flow.
 *
 * @param {object} data
 * @param {string} data.eventType - e.g. 'RATE_LIMIT_EXCEEDED' | 'DAILY_LIMIT_REACHED' | 'SKILL_INVOKED' | 'BOT_DETECTED'
 * @param {string} data.message
 * @param {'INFO'|'WARN'|'ERROR'|'CRITICAL'} [data.level='WARN']
 * @param {string} [data.wallet]
 * @param {string} [data.ipAddress]
 * @param {object} [data.metadata]
 */
export function logAuditEvent({
  eventType,
  message,
  level = 'WARN',
  wallet,
  ipAddress,
  metadata = {},
}) {
  const emoji = LEVEL_EMOJI[level] ?? LEVEL_EMOJI.INFO;
  console.log(`${emoji} [AUDIT:${eventType}] ${message}`, metadata);

  // Non-blocking Firestore write
  getFirestoreDb().then((db) => {
    if (!db) return;
    db.collection(AUDIT_LOG_COLLECTION).add({
      eventType,
      message,
      level,
      wallet: wallet || null,
      ipAddress: ipAddress || null,
      metadata,
      timestamp: new Date(),
      environment: 'local',
    }).catch((err) => {
      console.error('[audit-logger] Failed to write Firestore log:', err.message);
    });
  }).catch(() => { /* Already logged above */ });
}

/**
 * Convenience helpers
 */
export function logRateLimitExceeded(wallet, ip, metadata = {}) {
  logAuditEvent({
    eventType: 'RATE_LIMIT_EXCEEDED',
    message: `Rate limit exceeded for ${wallet || ip}`,
    level: 'WARN',
    wallet,
    ipAddress: ip,
    metadata,
  });
}

export function logDailyLimitReached(wallet, tier, limit, metadata = {}) {
  logAuditEvent({
    eventType: 'DAILY_LIMIT_REACHED',
    message: `Daily limit reached — wallet=${wallet}, tier=${tier}, limit=${limit}`,
    level: 'WARN',
    wallet,
    metadata: { tier, limit, ...metadata },
  });
}

export function logSkillInvoked(wallet, skillId, metadata = {}) {
  logAuditEvent({
    eventType: 'SKILL_INVOKED',
    message: `Skill invoked — wallet=${wallet}, skill=${skillId}`,
    level: 'INFO',
    wallet,
    metadata: { skillId, ...metadata },
  });
}

export function logBotDetected(ip, metadata = {}) {
  logAuditEvent({
    eventType: 'BOT_DETECTED',
    message: `Possible bot activity from ${ip}`,
    level: 'ERROR',
    ipAddress: ip,
    metadata,
  });
}

export default { logAuditEvent, logRateLimitExceeded, logDailyLimitReached, logSkillInvoked, logBotDetected };
