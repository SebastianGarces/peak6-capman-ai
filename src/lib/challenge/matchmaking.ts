interface QueueEntry {
  socketId: string;
  userId: string;
  curriculumLevel: number;
  xp: number;
  joinedAt: number;
}

const queue: Map<string, QueueEntry> = new Map();

export function addToQueue(entry: QueueEntry) {
  queue.set(entry.socketId, entry);
}

export function removeFromQueue(socketId: string) {
  queue.delete(socketId);
}

export function isCompatible(a: QueueEntry, b: QueueEntry, elapsedMs: number = 0): boolean {
  if (a.curriculumLevel !== b.curriculumLevel) return false;
  if (a.socketId === b.socketId) return false;

  const elapsedSec = elapsedMs / 1000;
  let xpRange = 400;
  if (elapsedSec >= 60) xpRange = Infinity;
  else if (elapsedSec >= 30) xpRange = 800;

  return Math.abs(a.xp - b.xp) <= xpRange;
}

export function findMatch(entry: QueueEntry): QueueEntry | null {
  const now = Date.now();
  for (const [, candidate] of queue) {
    if (candidate.socketId === entry.socketId) continue;
    const elapsed = now - Math.min(entry.joinedAt, candidate.joinedAt);
    if (isCompatible(entry, candidate, elapsed)) {
      return candidate;
    }
  }
  return null;
}

export function getQueueSize(): number {
  return queue.size;
}

export function clearQueue() {
  queue.clear();
}
