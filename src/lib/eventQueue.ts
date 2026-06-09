import fs from 'fs';
import path from 'path';
import { createSystemSnapshot } from './snapshot';

export interface QueuedEvent {
  id: string;
  type: string;
  data: any;
  retries: number;
  status: 'pending' | 'processing' | 'failed' | 'completed' | 'dlq';
  lastError?: string;
  createdAt: string;
  idempotencyKey?: string;
  correlationId?: string;
}

const MAX_RETRIES = 3;
const DB_PATH = path.join(process.cwd(), 'db.json');

const persistDb = (db: any) => {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
};

export const queueEvent = (
  type: string,
  data: any,
  db: any,
  options: { idempotencyKey?: string; correlationId?: string } = {}
) => {
  if (!db.event_queue) db.event_queue = [];
  
  // Idempotency check: see if a pending/completed event with this key exists
  if (options.idempotencyKey) {
    const existing = db.event_queue.find((e: QueuedEvent) => e.idempotencyKey === options.idempotencyKey);
    if (existing) {
        console.log(`[IGNORE DUPLICATE] IdempotencyKey ${options.idempotencyKey} already exists.`);
        return existing.id;
    }
  }

  const event: QueuedEvent = {
    id: `evt-${Date.now()}`,
    type,
    data,
    retries: 0,
    status: 'pending',
    createdAt: new Date().toISOString(),
    idempotencyKey: options.idempotencyKey,
    correlationId: options.correlationId || `chain-${Date.now()}`
  };
  
  db.event_queue.push(event);
  persistDb(db);
  console.log(`[EVENT WAL STORED] ${type} (${event.id}) - Chain: ${event.correlationId}`);
  
  // Auto-snapshot if queue gets too large
  if (db.event_queue.length > 50) {
      createSystemSnapshot(db);
  }
  
  return event.id;
};

export const processQueue = async (db: any, processor: (type: string, data: any, db: any) => Promise<void>) => {
  if (!db.event_queue) return;

  let hasChanges = false;
  for (const event of db.event_queue.filter((e: QueuedEvent) => e.status === 'pending' || e.status === 'failed')) {
    if (event.retries >= MAX_RETRIES) {
      event.status = 'dlq';
      hasChanges = true;
      console.error(`[EVENT DLQ] ${event.id} after ${event.retries} retries.`);
      continue;
    }

    event.status = 'processing';
    hasChanges = true;
    persistDb(db); // Save processing status

    try {
      await processor(event.type, event.data, db);
      event.status = 'completed';
      console.log(`[EVENT COMPLETED] ${event.id}`);
    } catch (error: any) {
      event.status = 'failed';
      event.retries++;
      event.lastError = error.message;
      console.error(`[EVENT FAILED] ${event.id}: ${error.message}`);
    }
    hasChanges = true;
  }
  if (hasChanges) {
    persistDb(db);
  }
};
