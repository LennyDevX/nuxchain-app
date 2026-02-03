/**
 * 🔄 Service Worker with Background Sync
 * Custom SW implementation with Workbox for advanced features
 */

/// <reference lib="webworker" />

import { clientsClaim } from 'workbox-core';
import { ExpirationPlugin } from 'workbox-expiration';
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

// Extend Service Worker types
declare const self: ServiceWorkerGlobalScope & { 
  __WB_MANIFEST: Array<{ url: string; revision: string | null }> 
};

// Take control immediately
clientsClaim();

// Precache all build assets
precacheAndRoute(self.__WB_MANIFEST);

// Cache Strategy 1: Static Assets
registerRoute(
  ({ request }) =>
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'font' ||
    request.destination === 'image',
  new CacheFirst({
    cacheName: 'nuxchain-static-assets',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  })
);

// Cache Strategy 2: GraphQL API
registerRoute(
  ({ url }) => url.hostname === 'api.studio.thegraph.com',
  new NetworkFirst({
    cacheName: 'graphql-cache',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 5 * 60, // 5 minutes
      }),
    ],
    networkTimeoutSeconds: 10,
  })
);

// Cache Strategy 3: RPC calls
registerRoute(
  ({ url }) => url.hostname.includes('.g.alchemy.com'),
  new NetworkFirst({
    cacheName: 'rpc-cache',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 2 * 60, // 2 minutes
      }),
    ],
    networkTimeoutSeconds: 10,
  })
);

/**
 * 🔄 Background Sync Handler
 * Retries failed transactions when connection is restored
 */
self.addEventListener('sync', (event: Event) => {
  // Type assertion for SyncEvent which has tag and waitUntil
  const syncEvent = event as ExtendableEvent & { tag: string };
  
  if (syncEvent.tag === 'sync-transactions') {
    syncEvent.waitUntil(syncTransactions());
  }
});

async function syncTransactions() {
  console.log('🔄 [SW] Starting background sync...');

  try {
    // Get pending transactions from IndexedDB
    const db = await openTransactionDB();
    const transactions = await getAllPendingTransactions(db);

    if (transactions.length === 0) {
      console.log('✅ [SW] No pending transactions');
      return;
    }

    console.log(`📊 [SW] Found ${transactions.length} pending transactions`);

    let successCount = 0;
    let failCount = 0;

    for (const tx of transactions) {
      try {
        // Prepare request body
        let body: string | FormData | undefined;
        if (tx.body) {
          if (tx.body instanceof FormData) {
            body = tx.body;
          } else if (typeof tx.body === 'string') {
            body = tx.body;
          } else {
            body = JSON.stringify(tx.body);
          }
        }

        // Retry the request
        const response = await fetch(tx.url, {
          method: tx.method,
          headers: tx.headers,
          body,
        });

        if (response.ok) {
          // Success - remove from queue
          await removeTransaction(db, tx.id);
          successCount++;
          console.log(`✅ [SW] Transaction synced: ${tx.id} (${tx.type})`);
        } else {
          // Failed - update retry count
          await updateTransactionRetry(db, tx.id, `HTTP ${response.status}`);
          failCount++;
          console.warn(`⚠️ [SW] Transaction failed: ${tx.id} (${response.status})`);
        }
      } catch (error) {
        // Network error - update retry count
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        await updateTransactionRetry(db, tx.id, errorMsg);
        failCount++;
        console.error(`❌ [SW] Transaction error: ${tx.id}`, error);
      }
    }

    // Notify clients about sync result
    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
      client.postMessage({
        type: successCount > 0 ? 'SYNC_COMPLETE' : 'SYNC_FAILED',
        success: successCount,
        failed: failCount,
      });
    });

    console.log(`✅ [SW] Sync complete: ${successCount} success, ${failCount} failed`);
  } catch (error) {
    console.error('❌ [SW] Background sync failed:', error);
  }
}

/**
 * IndexedDB helpers (lightweight versions for SW)
 */
const DB_NAME = 'nuxchain-tx-queue';
const STORE_NAME = 'pending-transactions';
const MAX_RETRIES = 3;

interface PendingTransaction {
  id: string;
  type: string;
  url: string;
  method: string;
  body?: string | FormData | Record<string, unknown>;
  headers: Record<string, string>;
  timestamp: number;
  retries: number;
  lastError?: string;
}

function openTransactionDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function getAllPendingTransactions(db: IDBDatabase): Promise<PendingTransaction[]> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const transactions = request.result as PendingTransaction[];
      // Filter out exceeded retry count
      resolve(transactions.filter((t) => t.retries < MAX_RETRIES));
    };
    request.onerror = () => reject(request.error);
  });
}

function removeTransaction(db: IDBDatabase, id: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

function updateTransactionRetry(db: IDBDatabase, id: string, error: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const getRequest = store.get(id);

    getRequest.onsuccess = () => {
      const transaction = getRequest.result as PendingTransaction;
      if (transaction) {
        transaction.retries += 1;
        transaction.lastError = error;
        const putRequest = store.put(transaction);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      } else {
        resolve();
      }
    };
    getRequest.onerror = () => reject(getRequest.error);
  });
}

// Skip waiting
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('✅ [SW] Nuxchain Service Worker with Background Sync loaded');
