import { Batch, SupplyChainEvent, RiskAlert } from "../types";

// Calculate distance between two lat/lng points in kilometers (Haversine formula)
export function getHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Risk analysis function
export function analyzeBatchRisk(batch: Batch, events: SupplyChainEvent[]): RiskAlert | null {
  if (events.length < 2) return null;

  // Sort events by timestamp
  const sorted = [...events].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // Check 1: Impossible Travel Velocity between consecutive events
  for (let i = 0; i < sorted.length - 1; i++) {
    const e1 = sorted[i];
    const e2 = sorted[i + 1];

    if (e1.lat && e1.lng && e2.lat && e2.lng) {
      const distKm = getHaversineDistance(e1.lat, e1.lng, e2.lat, e2.lng);
      const timeHours =
        (new Date(e2.timestamp).getTime() - new Date(e1.timestamp).getTime()) / (1000 * 60 * 60);

      if (timeHours > 0) {
        const speedKmH = distKm / timeHours;
        // If speed > 180 km/h (impossible for land transport of food produce)
        if (speedKmH > 180 && distKm > 30) {
          return {
            id: `risk-vel-${batch.id}-${Date.now()}`,
            batchId: batch.batchId,
            riskLevel: "CRITICAL",
            flagReason: `Impossible Travel Velocity: Batch moved ${Math.round(distKm)} km in ${(
              timeHours * 60
            ).toFixed(1)} mins (${Math.round(speedKmH)} km/h) between "${e1.eventType}" at ${e1.locationName} and "${e2.eventType}" at ${e2.locationName}.`,
            detectedAt: new Date().toISOString(),
            resolved: false,
            actorName: e2.actorName,
            actorRole: e2.actorRole,
          };
        }
      }
    }
  }

  // Check 2: Expired batch in active transfer
  if (batch.expiryDate) {
    const expiryTime = new Date(batch.expiryDate).getTime();
    const now = Date.now();
    if (now > expiryTime && batch.currentStatus !== "EXPIRED" && batch.currentStatus !== "DISPOSED") {
      return {
        id: `risk-exp-${batch.id}-${Date.now()}`,
        batchId: batch.batchId,
        riskLevel: "HIGH",
        flagReason: `Expired Product In Transit: Batch reached expiration on ${new Date(
          batch.expiryDate
        ).toLocaleDateString()} but remains in active supply chain status (${batch.currentStatus}).`,
        detectedAt: new Date().toISOString(),
        resolved: false,
        actorName: batch.currentOwner,
        actorRole: batch.currentOwnerRole,
      };
    }
  }

  // Check 3: Temperature breach in Cold Storage
  const coldEvents = sorted.filter((e) => e.eventType === "COLD_STORAGE" || e.temperature !== undefined);
  for (const ce of coldEvents) {
    if (ce.temperature !== undefined && ce.temperature > 15) {
      return {
        id: `risk-temp-${batch.id}-${Date.now()}`,
        batchId: batch.batchId,
        riskLevel: "MEDIUM",
        flagReason: `Cold Storage Temperature Breach: Recorded temperature ${ce.temperature}°C exceeded safe threshold (max 15°C) at ${ce.locationName}.`,
        detectedAt: new Date().toISOString(),
        resolved: false,
        actorName: ce.actorName,
        actorRole: ce.actorRole,
      };
    }
  }

  return null;
}

// Bulk risk detection for all batches
export function detectRisksAndAnomalies(batches: Batch[], events: SupplyChainEvent[]): RiskAlert[] {
  const alerts: RiskAlert[] = [];
  for (const b of batches) {
    const bEvents = events.filter((e) => e.batchId === b.batchId);
    const risk = analyzeBatchRisk(b, bEvents);
    if (risk) {
      alerts.push(risk);
    }
  }
  return alerts;
}

