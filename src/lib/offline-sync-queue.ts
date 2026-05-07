import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";

export interface QueuedRequest {
  id: string;
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: any;
  timestamp: string;
  retries: number;
}

const LOCAL_STATE_DIR = process.env.EDUOS_LOCAL_STATE_DIR ?? path.join(process.cwd(), ".eduos-local");
const QUEUE_FILE = path.join(LOCAL_STATE_DIR, "offline-queue.json");

function ensureQueueDir() {
  if (!existsSync(LOCAL_STATE_DIR)) {
    mkdirSync(LOCAL_STATE_DIR, { recursive: true });
  }
  if (!existsSync(QUEUE_FILE)) {
    writeFileSync(QUEUE_FILE, JSON.stringify([]), "utf8");
  }
}

export function readQueue(): QueuedRequest[] {
  try {
    ensureQueueDir();
    const data = readFileSync(QUEUE_FILE, "utf8");
    return JSON.parse(data) as QueuedRequest[];
  } catch (error) {
    console.error("Error reading offline queue:", error);
    return [];
  }
}

export function writeQueue(queue: QueuedRequest[]) {
  try {
    ensureQueueDir();
    writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2), "utf8");
  } catch (error) {
    console.error("Error writing to offline queue:", error);
  }
}

export function enqueueRequest(url: string, method: string, headers: Record<string, string>, body?: any) {
  const queue = readQueue();
  const newRequest: QueuedRequest = {
    id: crypto.randomUUID(),
    url,
    method,
    headers,
    body,
    timestamp: new Date().toISOString(),
    retries: 0,
  };
  queue.push(newRequest);
  writeQueue(queue);
  return newRequest.id;
}

export function dequeueRequest(id: string) {
  const queue = readQueue();
  const updatedQueue = queue.filter(req => req.id !== id);
  writeQueue(updatedQueue);
}

export async function processQueue() {
  const queue = readQueue();
  if (queue.length === 0) return;

  console.log(`Processing offline queue: ${queue.length} items found.`);

  for (const req of queue) {
    try {
      // Simulate network check before pushing
      if (!navigator.onLine && typeof navigator !== 'undefined') {
          console.log("System offline, pausing queue processing.");
          break;
      }

      // We attempt to send to the main server endpoint
      const response = await fetch(req.url, {
        method: req.method,
        headers: req.headers,
        body: req.body ? JSON.stringify(req.body) : undefined,
      });

      if (response.ok) {
        console.log(`Successfully processed queued request: ${req.id}`);
        dequeueRequest(req.id);
      } else {
        console.error(`Failed to process queued request: ${req.id}, Status: ${response.status}`);
        // Logic to increment retries and keep in queue could be added here
      }
    } catch (error) {
      console.error(`Error processing queued request ${req.id}:`, error);
      // Wait for the next sync cycle
    }
  }
}
