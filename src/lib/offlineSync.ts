import { SupplyChainEvent, SyncQueueItem } from "../types";
import { addToSyncQueue, getSyncQueue, removeFromSyncQueue, saveEvent } from "./db";

export class OfflineSyncManager {
  private static listeners: ((status: "ONLINE" | "OFFLINE", pendingCount: number) => void)[] = [];
  private static isOnline: boolean = typeof navigator !== "undefined" ? navigator.onLine : true;

  public static init(): void {
    if (typeof window === "undefined") return;

    window.addEventListener("online", () => {
      this.isOnline = true;
      this.notifyListeners();
      this.triggerSync();
    });

    window.addEventListener("offline", () => {
      this.isOnline = false;
      this.notifyListeners();
    });

    // Listen for service worker trigger messages
    navigator.serviceWorker?.addEventListener("message", (event) => {
      if (event.data?.type === "TRIGGER_OFFLINE_SYNC") {
        this.triggerSync();
      }
    });
  }

  public static subscribe(listener: (status: "ONLINE" | "OFFLINE", pendingCount: number) => void): () => void {
    this.listeners.push(listener);
    this.getPendingCount().then((count) => {
      listener(this.isOnline ? "ONLINE" : "OFFLINE", count);
    });

    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  public static async getPendingCount(): Promise<number> {
    const queue = await getSyncQueue();
    return queue.length;
  }

  private static async notifyListeners(): Promise<void> {
    const count = await this.getPendingCount();
    const status = this.isOnline ? "ONLINE" : "OFFLINE";
    this.listeners.forEach((l) => l(status, count));
  }

  public static async recordEvent(event: SupplyChainEvent): Promise<{ event: SupplyChainEvent; queued: boolean }> {
    const idempotencyKey = `idempotent-${event.batchId}-${event.eventType}-${event.timestamp}`;
    const fullEvent: SupplyChainEvent = {
      ...event,
      idempotencyKey,
      syncStatus: this.isOnline ? "SYNCED" : "PENDING",
    };

    // Save locally to IndexedDB immediately
    await saveEvent(fullEvent);

    if (!this.isOnline) {
      const queueItem: SyncQueueItem = {
        id: `sync-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        event: fullEvent,
        idempotencyKey,
        createdAt: new Date().toISOString(),
        retryCount: 0,
      };
      await addToSyncQueue(queueItem);
      await this.notifyListeners();

      // Register background sync if supported
      if ("serviceWorker" in navigator && "SyncManager" in window) {
        const reg = await navigator.serviceWorker.ready;
        try {
          // @ts-ignore - Background sync API
          await reg.sync.register("sync-farm-events");
        } catch {
          // Fallback if background sync registration fails
        }
      }

      return { event: fullEvent, queued: true };
    }

    // If online, simulate network upload and mark synced
    await this.notifyListeners();
    return { event: fullEvent, queued: false };
  }

  public static async triggerSync(): Promise<{ syncedCount: number; errorsCount: number }> {
    const queue = await getSyncQueue();
    if (queue.length === 0) return { syncedCount: 0, errorsCount: 0 };

    let syncedCount = 0;
    let errorsCount = 0;

    for (const item of queue) {
      try {
        // Mark event as synced in database
        const updatedEvent: SupplyChainEvent = {
          ...item.event,
          syncStatus: "SYNCED",
        };
        await saveEvent(updatedEvent);
        await removeFromSyncQueue(item.id);
        syncedCount++;
      } catch (err: any) {
        errorsCount++;
      }
    }

    await this.notifyListeners();
    return { syncedCount, errorsCount };
  }
}
