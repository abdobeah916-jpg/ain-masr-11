import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Language,
  UserRole,
  UserAccount,
  Report,
  ReportCategory,
  Department,
  AuthorityBranch,
  RoutingRule,
  AuditLog,
  AppNotification,
  ReportStatus,
  Severity,
  ClarificationMessage,
} from '../types';
import {
  CATEGORIES,
  DEPARTMENTS,
  AUTHORITY_BRANCHES,
  findNearestAuthorityBranch,
  INITIAL_REPORTS,
  INITIAL_ROUTING_RULES,
  INITIAL_AUDIT_LOGS,
  MOCK_USERS,
} from '../data/mockData';
import {
  syncReportToMongoDB,
  generateMongoObjectId,
  fetchReportsFromMongoDB,
  updateReportInMongoDB,
} from '../utils/databaseService';

export interface ExternalToastItem {
  id: string;
  titleAr: string;
  titleEn: string;
  messageAr: string;
  messageEn: string;
  reportRef?: string;
  branchNameAr?: string;
  type: string;
}

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  currentUser: UserAccount;
  setCurrentUser: (user: UserAccount) => void;
  switchRole: (role: UserRole, departmentId?: string) => void;
  activeView: string;
  setActiveView: (view: string) => void;
  selectedReportId: string | null;
  setSelectedReportId: (id: string | null) => void;

  // Auth & Roles
  isOfficialAuthenticated: boolean;
  isCitizenAuthenticated: boolean;
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  authDefaultTab: 'citizen' | 'official';
  setAuthDefaultTab: (tab: 'citizen' | 'official') => void;
  loginAsCitizen: (customName?: string, customPhone?: string, customEmail?: string, customNationalId?: string) => void;
  loginAsOfficial: (
    roleType: 'admin' | 'authority',
    username: string,
    pass: string,
    branchId?: string
  ) => { success: boolean; message?: string };
  logout: () => void;
  requireAuthForRole: (targetRole: 'authority' | 'admin', deptId?: string) => boolean;

  // Multi-Branch Collaborative System
  branches: AuthorityBranch[];
  currentOfficerBranch: AuthorityBranch;
  setCurrentOfficerBranch: (branch: AuthorityBranch) => void;
  transferReportBranch: (reportId: string, targetBranchId: string, reasonAr: string) => void;
  toggleShareReportWithNetwork: (reportId: string, shared: boolean, reason?: string) => void;
  markReportFinished: (reportId: string, resolutionNoteAr: string) => void;
  claimReportForBranch: (reportId: string) => void;

  // Receipt Modal
  receiptModalReport: Report | null;
  setReceiptModalReport: (report: Report | null) => void;
  printReportReceipt: (report: Report) => void;

  // Notifications
  notificationsDropdownOpen: boolean;
  setNotificationsDropdownOpen: (open: boolean) => void;
  markAllNotificationsAsRead: () => void;

  // External live toast notification
  externalToast: ExternalToastItem | null;
  dismissExternalToast: () => void;
  triggerExternalToast: (toast: Omit<ExternalToastItem, 'id'>) => void;

  // Reports
  reports: Report[];
  categories: ReportCategory[];
  departments: Department[];
  routingRules: RoutingRule[];
  auditLogs: AuditLog[];
  notifications: AppNotification[];

  // Emergency Modal
  emergencyModalOpen: boolean;
  setEmergencyModalOpen: (open: boolean) => void;

  // Actions
  submitNewReport: (newReport: Omit<Report, 'id' | 'referenceNo' | 'status' | 'statusTimeline' | 'internalNotes' | 'clarificationMessages' | 'moderationStatus' | 'createdAt' | 'updatedAt'>) => Report;
  updateReportStatus: (reportId: string, status: ReportStatus, noteAr: string, noteEn: string) => void;
  addInternalNote: (reportId: string, noteText: string) => void;
  addClarificationMessage: (reportId: string, content: string, sender: 'authority' | 'citizen' | 'admin') => void;
  forwardReport: (reportId: string, targetDeptId: string, reason: string) => void;
  withdrawReport: (reportId: string, reason: string) => void;
  submitReportRating: (reportId: string, rating: number, comment?: string) => void;
  moderateReport: (reportId: string, action: 'approve' | 'quarantine', notes?: string) => void;

  // Management
  addCategory: (cat: Omit<ReportCategory, 'id'>) => void;
  updateCategory: (cat: ReportCategory) => void;
  toggleCategory: (id: string) => void;
  addRoutingRule: (rule: Omit<RoutingRule, 'id'>) => void;
  toggleRoutingRule: (id: string) => void;
  deleteRoutingRule: (id: string) => void;

  // Draft
  reportDraft: any;
  saveReportDraft: (draft: any) => void;
  clearReportDraft: () => void;

  // Export
  exportReportsCsv: () => void;

  // Real-time synchronization
  refreshReportsFromBackend: () => Promise<void>;
  isRefreshingReports: boolean;
  lastReportsSyncTime: string | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  LANG: 'ain_masr_lang',
  USER: 'ain_masr_user',
  REPORTS: 'ain_masr_reports',
  CATEGORIES: 'ain_masr_categories',
  RULES: 'ain_masr_rules',
  AUDIT: 'ain_masr_audit',
  NOTIFS: 'ain_masr_notifs',
  DRAFT: 'ain_masr_draft',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem(STORAGE_KEYS.LANG) as Language) || 'ar';
  });

  const [currentUser, setCurrentUser] = useState<UserAccount>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return MOCK_USERS[0]; // default to citizen
  });

  const [reports, setReports] = useState<Report[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REPORTS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_REPORTS;
  });

  const [categories, setCategories] = useState<ReportCategory[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return CATEGORIES;
  });

  const [departments] = useState<Department[]>(DEPARTMENTS);

  const [routingRules, setRoutingRules] = useState<RoutingRule[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.RULES);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_ROUTING_RULES;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUDIT);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_AUDIT_LOGS;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return [
      {
        id: 'notif_init',
        timestamp: new Date().toISOString(),
        titleAr: 'مرحباً بك في منصة عين مصر',
        titleEn: 'Welcome to Ain Masr Platform',
        messageAr: 'نظام البلاغات المدنية الآمن وفقاً للقوانين المصرية.',
        messageEn: 'Responsible, confidential civic reporting system for Egypt.',
        read: false,
        type: 'system',
      },
    ];
  });

  const [activeView, setActiveView] = useState<string>('home');
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [emergencyModalOpen, setEmergencyModalOpen] = useState<boolean>(false);

  // Authentication & Portals
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authDefaultTab, setAuthDefaultTab] = useState<'citizen' | 'official'>('citizen');
  const [isCitizenAuthenticated, setIsCitizenAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem('ain_masr_citizen_logged');
    return saved === 'true';
  });

  const [isOfficialAuthenticated, setIsOfficialAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    if (saved) {
      try {
        const u = JSON.parse(saved);
        return u.role !== 'citizen';
      } catch (e) { /* ignore */ }
    }
    return false;
  });

  // Receipt Modal
  const [receiptModalReport, setReceiptModalReport] = useState<Report | null>(null);

  // Multi-Branch Collaborative System
  const branches = AUTHORITY_BRANCHES;
  const [currentOfficerBranch, setCurrentOfficerBranch] = useState<AuthorityBranch>(() => {
    const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        if (u.branchId) {
          const found = AUTHORITY_BRANCHES.find((b) => b.id === u.branchId);
          if (found) return found;
        }
      } catch (e) { /* ignore */ }
    }
    return AUTHORITY_BRANCHES[0]; // جهة الأربعين (السويس)
  });

  // External live toast notification
  const [externalToast, setExternalToast] = useState<ExternalToastItem | null>(null);

  const triggerExternalToast = (toast: Omit<ExternalToastItem, 'id'>) => {
    const newItem: ExternalToastItem = {
      ...toast,
      id: `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    };
    setExternalToast(newItem);
    setTimeout(() => {
      setExternalToast((curr) => (curr?.id === newItem.id ? null : curr));
    }, 7000);
  };

  const dismissExternalToast = () => {
    setExternalToast(null);
  };

  // Notifications Dropdown
  const [notificationsDropdownOpen, setNotificationsDropdownOpen] = useState<boolean>(false);

  const [reportDraft, setReportDraft] = useState<any>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DRAFT);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return null;
  });

  // Sync Language and Direction with DOM
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEYS.LANG, lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  };

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  // Persist state updates
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RULES, JSON.stringify(routingRules));
  }, [routingRules]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFS, JSON.stringify(notifications));
  }, [notifications]);

  const [isRefreshingReports, setIsRefreshingReports] = useState<boolean>(false);
  const [lastReportsSyncTime, setLastReportsSyncTime] = useState<string | null>(null);

  // Helper to normalize reports and ensure all required nested properties exist
  const normalizeReport = (raw: any): Report => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().slice(0, 5);

    // Normalize timeline to guarantee noteAr and noteEn are never undefined
    const rawTimeline = Array.isArray(raw.statusTimeline) && raw.statusTimeline.length > 0
      ? raw.statusTimeline
      : [
          {
            id: `tl_${Date.now()}_init`,
            status: raw.status || 'submitted',
            timestamp: raw.createdAt || now.toISOString(),
            noteAr: raw.commentAr || 'تم استلام وتسجيل البلاغ رسمياً وتوجيهه للنظام الميداني.',
            noteEn: raw.commentEn || 'Report registered and dispatched to field system.',
            actorRole: 'citizen',
            actorName: raw.reporter?.fullName || 'مواطن / مقيم',
          },
        ];

    const safeTimeline = rawTimeline.map((tl: any, idx: number) => ({
      id: tl.id || `tl_${idx}_${Date.now()}`,
      status: (tl.status || raw.status || 'submitted') as ReportStatus,
      timestamp: tl.timestamp || raw.createdAt || now.toISOString(),
      noteAr: tl.noteAr || tl.commentAr || 'إجراء متابعة ميدانية موثق',
      noteEn: tl.noteEn || tl.commentEn || 'Official status log',
      actorRole: tl.actorRole || tl.changedByRole || 'system',
      actorName: tl.actorName || '',
      departmentId: tl.departmentId || '',
    }));

    return {
      id: raw.id || `rep_${Date.now()}`,
      referenceNo: raw.referenceNo || `AM-${Date.now().toString().slice(-6)}`,
      title: raw.title || 'بلاغ وارد',
      categoryId: raw.categoryId || 'infrastructure',
      customCategory: raw.customCategory,
      mongoId: raw.mongoId || raw._id,
      dateOccurred: raw.dateOccurred || dateStr,
      timeOccurred: raw.timeOccurred || timeStr,
      isOngoing: Boolean(raw.isOngoing),
      severity: raw.severity || 'medium',
      description: raw.description || '',
      witnesses: raw.witnesses,
      immediateDanger: Boolean(raw.immediateDanger),
      additionalNotes: raw.additionalNotes,
      location: {
        governorateId: raw.location?.governorateId || 'cairo',
        cityDistrict: raw.location?.cityDistrict || 'حي مصر القديمة',
        streetLandmark: raw.location?.streetLandmark || '',
        lat: typeof raw.location?.lat === 'number' ? raw.location.lat : 30.0444,
        lng: typeof raw.location?.lng === 'number' ? raw.location.lng : 31.2357,
        accuracyMeters: typeof raw.location?.accuracyMeters === 'number' ? raw.location.accuracyMeters : 15,
      },
      attachments: Array.isArray(raw.attachments) ? raw.attachments : [],
      reporter: raw.reporter || { identityType: 'protected' },
      status: raw.status || 'submitted',
      statusTimeline: safeTimeline,
      assignedDepartmentId: raw.assignedDepartmentId || 'gov_cairo',
      assignedBranchId: raw.assignedBranchId,
      assignedBranchNameAr: raw.assignedBranchNameAr,
      assignedBranchNameEn: raw.assignedBranchNameEn,
      distanceToBranchKm: raw.distanceToBranchKm,
      isSharedWithNetwork: Boolean(raw.isSharedWithNetwork),
      sharedWithBranchIds: Array.isArray(raw.sharedWithBranchIds) ? raw.sharedWithBranchIds : [],
      isCompleted: Boolean(raw.isCompleted || raw.status === 'resolved' || raw.status === 'closed'),
      completedAt: raw.completedAt,
      completedByBranchAr: raw.completedByBranchAr,
      completedByOfficerName: raw.completedByOfficerName,
      internalNotes: Array.isArray(raw.internalNotes) ? raw.internalNotes : [],
      clarificationMessages: Array.isArray(raw.clarificationMessages) ? raw.clarificationMessages : [],
      moderationStatus: raw.moderationStatus || 'clean',
      moderationNotes: raw.moderationNotes,
      userFeedback: raw.userFeedback,
      createdAt: raw.createdAt || now.toISOString(),
      updatedAt: raw.updatedAt || now.toISOString(),
    };
  };

  // Real-time synchronization method (reconnects admin and officers to latest database state)
  const refreshReportsFromBackend = async (): Promise<void> => {
    setIsRefreshingReports(true);
    try {
      const remoteReports = await fetchReportsFromMongoDB();
      if (remoteReports && remoteReports.length > 0) {
        const normalized = remoteReports.map(normalizeReport);

        setReports((prev) => {
          const map = new Map<string, Report>();

          // Seed existing local state
          prev.forEach((r) => map.set(r.id, r));

          // Merge remote data seamlessly
          normalized.forEach((remoteRep) => {
            const existing = map.get(remoteRep.id);
            if (!existing) {
              map.set(remoteRep.id, remoteRep);
            } else {
              const remoteTime = new Date(remoteRep.updatedAt || remoteRep.createdAt).getTime();
              const localTime = new Date(existing.updatedAt || existing.createdAt).getTime();

              // Merge replies, timeline, and newest updates
              const mergedTimeline = remoteRep.statusTimeline.length >= existing.statusTimeline.length
                ? remoteRep.statusTimeline
                : existing.statusTimeline;

              const mergedReplies = (remoteRep.clarificationMessages?.length || 0) >= (existing.clarificationMessages?.length || 0)
                ? remoteRep.clarificationMessages
                : existing.clarificationMessages;

              const mergedNotes = (remoteRep.internalNotes?.length || 0) >= (existing.internalNotes?.length || 0)
                ? remoteRep.internalNotes
                : existing.internalNotes;

              if (remoteTime >= localTime) {
                map.set(remoteRep.id, {
                  ...existing,
                  ...remoteRep,
                  statusTimeline: mergedTimeline,
                  clarificationMessages: mergedReplies,
                  internalNotes: mergedNotes,
                });
              } else {
                map.set(remoteRep.id, {
                  ...remoteRep,
                  ...existing,
                  statusTimeline: mergedTimeline,
                  clarificationMessages: mergedReplies,
                  internalNotes: mergedNotes,
                });
              }
            }
          });

          const mergedList = Array.from(map.values()).sort(
            (a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
          );

          localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(mergedList));
          return mergedList;
        });

        setLastReportsSyncTime(new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      }
    } catch (e) {
      // ignore network errors in polling
    } finally {
      setIsRefreshingReports(false);
    }
  };

  // Automated background polling & cross-tab synchronization
  useEffect(() => {
    refreshReportsFromBackend();
    const interval = setInterval(refreshReportsFromBackend, 6000);

    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.REPORTS && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setReports(parsed.map(normalizeReport));
          }
        } catch {
          // ignore
        }
      }
    };

    const handleLocalSyncEvent = () => {
      const saved = localStorage.getItem(STORAGE_KEYS.REPORTS);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setReports(parsed.map(normalizeReport));
          }
        } catch {
          // ignore
        }
      }
    };

    window.addEventListener('storage', handleStorageEvent);
    window.addEventListener('ain_masr_reports_updated', handleLocalSyncEvent);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageEvent);
      window.removeEventListener('ain_masr_reports_updated', handleLocalSyncEvent);
    };
  }, []);

  // Helper to persist report mutations to state, localStorage, cross-tab events, and MongoDB
  const persistReportMutation = (
    reportId: string,
    mutator: (current: Report) => Report
  ): Report | null => {
    let mutatedItem: Report | null = null;

    setReports((prev) => {
      const nextList = prev.map((r) => {
        if (r.id !== reportId) return r;
        mutatedItem = mutator(r);
        return mutatedItem;
      });

      localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(nextList));
      window.dispatchEvent(new CustomEvent('ain_masr_reports_updated', { detail: { reportId } }));
      return nextList;
    });

    if (mutatedItem) {
      syncReportToMongoDB(mutatedItem).catch(() => {});
    }
    return mutatedItem;
  };

  // Role Switcher helper
  const switchRole = (role: UserRole, departmentId?: string) => {
    if (role === 'citizen') {
      loginAsCitizen();
      return;
    }

    // Official roles require authentication
    if (!isOfficialAuthenticated || currentUser.role !== role) {
      setAuthDefaultTab('official');
      setAuthModalOpen(true);
      return;
    }

    let matchedUser = MOCK_USERS.find((u) => u.role === role);
    if (role === 'authority' && departmentId) {
      matchedUser = MOCK_USERS.find((u) => u.departmentId === departmentId) || matchedUser;
    }
    if (matchedUser) {
      setCurrentUser(matchedUser);
    }

    // Switch view context appropriately
    if (role === 'authority') {
      setActiveView('authority_portal');
    } else if (role === 'admin') {
      setActiveView('admin_dashboard');
    } else {
      setActiveView('home');
    }
  };

  // Citizen Login
  const loginAsCitizen = (customName?: string, customPhone?: string, customEmail?: string, customNationalId?: string) => {
    const baseUser = MOCK_USERS[0];
    const citizenUser: UserAccount = {
      ...baseUser,
      name: customName?.trim() || baseUser.name,
      phone: customPhone?.trim() || baseUser.phone,
      email: customEmail?.trim() || baseUser.email,
      nationalId: customNationalId?.trim() || '29801011234567',
      isGuestCitizen: false,
    };
    setCurrentUser(citizenUser);
    setIsCitizenAuthenticated(true);
    setIsOfficialAuthenticated(false);
    localStorage.setItem('ain_masr_citizen_logged', 'true');
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(citizenUser));
    setAuthModalOpen(false);

    const now = new Date().toISOString();
    const newNotif: AppNotification = {
      id: `notif_${Date.now()}`,
      timestamp: now,
      titleAr: 'دخول ناجح كمواطن / مقيم',
      titleEn: 'Citizen access activated',
      messageAr: `مرحباً بك يا ${citizenUser.name}، يمكنك الآن تقديم ومتابعة بلاغاتك المدنية بأمان وسرية تامة.`,
      messageEn: `Welcome ${citizenUser.name}! You can now submit and track reports in full confidentiality.`,
      read: false,
      type: 'system',
    };
    setNotifications((prev) => [newNotif, ...prev]);

    triggerExternalToast({
      titleAr: 'مرحباً بك في عين مصر',
      titleEn: 'Welcome to Ain Masr',
      messageAr: `تم تسجيل دخولك بنجاح كمواطن: ${citizenUser.name}`,
      messageEn: `Logged in as citizen: ${citizenUser.name}`,
      type: 'system',
    });
  };

  // Official Authority or Admin Login (strictly two official roles: رئيس المنظومة OR جهة مختصة)
  const loginAsOfficial = (
    roleType: 'admin' | 'authority',
    userIdentifier: string,
    pass: string,
    branchId?: string
  ): { success: boolean; message?: string } => {
    const cleanUser = userIdentifier.trim().toLowerCase();
    const cleanPass = pass.trim();

    if (roleType === 'admin') {
      // رئيس المنظومة
      const adminMatches =
        (cleanUser === 'admin' || cleanUser === 'chief' || cleanUser === 'admin.ops') &&
        (cleanPass === 'admin2026' || cleanPass === 'pass123' || cleanPass === 'admin' || cleanPass === 'pass2026');

      if (!adminMatches) {
        return {
          success: false,
          message: language === 'ar' ? 'بيانات دخول رئيس المنظومة غير صحيحة.' : 'Invalid Head of System credentials.',
        };
      }

      const adminUser = MOCK_USERS.find((u) => u.role === 'admin') || MOCK_USERS[1];
      setCurrentUser(adminUser);
      setIsOfficialAuthenticated(true);
      setAuthModalOpen(false);
      setActiveView('admin_dashboard');

      triggerExternalToast({
        titleAr: 'تم تسجيل دخول رئيس المنظومة',
        titleEn: 'Head of System Logged In',
        messageAr: 'تم تفعيل صلاحيات الرقابة المركزية ومتابعة أداء جميع الجهات.',
        messageEn: 'Central oversight clearance granted.',
        type: 'system',
      });

      return { success: true };
    }

    // جهة مختصة
    // Accept valid credentials for authority officers (e.g. suez.officer, arbaeen.officer, authority, or any official with pass2026/pass123)
    const validPassword =
      cleanPass === 'pass2026' ||
      cleanPass === 'auth2026' ||
      cleanPass === '123456' ||
      cleanPass === 'pass123' ||
      cleanPass === 'suez2026' ||
      cleanPass === 'traffic2026';

    if (!validPassword) {
      return {
        success: false,
        message: language === 'ar' ? 'كلمة المرور غير صحيحة للجهة المختصة.' : 'Invalid password for authority sector.',
      };
    }

    // Determine target branch
    let matchedBranch = AUTHORITY_BRANCHES[0]; // default: جهة الأربعين (السويس)
    if (branchId) {
      const b = AUTHORITY_BRANCHES.find((item) => item.id === branchId);
      if (b) matchedBranch = b;
    } else if (cleanUser.includes('telecom') || cleanUser.includes('cyber') || cleanUser.includes('ntra')) {
      const b = AUTHORITY_BRANCHES.find((item) => item.id === 'branch_telecom_cyber');
      if (b) matchedBranch = b;
    } else if (cleanUser.includes('suez')) {
      const b = AUTHORITY_BRANCHES.find((item) => item.id === 'branch_suez_city');
      if (b) matchedBranch = b;
    } else if (cleanUser.includes('arbaeen')) {
      const b = AUTHORITY_BRANCHES.find((item) => item.id === 'branch_suez_arbaeen');
      if (b) matchedBranch = b;
    }

    setCurrentOfficerBranch(matchedBranch);

    const authorityUser: UserAccount = {
      id: `usr_auth_${matchedBranch.id}`,
      name: language === 'ar' ? `مفتش ${matchedBranch.nameAr}` : `Inspector (${matchedBranch.nameEn})`,
      role: 'authority',
      phone: matchedBranch.phone,
      email: `${matchedBranch.code.toLowerCase()}@ainmasr.eg.mock`,
      username: cleanUser || 'authority',
      branchId: matchedBranch.id,
      branchNameAr: matchedBranch.nameAr,
      branchNameEn: matchedBranch.nameEn,
    };

    setCurrentUser(authorityUser);
    setIsOfficialAuthenticated(true);
    setAuthModalOpen(false);
    setActiveView('authority_portal');

    triggerExternalToast({
      titleAr: `تم تسجيل الدخول: ${matchedBranch.nameAr}`,
      titleEn: `Authenticated: ${matchedBranch.nameEn}`,
      messageAr: 'مرحباً بك في شبكة الجهات المختصة المشتركة لمتابعة ومعالجة البلاغات.',
      messageEn: 'Welcome to the collaborative Competent Authority network.',
      branchNameAr: matchedBranch.nameAr,
      type: 'system',
    });

    return { success: true };
  };

  const logout = () => {
    const baseCitizen = MOCK_USERS[0];
    setCurrentUser(baseCitizen);
    setIsCitizenAuthenticated(false);
    setIsOfficialAuthenticated(false);
    localStorage.removeItem('ain_masr_citizen_logged');
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(baseCitizen));
    setActiveView('home');

    triggerExternalToast({
      titleAr: 'تم تسجيل الخروج',
      titleEn: 'Logged Out',
      messageAr: 'تم تسجيل الخروج بنجاح والعودة للوضع العام.',
      messageEn: 'Successfully logged out.',
      type: 'system',
    });
  };

  const requireAuthForRole = (targetRole: 'authority' | 'admin', deptId?: string): boolean => {
    if (currentUser.role === targetRole && isOfficialAuthenticated) {
      if (deptId && currentUser.departmentId !== deptId) {
        const matched = MOCK_USERS.find((u) => u.departmentId === deptId);
        if (matched) setCurrentUser(matched);
      }
      return true;
    }

    setAuthDefaultTab('official');
    setAuthModalOpen(true);
    return false;
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const printReportReceipt = (report: Report) => {
    setReceiptModalReport(report);
  };

  // Automated Routing Engine
  const evaluateRouting = (categoryId: string, governorateId: string, severity: Severity): string => {
    // Dedicated rule for cyber extortion & sensitive cases: ALWAYS route to Telecom Authority & Cybercrime Unit
    if (categoryId === 'cat_cyber_extortion') {
      return 'dept_telecom_cyber';
    }

    // Check rules in order of priority (highest priority first)
    const sortedRules = [...routingRules]
      .filter((r) => r.active)
      .sort((a, b) => b.priority - a.priority);

    for (const rule of sortedRules) {
      const matchCat = !rule.categoryId || rule.categoryId === categoryId;
      const matchGov = !rule.governorateId || rule.governorateId === governorateId;
      const matchSev = !rule.severity || rule.severity === severity;
      if (matchCat && matchGov && matchSev) {
        return rule.targetDepartmentId;
      }
    }

    // Default by category definition
    const cat = categories.find((c) => c.id === categoryId);
    return cat ? cat.defaultDepartmentId : 'dept_public_safety';
  };

  // Submit new report
  const submitNewReport = (newReportData: Omit<Report, 'id' | 'referenceNo' | 'status' | 'statusTimeline' | 'internalNotes' | 'clarificationMessages' | 'moderationStatus' | 'createdAt' | 'updatedAt'>): Report => {
    const count = reports.length + 101;
    const randomSeq = Math.floor(100 + Math.random() * 900);
    const referenceNo = `AM-2026-${count}${randomSeq.toString().slice(-1)}`;
    const newId = `rep_${Date.now()}`;
    const now = new Date().toISOString();

    // Check if this is a confidential sensitive case (cyber extortion, online bullying, or marked sensitive)
    const isSensitiveCyber = Boolean(
      newReportData.categoryId === 'cat_cyber_extortion' ||
      Boolean(newReportData.isSensitive) ||
      (newReportData.title && /ابتزاز|تنمر|سري|حساس|تشهير|إلكتروني|extortion|cyber|bullying/i.test(newReportData.title)) ||
      (newReportData.customCategory && /ابتزاز|تنمر|سري|حساس|تشهير|إلكتروني|extortion|cyber|bullying/i.test(newReportData.customCategory)) ||
      (newReportData.description && /ابتزاز|تنمر|تهديد بنشر صور|تهديد بفيديو/i.test(newReportData.description))
    );

    // Calculate Geographically Nearest Competent Authority Branch
    const nearestBranchInfo = findNearestAuthorityBranch(
      newReportData.location.lat,
      newReportData.location.lng,
      newReportData.location.governorateId,
      newReportData.location.cityDistrict
    );

    let assignedDeptId = isSensitiveCyber
      ? 'dept_telecom_cyber'
      : evaluateRouting(
          newReportData.categoryId,
          newReportData.location.governorateId,
          newReportData.severity
        );

    // If sensitive cyber report (extortion, cyberbullying), route EXCLUSIVELY to Egyptian Telecom Authority
    let finalBranchId = nearestBranchInfo.branch.id;
    let finalBranchNameAr = nearestBranchInfo.branch.nameAr;
    let finalBranchNameEn = nearestBranchInfo.branch.nameEn;
    let finalDistanceKm = nearestBranchInfo.distanceKm;

    if (isSensitiveCyber) {
      assignedDeptId = 'dept_telecom_cyber';
      const telecomBranch = AUTHORITY_BRANCHES.find((b) => b.id === 'branch_telecom_cyber');
      if (telecomBranch) {
        finalBranchId = telecomBranch.id;
        finalBranchNameAr = telecomBranch.nameAr;
        finalBranchNameEn = telecomBranch.nameEn;
        finalDistanceKm = 0;
      }
    }

    const isDefamatoryRisk =
      newReportData.description.includes('حرامي') ||
      newReportData.description.includes('نصاب') ||
      newReportData.description.includes('فاسد') ||
      newReportData.description.toLowerCase().includes('thief');

    const mongoId = generateMongoObjectId();

    const createdReport: Report = {
      ...newReportData,
      id: newId,
      mongoId,
      referenceNo,
      status: 'submitted',
      isSensitive: isSensitiveCyber,
      assignedDepartmentId: assignedDeptId,
      assignedBranchId: finalBranchId,
      assignedBranchNameAr: finalBranchNameAr,
      assignedBranchNameEn: finalBranchNameEn,
      distanceToBranchKm: finalDistanceKm,
      moderationStatus: isDefamatoryRisk ? 'flagged' : 'clean',
      moderationNotes: isDefamatoryRisk ? 'نظام التحقق الآلي: اشتباه بعبارات اتهام شخصية تستلزم المراجعة' : undefined,
      internalNotes: [],
      clarificationMessages: [],
      statusTimeline: [
        {
          id: `tl_${Date.now()}_1`,
          status: 'submitted',
          timestamp: now,
          noteAr: isSensitiveCyber
            ? 'تم استلام وتشفير البلاغ الحساس وقيده في السجل الأمني الموحد لمكافحة الابتزاز والجرائم الإلكترونية.'
            : 'تم استلام البلاغ وتوليد الرقم المرجعي الموحد وقيده في سجل المعاينة والمتابعة.',
          noteEn: isSensitiveCyber
            ? 'Sensitive extortion report received, encrypted, and logged into secure cyber-safety records.'
            : 'Report received and assigned unique tracking reference for inspection.',
          actorRole: 'citizen',
          actorName: newReportData.reporter.fullName || 'مواطن / مقيم',
        },
        {
          id: `tl_${Date.now()}_2`,
          status: 'assigned',
          timestamp: new Date(Date.now() + 1000).toISOString(),
          noteAr: isSensitiveCyber
            ? `تم التوجيه الأمني المشفر والتلقائي للبلاغ الحساس إلى: [الجهاز القومي لتنظيم الاتصالات ومباحث الإنترنت - هيئة الاتصالات المصرية] بسرية تامة وعزل كامل عن أي جهات أو فروع محلية.`
            : `تم التوجيه التلقائي للبلاغ إلى أقرب جهة مختصة ميدانية: [${finalBranchNameAr}] (على بُعد ${finalDistanceKm} كم).`,
          noteEn: isSensitiveCyber
            ? `Automatically dispatched strictly to: [National Telecom Regulatory Authority & Cybercrime Unit] with full confidentiality.`
            : `Automatically dispatched to nearest competent authority branch: [${finalBranchNameEn}] (${finalDistanceKm} km away).`,
          actorRole: 'system',
          departmentId: assignedDeptId,
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    setReports((prev) => [createdReport, ...prev]);

    // Asynchronously sync to MongoDB
    syncReportToMongoDB(createdReport).catch(() => {});

    // Create Audit Log
    const newAuditLog: AuditLog = {
      id: `log_${Date.now()}`,
      timestamp: now,
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      actionAr: `تسجيل بلاغ مدني جديد برقم ${referenceNo}`,
      actionEn: `Registered new civic report with ref ${referenceNo}`,
      targetType: 'report',
      targetId: newId,
      details: isSensitiveCyber
        ? `العنوان: ${newReportData.title} — توجيه أمني مشفر وحصري لهيئة الاتصالات المصرية ومباحث الإنترنت (معزول عن الفروع والمحليات)`
        : `العنوان: ${newReportData.title} — توجيه تلقائي لأقرب جهة: ${finalBranchNameAr}`,
    };
    setAuditLogs((prev) => [newAuditLog, ...prev]);

    // Push notification
    const newNotif: AppNotification = {
      id: `notif_${Date.now()}`,
      timestamp: now,
      titleAr: isSensitiveCyber
        ? `🚨 تم تشفير وتوجيه البلاغ الحساس رقم ${referenceNo}`
        : `تم إرسال وتوجيه بلاغك رقم ${referenceNo}`,
      titleEn: isSensitiveCyber
        ? `Sensitive Report ${referenceNo} Encrypted & Auto-Routed`
        : `Report ${referenceNo} Submitted & Auto-Routed`,
      messageAr: isSensitiveCyber
        ? `تم توجيه البلاغ الحساس تلقائياً وفورياً إلى: [الجهاز القومي لتنظيم الاتصالات ومباحث الإنترنت - هيئة الاتصالات المصرية] حصرياً وسرياً، ومحجوب تماماً عن أي جهات محلية.`
        : `تم توجيه البلاغ تلقائياً لأقرب جهة مختصة: ${finalBranchNameAr} (${finalDistanceKm} كم).`,
      messageEn: isSensitiveCyber
        ? `Confidential sensitive report routed exclusively to Egyptian Telecom Regulatory Authority & Cybercrime Unit.`
        : `Automatically dispatched to nearest authority: ${finalBranchNameEn}.`,
      read: false,
      reportRef: referenceNo,
      branchNameAr: isSensitiveCyber ? 'هيئة الاتصالات المصرية ومباحث الإنترنت' : finalBranchNameAr,
      type: 'nearest_routing',
    };
    setNotifications((prev) => [newNotif, ...prev]);

    // Trigger External Toast ("تظهر من بره")
    triggerExternalToast({
      titleAr: isSensitiveCyber
        ? `🚨 توجيه حصري للبلاغ الحساس ${referenceNo}`
        : `📍 توجيه تلقائي للبلاغ ${referenceNo}`,
      titleEn: isSensitiveCyber
        ? `Confidential Cyber Report: ${referenceNo}`
        : `Auto-Routed: ${referenceNo}`,
      messageAr: isSensitiveCyber
        ? `تم توجيه البلاغ الحساس تلقائياً وفورياً إلى: هيئة الاتصالات المصرية ومباحث الإنترنت (محجوب تماماً عن الفروع المحلية)`
        : `تم توجيه البلاغ تلقائياً لأقرب جهة مختصة: ${finalBranchNameAr}`,
      messageEn: isSensitiveCyber
        ? `Dispatched strictly to Egyptian Telecom Authority & Cybercrime Unit.`
        : `Dispatched to nearest branch: ${finalBranchNameEn}`,
      reportRef: referenceNo,
      branchNameAr: isSensitiveCyber ? 'هيئة الاتصالات المصرية ومباحث الإنترنت' : finalBranchNameAr,
      type: 'nearest_routing',
    });

    // Clear draft if any
    clearReportDraft();

    return createdReport;
  };

  // Transfer Report to another branch
  const transferReportBranch = (reportId: string, targetBranchId: string, reasonAr: string) => {
    const targetBranch = AUTHORITY_BRANCHES.find((b) => b.id === targetBranchId);
    if (!targetBranch) return;
    const now = new Date().toISOString();

    let targetReportRef = '';
    let fromBranchName = '';

    const mutated = persistReportMutation(reportId, (r) => {
      targetReportRef = r.referenceNo;
      fromBranchName = r.assignedBranchNameAr || 'الجهة السابقة';
      const newTimeline = {
        id: `tl_${Date.now()}_trans`,
        status: 'forwarded' as ReportStatus,
        timestamp: now,
        noteAr: `تم تحويل البلاغ من [${fromBranchName}] إلى [${targetBranch.nameAr}]. مذكرة التحويل: ${reasonAr}`,
        noteEn: `Transferred from [${fromBranchName}] to [${targetBranch.nameEn}]. Reason: ${reasonAr}`,
        actorRole: currentUser.role,
        actorName: currentUser.name,
      };
      return {
        ...r,
        status: 'forwarded' as ReportStatus,
        assignedBranchId: targetBranch.id,
        assignedBranchNameAr: targetBranch.nameAr,
        assignedBranchNameEn: targetBranch.nameEn,
        updatedAt: now,
        statusTimeline: [...r.statusTimeline, newTimeline],
      };
    });

    const ref = targetReportRef || mutated?.referenceNo || reportId;
    const newNotif: AppNotification = {
      id: `notif_${Date.now()}`,
      timestamp: now,
      titleAr: `إحالة البلاغ ${ref} لجهة أخرى`,
      titleEn: `Report ${ref} Transferred`,
      messageAr: `تم تحويل البلاغ بنجاح إلى [${targetBranch.nameAr}]: ${reasonAr}`,
      messageEn: `Report assigned to [${targetBranch.nameEn}]`,
      read: false,
      reportRef: ref,
      branchNameAr: targetBranch.nameAr,
      type: 'branch_transfer',
    };
    setNotifications((prev) => [newNotif, ...prev]);

    triggerExternalToast({
      titleAr: `🔄 تم تحويل البلاغ ${ref}`,
      titleEn: `Report ${ref} Transferred`,
      messageAr: `البلاغ أصبح الآن في عهدة [${targetBranch.nameAr}]`,
      messageEn: `Assigned to [${targetBranch.nameEn}]`,
      reportRef: ref,
      branchNameAr: targetBranch.nameAr,
      type: 'branch_transfer',
    });
  };

  // Toggle sharing report with other network branches (الإتاحة لبقية الجهات)
  const toggleShareReportWithNetwork = (reportId: string, shared: boolean, reason?: string) => {
    const now = new Date().toISOString();
    const branchName = currentOfficerBranch?.nameAr || currentUser.branchNameAr || 'الجهة المختصة';
    let targetRef = '';

    const mutated = persistReportMutation(reportId, (r) => {
      targetRef = r.referenceNo;
      const noteText = shared
        ? `قررت [${branchName}] إظهار وإتاحة البلاغ لبقية الجهات في الشبكة للتنسيق المشترك. ${reason ? `السبب: ${reason}` : ''}`
        : `أعادت [${branchName}] حصر البلاغ على الفرع المحلي وألغت إتاحته لبقية الجهات.`;
      const newTimeline = {
        id: `tl_${Date.now()}_share`,
        status: r.status,
        timestamp: now,
        noteAr: noteText,
        noteEn: shared
          ? `Report shared across authority network for joint coordination by [${branchName}].`
          : `Network sharing revoked by [${branchName}].`,
        actorRole: currentUser.role,
        actorName: currentUser.name,
      };
      return {
        ...r,
        isSharedWithNetwork: shared,
        updatedAt: now,
        statusTimeline: [...r.statusTimeline, newTimeline],
      };
    });

    const ref = targetRef || mutated?.referenceNo || reportId;
    triggerExternalToast({
      titleAr: shared ? `🌐 تمت إتاحة البلاغ للشبكة` : `🔒 تم حصر البلاغ محلياً`,
      titleEn: shared ? `Report Shared with Network` : `Network Sharing Revoked`,
      messageAr: shared
        ? `البلاغ ${ref} أصبح مرئياً لبقية الجهات المختصة للتنسيق.`
        : `تم إلغاء ظهور البلاغ ${ref} لبقية الجهات.`,
      messageEn: shared
        ? `Report ${ref} is now visible across network.`
        : `Visibility of report ${ref} revoked to local branch.`,
      reportRef: ref,
      branchNameAr: branchName,
      type: 'status_update',
    });
  };

  // Mark report as finished ("خلاص البلاغ ده خلص")
  const markReportFinished = (reportId: string, resolutionNoteAr: string) => {
    const now = new Date().toISOString();
    const branchName = currentOfficerBranch?.nameAr || currentUser.branchNameAr || 'الجهة المختصة';
    let targetReportRef = '';

    const mutated = persistReportMutation(reportId, (r) => {
      targetReportRef = r.referenceNo;
      const newTimeline = {
        id: `tl_${Date.now()}_fin`,
        status: 'resolved' as ReportStatus,
        timestamp: now,
        noteAr: `خلاص البلاغ ده خلص — تم إغلاق وإنهاء البلاغ بنجاح بواسطة [${branchName}]. بيان الإنجاز: ${resolutionNoteAr}`,
        noteEn: `Report resolved and closed by [${branchName}]: ${resolutionNoteAr}`,
        actorRole: currentUser.role,
        actorName: currentUser.name,
      };
      return {
        ...r,
        status: 'resolved' as ReportStatus,
        isCompleted: true,
        completedAt: now,
        completedByBranchAr: branchName,
        completedByOfficerName: currentUser.name,
        updatedAt: now,
        statusTimeline: [...r.statusTimeline, newTimeline],
      };
    });

    const ref = targetReportRef || mutated?.referenceNo || reportId;
    const newNotif: AppNotification = {
      id: `notif_${Date.now()}`,
      timestamp: now,
      titleAr: `✅ تم إنهاء وإغلاق البلاغ ${ref}`,
      titleEn: `Report ${ref} Resolved & Closed`,
      messageAr: `خلاص البلاغ ده خلص — تم إنهاء كافة الأعمال بواسطة [${branchName}].`,
      messageEn: `Finished and closed by [${branchName}].`,
      read: false,
      reportRef: ref,
      branchNameAr: branchName,
      type: 'resolved',
    };
    setNotifications((prev) => [newNotif, ...prev]);

    triggerExternalToast({
      titleAr: `✅ خلاص البلاغ ده خلص!`,
      titleEn: `Report ${ref} Completed!`,
      messageAr: `تم إنهاء وإغلاق البلاغ ${ref} بنجاح بواسطة [${branchName}]`,
      messageEn: `Finished & closed by [${branchName}]`,
      reportRef: ref,
      branchNameAr: branchName,
      type: 'resolved',
    });
  };

  // Claim report for current branch
  const claimReportForBranch = (reportId: string) => {
    const now = new Date().toISOString();
    const branch = currentOfficerBranch;
    let targetRef = '';

    const mutated = persistReportMutation(reportId, (r) => {
      targetRef = r.referenceNo;
      const newTimeline = {
        id: `tl_${Date.now()}_claim`,
        status: 'investigating' as ReportStatus,
        timestamp: now,
        noteAr: `تم استلام ومباشرة البلاغ رسمياً من قِبل [${branch.nameAr}] وتكليف فريق المعاينة الميدانية.`,
        noteEn: `Claimed and initiated by [${branch.nameEn}].`,
        actorRole: currentUser.role,
        actorName: currentUser.name,
      };
      return {
        ...r,
        status: 'investigating' as ReportStatus,
        assignedBranchId: branch.id,
        assignedBranchNameAr: branch.nameAr,
        assignedBranchNameEn: branch.nameEn,
        updatedAt: now,
        statusTimeline: [...r.statusTimeline, newTimeline],
      };
    });

    const ref = targetRef || mutated?.referenceNo || reportId;
    triggerExternalToast({
      titleAr: `تم استلام البلاغ ${ref}`,
      titleEn: `Report ${ref} Claimed`,
      messageAr: `باشرت [${branch.nameAr}] إجراءات الفحص الميداني للبلاغ.`,
      messageEn: `Claimed by [${branch.nameEn}]`,
      reportRef: ref,
      branchNameAr: branch.nameAr,
      type: 'status_update',
    });
  };

  // Update status
  const updateReportStatus = (reportId: string, status: ReportStatus, noteAr: string, noteEn: string) => {
    const now = new Date().toISOString();
    let updatedRep: Report | null = null;

    updatedRep = persistReportMutation(reportId, (r) => {
      const newTimelineEntry = {
        id: `tl_${Date.now()}`,
        status,
        timestamp: now,
        noteAr,
        noteEn,
        actorRole: currentUser.role,
        actorName: currentUser.name,
        departmentId: currentUser.departmentId,
      };
      return {
        ...r,
        status,
        updatedAt: now,
        statusTimeline: [...r.statusTimeline, newTimelineEntry],
      };
    });

    // Audit log
    const newAuditLog: AuditLog = {
      id: `log_${Date.now()}`,
      timestamp: now,
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      actionAr: `تحديث حالة البلاغ ${updatedRep?.referenceNo || reportId} إلى "${status}"`,
      actionEn: `Updated status of ${updatedRep?.referenceNo || reportId} to "${status}"`,
      targetType: 'report',
      targetId: reportId,
      details: noteAr,
    };
    setAuditLogs((prev) => [newAuditLog, ...prev]);

    // Notification
    if (updatedRep) {
      const newNotif: AppNotification = {
        id: `notif_${Date.now()}`,
        timestamp: now,
        titleAr: `تحديث حالة البلاغ ${updatedRep.referenceNo}`,
        titleEn: `Update on Report ${updatedRep.referenceNo}`,
        messageAr: noteAr,
        messageEn: noteEn,
        read: false,
        reportRef: updatedRep.referenceNo,
        type: 'status_update',
      };
      setNotifications((prev) => [newNotif, ...prev]);
    }
  };

  // Add internal confidential note
  const addInternalNote = (reportId: string, noteText: string) => {
    const now = new Date().toISOString();
    const dept = departments.find((d) => d.id === currentUser.departmentId);
    const newNote = {
      id: `in_${Date.now()}`,
      authorName: currentUser.name,
      departmentName: dept?.nameAr || 'الإدارة المختصة',
      timestamp: now,
      note: noteText,
    };

    persistReportMutation(reportId, (r) => ({
      ...r,
      internalNotes: [...r.internalNotes, newNote],
      updatedAt: now,
    }));
  };

  // Add clarification message (Citizen <-> Authority <-> Admin Central Oversight)
  const addClarificationMessage = (reportId: string, content: string, sender: 'authority' | 'citizen' | 'admin') => {
    const now = new Date().toISOString();
    const senderTitle =
      sender === 'admin'
        ? (language === 'ar' ? 'رئاسة المنظومة (Admin)' : 'Platform Directorate')
        : currentUser.name;

    const newMessage: ClarificationMessage = {
      id: `cm_${Date.now()}`,
      sender,
      senderName: senderTitle,
      timestamp: now,
      content,
    };

    const currentRep = persistReportMutation(reportId, (r) => ({
      ...r,
      clarificationMessages: [...r.clarificationMessages, newMessage],
      updatedAt: now,
    }));

    if (currentRep) {
      const senderLabel =
        sender === 'admin'
          ? (language === 'ar' ? 'توجيه إداري من رئيس المنظومة' : 'Direct directive from Platform Directorate')
          : sender === 'authority'
          ? (language === 'ar' ? 'رد من الجهة المختصة' : 'Authority Response')
          : (language === 'ar' ? 'رد من المواطن المبلغ' : 'Citizen response');

      const newNotif: AppNotification = {
        id: `notif_${Date.now()}`,
        timestamp: now,
        titleAr: `${senderLabel} على البلاغ ${currentRep.referenceNo}`,
        titleEn: `Update on ${currentRep.referenceNo}: ${senderLabel}`,
        messageAr: content.slice(0, 100),
        messageEn: content.slice(0, 100),
        read: false,
        reportRef: currentRep.referenceNo,
        type: 'clarification',
      };
      setNotifications((prev) => [newNotif, ...prev]);

      triggerExternalToast({
        titleAr: `💬 ${senderLabel}`,
        titleEn: `Update on ${currentRep.referenceNo}`,
        messageAr: `البلاغ ${currentRep.referenceNo}: ${content.slice(0, 70)}...`,
        messageEn: `${currentRep.referenceNo}: ${content.slice(0, 70)}...`,
        reportRef: currentRep.referenceNo,
        type: 'clarification',
      });
    }
  };

  // Forward report to another department
  const forwardReport = (reportId: string, targetDeptId: string, reason: string) => {
    const now = new Date().toISOString();
    const targetDept = departments.find((d) => d.id === targetDeptId);

    persistReportMutation(reportId, (r) => {
      const newTimelineEntry = {
        id: `tl_${Date.now()}`,
        status: 'forwarded' as ReportStatus,
        timestamp: now,
        noteAr: `تمت الإحالة الإدارية إلى ${targetDept?.nameAr || 'جهة أخرى'}. السبب: ${reason}`,
        noteEn: `Forwarded to ${targetDept?.nameEn || 'other agency'}. Reason: ${reason}`,
        actorRole: currentUser.role,
        actorName: currentUser.name,
        departmentId: targetDeptId,
      };
      return {
        ...r,
        status: 'forwarded',
        assignedDepartmentId: targetDeptId,
        updatedAt: now,
        statusTimeline: [...r.statusTimeline, newTimelineEntry],
      };
    });

    // Audit log
    setAuditLogs((prev) => [
      {
        id: `log_${Date.now()}`,
        timestamp: now,
        actorId: currentUser.id,
        actorName: currentUser.name,
        actorRole: currentUser.role,
        actionAr: `إحالة البلاغ ${reportId} إلى ${targetDept?.nameAr}`,
        actionEn: `Forwarded report ${reportId} to ${targetDept?.nameEn}`,
        targetType: 'report',
        targetId: reportId,
        details: reason,
      },
      ...prev,
    ]);
  };

  // Withdraw report
  const withdrawReport = (reportId: string, reason: string) => {
    const now = new Date().toISOString();
    persistReportMutation(reportId, (r) => ({
      ...r,
      status: 'closed',
      updatedAt: now,
      statusTimeline: [
        ...r.statusTimeline,
        {
          id: `tl_${Date.now()}`,
          status: 'closed',
          timestamp: now,
          noteAr: `قام المواطن بسحب وإلغاء البلاغ. السبب: ${reason}`,
          noteEn: `Citizen withdrew the report. Reason: ${reason}`,
          actorRole: 'citizen',
          actorName: currentUser.name,
        },
      ],
    }));
  };

  // Citizen rating
  const submitReportRating = (reportId: string, rating: number, comment?: string) => {
    const now = new Date().toISOString();
    persistReportMutation(reportId, (r) => ({
      ...r,
      userFeedback: {
        rating,
        comment,
        submittedAt: now,
      },
      updatedAt: now,
    }));
  };

  // Moderate report
  const moderateReport = (reportId: string, action: 'approve' | 'quarantine', notes?: string) => {
    const now = new Date().toISOString();
    persistReportMutation(reportId, (r) => ({
      ...r,
      moderationStatus: action === 'approve' ? 'clean' : 'quarantined',
      moderationNotes: notes || (action === 'approve' ? 'تم الفحص والتأكد من خلوه من التشهير' : 'تم الحظر لمنع التشهير'),
      updatedAt: now,
    }));

    // Audit log
    setAuditLogs((prev) => [
      {
        id: `log_${Date.now()}`,
        timestamp: now,
        actorId: currentUser.id,
        actorName: currentUser.name,
        actorRole: currentUser.role,
        actionAr: action === 'approve' ? `اعتماد نزاهة البلاغ ${reportId}` : `حظر البلاغ ${reportId} لاشتباه التشهير`,
        actionEn: action === 'approve' ? `Approved integrity of report ${reportId}` : `Quarantined report ${reportId} for defamation risk`,
        targetType: 'report',
        targetId: reportId,
        details: notes || '',
      },
      ...prev,
    ]);
  };

  // Category management
  const addCategory = (catData: Omit<ReportCategory, 'id'>) => {
    const newCat: ReportCategory = {
      ...catData,
      id: `cat_${Date.now()}`,
    };
    setCategories((prev) => [...prev, newCat]);
  };

  const updateCategory = (cat: ReportCategory) => {
    setCategories((prev) => prev.map((c) => (c.id === cat.id ? cat : c)));
  };

  const toggleCategory = (id: string) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c))
    );
  };

  // Routing rule management
  const addRoutingRule = (ruleData: Omit<RoutingRule, 'id'>) => {
    const newRule: RoutingRule = {
      ...ruleData,
      id: `rule_${Date.now()}`,
    };
    setRoutingRules((prev) => [...prev, newRule]);
  };

  const toggleRoutingRule = (id: string) => {
    setRoutingRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r))
    );
  };

  const deleteRoutingRule = (id: string) => {
    setRoutingRules((prev) => prev.filter((r) => r.id !== id));
  };

  // Draft
  const saveReportDraft = (draft: any) => {
    setReportDraft(draft);
    localStorage.setItem(STORAGE_KEYS.DRAFT, JSON.stringify(draft));
  };

  const clearReportDraft = () => {
    setReportDraft(null);
    localStorage.removeItem(STORAGE_KEYS.DRAFT);
  };

  // Export to CSV
  const exportReportsCsv = () => {
    const headers = [
      'Reference No',
      'Title',
      'Category ID',
      'Governorate ID',
      'District',
      'Severity',
      'Status',
      'Created At',
      'Assigned Department',
    ];
    const rows = reports.map((r) => [
      r.referenceNo,
      `"${r.title.replace(/"/g, '""')}"`,
      r.categoryId,
      r.location?.governorateId || '',
      `"${(r.location?.cityDistrict || '').replace(/"/g, '""')}"`,
      r.severity,
      r.status,
      r.createdAt,
      r.assignedDepartmentId || 'None',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Ain_Masr_Reports_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        currentUser,
        setCurrentUser,
        switchRole,
        activeView,
        setActiveView,
        selectedReportId,
        setSelectedReportId,
        isOfficialAuthenticated,
        isCitizenAuthenticated,
        authModalOpen,
        setAuthModalOpen,
        authDefaultTab,
        setAuthDefaultTab,
        loginAsCitizen,
        loginAsOfficial,
        logout,
        requireAuthForRole,
        branches,
        currentOfficerBranch,
        setCurrentOfficerBranch,
        transferReportBranch,
        toggleShareReportWithNetwork,
        markReportFinished,
        claimReportForBranch,
        receiptModalReport,
        setReceiptModalReport,
        printReportReceipt,
        notificationsDropdownOpen,
        setNotificationsDropdownOpen,
        markAllNotificationsAsRead,
        externalToast,
        dismissExternalToast,
        triggerExternalToast,
        reports,
        categories,
        departments,
        routingRules,
        auditLogs,
        notifications,
        emergencyModalOpen,
        setEmergencyModalOpen,
        submitNewReport,
        updateReportStatus,
        addInternalNote,
        addClarificationMessage,
        forwardReport,
        withdrawReport,
        submitReportRating,
        moderateReport,
        addCategory,
        updateCategory,
        toggleCategory,
        addRoutingRule,
        toggleRoutingRule,
        deleteRoutingRule,
        reportDraft,
        saveReportDraft,
        clearReportDraft,
        exportReportsCsv,
        refreshReportsFromBackend,
        isRefreshingReports,
        lastReportsSyncTime,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
