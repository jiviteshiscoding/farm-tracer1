import { openDB, DBSchema, IDBPDatabase } from "idb";
import { Batch, SupplyChainEvent, BatchLineage, RecallNotice, RiskAlert, SyncQueueItem } from "../types";
import { INITIAL_BATCHES, INITIAL_EVENTS, INITIAL_LINEAGE, INITIAL_RECALLS, INITIAL_RISKS } from "./mockData";

interface FarmTracerDBSchema extends DBSchema {
  batches: {
    key: string;
    value: Batch;
  };
  events: {
    key: string;
    value: SupplyChainEvent;
    indexes: { "by-batchId": string };
  };
  lineage: {
    key: string;
    value: BatchLineage;
    indexes: { "by-parent": string; "by-child": string };
  };
  recalls: {
    key: string;
    value: RecallNotice;
  };
  risks: {
    key: string;
    value: RiskAlert;
  };
  syncQueue: {
    key: string;
    value: SyncQueueItem;
  };
}

const DB_NAME = "farm_tracer_db";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<FarmTracerDBSchema>> | null = null;

export async function getDB(): Promise<IDBPDatabase<FarmTracerDBSchema>> {
  if (!dbPromise) {
    dbPromise = openDB<FarmTracerDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("batches")) {
          db.createObjectStore("batches", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("events")) {
          const eventStore = db.createObjectStore("events", { keyPath: "id" });
          eventStore.createIndex("by-batchId", "batchId");
        }
        if (!db.objectStoreNames.contains("lineage")) {
          const lineageStore = db.createObjectStore("lineage", { keyPath: "id" });
          lineageStore.createIndex("by-parent", "parentBatchId");
          lineageStore.createIndex("by-child", "childBatchId");
        }
        if (!db.objectStoreNames.contains("recalls")) {
          db.createObjectStore("recalls", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("risks")) {
          db.createObjectStore("risks", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("syncQueue")) {
          db.createObjectStore("syncQueue", { keyPath: "id" });
        }
      },
    });
  }
  return dbPromise;
}

// Seed initial demo data into IndexedDB if empty
export async function seedDemoDataIfEmpty(): Promise<void> {
  const db = await getDB();
  const batchCount = await db.count("batches");
  if (batchCount === 0) {
    const tx = db.transaction(["batches", "events", "lineage", "recalls", "risks"], "readwrite");
    for (const b of INITIAL_BATCHES) {
      await tx.objectStore("batches").put(b);
    }
    for (const e of INITIAL_EVENTS) {
      await tx.objectStore("events").put(e);
    }
    for (const l of INITIAL_LINEAGE) {
      await tx.objectStore("lineage").put(l);
    }
    for (const r of INITIAL_RECALLS) {
      await tx.objectStore("recalls").put(r);
    }
    for (const rk of INITIAL_RISKS) {
      await tx.objectStore("risks").put(rk);
    }
    await tx.done;
    console.log("[Farm Tracer] Initial demo supply chain seeded into IndexedDB");
  }
}

export const seedInitialMockData = seedDemoDataIfEmpty;

// Batch Database Operations
export async function getAllBatches(): Promise<Batch[]> {
  const db = await getDB();
  return db.getAll("batches");
}

export async function getBatchByBatchId(batchId: string): Promise<Batch | undefined> {
  const db = await getDB();
  const all = await db.getAll("batches");
  return all.find((b) => b.batchId === batchId || b.id === batchId);
}

export async function saveBatch(batch: Batch): Promise<void> {
  const db = await getDB();
  await db.put("batches", batch);
}

// Event Operations
export async function getEventsByBatchId(batchId: string): Promise<SupplyChainEvent[]> {
  const db = await getDB();
  const events = await db.getAllFromIndex("events", "by-batchId", batchId);
  return events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

export async function getAllEvents(): Promise<SupplyChainEvent[]> {
  const db = await getDB();
  return db.getAll("events");
}

export async function saveEvent(event: SupplyChainEvent): Promise<void> {
  const db = await getDB();
  await db.put("events", event);
}

// Lineage Operations (DAG)
export async function saveLineage(lineage: BatchLineage): Promise<void> {
  const db = await getDB();
  await db.put("lineage", lineage);
}

export async function getParentLineage(childBatchId: string): Promise<BatchLineage[]> {
  const db = await getDB();
  return db.getAllFromIndex("lineage", "by-child", childBatchId);
}

export async function getChildLineage(parentBatchId: string): Promise<BatchLineage[]> {
  const db = await getDB();
  return db.getAllFromIndex("lineage", "by-parent", parentBatchId);
}

export async function getAllLineage(): Promise<BatchLineage[]> {
  const db = await getDB();
  return db.getAll("lineage");
}

// Recalls & Risks
export async function getAllRecalls(): Promise<RecallNotice[]> {
  const db = await getDB();
  return db.getAll("recalls");
}

export async function saveRecall(recall: RecallNotice): Promise<void> {
  const db = await getDB();
  await db.put("recalls", recall);
}

export async function getAllRisks(): Promise<RiskAlert[]> {
  const db = await getDB();
  return db.getAll("risks");
}

export async function saveRisk(risk: RiskAlert): Promise<void> {
  const db = await getDB();
  await db.put("risks", risk);
}

// Offline Sync Queue
export async function addToSyncQueue(item: SyncQueueItem): Promise<void> {
  const db = await getDB();
  await db.put("syncQueue", item);
}

export async function getSyncQueue(): Promise<SyncQueueItem[]> {
  const db = await getDB();
  return db.getAll("syncQueue");
}

export async function removeFromSyncQueue(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("syncQueue", id);
}
