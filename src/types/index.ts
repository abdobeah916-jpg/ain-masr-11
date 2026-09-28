export type Language = 'ar' | 'en';

export type UserRole = 'citizen' | 'authority' | 'admin';

export type Severity = 'low' | 'medium' | 'high' | 'critical';

export type ReportStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'assigned'
  | 'info_requested'
  | 'investigating'
  | 'forwarded'
  | 'resolved'
  | 'rejected'
  | 'duplicate'
  | 'closed';

export interface Governorate {
  id: string;
  nameAr: string;
  nameEn: string;
  lat: number;
  lng: number;
  region: 'greater_cairo' | 'alexandria' | 'delta' | 'canal' | 'upper_egypt' | 'frontier';
}

export interface ReportCategory {
  id: string;
  nameAr: string;
  nameEn: string;
  iconName: string;
  descriptionAr: string;
  descriptionEn: string;
  defaultDepartmentId: string;
  isEmergencyRisk: boolean;
  active: boolean;
  order: number;
}

export interface Department {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  governoratesCovered: string[]; // empty means all-Egypt
  contactEmail: string;
  hotline: string;
  categoryIds: string[];
  headOfficerAr: string;
  headOfficerEn: string;
}

export interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio' | 'document';
  url: string;
  sizeBytes: number;
  isBlurred?: boolean;
  videoStorageId?: string; // Dedicated Video Vault Identifier
  storageBucket?: string; // Video Database Bucket
  sha256?: string; // Cryptographic SHA-256 Checksum
  isValidated?: boolean; // Forensic Authenticity Verification
}

export interface StatusTimelineEntry {
  id: string;
  status: ReportStatus;
  timestamp: string;
  noteAr: string;
  noteEn: string;
  actorRole: 'system' | 'admin' | 'authority' | 'citizen';
  actorName?: string;
  departmentId?: string;
  commentAr?: string;
  commentEn?: string;
}

export interface InternalNote {
  id: string;
  authorName: string;
  departmentName: string;
  timestamp: string;
  note: string;
}

export interface ClarificationMessage {
  id: string;
  sender: 'authority' | 'citizen' | 'admin';
  senderName: string;
  timestamp: string;
  content: string;
}

export interface AuthorityBranch {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  governorateId: string;
  district: string;
  lat: number;
  lng: number;
  phone: string;
  addressAr: string;
  addressEn: string;
}

export interface Report {
  id: string;
  referenceNo: string; // e.g. AM-2026-000101
  title: string;
  titleEn?: string;
  categoryId: string;
  customCategory?: string; // Citizen-defined category / type of incident
  customCategoryEn?: string;
  mongoId?: string; // MongoDB _id (24-hex ObjectId)
  dateOccurred: string;
  timeOccurred: string;
  isOngoing: boolean;
  severity: Severity;
  description: string;
  descriptionEn?: string;
  witnesses?: string;
  witnessesEn?: string;
  immediateDanger: boolean;
  additionalNotes?: string;
  additionalNotesEn?: string;
  location: {
    governorateId: string;
    cityDistrict: string;
    cityDistrictEn?: string;
    streetLandmark: string;
    streetLandmarkEn?: string;
    lat: number;
    lng: number;
    accuracyMeters: number;
  };
  attachments: Attachment[];
  reporter: {
    identityType: 'verified' | 'protected';
    fullName?: string;
    phone?: string;
    email?: string;
    nationalIdLast4?: string;
    preferredContact?: 'sms' | 'phone' | 'email';
  };
  status: ReportStatus;
  statusTimeline: StatusTimelineEntry[];
  assignedDepartmentId?: string;
  assignedBranchId?: string;
  assignedBranchNameAr?: string;
  assignedBranchNameEn?: string;
  distanceToBranchKm?: number;
  isSharedWithNetwork?: boolean; // When true, other branches can see the report
  sharedWithBranchIds?: string[]; // Specifically authorized branches or shared branches
  isCompleted?: boolean;
  completedAt?: string;
  completedByBranchAr?: string;
  completedByOfficerName?: string;
  internalNotes: InternalNote[];
  clarificationMessages: ClarificationMessage[];
  moderationStatus: 'clean' | 'flagged' | 'quarantined' | 'reviewed';
  moderationNotes?: string;
  userFeedback?: {
    rating: number; // 1-5
    comment?: string;
    submittedAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface RoutingRule {
  id: string;
  nameAr: string;
  nameEn: string;
  categoryId?: string;
  governorateId?: string;
  severity?: Severity;
  targetDepartmentId: string;
  priority: number;
  active: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole | 'system';
  actionAr: string;
  actionEn: string;
  targetType: 'report' | 'category' | 'routing_rule' | 'user' | 'department';
  targetId: string;
  details: string;
}

export interface AppNotification {
  id: string;
  timestamp: string;
  titleAr: string;
  titleEn: string;
  messageAr: string;
  messageEn: string;
  read: boolean;
  reportRef?: string;
  branchNameAr?: string;
  branchNameEn?: string;
  type: 'status_update' | 'clarification' | 'system' | 'moderation' | 'nearest_routing' | 'branch_transfer' | 'resolved';
}

export interface UserAccount {
  id: string;
  name: string;
  role: UserRole;
  phone: string;
  email: string;
  username?: string;
  password?: string;
  departmentId?: string;
  branchId?: string;
  branchNameAr?: string;
  branchNameEn?: string;
  isSuspended?: boolean;
  isGuestCitizen?: boolean;
}
