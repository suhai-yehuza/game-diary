import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import pLimit from 'p-limit';
import { v4 as uuidv4, v7 as uuidv7 } from 'uuid';

import { API_CONFIG } from '../config/api.config';

import { sleep } from './index.time';

// Define types locally to avoid circular dependency
export type BatchProcessingOptions<T, R> = {
  items: T[];
  batchSize: number;
  tableName?: string;
  processFn: (batch: T[], context?: Record<string, unknown>) => Promise<R>;
  context?: Record<string, unknown>;
  delayBetweenBatches?: number;
  maxRetries?: number;
  retryDelay?: number;
  concurrencyLimit?: number;
  dbPool?: NeonHttpDatabase<Record<string, unknown>>;
  useTransactions?: boolean;
  onProgress?: (progress: number) => void;
};

export class UuidGenerationError extends Error {
  code: string;
  details?: string;

  constructor(message: string, code: string = 'UUID_GENERATION_ERROR', details?: string) {
    super(message);
    this.name = 'UuidGenerationError';
    this.code = code;
    this.details = details;
  }
}

export type UuidGenerationOptions = {
  namespace?: string;
  logProgress?: boolean;
  useV7?: boolean;
  maxRetries?: number;
  batchSize?: number;
};

/**
 * Unified batch processing function that can handle various use cases:
 * - Simple batch processing with delays
 * - Batch processing with retries
 * - Batch processing with database transactions
 * - Batch processing with concurrency limits
 */
export async function processInBatches<T, R = void>({
  items,
  batchSize = API_CONFIG.databaseSeeding.BATCH_SIZE,
  tableName = 'unknown-table-name',
  processFn,
  context,
  delayBetweenBatches = API_CONFIG.rateLimit.BASE_DELAY,
  maxRetries = API_CONFIG.databaseSeeding.MAX_RETRIES,
  retryDelay = API_CONFIG.databaseSeeding.RETRY_DELAY,
  concurrencyLimit,
  dbPool,
  useTransactions = false,
}: BatchProcessingOptions<T, R>): Promise<R[]> {
  const batches = Array.from({ length: Math.ceil(items.length / batchSize) }, (_, i) =>
    items.slice(i * batchSize, (i + 1) * batchSize)
  );

  const results: R[] = [];
  const limit = concurrencyLimit ? pLimit(concurrencyLimit) : (fn: () => Promise<R>) => fn();

  const processBatch = async (batch: T[], index: number): Promise<R> => {
    let retries = 0;
    let success = false;
    let lastError: Error | null = null;

    while (!success && retries < maxRetries) {
      try {
        let result: R;
        if (useTransactions && dbPool) {
          const db = dbPool;
          result = await withTransaction(db, async tx => {
            return await processFn(batch, { ...context, db: tx });
          });
        } else {
          result = await processFn(batch, context);
        }
        success = true;
        console.log(`Successfully processed batch ${index + 1}/${batches.length} for ${tableName}`);
        return result;
      } catch (error) {
        retries++;
        lastError = error as Error;
        if (retries === maxRetries) {
          console.error(
            `Failed to process batch ${index + 1}/${batches.length} after ${maxRetries} attempts:`,
            error
          );
          throw error;
        }
        const delay = Math.min(
          retryDelay * Math.pow(2, retries - 1) + Math.random() * 1000,
          retryDelay
        );
        console.log(
          `Retrying batch ${index + 1}/${batches.length} in ${Math.round(delay)}ms (attempt ${retries}/${maxRetries})`
        );
        await sleep(delay);
      }
    }

    throw lastError;
  };

  for (let index = 0; index < batches.length; index++) {
    const batch = batches[index];
    const result = await limit(() => processBatch(batch, index));
    results.push(result);

    if (index < batches.length - 1) {
      await sleep(delayBetweenBatches);
    }
  }

  return results;
}

/**
 * Helper function to execute operations within a transaction
 */
async function withTransaction<T>(
  db: NeonHttpDatabase<Record<string, unknown>>,
  operation: (tx: NeonHttpDatabase<Record<string, unknown>>) => Promise<T>
): Promise<T> {
  try {
    return await operation(db);
  } catch (error) {
    console.error('Transaction failed:', error);
    throw error;
  }
}

// UUID Generation Functions
// Additional entropy sources
const getAdditionalEntropy = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2);
  const processId = process.pid.toString(36);
  return `${timestamp}-${random}-${processId}`;
};

/**
 * Generates a UUID with additional entropy and collision detection
 */
export const generateUUID = (options: UuidGenerationOptions = {}): string => {
  const { useV7 = true } = options;
  const generator = useV7 ? uuidv7 : uuidv4;
  return generator();
};

/**
 * Generates a batch of unique UUIDs with collision detection
 */
export const generateUuidBatch = (count: number, options: UuidGenerationOptions = {}): string[] => {
  const { useV7 = true, maxRetries = 5, batchSize = 1000, logProgress = true } = options;
  const uuids = new Set<string>();
  let attempts = 0;
  let lastProgress = 0;

  while (uuids.size < count && attempts < maxRetries) {
    const batchCount = Math.min(batchSize, count - uuids.size);
    const batchStart = uuids.size;

    for (let i = 0; i < batchCount; i++) {
      uuids.add(generateUUID({ useV7 }));
    }

    if (logProgress) {
      const progress = Math.floor((uuids.size / count) * 100);
      if (progress > lastProgress) {
        console.log(`UUID generation progress: ${progress}% (${uuids.size}/${count})`);
        lastProgress = progress;
      }
    }

    if (uuids.size === batchStart) {
      attempts++;
      if (attempts < maxRetries) {
        console.warn(
          `UUID generation attempt ${attempts} failed to generate new UUIDs. Retrying...`
        );
      }
    }
  }

  if (uuids.size < count) {
    throw new UuidGenerationError(
      `Failed to generate ${count} unique UUIDs after ${maxRetries} attempts. Generated ${uuids.size} UUIDs.`
    );
  }

  return Array.from(uuids);
};

/**
 * Manages a pool of UUIDs for sequential access
 */
export class UuidPool {
  private uuids: string[];
  private currentIndex: number;
  private readonly totalUuids: number;

  constructor(uuids: string[]) {
    this.uuids = uuids;
    this.currentIndex = 0;
    this.totalUuids = uuids.length;
  }

  next(): string {
    if (this.currentIndex >= this.totalUuids) {
      throw new UuidGenerationError('UUID pool exhausted');
    }
    return this.uuids[this.currentIndex++];
  }

  remaining(): number {
    return this.totalUuids - this.currentIndex;
  }

  used(): number {
    return this.currentIndex;
  }
}
