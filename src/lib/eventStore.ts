import { QueuedEvent } from './eventQueue';

export const replayEvents = async (db: any, processor: (type: string, data: any, db: any) => Promise<void>) => {
  if (!db.event_queue) return;
  
  console.log(`[REPLAY ENGINE] Starting full system replay...`);
  
  // Replay all events in order of creation (history)
  const sortedEvents = [...db.event_queue].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  
  for (const event of sortedEvents) {
    if (event.status !== 'completed') {
       console.log(`[REPLAY] Re-executing event: ${event.id} (${event.type})`);
       try {
         await processor(event.type, event.data, db);
         event.status = 'completed';
       } catch (error) {
         console.error(`[REPLAY FAILED] Event ${event.id}:`, error);
       }
    }
  }
  
  console.log(`[REPLAY ENGINE] Replay complete.`);
};
