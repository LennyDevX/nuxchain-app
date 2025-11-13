/**
 * 📦 IndexedDB Manager for Transaction Queue
 * 
 * Stores failed transactions for background sync retry
 * Used by Service Worker to retry when connection is restored
 * 
 * Database: nuxchain-tx-queue
 * Store: pending-transactions
 * 
 * Transaction schema:
 * {
 *   id: string (unique timestamp-based)
 *   type: 'staking' | 'nft-purchase' | 'nft-listing' | 'airdrop-claim'
 *   url: string (API endpoint)
 *   method: 'POST' | 'PUT' | 'DELETE'
 *   body: any (request payload)
 *   headers: Record<string, string>
 *   timestamp: number
 *   retries: number
 *   lastError?: string
 * }
 */

const DB_NAME = 'nuxchain-tx-queue';
const DB_VERSION = 1;
const STORE_NAME = 'pending-transactions';
const MAX_RETRIES = 3;

export interface PendingTransaction {
  id: string;
  type: 'staking' | 'nft-purchase' | 'nft-listing' | 'airdrop-claim' | 'generic';
  url: string;
  method: 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: string | FormData | object;
  headers: Record<string, string>;
  timestamp: number;
  retries: number;
  lastError?: string;
  metadata?: {
    userAddress?: string;
    nftId?: string;
    amount?: string;
    description?: string;
  };
}

/**
 * Open IndexedDB connection
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create object store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        
        // Create indexes for querying
        store.createIndex('type', 'type', { unique: false });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('retries', 'retries', { unique: false });
        
        console.log('✅ [IndexedDB] Created transaction queue store');
      }
    };
  });
}

/**
 * Add transaction to queue
 */
export async function queueTransaction(transaction: Omit<PendingTransaction, 'id' | 'timestamp' | 'retries'>): Promise<string> {
  try {
    const db = await openDB();
    
    const txData: PendingTransaction = {
      ...transaction,
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retries: 0,
    };

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.add(txData);

      request.onsuccess = () => {
        console.log('✅ [IndexedDB] Transaction queued:', txData.id, txData.type);
        resolve(txData.id);
      };
      
      request.onerror = () => reject(request.error);
      
      tx.oncomplete = () => db.close();
    });
  } catch (error) {
    console.error('❌ [IndexedDB] Failed to queue transaction:', error);
    throw error;
  }
}

/**
 * Get all pending transactions
 */
export async function getPendingTransactions(): Promise<PendingTransaction[]> {
  try {
    const db = await openDB();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const transactions = request.result as PendingTransaction[];
        // Filter out transactions that exceeded max retries
        const valid = transactions.filter(t => t.retries < MAX_RETRIES);
        console.log(`📊 [IndexedDB] Found ${valid.length} pending transactions`);
        resolve(valid);
      };
      
      request.onerror = () => reject(request.error);
      
      tx.oncomplete = () => db.close();
    });
  } catch (error) {
    console.error('❌ [IndexedDB] Failed to get pending transactions:', error);
    return [];
  }
}

/**
 * Remove transaction from queue (after successful retry)
 */
export async function removePendingTransaction(id: string): Promise<void> {
  try {
    const db = await openDB();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => {
        console.log('✅ [IndexedDB] Transaction removed:', id);
        resolve();
      };
      
      request.onerror = () => reject(request.error);
      
      tx.oncomplete = () => db.close();
    });
  } catch (error) {
    console.error('❌ [IndexedDB] Failed to remove transaction:', error);
    throw error;
  }
}

/**
 * Update transaction retry count and error
 */
export async function updateTransactionRetry(id: string, error?: string): Promise<void> {
  try {
    const db = await openDB();

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
          
          putRequest.onsuccess = () => {
            console.log(`🔄 [IndexedDB] Transaction retry updated: ${id} (${transaction.retries}/${MAX_RETRIES})`);
            resolve();
          };
          
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          reject(new Error(`Transaction ${id} not found`));
        }
      };
      
      getRequest.onerror = () => reject(getRequest.error);
      
      tx.oncomplete = () => db.close();
    });
  } catch (error) {
    console.error('❌ [IndexedDB] Failed to update transaction:', error);
    throw error;
  }
}

/**
 * Get transaction count by type
 */
export async function getTransactionCountByType(): Promise<Record<string, number>> {
  try {
    const transactions = await getPendingTransactions();
    
    return transactions.reduce((acc, tx) => {
      acc[tx.type] = (acc[tx.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  } catch (error) {
    console.error('❌ [IndexedDB] Failed to get transaction count:', error);
    return {};
  }
}

/**
 * Clear all transactions (for debugging/reset)
 */
export async function clearAllTransactions(): Promise<void> {
  try {
    const db = await openDB();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => {
        console.log('🗑️ [IndexedDB] All transactions cleared');
        resolve();
      };
      
      request.onerror = () => reject(request.error);
      
      tx.oncomplete = () => db.close();
    });
  } catch (error) {
    console.error('❌ [IndexedDB] Failed to clear transactions:', error);
    throw error;
  }
}

/**
 * Check if IndexedDB is available
 */
export function isIndexedDBAvailable(): boolean {
  try {
    return typeof indexedDB !== 'undefined';
  } catch {
    return false;
  }
}
