import fs from 'fs';
import path from 'path';

const SNAPSHOT_DIR = path.join(process.cwd(), 'snapshots');

if (!fs.existsSync(SNAPSHOT_DIR)) {
  fs.mkdirSync(SNAPSHOT_DIR);
}

export const createSystemSnapshot = (db: any) => {
  const timestamp = Date.now();
  const snapshotPath = path.join(SNAPSHOT_DIR, `snapshot-${timestamp}.json`);
  
  // Save compact snapshot
  const snapshot = {
    ...db,
    event_queue: db.event_queue.filter((e: any) => e.status === 'pending' || e.status === 'failed') // Only keep unprocessed
  };
  
  fs.writeFileSync(snapshotPath, JSON.stringify(snapshot, null, 2), 'utf-8');
  console.log(`[SNAPSHOT] Created at ${snapshotPath}`);
  
  // Compact main db: archive completed events
  db.event_queue = db.event_queue.filter((e: any) => e.status !== 'completed');
  fs.writeFileSync(path.join(process.cwd(), 'db.json'), JSON.stringify(db, null, 2), 'utf-8');
  
  return snapshotPath;
};
