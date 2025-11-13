/**
 * Utility for batching contract read calls
 * Prevents RPC rate limiting by grouping multiple reads with delays between batches
 */

import type { PublicClient, ReadContractParameters } from 'viem';

interface BatchReadOptions {
  batchSize?: number;  // Number of calls per batch (default: 5)
  delayMs?: number;    // Delay between batches in ms (default: 100)
  maxRetries?: number; // Max retry attempts (default: 2)
}

/**
 * Execute multiple contract read calls in batches
 * @param publicClient Viem public client
 * @param calls Array of read contract parameters
 * @param options Batching configuration
 * @returns Array of results in the same order as input calls
 */
export async function batchReadContract<T extends readonly ReadContractParameters[]>(
  publicClient: PublicClient,
  calls: T,
  options: BatchReadOptions = {}
): Promise<unknown[]> {
  const { batchSize = 5, delayMs = 100, maxRetries = 2 } = options;

  const results: unknown[] = new Array(calls.length);
  const failed: Array<{ index: number; error: unknown }> = [];

  // Process in batches
  for (let i = 0; i < calls.length; i += batchSize) {
    const batch = calls.slice(i, i + batchSize);
    const batchIndices = Array.from({ length: batch.length }, (_, j) => i + j);

    try {
      const batchResults = await Promise.all(
        batch.map((call) =>
          publicClient.readContract(call as ReadContractParameters).catch((error) => ({
            _error: true,
            _reason: error,
          }))
        )
      );

      // Store results and track failures
      batchResults.forEach((result, j) => {
        const idx = batchIndices[j];
        if (result && typeof result === 'object' && '_error' in result) {
          failed.push({ index: idx, error: (result as unknown as { _reason: unknown })._reason });
          results[idx] = undefined;
        } else {
          results[idx] = result;
        }
      });
    } catch (error) {
      // Batch-level error - mark all as failed
      batchIndices.forEach((idx) => {
        failed.push({ index: idx, error });
        results[idx] = undefined;
      });
    }

    // Delay between batches (except after last batch)
    if (i + batchSize < calls.length) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  // Retry failed calls
  if (failed.length > 0 && maxRetries > 0) {
    console.log(`[Batch] Retrying ${failed.length} failed calls...`);
    for (const { index, error } of failed) {
      let lastError = error;
      for (let retry = 0; retry < maxRetries; retry++) {
        try {
          const result = await publicClient.readContract(calls[index] as ReadContractParameters);
          results[index] = result;
          lastError = null;
          break;
        } catch (err) {
          lastError = err;
          if (retry < maxRetries - 1) {
            // Exponential backoff for retries
            const backoff = Math.min(100 * Math.pow(2, retry), 2000);
            await new Promise((resolve) => setTimeout(resolve, backoff));
          }
        }
      }
      if (lastError) {
        console.warn(`[Batch] Call ${index} failed after ${maxRetries} retries:`, lastError);
      }
    }
  }

  return results;
}

/**
 * Helper to create a batched contract read function for a specific contract
 * @param publicClient Viem public client
 * @param options Batching configuration
 * @returns Function to batch read calls
 */
export function createBatchReader(
  publicClient: PublicClient,
  options: BatchReadOptions = {}
) {
  return async <T extends readonly ReadContractParameters[]>(calls: T) => {
    return batchReadContract(publicClient, calls, options);
  };
}
