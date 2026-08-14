export type UserRole =
  | "FARMER"
  | "PROCESSOR"
  | "DISTRIBUTOR"
  | "WAREHOUSE"
  | "TRANSPORTER"
  | "RETAILER"
  | "CONSUMER"
  | "AUTHORITY"
  | "ADMIN"
  | "COLD_STORAGE";

export type ProductCategory =
  | "MILK"
  | "VEGETABLES"
  | "FRUITS"
  | "GRAINS"
  | "CROPS"
  | "MEAT_FISHERIES"
  | "PROCESSED_FOOD";

export type BatchStatus =
  | "DRAFT"
  | "CREATED"
  | "HARVESTED"
  | "COLLECTED"
  | "IN_TRANSIT"
  | "RECEIVED"
  | "PROCESSING"
  | "PROCESSED"
  | "PACKAGED"
  | "DISTRIBUTED"
  | "RETAIL"
  | "SOLD"
  | "EXPIRED"
  | "RECALLED"
  | "DISPOSED"
  | "FLAGGED"
  | "COLD_STORAGE";

export type VerificationStatus = "VERIFIED" | "WARNING" | "RECALLED" | "EXPIRED" | "UNVERIFIED";

export type EventType =
  | "HARVESTED"
  | "COLLECTED"
  | "QUALITY_CHECK"
  | "PACKED"
  | "TRANSFERRED"
  | "PICKED_UP"
  | "IN_TRANSIT"
  | "WAREHOUSE_RECEIVED"
  | "COLD_STORAGE"
  | "PROCESSED"
  | "TRANSFORMED"
  | "PACKAGED"
  | "DISTRIBUTED"
  | "RECEIVED_BY_RETAILER"
  | "SOLD"
  | "RECALLED"
  | "EXPIRED"
  | "FLAGGED"
  | "DISPOSED";

export type SyncStatus = "SYNCED" | "PENDING" | "FAILED";

export interface UserProfile {
  id: string;
  name: string;
  organization: string;
  email?: string;
  phone?: string;
  role: UserRole;
  address: string;
  district: string;
  state: string;
  pinCode?: string;
  fssaiNumber?: string;
  gstNumber?: string;
  verified?: boolean;
}

export interface SupplyChainEvent {
  id: string;
  batchId: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  eventType: EventType;
  timestamp: string;
  lat?: number;
  lng?: number;
  locationName: string;
  district: string;
  state: string;
  notes?: string;
  photos?: string[];
  temperature?: number;
  humidity?: number;
  previousEventHash?: string;
  eventHash: string;
  signature?: string;
  syncStatus: SyncStatus;
  idempotencyKey?: string;
}

export interface Batch {
  id: string;
  batchId: string; // FT-IN-MH-PUN-YYYYMMDD-XXXXXX
  productName: string;
  category: ProductCategory;
  variety?: string;
  quantity: number;
  unit: "KG" | "TONS" | "LITERS" | "BOXES" | "PACKETS" | "UNITS";
  harvestDate?: string;
  productionDate: string;
  expiryDate?: string;
  farmLocation: string;
  lat: number;
  lng: number;
  district: string;
  state: string;
  farmerName: string;
  farmerOrg?: string;
  createdBy: string;
  currentOwner: string;
  currentOwnerRole: UserRole;
  currentStatus: BatchStatus;
  verificationStatus: VerificationStatus;
  parentBatchIds: string[];
  childBatchIds: string[];
  qualityGrade?: "A+" | "A" | "B" | "C" | "STANDARD" | "ORGANIC";
  photos: string[];
  notes?: string;
  fssaiLicence?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BatchLineage {
  id: string;
  parentBatchId: string;
  childBatchId: string;
  relationshipType: "SPLIT" | "MERGE" | "TRANSFORM" | "REPACK";
  quantityUsed: number;
  unit: string;
  eventId?: string;
  createdBy: string;
  createdAt: string;
}

export interface RecallNotice {
  id: string;
  batchId: string;
  reason: string;
  severity: "HIGH" | "CRITICAL";
  authorityId: string;
  authorityName: string;
  issuedAt: string;
  affectedDescendantBatchIds: string[];
  active: boolean;
}

export interface RiskAlert {
  id: string;
  batchId: string;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  flagReason: string;
  detectedAt: string;
  resolved: boolean;
  actorName?: string;
  actorRole?: UserRole;
}

export interface SyncQueueItem {
  id: string;
  event: SupplyChainEvent;
  idempotencyKey: string;
  createdAt: string;
  retryCount: number;
  lastError?: string;
}

export type SupportedLanguage = "EN" | "HI" | "MR" | "GU" | "TA" | "TE" | "KN" | "BN" | "PA";
