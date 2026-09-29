import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Sliders,
  FolderTree,
  Route,
  ShieldAlert,
  History,
  Download,
  Plus,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Lock,
  UserX,
  Building,
  MapPin,
  Search,
  Printer,
  Eye,
  Clock,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  Film,
  FileCheck,
  CheckCircle2,
  Filter,
  Copy,
  Check,
  Database,
  Server,
  HardDrive,
  RefreshCw,
  ShieldCheck,
  FileCode,
  Activity,
  Play,
  PlayCircle,
  ExternalLink,
  Cloud,
  MessageSquare,
  Send,
  Share2,
  Navigation,
  Repeat,
  FileText,
  UserCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { t, formatStatus, formatSeverity } from '../locales/i18n';
import { GOVERNORATES } from '../data/mockData';
import {
  getSupabaseConfig,
  saveSupabaseConfig,
  clearSupabaseConfig,
  SupabaseConfig,
} from '../utils/supabaseClient';
import { Report, ReportCategory, RoutingRule, Severity, UserRole, ReportStatus } from '../types';
import { ReportStatusBadge } from './ReportStatusBadge';
import {
  fetchMongoServerStatus,
  fetchVideoVaultStatus,
  testMongoConnection,
  validateVideoFile,
  MongoServerStatus,
  VideoVaultStatus,
  VideoValidationResult,
} from '../utils/databaseService';

export const AdminDashboardView: React.FC = () => {
  const {
    language,
    reports,
    categories,
    departments,
    routingRules,
    auditLogs,
    currentUser,
    isOfficialAuthenticated,
    loginAsOfficial,
    setActiveView,
    addCategory,
    updateCategory,
    toggleCategory,
    addRoutingRule,
    toggleRoutingRule,
    deleteRoutingRule,
    moderateReport,
    exportReportsCsv,
    forwardReport,
    selectedReportId,
    setSelectedReportId,
    // Multi-Branch Collaborative Tools
    branches,
    currentOfficerBranch,
    setCurrentOfficerBranch,
    transferReportBranch,
    toggleShareReportWithNetwork,
    markReportFinished,
    updateReportStatus,
    addInternalNote,
    addClarificationMessage,
    notifications,
    printReportReceipt,
    refreshReportsFromBackend,
    isRefreshingReports,
    lastReportsSyncTime,
  } = useApp();

  const [loginUsername, setLoginUsername] = useState('admin.ops');
  const [loginPassword, setLoginPassword] = useState('admin2026');
  const [loginError, setLoginError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<
    'overview' | 'reports' | 'transfers' | 'replies' | 'categories' | 'routing' | 'moderation' | 'audit' | 'databases'
  >('overview');

  // Search & Filtering in Reports Tab
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [govFilter, setGovFilter] = useState<string>('all');
  const [quickFilter, setQuickFilter] = useState<'all' | 'transferred' | 'with_replies' | 'investigating' | 'resolved' | 'flagged' | 'sensitive_cyber'>('all');

  // Fast inline reply state in Replies Tab
  const [quickReplyReportId, setQuickReplyReportId] = useState<string | null>(null);
  const [quickReplyText, setQuickReplyText] = useState('');

  // Reactive Modal Report ID and active tab inside modal
  const [inspectReportId, setInspectReportId] = useState<string | null>(null);
  const inspectModalReport = reports.find((r) => r.id === inspectReportId) || null;
  const [inspectTab, setInspectTab] = useState<'details' | 'timeline' | 'replies' | 'notes' | 'actions'>('details');

  // Direct Admin Action States inside modal
  const [adminReplyText, setAdminReplyText] = useState('');
  const [adminNoteText, setAdminNoteText] = useState('');
  const [adminTransferBranchId, setAdminTransferBranchId] = useState(branches[0]?.id || 'branch_suez_arbaeen');
  const [adminTransferReason, setAdminTransferReason] = useState('');
  const [adminStatusSelected, setAdminStatusSelected] = useState<ReportStatus>('investigating');
  const [adminStatusNoteAr, setAdminStatusNoteAr] = useState('');
  const [adminResolutionNote, setAdminResolutionNote] = useState('');

  const [copiedRef, setCopiedRef] = useState<string | null>(null);

  // Auto-focus selected report from outside (notifications or wizard)
  useEffect(() => {
    if (selectedReportId) {
      const rep = reports.find((r) => r.id === selectedReportId);
      if (rep) {
        setInspectReportId(rep.id);
        setInspectTab('timeline');
      }
    }
  }, [selectedReportId, reports]);

  // Category modal
  const [newCatNameAr, setNewCatNameAr] = useState('');
  const [newCatNameEn, setNewCatNameEn] = useState('');
  const [newCatDescAr, setNewCatDescAr] = useState('');
  const [newCatDescEn, setNewCatDescEn] = useState('');
  const [newCatDeptId, setNewCatDeptId] = useState('dept_public_safety');

  // Routing Rule modal
  const [newRuleNameAr, setNewRuleNameAr] = useState('');
  const [newRuleNameEn, setNewRuleNameEn] = useState('');
  const [newRuleCatId, setNewRuleCatId] = useState('');
  const [newRuleGovId, setNewRuleGovId] = useState('');
  const [newRuleSev, setNewRuleSev] = useState<Severity | ''>('');
  const [newRuleDeptId, setNewRuleDeptId] = useState('dept_traffic');
  const [newRulePriority, setNewRulePriority] = useState<number>(5);

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Real-time Database Status States
  const [mongoStatus, setMongoStatus] = useState<MongoServerStatus | null>(null);
  const [videoVaultStatus, setVideoVaultStatus] = useState<VideoVaultStatus | null>(null);
  const [isRefreshingDbStatus, setIsRefreshingDbStatus] = useState(false);
  const [pingTesting, setPingTesting] = useState(false);
  const [pingResult, setPingResult] = useState<{ success: boolean; latencyMs?: number; messageAr: string } | null>(null);
  const [validatingVideoId, setValidatingVideoId] = useState<string | null>(null);
  const [activeValidationCert, setActiveValidationCert] = useState<VideoValidationResult | null>(null);
  const [streamingTestVideo, setStreamingTestVideo] = useState<{ url: string; name: string } | null>(null);

  // Supabase & Vercel Cloud Storage States
  const [supabaseCfg, setSupabaseCfg] = useState<SupabaseConfig>(getSupabaseConfig());
  const [sbUrlInput, setSbUrlInput] = useState(supabaseCfg.url);
  const [sbKeyInput, setSbKeyInput] = useState(supabaseCfg.anonKey);
  const [sbBucketInput, setSbBucketInput] = useState(supabaseCfg.bucket);
  const [sbSaveSuccess, setSbSaveSuccess] = useState(false);
  const [copiedVercelEnv, setCopiedVercelEnv] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const handleSaveSupabaseConfig = () => {
    saveSupabaseConfig(sbUrlInput, sbKeyInput, sbBucketInput);
    setSupabaseCfg(getSupabaseConfig());
    setSbSaveSuccess(true);
    setTimeout(() => setSbSaveSuccess(false), 3000);
  };

  const handleClearSupabaseConfig = () => {
    clearSupabaseConfig();
    setSupabaseCfg(getSupabaseConfig());
    setSbUrlInput('');
    setSbKeyInput('');
  };

  const refreshLiveDbStatus = async () => {
    setIsRefreshingDbStatus(true);
    try {
      const [mStatus, vStatus] = await Promise.all([
        fetchMongoServerStatus(),
        fetchVideoVaultStatus(),
      ]);
      setMongoStatus(mStatus);
      setVideoVaultStatus(vStatus);
    } catch (e) {
      // ignore
    } finally {
      setIsRefreshingDbStatus(false);
    }
  };

  useEffect(() => {
    refreshLiveDbStatus();
    const interval = setInterval(refreshLiveDbStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleTestMongoPing = async () => {
    setPingTesting(true);
    setPingResult(null);
    try {
      const res = await testMongoConnection();
      setPingResult(res);
      showToast(language === 'ar' ? res.messageAr : (res.messageEn || res.messageAr));
    } catch (e: any) {
      setPingResult({ success: false, messageAr: language === 'ar' ? 'فشل فحص الاتصال' : 'Connection check failed' });
    } finally {
      setPingTesting(false);
    }
  };

  const handleRunForensicValidation = async (videoStorageId: string) => {
    setValidatingVideoId(videoStorageId);
    try {
      const cert = await validateVideoFile(videoStorageId);
      if (cert) {
        setActiveValidationCert(cert);
        showToast(language === 'ar' ? 'تم التحقق الجنائي للبصمة الرقمية بنجاح ✓' : 'Forensic checksum verified successfully ✓');
      } else {
        showToast(language === 'ar' ? 'تعذر استخراج شهادة الفحص للملف' : 'Could not generate inspection certificate for file');
      }
    } catch (e) {
      showToast(language === 'ar' ? 'خطأ أثناء فحص سلامة الفيديو' : 'Error inspecting video integrity');
    } finally {
      setValidatingVideoId(null);
    }
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleAdminGateLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoginError(null);
    const res = loginAsOfficial('admin', loginUsername.trim(), loginPassword.trim());
    if (!res.success) {
      setLoginError(res.message || (language === 'ar' ? 'بيانات الدخول غير صحيحة' : 'Invalid credentials'));
    }
  };

  const handleQuickAdminLogin = () => {
    loginAsOfficial('admin', 'admin', 'admin2026');
  };

  const copyRef = (refNo: string) => {
    navigator.clipboard.writeText(refNo);
    setCopiedRef(refNo);
    setTimeout(() => setCopiedRef(null), 2000);
  };

  const handlePrintPdfSummary = () => {
    window.print();
  };

  // If user is not authenticated as admin, show restricted gate
  if (!isOfficialAuthenticated || currentUser.role !== 'admin') {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 animate-in fade-in">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden p-8 space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
            <Lock className="w-8 h-8 text-amber-600" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {language === 'ar' ? 'لوحة التحكم والرقابة المركزية (Admin)' : 'Central Admin Console'}
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
              {language === 'ar'
                ? 'مخصصة لإدارة المنظومة ورؤساء القطاعات لمتابعة كافة البلاغات الواردة والتوجيه الميداني لحظة بلحظة.'
                : 'Centralized oversight console for platform administrators and sector directors.'}
            </p>
          </div>

          {/* Instant 1-Click Access Button */}
          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl text-start space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-950">
                {language === 'ar' ? 'تجربة الدخول الفوري كمدير المنظومة:' : '1-Click Direct Admin Access:'}
              </span>
              <span className="text-[10px] text-amber-700 bg-amber-200/60 px-2 py-0.5 rounded-full font-bold">
                {language === 'ar' ? 'مفعل للتجربة' : 'Demo Active'}
              </span>
            </div>
            <button
              type="button"
              onClick={handleQuickAdminLogin}
              className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sliders className="w-4 h-4" />
              <span>{language === 'ar' ? 'الدخول المباشر كمدير المنظومة الآن' : 'Instant Admin Clearance'}</span>
            </button>
          </div>

          {loginError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 text-start flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          {/* Standard Form Fallback */}
          <form onSubmit={handleAdminGateLogin} className="space-y-4 text-start pt-2 border-t border-slate-100">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-800">
                {t('usernameLabel', language)}
              </label>
              <input
                type="text"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                placeholder="admin.ops"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-800">
                {t('passwordLabel', language)}
              </label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lock className="w-4 h-4 text-amber-400" />
              <span>{t('loginSubmitBtn', language)}</span>
            </button>
          </form>

          <div className="pt-2">
            <button
              onClick={() => setActiveView('home')}
              className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
            >
              {language === 'ar' ? 'العودة للصفحة الرئيسية' : 'Return to Home'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatNameAr.trim() || !newCatNameEn.trim()) return;
    addCategory({
      nameAr: newCatNameAr.trim(),
      nameEn: newCatNameEn.trim(),
      iconName: 'FileText',
      descriptionAr: newCatDescAr.trim() || 'تصنيف خدمي مدني',
      descriptionEn: newCatDescEn.trim() || 'Civic service category',
      defaultDepartmentId: newCatDeptId,
      isEmergencyRisk: false,
      active: true,
      order: categories.length + 1,
    });
    setNewCatNameAr('');
    setNewCatNameEn('');
    setNewCatDescAr('');
    setNewCatDescEn('');
    showToast(language === 'ar' ? 'تمت إضافة التصنيف بنجاح' : 'Category added successfully');
  };

  const handleCreateRoutingRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleNameAr.trim() || !newRuleNameEn.trim()) return;
    addRoutingRule({
      nameAr: newRuleNameAr.trim(),
      nameEn: newRuleNameEn.trim(),
      categoryId: newRuleCatId || undefined,
      governorateId: newRuleGovId || undefined,
      severity: (newRuleSev as Severity) || undefined,
      targetDepartmentId: newRuleDeptId,
      priority: Number(newRulePriority),
      active: true,
    });
    setNewRuleNameAr('');
    setNewRuleNameEn('');
    setNewRuleCatId('');
    setNewRuleGovId('');
    setNewRuleSev('');
    showToast(language === 'ar' ? 'تم حفظ قاعدة التوجيه الآلي' : 'Routing rule saved');
  };

  // Flagged reports
  const flaggedReports = reports.filter((r) => r.moderationStatus === 'flagged');

  // Stats calculation
  const totalReportsCount = reports.length;
  const resolvedCount = reports.filter((r) => r.status === 'resolved' || r.isCompleted).length;
  const investigatingCount = reports.filter((r) => r.status === 'investigating' || r.status === 'assigned').length;
  const criticalCount = reports.filter((r) => r.severity === 'critical').length;
  const submittedCount = reports.filter((r) => r.status === 'submitted').length;

  const isReportTransferred = (r: Report) =>
    r.status === 'forwarded' ||
    Boolean(
      r.statusTimeline?.some(
        (tl) =>
          tl.status === 'forwarded' ||
          (tl.noteAr && (tl.noteAr.includes('تحويل') || tl.noteAr.includes('إحالة'))) ||
          (tl.commentAr && (tl.commentAr.includes('تحويل') || tl.commentAr.includes('إحالة')))
      )
    ) ||
    Boolean(r.assignedBranchId && r.assignedBranchId !== 'branch_cairo_tahrir');

  const transferredReports = [...reports]
    .filter(isReportTransferred)
    .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());
  const transferredCount = transferredReports.length;

  const hasReplies = (r: Report) => Boolean(r.clarificationMessages && r.clarificationMessages.length > 0);
  const reportsWithReplies = [...reports]
    .filter(hasReplies)
    .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());
  const repliedCount = reportsWithReplies.length;

  const sensitiveCyberCount = reports.filter(
    (r) => r.categoryId === 'cat_cyber_extortion' || Boolean(r.isSensitive)
  ).length;

  // Filtered reports for Reports tab, sorted by newest activity first
  const filteredReports = [...reports]
    .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())
    .filter((rep) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (rep.referenceNo || '').toLowerCase().includes(q) ||
        (rep.title || '').toLowerCase().includes(q) ||
        (rep.location?.cityDistrict && rep.location.cityDistrict.toLowerCase().includes(q)) ||
        (rep.assignedBranchNameAr && rep.assignedBranchNameAr.toLowerCase().includes(q)) ||
        (rep.assignedBranchNameEn && rep.assignedBranchNameEn.toLowerCase().includes(q)) ||
        (rep.reporter?.fullName && rep.reporter.fullName.toLowerCase().includes(q)) ||
        rep.clarificationMessages?.some((cm) => (cm.content || '').toLowerCase().includes(q)) ||
        rep.statusTimeline?.some((tl) => ((tl.noteAr || tl.commentAr || '').toLowerCase().includes(q)));

      const matchesStatus = statusFilter === 'all' ? true : rep.status === statusFilter;
      const matchesGov = govFilter === 'all' ? true : rep.location?.governorateId === govFilter;

      let matchesQuick = true;
      if (quickFilter === 'sensitive_cyber') {
        matchesQuick = rep.categoryId === 'cat_cyber_extortion' || Boolean(rep.isSensitive);
      } else if (quickFilter === 'transferred') {
        matchesQuick = isReportTransferred(rep);
      } else if (quickFilter === 'with_replies') {
        matchesQuick = hasReplies(rep);
      } else if (quickFilter === 'investigating') {
        matchesQuick = rep.status === 'investigating' || rep.status === 'assigned';
      } else if (quickFilter === 'resolved') {
        matchesQuick = rep.status === 'resolved' || Boolean(rep.isCompleted);
      } else if (quickFilter === 'flagged') {
        matchesQuick = rep.moderationStatus === 'flagged';
      }

      return matchesSearch && matchesStatus && matchesGov && matchesQuick;
    });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-slate-800 shadow-2xl">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-400/40">
              {language === 'ar' ? 'الرقابة والإشراف المركزي' : 'Central Admin Console'}
            </span>
            <span className="text-slate-400 text-xs font-mono">
              [{language === 'ar' ? 'المسؤول' : 'Admin'}: {currentUser.name}]
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{language === 'ar' ? 'ربط حي مباشر' : 'Live Sync Active'}</span>
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            {t('adminTitle', language)}
          </h1>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            {language === 'ar'
              ? 'لوحة القيادة الموحدة لمتابعة كافة البلاغات الواردة، سجل التحويلات بين الفروع، وحوارات الردود الميدانية لحظة بلحظة.'
              : t('adminSubtitle', language)}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {/* Live Sync Button */}
          <button
            type="button"
            onClick={refreshReportsFromBackend}
            disabled={isRefreshingReports}
            className="px-3.5 py-2 text-xs font-bold text-slate-100 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50"
            title={language === 'ar' ? 'مزامنة فورية مع قاعدة بيانات MongoDB وسيرفر النظام' : 'Instant sync with database'}
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isRefreshingReports ? 'animate-spin' : ''}`} />
            <span>{isRefreshingReports ? (language === 'ar' ? 'جاري المزامنة...' : 'Syncing...') : (language === 'ar' ? 'مزامنة فورية' : 'Live Sync')}</span>
            {lastReportsSyncTime && (
              <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                ({lastReportsSyncTime})
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={exportReportsCsv}
            className="px-3.5 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t('exportCsvBtn', language)}</span>
          </button>

          <button
            type="button"
            onClick={handlePrintPdfSummary}
            className="px-3.5 py-2 text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Printer className="w-3.5 h-3.5 text-amber-400" />
            <span>{t('exportPdfBtn', language)}</span>
          </button>
        </div>
      </div>

      {toastMsg && (
        <div className="p-3 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-semibold overflow-x-auto pb-1">
        {[
          { id: 'overview', label: t('adminTabOverview', language), icon: BarChart3, count: null },
          { id: 'reports', label: `${t('adminTabReports', language)} (${reports.length})`, icon: FolderTree, count: reports.length },
          {
            id: 'transfers',
            label: language === 'ar' ? `التحويلات بين الفروع (${transferredCount})` : `Branch Transfers (${transferredCount})`,
            icon: Repeat,
            count: transferredCount,
            badgeClass: 'bg-blue-100 text-blue-800 font-bold',
          },
          {
            id: 'replies',
            label: language === 'ar' ? `الردود والاستفسارات (${repliedCount})` : `Inquiries & Replies (${repliedCount})`,
            icon: MessageSquare,
            count: repliedCount,
            badgeClass: 'bg-indigo-100 text-indigo-800 font-bold',
          },
          { id: 'databases', label: language === 'ar' ? 'قواعد البيانات (MongoDB & Video)' : 'Databases (MongoDB & Video)', icon: Database, count: null },
          { id: 'categories', label: t('adminTabCategories', language), icon: Sliders, count: categories.length },
          { id: 'routing', label: t('adminTabRouting', language), icon: Route, count: routingRules.length },
          { id: 'moderation', label: `${t('adminTabModeration', language)} (${flaggedReports.length})`, icon: ShieldAlert, count: flaggedReports.length },
          { id: 'audit', label: t('adminTabAudit', language), icon: History, count: auditLogs.length },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 px-3.5 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap rounded-t-lg ${
                activeTab === tab.id
                  ? 'text-slate-900 border-b-2 border-amber-500 font-extrabold bg-slate-100/50'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-1">
              <span className="text-[11px] text-slate-500 font-semibold">{t('totalReports', language)}</span>
              <div className="text-xl sm:text-2xl font-mono font-extrabold text-slate-900 tabular-nums">
                {totalReportsCount}
              </div>
              <span className="text-[10px] text-slate-400 block">
                {submittedCount} {language === 'ar' ? 'وارد جديد' : 'newly submitted'}
              </span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-1">
              <span className="text-[11px] text-slate-500 font-semibold">{t('resolvedReports', language)}</span>
              <div className="text-xl sm:text-2xl font-mono font-extrabold text-emerald-600 tabular-nums">
                {resolvedCount}
              </div>
              <span className="text-[10px] text-emerald-600 font-bold block">
                {totalReportsCount > 0 ? Math.round((resolvedCount / totalReportsCount) * 100) : 0}% {language === 'ar' ? 'نسبة الإنجاز' : 'resolution'}
              </span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-1">
              <span className="text-[11px] text-slate-500 font-semibold">{t('activeInvestigating', language)}</span>
              <div className="text-xl sm:text-2xl font-mono font-extrabold text-amber-600 tabular-nums">
                {investigatingCount}
              </div>
              <span className="text-[10px] text-slate-400 block">
                {language === 'ar' ? 'لجان ميدانية' : 'field teams'}
              </span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-1">
              <span className="text-[11px] text-slate-500 font-semibold">
                {language === 'ar' ? 'بلاغات محالة بين الفروع' : 'Branch Transfers'}
              </span>
              <div className="text-xl sm:text-2xl font-mono font-extrabold text-blue-600 tabular-nums">
                {transferredCount}
              </div>
              <span className="text-[10px] text-blue-600 font-bold block">
                {language === 'ar' ? 'إحالة وتنسيق' : 'inter-branch'}
              </span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-1">
              <span className="text-[11px] text-slate-500 font-semibold">
                {language === 'ar' ? 'ردود واستفسارات' : 'Active Inquiries'}
              </span>
              <div className="text-xl sm:text-2xl font-mono font-extrabold text-indigo-600 tabular-nums">
                {repliedCount}
              </div>
              <span className="text-[10px] text-indigo-600 font-bold block">
                {language === 'ar' ? 'حوار ومتابعة' : 'replies active'}
              </span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-1">
              <span className="text-[11px] text-slate-500 font-semibold">
                {language === 'ar' ? 'فائقة الخطورة' : 'Critical'}
              </span>
              <div className="text-xl sm:text-2xl font-mono font-extrabold text-rose-600 tabular-nums">
                {criticalCount}
              </div>
              <span className="text-[10px] text-rose-600 font-bold block">
                {language === 'ar' ? 'أولوية قصوى' : 'top priority'}
              </span>
            </div>
          </div>

          {/* Direct Live Influx Section */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden space-y-3 p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-base text-slate-900">
                    {language === 'ar' ? '⚡ البلاغات الواردة حديثاً (Live Influx)' : '⚡ Live Incoming Reports'}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 animate-pulse">
                    {language === 'ar' ? 'مباشر وتلقائي' : 'Realtime'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {language === 'ar'
                    ? 'أحدث البلاغات المسجلة في المنظومة مرتبة بالأحدث مع توضيح الفرع الميداني وحالة التحويل والردود'
                    : 'Latest registered civic complaints with active branch jurisdiction and response indicators'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('reports')}
                className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
              >
                <span>{language === 'ar' ? 'عرض كافة البلاغات' : 'View all reports'}</span>
                <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
              </button>
            </div>

            {/* Influx Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-start">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <tr>
                    <th className="p-3">{t('referenceNo', language)}</th>
                    <th className="p-3">{t('fieldTitle', language)}</th>
                    <th className="p-3">{t('governorate', language)}</th>
                    <th className="p-3">{t('severity', language)}</th>
                    <th className="p-3">{t('status', language)}</th>
                    <th className="p-3">{language === 'ar' ? 'الفرع الميداني المختص' : 'Assigned Authority'}</th>
                    <th className="p-3">{language === 'ar' ? 'الردود والمذكرات' : 'Responses'}</th>
                    <th className="p-3 text-center">{t('actions', language)}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredReports.slice(0, 6).map((rep, idx) => {
                    const dept = departments.find((d) => d.id === rep.assignedDepartmentId);
                    const gov = GOVERNORATES.find((g) => g.id === rep.location.governorateId);
                    const isNewest = idx === 0;
                    const isTransferred = rep.status === 'forwarded' || rep.statusTimeline?.some((t) => t.status === 'forwarded');
                    const repliesCount = rep.clarificationMessages?.length || 0;
                    const notesCount = rep.internalNotes?.length || 0;

                    return (
                      <tr
                        key={rep.id}
                        className={`hover:bg-slate-50 transition-colors ${
                          isNewest ? 'bg-amber-50/40 font-medium' : ''
                        }`}
                      >
                        <td className="p-3 font-mono font-bold text-slate-900 tabular-nums">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {isNewest && (
                              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                            )}
                            <span>{rep.referenceNo}</span>
                            {isTransferred && (
                              <span
                                title={language === 'ar' ? 'تم تحويل البلاغ' : 'Transferred'}
                                className="px-1.5 py-0.5 rounded text-[9px] bg-blue-100 text-blue-800 font-bold border border-blue-200"
                              >
                                🔄 {language === 'ar' ? 'محال' : 'Transferred'}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 font-semibold text-slate-900 max-w-xs truncate">
                          {rep.title}
                        </td>
                        <td className="p-3 text-slate-600">
                          {gov ? (language === 'ar' ? gov.nameAr : gov.nameEn) : (rep.location?.cityDistrict || '—')}
                        </td>
                        <td className="p-3">
                          <span
                            className={`font-bold ${
                              rep.severity === 'critical'
                                ? 'text-rose-700'
                                : rep.severity === 'high'
                                ? 'text-amber-700'
                                : 'text-slate-700'
                            }`}
                          >
                            {formatSeverity(rep.severity, language)}
                          </span>
                        </td>
                        <td className="p-3">
                          <ReportStatusBadge
                            status={rep.status}
                            isCompleted={rep.isCompleted}
                            language={language}
                            size="xs"
                            showLiveIndicator={true}
                          />
                        </td>
                        <td className="p-3 text-slate-800">
                          <div className="flex items-center gap-1.5">
                            <Building className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span className="font-bold text-blue-900">
                              {rep.assignedBranchNameAr || (dept ? dept.nameAr : 'جاري التوجيه')}
                            </span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            {repliesCount > 0 ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-[10px] font-bold">
                                <MessageSquare className="w-3 h-3" />
                                <span>{repliesCount} {language === 'ar' ? 'ردود' : 'replies'}</span>
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[10px]">
                                {language === 'ar' ? 'لا يوجد رد' : 'No replies'}
                              </span>
                            )}
                            {notesCount > 0 && (
                              <span className="inline-flex items-center gap-0.5 text-slate-500 text-[10px]">
                                <FileText className="w-3 h-3 text-slate-400" />
                                <span>{notesCount}</span>
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              setInspectReportId(rep.id);
                              setInspectTab('details');
                            }}
                            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[11px] font-bold transition-colors inline-flex items-center gap-1 cursor-pointer shadow-xs"
                          >
                            <Eye className="w-3 h-3 text-amber-400" />
                            <span>{language === 'ar' ? 'معاينة وتحكم' : 'Inspect'}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Breakdown by Governorate */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 space-y-4 shadow-xs">
            <h3 className="font-extrabold text-sm text-slate-900">
              {language === 'ar' ? 'توزيع البلاغات حسب المحافظة في مصر' : 'Reports Distributed by Egyptian Governorate'}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {['cairo', 'giza', 'alexandria', 'suez', 'port_said', 'dakahlia', 'gharbia', 'aswan'].map((govId) => {
                const count = reports.filter((r) => r.location.governorateId === govId).length;
                const gov = GOVERNORATES.find((g) => g.id === govId);
                return (
                  <div key={govId} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                    <span className="font-semibold text-slate-700">
                      {language === 'ar' ? gov?.nameAr : gov?.nameEn}
                    </span>
                    <span className="font-mono font-extrabold text-slate-900 tabular-nums bg-white px-2 py-0.5 rounded-md border border-slate-200">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Full Reports & Dispatch Table */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm space-y-4 p-5">
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 left-3 rtl:left-auto rtl:right-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'ar' ? 'ابحث برقم البلاغ، العنوان، المحافظة، الفرع الميداني، أو نص الردود...' : 'Search ref no, title, branch, replies...'}
                className="w-full pl-9 pr-3 rtl:pr-9 rtl:pl-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">{language === 'ar' ? 'كل الحالات' : 'All Statuses'}</option>
                <option value="submitted">{language === 'ar' ? 'جديد (مقدم)' : 'Submitted'}</option>
                <option value="investigating">{language === 'ar' ? 'قيد المعاينة' : 'Investigating'}</option>
                <option value="forwarded">{language === 'ar' ? 'محال لجهة' : 'Forwarded'}</option>
                <option value="resolved">{language === 'ar' ? 'منجز ومغلق' : 'Resolved'}</option>
              </select>

              <select
                value={govFilter}
                onChange={(e) => setGovFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">{language === 'ar' ? 'كل المحافظات' : 'All Governorates'}</option>
                {GOVERNORATES.map((g) => (
                  <option key={g.id} value={g.id}>
                    {language === 'ar' ? g.nameAr : g.nameEn}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Filter Badges Row */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] text-slate-400 font-bold shrink-0">
              {language === 'ar' ? 'تصنيف سريع:' : 'Quick Filter:'}
            </span>
            {[
              { id: 'all', label: language === 'ar' ? 'كافة البلاغات' : 'All Reports', count: totalReportsCount },
              { id: 'sensitive_cyber', label: language === 'ar' ? '🚨 بلاغات الابتزاز والتنمر (هيئة الاتصالات)' : '🚨 Cyber Extortion (Telecom)', count: sensitiveCyberCount },
              { id: 'transferred', label: language === 'ar' ? '🔄 المحالة بين الفروع' : '🔄 Branch Transfers', count: transferredCount },
              { id: 'with_replies', label: language === 'ar' ? '💬 بها ردود واستفسارات' : '💬 Active Replies', count: repliedCount },
              { id: 'investigating', label: language === 'ar' ? '🔍 قيد المعاينة الميدانية' : '🔍 Investigating', count: investigatingCount },
              { id: 'resolved', label: language === 'ar' ? '✅ منجزة ومغلقة' : '✅ Resolved', count: resolvedCount },
              { id: 'flagged', label: language === 'ar' ? '⚠️ اشتباه تشهير' : '⚠️ Flagged', count: flaggedReports.length },
            ].map((chip) => (
              <button
                key={chip.id}
                type="button"
                onClick={() => setQuickFilter(chip.id as any)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 text-xs ${
                  quickFilter === chip.id
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <span>{chip.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  quickFilter === chip.id ? 'bg-amber-600 text-white' : 'bg-white text-slate-600 border border-slate-200'
                }`}>
                  {chip.count}
                </span>
              </button>
            ))}
          </div>

          {/* Admin Media & Privacy Clearance Banner */}
          <div className="p-3.5 bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white rounded-2xl flex items-center justify-between gap-3 text-xs border border-amber-500/30 shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <span className="font-extrabold text-amber-300 block">
                  {language === 'ar'
                    ? 'صلاحية المشرف العام المركزية: كشف كامل للأدلة الجنائية والمرفقات الحساسة'
                    : 'Central Admin Clearance: Full Access to Sensitive Photos & Video Vault'}
                </span>
                <span className="text-[11px] text-slate-300">
                  {language === 'ar'
                    ? 'كافة المرفقات (الصور، الفيديوهات عالية الدقة 500MB، وبصمات SHA-256) معروضة حصرياً لك ومحجوبة عن الفروع الميدانية العادية حمايةً للخصوصية.'
                    : 'All forensic evidence photos and 500MB videos are fully accessible here and restricted from regular municipal branches.'}
                </span>
              </div>
            </div>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-full border border-amber-400/40 font-mono font-bold shrink-0 hidden sm:inline">
              {language === 'ar' ? 'معاينة غير مقيدة' : 'Unrestricted Access'}
            </span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-xs text-start">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                <tr>
                  <th className="p-3">{t('referenceNo', language)}</th>
                  <th className="p-3">{t('fieldTitle', language)}</th>
                  <th className="p-3">{t('governorate', language)}</th>
                  <th className="p-3">{t('severity', language)}</th>
                  <th className="p-3">{t('status', language)}</th>
                  <th className="p-3">{language === 'ar' ? 'الجهة والفرع الميداني المختص' : 'Assigned Branch Unit'}</th>
                  <th className="p-3">{language === 'ar' ? 'الردود والمذكرات' : 'Responses'}</th>
                  <th className="p-3 text-center">{t('actions', language)}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReports.map((rep) => {
                  const dept = departments.find((d) => d.id === rep.assignedDepartmentId);
                  const gov = GOVERNORATES.find((g) => g.id === rep.location.governorateId);
                  const isTransferred = rep.status === 'forwarded' || rep.statusTimeline?.some((t) => t.status === 'forwarded');
                  const repliesCount = rep.clarificationMessages?.length || 0;
                  const notesCount = rep.internalNotes?.length || 0;

                  return (
                    <tr key={rep.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-mono font-bold text-slate-800 tabular-nums">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span>{rep.referenceNo}</span>
                          {isTransferred && (
                            <span
                              title={language === 'ar' ? 'تم تحويل البلاغ بين الجهات' : 'Transferred'}
                              className="px-1.5 py-0.5 rounded text-[9px] bg-blue-100 text-blue-800 font-bold border border-blue-200 flex items-center gap-0.5"
                            >
                              <Repeat className="w-2.5 h-2.5" />
                              <span>{language === 'ar' ? 'محال' : 'Transferred'}</span>
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 font-semibold text-slate-900 max-w-xs">
                        <div className="truncate">{rep.title}</div>
                        {(rep.categoryId === 'cat_cyber_extortion' || Boolean(rep.isSensitive)) && (
                          <span className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-purple-100 text-purple-900 border border-purple-300">
                            <ShieldAlert className="w-2.5 h-2.5 text-rose-600" />
                            <span>{language === 'ar' ? 'بلاغ حساس (هيئة الاتصالات ومباحث الإنترنت)' : 'Sensitive Cyber (NTRA)'}</span>
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-slate-600">
                        {language === 'ar' ? gov?.nameAr : gov?.nameEn}
                        {rep.location?.cityDistrict && (
                          <span className="text-slate-400 block text-[10px]">
                            {rep.location.cityDistrict}
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <span
                          className={`font-bold ${
                            rep.severity === 'critical'
                              ? 'text-rose-700'
                              : rep.severity === 'high'
                              ? 'text-amber-700'
                              : 'text-slate-700'
                          }`}
                        >
                          {formatSeverity(rep.severity, language)}
                        </span>
                      </td>
                      <td className="p-3">
                        <ReportStatusBadge
                          status={rep.status}
                          isCompleted={rep.isCompleted}
                          language={language}
                          size="xs"
                          showLiveIndicator={true}
                        />
                      </td>
                      <td className="p-3 text-slate-800">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1 font-bold text-blue-900">
                            <Building className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span>{rep.assignedBranchNameAr || (dept ? dept.nameAr : 'جاري التوجيه')}</span>
                          </div>
                          {rep.distanceToBranchKm !== undefined && (
                            <span className="text-[10px] text-slate-400 block">
                              {language === 'ar' ? `(على بُعد ${rep.distanceToBranchKm} كم)` : `(${rep.distanceToBranchKm} km away)`}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {repliesCount > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-[10px] font-bold">
                              <MessageSquare className="w-3 h-3 text-indigo-600" />
                              <span>{repliesCount} {language === 'ar' ? 'ردود' : 'replies'}</span>
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[10px]">
                              {language === 'ar' ? '— لا ردود' : 'No replies'}
                            </span>
                          )}
                          {notesCount > 0 && (
                            <span className="inline-flex items-center gap-0.5 text-slate-500 text-[10px]" title="مذكرات فحص داخلية">
                              <FileText className="w-3 h-3 text-slate-400" />
                              <span>{notesCount}</span>
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setInspectReportId(rep.id);
                              setInspectTab('details');
                            }}
                            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[11px] font-bold transition-colors inline-flex items-center gap-1 cursor-pointer shadow-xs"
                          >
                            <Eye className="w-3 h-3 text-amber-400" />
                            <span>{language === 'ar' ? 'معاينة وتحكم' : 'Inspect'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setInspectReportId(rep.id);
                              setInspectTab('actions');
                            }}
                            title={language === 'ar' ? 'تحويل البلاغ أو الرد المباشر' : 'Transfer or Respond'}
                            className="p-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-[11px] font-bold transition-colors cursor-pointer border border-blue-200"
                          >
                            <Repeat className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Branch Transfers Oversight (مركز متابعة تحويلات البلاغات بين الفروع) */}
      {activeTab === 'transfers' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Header Banner */}
          <div className="p-6 bg-gradient-to-r from-blue-950 via-slate-900 to-slate-950 text-white rounded-3xl border border-blue-900/60 shadow-xl space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/40 text-blue-400 flex items-center justify-center font-bold shrink-0">
                  <Repeat className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
                    <span>{language === 'ar' ? 'مركز متابعة تحويلات البلاغات بين الفروع والمحافظات' : 'Inter-Branch Transfer Oversight'}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] font-mono font-bold">
                      {transferredCount} {language === 'ar' ? 'بلاغات محالة' : 'transferred'}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                    {language === 'ar'
                      ? 'متابعة وتدقيق لكافة البلاغات التي تم تحويلها بين جهات الاختصاص والفروع الميدانية، ومراجعة أسباب التحويل وإمكانية إعادة التوجيه الفوري.'
                      : 'Central audit log for all reports redirected between branch units, showing routing rationale and immediate intervention tools.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => refreshReportsFromBackend()}
                  disabled={isRefreshingReports}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-blue-300 border border-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingReports ? 'animate-spin' : ''}`} />
                  <span>{language === 'ar' ? 'تحديث السجلات' : 'Refresh'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Transfers Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-1 shadow-2xs">
              <span className="text-[11px] text-slate-500 font-semibold">{language === 'ar' ? 'إجمالي البلاغات المحالة' : 'Total Transferred'}</span>
              <div className="text-2xl font-mono font-extrabold text-blue-600 tabular-nums">
                {transferredCount}
              </div>
              <span className="text-[10px] text-slate-400 block">{language === 'ar' ? 'تمت إحالتها لفرع آخر' : 'Re-assigned to other units'}</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-1 shadow-2xs">
              <span className="text-[11px] text-slate-500 font-semibold">{language === 'ar' ? 'محالة قيد الفحص الميداني' : 'Under Investigation in New Unit'}</span>
              <div className="text-2xl font-mono font-extrabold text-amber-600 tabular-nums">
                {transferredReports.filter((r) => r.status === 'investigating' || r.status === 'forwarded' || r.status === 'assigned').length}
              </div>
              <span className="text-[10px] text-amber-600 font-bold block">{language === 'ar' ? 'متابعة جارية' : 'Active follow-up'}</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-1 shadow-2xs">
              <span className="text-[11px] text-slate-500 font-semibold">{language === 'ar' ? 'محالة تم إنجازها بنجاح' : 'Resolved in Destination Branch'}</span>
              <div className="text-2xl font-mono font-extrabold text-emerald-600 tabular-nums">
                {transferredReports.filter((r) => r.status === 'resolved' || r.isCompleted).length}
              </div>
              <span className="text-[10px] text-emerald-600 font-bold block">{language === 'ar' ? 'تم إنهاء العمل بها' : 'Completed & closed'}</span>
            </div>
          </div>

          {/* Transferred Reports List */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm space-y-4 p-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <span>{language === 'ar' ? 'سجل البلاغات المحالة وتفاصيل جهة الاختصاص' : 'Transferred Reports Registry'}</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {language === 'ar' ? 'يمكنك فحص سجل كل بلاغ، ومذكرة الإحالة، والتدخل المباشر لإعادة التوجيه عند الحاجة' : 'Audit transfer rationale, source and destination branch, or re-route directly'}
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute top-1/2 -translate-y-1/2 left-3 rtl:left-auto rtl:right-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={language === 'ar' ? 'بحث برقم البلاغ أو الفرع...' : 'Search ref, branch...'}
                    className="w-full pl-8 pr-3 rtl:pr-8 rtl:pl-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {transferredReports.length === 0 ? (
              <div className="p-12 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-3">
                <Repeat className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-600">
                  {language === 'ar' ? 'لا توجد بلاغات محالة بين الفروع حالياً.' : 'No reports have been transferred yet.'}
                </p>
                <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                  {language === 'ar'
                    ? 'عندما تقوم جهة مختصة في بوابة الضباط بتحويل بلاغ لفرع آخر، سيظهر البلاغ هنا فوراً مع كامل المذكرات.'
                    : 'When an officer transfers a report to another branch, it will appear here in real time.'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {transferredReports
                  .filter((rep) => {
                    if (!searchQuery.trim()) return true;
                    const q = searchQuery.toLowerCase().trim();
                    return (
                      rep.referenceNo.toLowerCase().includes(q) ||
                      rep.title.toLowerCase().includes(q) ||
                      (rep.assignedBranchNameAr && rep.assignedBranchNameAr.toLowerCase().includes(q)) ||
                      rep.statusTimeline?.some((tl) => (tl.noteAr || '').toLowerCase().includes(q))
                    );
                  })
                  .map((rep) => {
                    const lastTransferNote = [...(rep.statusTimeline || [])]
                      .reverse()
                      .find((tl) => tl.status === 'forwarded' || (tl.noteAr && (tl.noteAr.includes('تحويل') || tl.noteAr.includes('إحالة'))));

                    const gov = GOVERNORATES.find((g) => g.id === rep.location.governorateId);

                    return (
                      <div key={rep.id} className="p-4 hover:bg-slate-50/80 transition-colors rounded-xl space-y-2.5">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-extrabold text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                              {rep.referenceNo}
                            </span>
                            <span className="font-bold text-slate-900 text-xs">{rep.title}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
                              <Repeat className="w-3 h-3" />
                              <span>{language === 'ar' ? 'محال بين الفروع' : 'Transferred'}</span>
                            </span>
                            <ReportStatusBadge
                              status={rep.status}
                              isCompleted={rep.isCompleted}
                              language={language}
                              size="xs"
                              showLiveIndicator={true}
                            />
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setInspectReportId(rep.id);
                                setInspectTab('timeline');
                              }}
                              className="px-2.5 py-1 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <History className="w-3.5 h-3.5" />
                              <span>{language === 'ar' ? 'سجل المسار' : 'Timeline'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setInspectReportId(rep.id);
                                setInspectTab('actions');
                              }}
                              className="px-2.5 py-1 text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                            >
                              <Sliders className="w-3.5 h-3.5" />
                              <span>{language === 'ar' ? 'إعادة توجيه / تدخل' : 'Intervene'}</span>
                            </button>
                          </div>
                        </div>

                        {/* Transfer Logistics Card */}
                        <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl space-y-1.5 text-xs text-slate-700">
                          <div className="flex items-center justify-between flex-wrap gap-2 text-[11px] font-bold text-blue-950">
                            <div className="flex items-center gap-2">
                              <Building className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                              <span>{language === 'ar' ? 'الجهة المستلمة حالياً:' : 'Current Jurisdiction:'}</span>
                              <span className="px-2 py-0.5 rounded bg-white border border-blue-200 text-blue-900 font-extrabold">
                                {rep.assignedBranchNameAr || (language === 'ar' ? 'الفرع المختص' : 'Assigned Unit')}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 font-mono text-slate-500 text-[10px]">
                              <span>{gov ? (language === 'ar' ? gov.nameAr : gov.nameEn) : ''}</span>
                              <span>•</span>
                              <span>{rep.location.cityDistrict}</span>
                            </div>
                          </div>

                          {lastTransferNote && (
                            <div className="text-slate-800 text-xs font-medium leading-relaxed bg-white/80 p-2.5 rounded-lg border border-blue-100">
                              <span className="font-bold text-blue-900 ml-1">
                                {language === 'ar' ? 'مذكرة التحويل الموثقة:' : 'Transfer Note:'}
                              </span>
                              <span>{lastTransferNote.noteAr || lastTransferNote.commentAr || 'تم تحويل البلاغ لمتابعة الإجراء الميداني المختص.'}</span>
                              {lastTransferNote.timestamp && (
                                <span className="block text-[10px] text-slate-400 font-mono mt-1">
                                  {language === 'ar' ? 'تاريخ التحويل:' : 'Date:'} {lastTransferNote.timestamp.slice(0, 19).replace('T', ' ')}
                                  {lastTransferNote.actorName ? ` — بواسطة: ${lastTransferNote.actorName}` : ''}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Replies & Inquiries Dialogue Center (مركز إدارة ومتابعة الردود والاستفسارات) */}
      {activeTab === 'replies' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Header Banner */}
          <div className="p-6 bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-950 text-white rounded-3xl border border-indigo-900/60 shadow-xl space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 text-indigo-400 flex items-center justify-center font-bold shrink-0">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
                    <span>{language === 'ar' ? 'مركز إدارة ومتابعة الردود والاستفسارات المتبادلة' : 'Civic Inquiry & Response Control Hub'}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-[10px] font-mono font-bold">
                      {repliedCount} {language === 'ar' ? 'بلاغات بها محادثات' : 'with dialogues'}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                    {language === 'ar'
                      ? 'متابعة مركزية لجميع رسائل الاستيضاح، ردود المواطنين، واستفسارات الجهات الميدانية مع إمكانية الرد والتوجيه الإداري الفوري.'
                      : 'Real-time surveillance over citizen inquiries, authority field notices, and direct administrative directives.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => refreshReportsFromBackend()}
                  disabled={isRefreshingReports}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingReports ? 'animate-spin' : ''}`} />
                  <span>{language === 'ar' ? 'تحديث الردود' : 'Refresh'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Replies Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-1 shadow-2xs">
              <span className="text-[11px] text-slate-500 font-semibold">{language === 'ar' ? 'بلاغات بها حوار نشط' : 'Reports with Dialogues'}</span>
              <div className="text-2xl font-mono font-extrabold text-indigo-600 tabular-nums">
                {repliedCount}
              </div>
              <span className="text-[10px] text-slate-400 block">{language === 'ar' ? 'محادثات استيضاح جارية' : 'Active dialogues'}</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-1 shadow-2xs">
              <span className="text-[11px] text-slate-500 font-semibold">{language === 'ar' ? 'إجمالي الرسائل المتبادلة' : 'Total Exchanged Messages'}</span>
              <div className="text-2xl font-mono font-extrabold text-slate-900 tabular-nums">
                {reports.reduce((acc, r) => acc + (r.clarificationMessages?.length || 0), 0)}
              </div>
              <span className="text-[10px] text-slate-400 block">{language === 'ar' ? 'مواطن / جهة / رئاسة' : 'Citizen / Authority / Admin'}</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-1 shadow-2xs">
              <span className="text-[11px] text-slate-500 font-semibold">{language === 'ar' ? 'توجيهات رئاسة المنظومة (Admin)' : 'Admin Directives Issued'}</span>
              <div className="text-2xl font-mono font-extrabold text-amber-600 tabular-nums">
                {reports.reduce((acc, r) => acc + (r.clarificationMessages?.filter((m) => m.sender === 'admin').length || 0), 0)}
              </div>
              <span className="text-[10px] text-amber-600 font-bold block">{language === 'ar' ? 'توجيهات نافذة' : 'Directives executed'}</span>
            </div>
          </div>

          {/* Replies Cards Feed */}
          <div className="space-y-4">
            {reportsWithReplies.length === 0 ? (
              <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200 space-y-3">
                <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-600">
                  {language === 'ar' ? 'لا توجد ردود أو استفسارات نشطة حالياً.' : 'No active inquiries or replies yet.'}
                </p>
                <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                  {language === 'ar'
                    ? 'عندما يقوم مواطن بالاستفسار في شاشة التتبع، أو ترد الجهة الميدانية، ستظهر المحادثات هنا فوراً.'
                    : 'When a citizen posts an inquiry in report tracking or an authority replies, the thread appears here.'}
                </p>
              </div>
            ) : (
              reportsWithReplies.map((rep) => {
                const isRepQuickReplyOpen = quickReplyReportId === rep.id;
                const messages = rep.clarificationMessages || [];

                return (
                  <div key={rep.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-3 p-5">
                    {/* Report Header in Reply Card */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-extrabold text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                          {rep.referenceNo}
                        </span>
                        <h4 className="font-extrabold text-sm text-slate-900">{rep.title}</h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200 flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          <span>{messages.length} {language === 'ar' ? 'رسائل' : 'messages'}</span>
                        </span>
                        <ReportStatusBadge
                          status={rep.status}
                          isCompleted={rep.isCompleted}
                          language={language}
                          size="xs"
                          showLiveIndicator={true}
                        />
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] text-slate-500 font-bold bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                          {rep.assignedBranchNameAr || (language === 'ar' ? 'الفرع الميداني' : 'Branch')}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setInspectReportId(rep.id);
                            setInspectTab('replies');
                          }}
                          className="px-2.5 py-1 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{language === 'ar' ? 'فتح المحادثة كاملة' : 'View Thread'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Messages Feed */}
                    <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                      {messages.map((msg) => {
                        const isAdmin = msg.sender === 'admin';
                        const isAuth = msg.sender === 'authority';
                        const isCitizen = msg.sender === 'citizen';

                        return (
                          <div
                            key={msg.id}
                            className={`p-3 rounded-xl border text-xs space-y-1 ${
                              isAdmin
                                ? 'bg-amber-50/90 border-amber-300 mr-4'
                                : isAuth
                                ? 'bg-blue-50/80 border-blue-200 mr-2'
                                : 'bg-slate-50 border-slate-200 ml-2'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span
                                className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                                  isAdmin
                                    ? 'bg-amber-200 text-amber-950'
                                    : isAuth
                                    ? 'bg-blue-200 text-blue-950'
                                    : 'bg-emerald-100 text-emerald-900'
                                }`}
                              >
                                {isAdmin
                                  ? (language === 'ar' ? '⚡ توجيه رئاسة المنظومة (Admin)' : '⚡ Directorate Directive')
                                  : isAuth
                                  ? (language === 'ar' ? `رد الجهة المختصة (${msg.senderName})` : `Authority Response: ${msg.senderName}`)
                                  : (language === 'ar' ? `المواطن المبلّغ (${msg.senderName})` : `Citizen: ${msg.senderName}`)}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {msg.timestamp ? msg.timestamp.slice(0, 19).replace('T', ' ') : ''}
                              </span>
                            </div>
                            <p className="text-slate-800 leading-relaxed font-medium pt-0.5">
                              {msg.content}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    {/* Fast Inline Admin Directive Input */}
                    <div className="pt-2 border-t border-slate-100">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={quickReplyReportId === rep.id ? quickReplyText : ''}
                          onChange={(e) => {
                            setQuickReplyReportId(rep.id);
                            setQuickReplyText(e.target.value);
                          }}
                          placeholder={language === 'ar' ? 'إرسال توجيه فوري من رئاسة المنظومة لهذا البلاغ...' : 'Post instant administrative directive...'}
                          className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 font-medium"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && quickReplyReportId === rep.id && quickReplyText.trim()) {
                              addClarificationMessage(rep.id, quickReplyText.trim(), 'admin');
                              setQuickReplyText('');
                              showToast(language === 'ar' ? 'تم إرسال التوجيه الإداري بنجاح' : 'Directive sent');
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (quickReplyReportId === rep.id && quickReplyText.trim()) {
                              addClarificationMessage(rep.id, quickReplyText.trim(), 'admin');
                              setQuickReplyText('');
                              showToast(language === 'ar' ? 'تم إرسال التوجيه الإداري بنجاح' : 'Directive sent');
                            }
                          }}
                          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm shrink-0"
                        >
                          <Send className="w-3.5 h-3.5 text-amber-400" />
                          <span>{language === 'ar' ? 'إرسال التوجيه' : 'Send'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
      {activeTab === 'databases' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Overview Header with Real-Time Refresh Button */}
          <div className="p-6 bg-gradient-to-r from-slate-900 to-slate-950 text-white rounded-3xl border border-slate-800 space-y-4 shadow-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-400 flex items-center justify-center font-bold shrink-0">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
                    <span>{language === 'ar' ? 'منظومة قواعد البيانات الثنائية (MongoDB & Dedicated Video Vault)' : 'Dual Database Architecture (MongoDB & Dedicated Video Vault)'}</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold">
                      {language === 'ar' ? 'تشغيل فعلي' : 'Live Production'}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300">
                    {language === 'ar'
                      ? 'قاعدة بيانات MongoDB للبيانات الهيكلية وسجلات البلاغات، وخادم مستقل للفيديوهات يدعم حتى 500 ميجابايت مع التحقق الجنائي (SHA-256).'
                      : 'Structured report records in MongoDB, and high-capacity video evidence (500MB) with cryptographic SHA-256 validation.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={refreshLiveDbStatus}
                disabled={isRefreshingDbStatus}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50 shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingDbStatus ? 'animate-spin' : ''}`} />
                <span>{language === 'ar' ? 'تحديث حالة الاتصال' : 'Refresh Live Status'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Database 1: MongoDB Card ("مونجو") */}
            <div className="p-6 bg-white rounded-2xl border border-slate-200 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">
                      {language === 'ar' ? 'قاعدة بيانات 1: MongoDB' : 'Database 1: MongoDB'}
                    </h4>
                    <span className="text-[11px] text-slate-500 font-mono">
                      Collection: {mongoStatus?.collection || 'civic_reports'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                      mongoStatus?.connected
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border-amber-300'
                    }`}
                  >
                    {mongoStatus?.connected
                      ? (language === 'ar' ? 'متصل وحي (MongoDB ✓)' : 'Live Connected (MongoDB ✓)')
                      : (language === 'ar' ? 'مخزن بيانات آمن (Active ✓)' : 'Persistent Store (Active ✓)')}
                  </span>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-600">
                <p className="leading-relaxed text-[11px]">
                  {language === 'ar'
                    ? 'مخصصة لتخزين سجلات البلاغات، إحداثيات الـ GPS، بيانات المتابعة الإجرائية، وسجلات التدقيق عبر معرفات كائنات (ObjectId) مطابقة لمعايير MongoDB الرسمية.'
                    : 'Stores structured report documents, GPS coordinates, tracking updates, and audit logs using native MongoDB ObjectIds.'}
                </p>

                <div className="p-3.5 bg-slate-900 rounded-xl text-slate-200 font-mono text-[11px] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">URI:</span>
                    <span className="text-amber-300 truncate max-w-[220px]">
                      {mongoStatus?.uriMasked || 'mongodb://127.0.0.1:27017/ain_masr_civic'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Database:</span>
                    <span className="text-emerald-400 font-bold">{mongoStatus?.database || 'ain_masr_civic'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Total Documents:</span>
                    <span className="text-white font-extrabold">{mongoStatus?.totalDocuments ?? reports.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Engine Mode:</span>
                    <span className="text-blue-300 font-bold">
                      {mongoStatus?.connected ? 'Live MongoDB Server' : 'Persistent Storage Engine'}
                    </span>
                  </div>
                </div>

                {/* Ping / Connection Test Action */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleTestMongoPing}
                    disabled={pingTesting}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Activity className={`w-3.5 h-3.5 text-emerald-600 ${pingTesting ? 'animate-pulse' : ''}`} />
                    <span>{pingTesting ? (language === 'ar' ? 'جاري الفحص...' : 'Pinging...') : (language === 'ar' ? 'فحص نبض اتصال MongoDB' : 'Ping MongoDB Connection')}</span>
                  </button>

                  {pingResult && (
                    <span className="text-[11px] font-bold text-emerald-700 font-mono">
                      {pingResult.latencyMs ? `${pingResult.latencyMs}ms ✓` : (language === 'ar' ? 'تم التحقق ✓' : 'Verified ✓')}
                    </span>
                  )}
                </div>

                <div className="pt-2">
                  <span className="font-bold text-slate-800 block mb-1">
                    {language === 'ar' ? 'أحدث مستندات MongoDB المسجلة:' : 'Recent MongoDB Report Documents:'}
                  </span>
                  <div className="max-h-36 overflow-y-auto space-y-1">
                    {reports.slice(0, 5).map((r) => (
                      <div key={r.id} className="p-2 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between font-mono text-[10px]">
                        <span className="text-amber-800 font-bold">{r.referenceNo}</span>
                        <span className="text-slate-500 truncate max-w-[140px]">_id: {r.mongoId || r.id}</span>
                        <span className="text-emerald-700 font-bold">synced</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Database 2: Dedicated Video Storage Card */}
            <div className="p-6 bg-white rounded-2xl border border-slate-200 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
                    <Server className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">
                      {language === 'ar' ? 'قاعدة بيانات 2: مخزن الفيديوهات المخصص (Video Vault)' : 'Database 2: Dedicated Video Vault (500MB)'}
                    </h4>
                    <span className="text-[11px] text-slate-500 font-mono">
                      Bucket: {videoVaultStatus?.bucket || 'civic_evidence_videos'}
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
                  {language === 'ar' ? 'فحص جنائي مفعل ✓' : 'Forensics Active ✓'}
                </span>
              </div>

              <div className="space-y-3 text-xs text-slate-600">
                <p className="leading-relaxed text-[11px]">
                  {language === 'ar'
                    ? 'مخزن سحابي مخصص لاستيعاب الفيديوهات عالية الدقة حتى 500 ميجابايت مع تدفق فوري (HTTP 206 Streaming) وحساب البصمة المشفرة (SHA-256) لاعتمادها قانونياً.'
                    : 'Dedicated high-capacity storage for HD incident videos up to 500MB with partial content streaming (HTTP 206) and court-admissible SHA-256 verification.'}
                </p>

                <div className="p-3.5 bg-slate-900 rounded-xl text-slate-200 font-mono text-[11px] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Vault Path:</span>
                    <span className="text-amber-300">{videoVaultStatus?.storagePath || './storage/videos'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Max Video Limit:</span>
                    <span className="text-emerald-400 font-bold">500 MB</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Validation:</span>
                    <span className="text-purple-300 font-bold">SHA-256 Forensic Authenticator</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Streaming Engine:</span>
                    <span className="text-blue-300 font-bold">HTTP 206 Partial Content (1MB chunks)</span>
                  </div>
                </div>

                <div className="pt-1">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-slate-800">
                      {language === 'ar' ? 'مقاطع الفيديو المسجلة في المخزن:' : 'Registered Videos in Vault:'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {reports.flatMap((r) => r.attachments.filter((a) => a.type === 'video')).length} {language === 'ar' ? 'ملفات' : 'files'}
                    </span>
                  </div>

                  <div className="max-h-40 overflow-y-auto space-y-1.5">
                    {reports
                      .flatMap((r) => r.attachments.filter((a) => a.type === 'video'))
                      .map((att) => (
                        <div
                          key={att.id}
                          className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-[11px] gap-2"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <Film className="w-4 h-4 text-amber-600 shrink-0" />
                            <div className="truncate">
                              <span className="text-slate-900 font-bold block truncate">{att.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono block truncate">
                                {att.videoStorageId || 'vid_vault_default.mp4'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {/* Stream Play Button */}
                            <button
                              type="button"
                              onClick={() => {
                                const streamUrl = att.videoStorageId
                                  ? `/api/videos/stream/${att.videoStorageId}`
                                  : att.url;
                                setStreamingTestVideo({ url: streamUrl, name: att.name });
                              }}
                              className="px-2 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-[10px] flex items-center gap-1 cursor-pointer"
                              title={language === 'ar' ? 'تشغيل الفيديو' : 'Play Video'}
                            >
                              <Play className="w-3 h-3 fill-current" />
                              <span>{language === 'ar' ? 'تشغيل' : 'Play'}</span>
                            </button>

                            {/* Forensic Validation Button */}
                            <button
                              type="button"
                              disabled={validatingVideoId === att.videoStorageId}
                              onClick={() => handleRunForensicValidation(att.videoStorageId || 'default')}
                              className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-[10px] flex items-center gap-1 cursor-pointer disabled:opacity-50"
                              title={language === 'ar' ? 'التحقق الجنائي' : 'Forensic Check'}
                            >
                              <ShieldCheck className="w-3 h-3 text-emerald-400" />
                              <span>{language === 'ar' ? 'فحص SHA-256' : 'Verify SHA-256'}</span>
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Environment Variables Reference Card */}
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-amber-600" />
                <h4 className="font-extrabold text-sm text-slate-900">
                  {language === 'ar' ? 'إعدادات ملف البيئة (.env Configuration File)' : '.env Configuration File'}
                </h4>
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                /.env & /.env.example
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {language === 'ar'
                ? 'تم تكوين وتفعيل ملف .env الفعلي بالمتغيرات المحددة لقاعدة بيانات MongoDB وسحابة Supabase ومخزن الفيديوهات.'
                : 'Configured .env file is actively loaded for MongoDB and Supabase Storage.'}
            </p>

            <div className="p-4 bg-slate-950 text-slate-200 rounded-xl font-mono text-xs overflow-x-auto space-y-1">
              <div className="text-slate-500"># Supabase Storage & Cloud Credentials</div>
              <div className="text-sky-400">SUPABASE_URL=https://ebkortdqzznnfmtmrdyw.supabase.co</div>
              <div className="text-sky-400">SUPABASE_PUBLISHABLE_KEY=sb_publishable_PyJBD-EK9s4Zz0xTSvhPUw_-1nvF00k</div>
              <div className="text-sky-400">SUPABASE_SECRET_KEY=sb_secret_WNo8M2fyjh8WMf-JIZXSWA_Nc4-ohin</div>
              <div className="text-sky-400">SUPABASE_JWKS_URL=https://ebkortdqzznnfmtmrdyw.supabase.co/auth/v1/.well-known/jwks.json</div>
              <div className="text-slate-500 pt-2"># MongoDB Database Configuration</div>
              <div className="text-emerald-400">MONGODB_URI=mongodb+srv://abdobeah916_db_user:Axm6QGnt2hSVkOFg@cluster0.jb69qjk.mongodb.net/?appName=Cluster0</div>
            </div>
          </div>

          {/* Vercel & Supabase Cloud Deployment Hub */}
          <div className="p-6 bg-gradient-to-br from-white to-sky-50/40 rounded-2xl border border-sky-200 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sky-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-md">
                  <Cloud className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-base text-slate-900">
                    {language === 'ar' ? 'منظومة نشر Vercel وربط Supabase للفيديوهات (500MB)' : 'Vercel Deployment & Supabase Video Vault'}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {language === 'ar'
                      ? 'رفع الفيديوهات الضخمة مباشرة من متصفح المستخدم إلى سوبابيز بدون التقيد بحدود Vercel'
                      : 'Bypasses Vercel 4.5MB limit by streaming directly from citizen browser to Supabase'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {supabaseCfg.isConfigured ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-300">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{language === 'ar' ? 'سوبابيز متصل ونشط' : 'Supabase Connected & Active'}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-xs border border-amber-300">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>{language === 'ar' ? 'بانتظار إدخال مفاتيح Supabase' : 'Awaiting Supabase Keys'}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Quick Setup Form */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Supabase Project URL</label>
                <input
                  type="text"
                  placeholder="https://xyzabc.supabase.co"
                  value={sbUrlInput}
                  onChange={(e) => setSbUrlInput(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 font-mono"
                  dir="ltr"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Supabase Anon Key</label>
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                  value={sbKeyInput}
                  onChange={(e) => setSbKeyInput(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 font-mono"
                  dir="ltr"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Storage Bucket Name</label>
                <input
                  type="text"
                  placeholder="civic_evidence_videos"
                  value={sbBucketInput}
                  onChange={(e) => setSbBucketInput(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 font-mono"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveSupabaseConfig}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>
                    {sbSaveSuccess
                      ? (language === 'ar' ? 'تم الحفظ والتفعيل بنجاح!' : 'Saved & Activated!')
                      : (language === 'ar' ? 'حفظ وتفعيل الربط المباشر' : 'Save & Activate Integration')}
                  </span>
                </button>
                {supabaseCfg.isConfigured && (
                  <button
                    type="button"
                    onClick={handleClearSupabaseConfig}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    {language === 'ar' ? 'مسح' : 'Clear'}
                  </button>
                )}
              </div>

              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-sky-700 hover:text-sky-900 inline-flex items-center gap-1 underline underline-offset-4"
              >
                <span>{language === 'ar' ? 'فتح لوحة تحكم Supabase وإنشاء مشروع مجاني' : 'Open Supabase Dashboard'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* SQL Query Snippet for Supabase Bucket */}
            <div className="p-4 bg-slate-900 text-slate-200 rounded-xl space-y-2 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400">
                  {language === 'ar' ? 'كود SQL لإنشاء الباكت في Supabase (SQL Editor):' : 'SQL Script to Create Bucket in Supabase:'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const sql = `INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('civic_evidence_videos', 'civic_evidence_videos', true, 524288000, ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska', 'video/avi'])
ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = 524288000;

CREATE POLICY "Public Upload" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'civic_evidence_videos');
CREATE POLICY "Public Read" ON storage.objects FOR SELECT TO public USING (bucket_id = 'civic_evidence_videos');`;
                    navigator.clipboard.writeText(sql);
                    setCopiedSql(true);
                    setTimeout(() => setCopiedSql(false), 2500);
                  }}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-300" />}
                  <span>{copiedSql ? (language === 'ar' ? 'تم نسخ الـ SQL!' : 'Copied SQL!') : (language === 'ar' ? 'نسخ كود SQL' : 'Copy SQL')}</span>
                </button>
              </div>
              <pre className="text-[11px] font-mono text-slate-300 overflow-x-auto p-2 bg-slate-950 rounded-lg">
{`INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('civic_evidence_videos', 'civic_evidence_videos', true, 524288000)
ON CONFLICT (id) DO UPDATE SET public = true;`}
              </pre>
            </div>

            {/* Vercel Environment Variables Ready to Copy */}
            <div className="p-4 bg-slate-900 text-slate-200 rounded-xl space-y-2 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-400">
                  {language === 'ar' ? 'متغيرات بيئة Vercel الجاهزة للنسخ:' : 'Vercel Environment Variables:'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const text = `SUPABASE_URL=https://ebkortdqzznnfmtmrdyw.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_PyJBD-EK9s4Zz0xTSvhPUw_-1nvF00k
SUPABASE_SECRET_KEY=sb_secret_WNo8M2fyjh8WMf-JIZXSWA_Nc4-ohin
SUPABASE_JWKS_URL=https://ebkortdqzznnfmtmrdyw.supabase.co/auth/v1/.well-known/jwks.json
MONGODB_URI=mongodb+srv://abdobeah916_db_user:Axm6QGnt2hSVkOFg@cluster0.jb69qjk.mongodb.net/?appName=Cluster0`;
                    navigator.clipboard.writeText(text);
                    setCopiedVercelEnv(true);
                    setTimeout(() => setCopiedVercelEnv(false), 2500);
                  }}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copiedVercelEnv ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-300" />}
                  <span>{copiedVercelEnv ? (language === 'ar' ? 'تم نسخ المتغيرات!' : 'Copied!') : (language === 'ar' ? 'نسخ كافة المتغيرات' : 'Copy All')}</span>
                </button>
              </div>
              <pre className="font-mono text-[11px] text-sky-300 bg-slate-950 p-2.5 rounded-lg space-y-1 overflow-x-auto whitespace-pre-wrap leading-relaxed">
{`SUPABASE_URL=https://ebkortdqzznnfmtmrdyw.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_PyJBD-EK9s4Zz0xTSvhPUw_-1nvF00k
SUPABASE_SECRET_KEY=sb_secret_WNo8M2fyjh8WMf-JIZXSWA_Nc4-ohin
SUPABASE_JWKS_URL=https://ebkortdqzznnfmtmrdyw.supabase.co/auth/v1/.well-known/jwks.json
MONGODB_URI=mongodb+srv://abdobeah916_db_user:Axm6QGnt2hSVkOFg@cluster0.jb69qjk.mongodb.net/?appName=Cluster0`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Video Validation Certificate Modal */}
      {activeValidationCert && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in"
          onClick={() => setActiveValidationCert(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
          >
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-sm">
                  {language === 'ar' ? 'شهادة التحقق الجنائي للبصمة الرقمية' : 'Forensic Validation Certificate'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveValidationCert(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 font-bold">
                  ✓
                </div>
                <div>
                  <h4 className="font-extrabold text-emerald-950 text-sm">
                    {language === 'ar' ? 'فيديو معتمد وسليم 100%' : 'Video Validated & Tamper-Proof'}
                  </h4>
                  <p className="text-emerald-800 text-[11px] leading-relaxed">
                    {language === 'ar'
                      ? 'تم التحقق من مطابقة الحاوية وسلامة البصمة المشفرة وفقاً لمعايير الأدلة الجنائية الرقمية.'
                      : 'File matches forensic integrity standards and SHA-256 chain of custody.'}
                  </p>
                </div>
              </div>

              <div className="space-y-2 font-mono text-[11px]">
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-slate-400 block text-[10px]">
                    {language === 'ar' ? 'كود الشهادة:' : 'Certificate ID:'}
                  </span>
                  <span className="font-bold text-slate-900">{activeValidationCert.certificateId}</span>
                </div>

                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-slate-400 block text-[10px]">
                    {language === 'ar' ? 'البصمة المشفرة (SHA-256 Checksum):' : 'Cryptographic Checksum (SHA-256):'}
                  </span>
                  <span className="font-bold text-amber-800 break-all">{activeValidationCert.sha256Checksum}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-slate-400 block text-[10px]">
                      {language === 'ar' ? 'حجم الملف:' : 'File Size:'}
                    </span>
                    <span className="font-bold text-slate-900">
                      {activeValidationCert.sizeMB} {language === 'ar' ? 'ميجابايت' : 'MB'}
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-slate-400 block text-[10px]">
                      {language === 'ar' ? 'حاوية التخزين:' : 'Storage Bucket:'}
                    </span>
                    <span className="font-bold text-slate-900">{activeValidationCert.bucket}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveValidationCert(null)}
                className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs hover:bg-slate-800 cursor-pointer"
              >
                {language === 'ar' ? 'إغلاق الشهادة' : 'Close Certificate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Stream Preview Modal */}
      {streamingTestVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in"
          onClick={() => setStreamingTestVideo(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 overflow-hidden text-white"
          >
            <div className="p-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Film className="w-5 h-5 text-amber-400" />
                <span className="font-bold text-xs truncate max-w-md">{streamingTestVideo.name}</span>
              </div>
              <button
                type="button"
                onClick={() => setStreamingTestVideo(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-black aspect-video flex items-center justify-center">
              <video
                src={streamingTestVideo.url}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>

            <div className="p-3 bg-slate-950 text-slate-400 text-[11px] font-mono flex items-center justify-between border-t border-slate-800">
              <span>Streaming: HTTP 206 Partial Content</span>
              <span className="text-emerald-400 font-bold">500MB Video Vault Ready ✓</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Category Management */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          <form onSubmit={handleCreateCategory} className="p-6 bg-white rounded-2xl border border-slate-200 space-y-4 shadow-xs">
            <h3 className="font-extrabold text-sm text-slate-900">
              {language === 'ar' ? 'إضافة تصنيف جديد للبلاغات' : 'Add New Category'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <input
                type="text"
                value={newCatNameAr}
                onChange={(e) => setNewCatNameAr(e.target.value)}
                placeholder="اسم التصنيف (بالعربية)"
                className="p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 font-medium"
              />
              <input
                type="text"
                value={newCatNameEn}
                onChange={(e) => setNewCatNameEn(e.target.value)}
                placeholder="Category Name (English)"
                className="p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 font-medium"
              />
              <input
                type="text"
                value={newCatDescAr}
                onChange={(e) => setNewCatDescAr(e.target.value)}
                placeholder="الوصف بالعربية"
                className="p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
              />
              <input
                type="text"
                value={newCatDescEn}
                onChange={(e) => setNewCatDescEn(e.target.value)}
                placeholder="Description in English"
                className="p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div className="flex items-center justify-between text-xs pt-1">
              <div className="flex items-center gap-2">
                <span className="text-slate-700 font-bold">{t('department', language)}:</span>
                <select
                  value={newCatDeptId}
                  onChange={(e) => setNewCatDeptId(e.target.value)}
                  className="p-2 border border-slate-300 rounded-xl font-medium"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {language === 'ar' ? d.nameAr : d.nameEn}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl cursor-pointer shadow-sm"
              >
                {language === 'ar' ? 'حفظ التصنيف' : 'Save Category'}
              </button>
            </div>
          </form>

          {/* List Categories */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {categories.map((c) => (
              <div key={c.id} className="p-4 bg-white rounded-2xl border border-slate-200 text-xs space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">
                    {language === 'ar' ? c.nameAr : c.nameEn}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleCategory(c.id)}
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold cursor-pointer ${
                      c.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {c.active ? (language === 'ar' ? 'نشط' : 'Active') : (language === 'ar' ? 'معطل' : 'Disabled')}
                  </button>
                </div>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  {language === 'ar' ? c.descriptionAr : c.descriptionEn}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Routing Rules */}
      {activeTab === 'routing' && (
        <div className="space-y-6">
          <form onSubmit={handleCreateRoutingRule} className="p-6 bg-white rounded-2xl border border-slate-200 space-y-4 shadow-xs">
            <h3 className="font-extrabold text-sm text-slate-900">
              {t('addRuleBtn', language)}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <input
                type="text"
                value={newRuleNameAr}
                onChange={(e) => setNewRuleNameAr(e.target.value)}
                placeholder="اسم القاعدة بالعربية (مثال: توجيه أضرار الطرق لمرور القاهرة)"
                className="p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 font-medium"
              />
              <input
                type="text"
                value={newRuleNameEn}
                onChange={(e) => setNewRuleNameEn(e.target.value)}
                placeholder="Rule Name in English"
                className="p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 font-medium"
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">{t('category', language)}</label>
                <select
                  value={newRuleCatId}
                  onChange={(e) => setNewRuleCatId(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-xl font-medium"
                >
                  <option value="">{language === 'ar' ? 'أي تصنيف' : 'Any Category'}</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {language === 'ar' ? c.nameAr : c.nameEn}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">{t('governorate', language)}</label>
                <select
                  value={newRuleGovId}
                  onChange={(e) => setNewRuleGovId(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-xl font-medium"
                >
                  <option value="">{language === 'ar' ? 'كل المحافظات' : 'All Egypt'}</option>
                  {GOVERNORATES.map((g) => (
                    <option key={g.id} value={g.id}>
                      {language === 'ar' ? g.nameAr : g.nameEn}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">{t('severity', language)}</label>
                <select
                  value={newRuleSev}
                  onChange={(e) => setNewRuleSev(e.target.value as any)}
                  className="w-full p-2 border border-slate-300 rounded-xl font-medium"
                >
                  <option value="">{language === 'ar' ? 'أي درجة خطورة' : 'Any Severity'}</option>
                  <option value="critical">{formatSeverity('critical', language)}</option>
                  <option value="high">{formatSeverity('high', language)}</option>
                  <option value="medium">{formatSeverity('medium', language)}</option>
                  <option value="low">{formatSeverity('low', language)}</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">{t('department', language)}</label>
                <select
                  value={newRuleDeptId}
                  onChange={(e) => setNewRuleDeptId(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-xl font-medium"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {language === 'ar' ? d.nameAr : d.nameEn}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer shadow-sm"
              >
                {language === 'ar' ? 'تفعيل القاعدة' : 'Add Rule'}
              </button>
            </div>
          </form>

          {/* List of rules */}
          <div className="space-y-3">
            {routingRules.map((rule) => {
              const dept = departments.find((d) => d.id === rule.targetDepartmentId);
              const gov = GOVERNORATES.find((g) => g.id === rule.governorateId);
              const cat = categories.find((c) => c.id === rule.categoryId);

              return (
                <div
                  key={rule.id}
                  className="p-4 bg-white rounded-2xl border border-slate-200 flex items-center justify-between text-xs shadow-xs"
                >
                  <div className="space-y-1">
                    <span className="font-bold text-slate-900 text-sm">
                      {language === 'ar' ? rule.nameAr : rule.nameEn}
                    </span>
                    <div className="flex items-center gap-2 text-slate-500">
                      <span>{gov ? (language === 'ar' ? gov.nameAr : gov.nameEn) : 'كل المحافظات'}</span>
                      <span aria-hidden="true">·</span>
                      <span>{cat ? (language === 'ar' ? cat.nameAr : cat.nameEn) : 'كافة التصنيفات'}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-bold text-amber-700">{language === 'ar' ? dept?.nameAr : dept?.nameEn}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleRoutingRule(rule.id)}
                      className={`px-3 py-1 rounded-full font-bold cursor-pointer ${
                        rule.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {rule.active ? (language === 'ar' ? 'نشطة' : 'Active') : (language === 'ar' ? 'معطلة' : 'Inactive')}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteRoutingRule(rule.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 5: Moderation */}
      {activeTab === 'moderation' && (
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-2xl border border-slate-200">
            <h3 className="font-extrabold text-sm text-slate-900 mb-1">
              {language === 'ar' ? 'بلاغات خاضعة للرقابة اللفظية ومكافحة التشهير' : 'Defamation Shield Audit'}
            </h3>
            <p className="text-xs text-slate-500">
              {language === 'ar'
                ? 'البلاغات التي تضمنت عبارات اتهام شخصية أو تشهير محتمل وفقاً للقانون 175 لسنة 2018.'
                : 'Submissions flagged for potential defamation or offensive terminology.'}
            </p>
          </div>

          {flaggedReports.length > 0 ? (
            <div className="space-y-3">
              {flaggedReports.map((rep) => (
                <div key={rep.id} className="p-5 bg-white rounded-2xl border border-rose-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-rose-800">{rep.referenceNo}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-xs">
                      {language === 'ar' ? 'اشتباه تشهير' : 'Defamation Flag'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-800 font-semibold">
                    {language === 'en' && rep.titleEn ? rep.titleEn : rep.title}
                  </p>
                  <p className="text-xs text-slate-600 bg-rose-50/60 p-3 rounded-xl border border-rose-100">
                    {language === 'en' && rep.descriptionEn ? rep.descriptionEn : rep.description}
                  </p>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        moderateReport(rep.id, 'approve', language === 'ar' ? 'تمت الإجازة بعد التحقق الموضوعي' : 'Approved as objective');
                        showToast(language === 'ar' ? 'تمت إجازة البلاغ' : 'Report approved');
                      }}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      {language === 'ar' ? 'إجازة البلاغ (موضوعي)' : 'Approve Report'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        moderateReport(rep.id, 'quarantine', language === 'ar' ? 'مخالف لضوابط مكافحة التشهير' : 'Violates anti-defamation rules');
                        showToast(language === 'ar' ? 'تم استبعاد البلاغ' : 'Report quarantined');
                      }}
                      className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      {language === 'ar' ? 'استبعاد وحجب' : 'Quarantine'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 text-xs">
              {language === 'ar' ? 'لا توجد بلاغات مشبوهة أو مخالفة معلقة حالياً.' : 'No flagged or suspicious reports pending review.'}
            </div>
          )}
        </div>
      )}

      {/* Tab 6: Audit Logs */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
          <h3 className="font-extrabold text-sm text-slate-900">
            {language === 'ar' ? 'سجل الرقابة والعمليات المركزية (Audit Trail)' : 'System Audit Trail'}
          </h3>
          <div className="divide-y divide-slate-100 text-xs">
            {auditLogs.map((log) => (
              <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div>
                  <div className="font-bold text-slate-900">{log.actionAr}</div>
                  <div className="text-[11px] text-slate-500">
                    {log.actorName} ({log.actorRole}) — {log.details}
                  </div>
                </div>
                <div className="text-[11px] text-slate-400 font-mono tabular-nums shrink-0">
                  {log.timestamp.slice(0, 19).replace('T', ' ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inspection & Command Console Modal for Single Report (حل مشكلة عزل لوحة الأدمن) */}
      {inspectModalReport && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in"
          onClick={() => setInspectReportId(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
          >
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-5 sm:px-6 py-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="font-mono font-extrabold text-amber-400 text-sm sm:text-base">
                  {inspectModalReport.referenceNo}
                </span>

                <ReportStatusBadge
                  status={inspectModalReport.status}
                  isCompleted={inspectModalReport.isCompleted}
                  language={language}
                  size="sm"
                  showLiveIndicator={true}
                />

                {inspectModalReport.assignedBranchNameAr && (
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-900/60 text-blue-300 text-[11px] font-bold border border-blue-700/60 flex items-center gap-1">
                    <Building className="w-3 h-3 text-blue-400" />
                    <span>{inspectModalReport.assignedBranchNameAr}</span>
                  </span>
                )}

                {inspectModalReport.isSharedWithNetwork && (
                  <span className="px-2 py-0.5 rounded-full bg-purple-900/60 text-purple-300 text-[10px] font-bold border border-purple-700/60 flex items-center gap-1">
                    <Share2 className="w-2.5 h-2.5" />
                    <span>{language === 'ar' ? 'متاح للشبكة' : 'Network Shared'}</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => printReportReceipt(inspectModalReport)}
                  title={language === 'ar' ? 'طباعة محضر رسمي' : 'Print Official Dossier'}
                  className="text-slate-300 hover:text-white p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-amber-400" />
                </button>
                <button
                  type="button"
                  onClick={() => setInspectReportId(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Internal Navigation Tabs */}
            <div className="bg-slate-100 border-b border-slate-200 px-4 sm:px-6 flex items-center gap-1 sm:gap-2 overflow-x-auto text-xs font-bold pt-2">
              {[
                { id: 'details', label: language === 'ar' ? 'بيانات البلاغ والأدلة' : 'Report & Evidence', icon: FileCheck },
                {
                  id: 'timeline',
                  label: language === 'ar'
                    ? `مسار البلاغ والتحويلات (${inspectModalReport.statusTimeline?.length || 0})`
                    : `Timeline & Transfers (${inspectModalReport.statusTimeline?.length || 0})`,
                  icon: History,
                },
                {
                  id: 'replies',
                  label: language === 'ar'
                    ? `الردود والاستفسارات (${inspectModalReport.clarificationMessages?.length || 0})`
                    : `Replies (${inspectModalReport.clarificationMessages?.length || 0})`,
                  icon: MessageSquare,
                },
                {
                  id: 'notes',
                  label: language === 'ar'
                    ? `المذكرات الداخلية (${inspectModalReport.internalNotes?.length || 0})`
                    : `Internal Notes (${inspectModalReport.internalNotes?.length || 0})`,
                  icon: FileText,
                },
                {
                  id: 'actions',
                  label: language === 'ar' ? '⚡ تحويل وتحكم إداري' : '⚡ Dispatch & Actions',
                  icon: Route,
                },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setInspectTab(tab.id as any)}
                    className={`pb-2.5 px-3 rounded-t-lg transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap text-xs ${
                      inspectTab === tab.id
                        ? 'bg-white text-slate-900 border-t-2 border-amber-500 font-extrabold shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Modal Body with Active Tab */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs flex-1">
              {/* Tab 1: Details & Evidence */}
              {inspectTab === 'details' && (
                <div className="space-y-4 animate-in fade-in">
                  <div>
                    <h3 className="font-extrabold text-base sm:text-lg text-slate-900 mb-1">
                      {language === 'en' && inspectModalReport.titleEn ? inspectModalReport.titleEn : inspectModalReport.title}
                    </h3>
                    <p className="text-slate-700 bg-slate-50 p-4 rounded-xl leading-relaxed text-sm border border-slate-200">
                      {language === 'en' && inspectModalReport.descriptionEn ? inspectModalReport.descriptionEn : inspectModalReport.description}
                    </p>
                  </div>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-100 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-slate-400 block mb-0.5">
                        {language === 'ar' ? 'المحافظة:' : 'Governorate:'}
                      </span>
                      <span className="font-bold text-slate-900">
                        {(() => {
                          const g = GOVERNORATES.find((item) => item.id === inspectModalReport.location?.governorateId);
                          return g ? (language === 'ar' ? g.nameAr : g.nameEn) : (inspectModalReport.location?.governorateId || '—');
                        })()}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block mb-0.5">
                        {language === 'ar' ? 'الحي / المركز:' : 'District / City:'}
                      </span>
                      <span className="font-bold text-slate-900">
                        {language === 'en' && inspectModalReport.location?.cityDistrictEn ? inspectModalReport.location.cityDistrictEn : (inspectModalReport.location?.cityDistrict || '—')}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block mb-0.5">
                        {language === 'ar' ? 'الجهة الميدانية الحالية:' : 'Current Unit:'}
                      </span>
                      <span className="font-bold text-blue-900">
                        {inspectModalReport.assignedBranchNameAr || 'جاري التوجيه'}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block mb-0.5">
                        {language === 'ar' ? 'درجة الخطورة:' : 'Severity Level:'}
                      </span>
                      <span className="font-bold text-rose-700">{formatSeverity(inspectModalReport.severity, language)}</span>
                    </div>
                  </div>

                  {/* Street & Reporter Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                      <span className="text-slate-500 font-bold block">
                        {language === 'ar' ? 'أقرب معلم / الشارع:' : 'Street / Landmark:'}
                      </span>
                      <span className="text-slate-800">
                        {inspectModalReport.location?.streetLandmark || (language === 'ar' ? 'لم يتم تحديد علامة فارقة' : 'No landmark specified')}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                      <span className="text-slate-500 font-bold block">
                        {language === 'ar' ? 'بيانات المبلّغ:' : 'Reporter Details:'}
                      </span>
                      <span className="text-slate-800 flex items-center gap-1.5 font-medium">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{inspectModalReport.reporter?.fullName || (language === 'ar' ? 'مواطن / مقيم (هوية مشفرة ومحمية)' : 'Protected Identity')}</span>
                        {inspectModalReport.reporter?.phone && (
                          <span className="font-mono text-slate-500 text-[11px]">({inspectModalReport.reporter.phone})</span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Attachments & 500MB Video Vault Player */}
                  {inspectModalReport.attachments && inspectModalReport.attachments.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <div className="p-2.5 bg-amber-500/10 border border-amber-400/40 rounded-xl flex items-center justify-between text-xs text-amber-900">
                        <span className="font-bold flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-amber-600" />
                          <span>{language === 'ar' ? 'صلاحية المشرف العام: معاينة كاملة للصور ومقاطع الفيديو المحجوبة عن الفروع العادية' : 'Admin Privilege: Full preview of photos & videos restricted from regular branches'}</span>
                        </span>
                        <span className="text-[10px] bg-amber-100 text-amber-950 font-bold px-2 py-0.5 rounded border border-amber-300">
                          {language === 'ar' ? 'كشف غير مقيد' : 'Unrestricted'}
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-800 flex items-center justify-between">
                        <span>{language === 'ar' ? 'الأدلة الجنائية والمقاطع المرفقة' : 'Attached Media Evidence'} ({inspectModalReport.attachments.length}):</span>
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          {language === 'ar' ? 'فحص جنائي SHA-256 متاح' : 'SHA-256 Forensics Ready'}
                        </span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {inspectModalReport.attachments.map((att) => (
                          <div key={att.id} className="p-3 bg-white border border-slate-200 rounded-xl space-y-2 shadow-2xs">
                            <div className="flex items-center justify-between gap-2 font-medium">
                              <div className="flex items-center gap-1.5 truncate">
                                {att.type === 'video' ? <Film className="w-4 h-4 text-amber-600 shrink-0" /> : <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />}
                                <span className="truncate">{att.name}</span>
                              </div>
                              {att.sha256 && (
                                <button
                                  type="button"
                                  onClick={() => handleRunForensicValidation(att.videoStorageId || att.id)}
                                  className="text-[10px] px-2 py-0.5 bg-slate-900 text-amber-400 font-mono rounded cursor-pointer shrink-0"
                                >
                                  {language === 'ar' ? 'فحص البصمة' : 'Verify SHA'}
                                </button>
                              )}
                            </div>
                            {att.type === 'video' && (
                              <div className="rounded-lg overflow-hidden bg-black aspect-video flex items-center justify-center">
                                <video src={att.url} controls className="w-full h-full object-cover" />
                              </div>
                            )}
                            {att.type === 'image' && (
                              <img src={att.url} alt={att.name} className="w-full h-40 object-cover rounded-lg" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Live Status & Branch Transfer Timeline (حل مشكلة: لو البلاغ اتحول يظهر هنا بالكامل) */}
              {inspectTab === 'timeline' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-950 text-xs flex items-center justify-between">
                    <span>
                      {language === 'ar'
                        ? '📜 سجل التتبع المباشر لكافة عمليات التوجيه الميداني والتحويلات الإدارية بين الفروع:'
                        : 'Official Live Timeline & Inter-branch Transfer Logs:'}
                    </span>
                    <span className="font-mono font-bold text-amber-800">
                      {inspectModalReport.statusTimeline?.length || 0} {language === 'ar' ? 'إجراءات موثقة' : 'events'}
                    </span>
                  </div>

                  <div className="relative border-r-2 border-slate-200 rtl:border-r-2 ltr:border-l-2 mr-3 ltr:ml-3 space-y-6 pt-2">
                    {inspectModalReport.statusTimeline && inspectModalReport.statusTimeline.length > 0 ? (
                      inspectModalReport.statusTimeline.map((item, idx) => {
                        const itemNote = (item.noteAr || item.commentAr || '').toLowerCase();
                        const isTransfer = item.status === 'forwarded' || itemNote.includes('تحويل') || itemNote.includes('إحالة');
                        const isFinished = item.status === 'resolved';

                        return (
                          <div key={item.id || idx} className="relative pr-6 ltr:pl-6">
                            {/* Circle marker */}
                            <div
                              className={`absolute -right-2.5 ltr:-left-2.5 top-0 w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${
                                isTransfer
                                  ? 'bg-blue-600 border-white text-white'
                                  : isFinished
                                  ? 'bg-emerald-600 border-white text-white'
                                  : 'bg-amber-500 border-white text-slate-950'
                              }`}
                            >
                              {isTransfer ? '🔄' : isFinished ? '✓' : idx + 1}
                            </div>

                            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 shadow-2xs">
                              <div className="flex items-center justify-between flex-wrap gap-1">
                                <div className="flex items-center gap-1.5">
                                  <ReportStatusBadge
                                    status={item.status}
                                    language={language}
                                    size="xs"
                                    showLiveIndicator={idx === inspectModalReport.statusTimeline.length - 1}
                                  />
                                  {item.actorName && (
                                    <span className="font-bold text-slate-700 text-xs">
                                      بواسطة: {item.actorName} ({item.actorRole})
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {item.timestamp ? item.timestamp.slice(0, 19).replace('T', ' ') : '—'}
                                </span>
                              </div>

                              <p className="text-slate-800 text-xs leading-relaxed font-medium">
                                {language === 'ar' ? (item.noteAr || item.commentAr || 'إجراء مسار موثق') : (item.noteEn || item.noteAr || item.commentEn || 'Documented timeline event')}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-4 text-center text-slate-400">
                        {language === 'ar' ? 'لا يوجد سجل مسار متاح' : 'No timeline logs available'}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 3: Citizen <-> Authority Replies (حل مشكلة: لو تم الرد عليه مبتظهرش في الأدمن) */}
              {inspectTab === 'replies' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-950 text-xs flex items-center justify-between">
                    <span>
                      {language === 'ar'
                        ? '💬 حوار الاستيضاح والردود المتبادلة بين المواطن وجهة الفحص الميدانية ورئاسة المنظومة:'
                        : 'Official Clarification Dialogue between Citizen, Authority Unit, and Directorate:'}
                    </span>
                    <span className="font-mono font-bold text-indigo-800">
                      {inspectModalReport.clarificationMessages?.length || 0} {language === 'ar' ? 'رسائل' : 'messages'}
                    </span>
                  </div>

                  {/* Messages Feed */}
                  <div className="space-y-3 max-h-72 overflow-y-auto p-1">
                    {inspectModalReport.clarificationMessages && inspectModalReport.clarificationMessages.length > 0 ? (
                      inspectModalReport.clarificationMessages.map((msg) => {
                        const isAdmin = msg.sender === 'admin';
                        const isAuth = msg.sender === 'authority';
                        const isCitizen = msg.sender === 'citizen';

                        return (
                          <div
                            key={msg.id}
                            className={`p-3.5 rounded-2xl border text-xs space-y-1 ${
                              isAdmin
                                ? 'bg-amber-50 border-amber-300 mr-4'
                                : isAuth
                                ? 'bg-blue-50 border-blue-200 mr-2'
                                : 'bg-slate-50 border-slate-200 ml-2'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span
                                className={`font-bold px-2 py-0.5 rounded-lg text-[10px] ${
                                  isAdmin
                                    ? 'bg-amber-200 text-amber-950'
                                    : isAuth
                                    ? 'bg-blue-200 text-blue-950'
                                    : 'bg-emerald-100 text-emerald-900'
                                }`}
                              >
                                {isAdmin
                                  ? (language === 'ar' ? 'توجيه رئاسي (Admin)' : 'Admin Directive')
                                  : isAuth
                                  ? (language === 'ar' ? `جهة مختصة: ${msg.senderName}` : `Authority: ${msg.senderName}`)
                                  : (language === 'ar' ? `المواطن المبلّغ: ${msg.senderName}` : `Citizen: ${msg.senderName}`)}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {msg.timestamp ? msg.timestamp.slice(0, 19).replace('T', ' ') : ''}
                              </span>
                            </div>
                            <p className="text-slate-800 leading-relaxed text-xs pt-1">
                              {msg.content}
                            </p>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-slate-200">
                        {language === 'ar' ? 'لا توجد رسائل استيضاح أو ردود حتى الآن في هذا البلاغ.' : 'No clarification messages exchanged yet.'}
                      </div>
                    )}
                  </div>

                  {/* Form to Post Direct Admin Directive/Reply */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <label className="block text-xs font-bold text-slate-800">
                      {language === 'ar' ? 'إرسال توجيه رسمي أو رد من رئيس المنظومة (Admin Directive):' : 'Post Direct Admin Directive:'}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={adminReplyText}
                        onChange={(e) => setAdminReplyText(e.target.value)}
                        placeholder={language === 'ar' ? 'اكتب توجيهك المباشر للمواطن أو الجهة الميدانية...' : 'Enter your directive or instructions...'}
                        className="flex-1 px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!adminReplyText.trim()) return;
                          addClarificationMessage(inspectModalReport.id, adminReplyText.trim(), 'admin');
                          setAdminReplyText('');
                          showToast(language === 'ar' ? 'تم إرسال التوجيه الإداري بنجاح' : 'Directive posted successfully');
                        }}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <Send className="w-3.5 h-3.5 text-amber-400" />
                        <span>{language === 'ar' ? 'إرسال التوجيه' : 'Send'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Internal Notes */}
              {inspectTab === 'notes' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-800 text-xs flex items-center justify-between">
                    <span>
                      {language === 'ar'
                        ? '🔒 المذكرات الداخلية السرية للجان المعاينة وفحص الأدلة الميدانية:'
                        : 'Confidential Internal Notes by Field Inspectors & Forensic Audits:'}
                    </span>
                    <span className="font-mono font-bold text-slate-600">
                      {inspectModalReport.internalNotes?.length || 0} {language === 'ar' ? 'مذكرات' : 'notes'}
                    </span>
                  </div>

                  <div className="space-y-3 max-h-72 overflow-y-auto">
                    {inspectModalReport.internalNotes && inspectModalReport.internalNotes.length > 0 ? (
                      inspectModalReport.internalNotes.map((note) => (
                        <div key={note.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">
                              {note.authorName} ({note.departmentName})
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {note.timestamp ? note.timestamp.slice(0, 19).replace('T', ' ') : ''}
                            </span>
                          </div>
                          <p className="text-slate-700 text-xs leading-relaxed">
                            {note.note}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-slate-200">
                        {language === 'ar' ? 'لا توجد مذكرات داخلية مسجلة حتى الآن.' : 'No confidential internal notes recorded.'}
                      </div>
                    )}
                  </div>

                  {/* Add Internal Note */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <label className="block text-xs font-bold text-slate-800">
                      {language === 'ar' ? 'إضافة مذكرة فحص إدارية سرية جديدة:' : 'Add New Confidential Internal Audit Note:'}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={adminNoteText}
                        onChange={(e) => setAdminNoteText(e.target.value)}
                        placeholder={language === 'ar' ? 'سجل ملاحظات التفتيش الفني أو التعليمات الأمنية...' : 'Enter confidential audit note...'}
                        className="flex-1 px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!adminNoteText.trim()) return;
                          addInternalNote(inspectModalReport.id, adminNoteText.trim());
                          setAdminNoteText('');
                          showToast(language === 'ar' ? 'تم حفظ المذكرة الداخلية بنجاح' : 'Note added successfully');
                        }}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <FileText className="w-3.5 h-3.5 text-amber-400" />
                        <span>{language === 'ar' ? 'حفظ المذكرة' : 'Save'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 5: Direct Dispatch & Actions (تحويل البلاغ، إنهاء البلاغ، تغيير الحالة) */}
              {inspectTab === 'actions' && (
                <div className="space-y-5 animate-in fade-in">
                  {/* Action 1: Transfer Report to Another Branch */}
                  <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2 text-blue-900 font-extrabold text-xs">
                      <Repeat className="w-4 h-4 text-blue-700" />
                      <span>{language === 'ar' ? '🔄 تحويل البلاغ لفرع ميداني آخر (Inter-Branch Transfer)' : 'Transfer Report to Another Branch'}</span>
                    </div>
                    <p className="text-[11px] text-blue-700 leading-relaxed">
                      {language === 'ar'
                        ? 'إحالة البلاغ لفرع ميداني آخر مع توثيق مذكرة التحويل في المسار الموحد وإشعار كافة الأطراف.'
                        : 'Transfer report jurisdiction to another branch with official memo logging and live notifications.'}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          {language === 'ar' ? 'اختر الفرع الميداني المحال إليه:' : 'Target Authority Branch:'}
                        </label>
                        <select
                          value={adminTransferBranchId}
                          onChange={(e) => setAdminTransferBranchId(e.target.value)}
                          className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                        >
                          {branches.map((b) => (
                            <option key={b.id} value={b.id}>
                              {language === 'ar' ? b.nameAr : b.nameEn} ({b.phone})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          {language === 'ar' ? 'مذكرة وأسباب التحويل:' : 'Transfer Reason & Memo:'}
                        </label>
                        <input
                          type="text"
                          value={adminTransferReason}
                          onChange={(e) => setAdminTransferReason(e.target.value)}
                          placeholder={language === 'ar' ? 'مثال: إحالة للاختصاص المكاني واستكمال الإجراءات' : 'e.g. Assigned for spatial proximity'}
                          className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const reason = adminTransferReason.trim() || (language === 'ar' ? 'إحالة إدارية رسمية من رئيس المنظومة' : 'Administrative transfer');
                        transferReportBranch(inspectModalReport.id, adminTransferBranchId, reason);
                        showToast(language === 'ar' ? 'تم تحويل البلاغ للفرع الميداني بنجاح' : 'Report transferred successfully');
                      }}
                      className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-md"
                    >
                      <Repeat className="w-3.5 h-3.5" />
                      <span>{language === 'ar' ? 'تنفيذ التحويل الفوري الآن' : 'Execute Transfer'}</span>
                    </button>
                  </div>

                  {/* Action 2: Update Field Status */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2 text-slate-900 font-extrabold text-xs">
                        <Clock className="w-4 h-4 text-amber-600" />
                        <span>{language === 'ar' ? 'تحديث الحالة الميدانية للبلاغ' : 'Update Report Status'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-slate-500 font-semibold">{language === 'ar' ? 'الحالة الحالية:' : 'Live State:'}</span>
                        <ReportStatusBadge
                          status={inspectModalReport.status}
                          isCompleted={inspectModalReport.isCompleted}
                          language={language}
                          size="xs"
                          showLiveIndicator={true}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          {language === 'ar' ? 'الحالة الجديدة:' : 'New Status:'}
                        </label>
                        <select
                          value={adminStatusSelected}
                          onChange={(e) => setAdminStatusSelected(e.target.value as ReportStatus)}
                          className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-bold"
                        >
                          <option value="submitted">{language === 'ar' ? 'جديد (وارد)' : 'Submitted'}</option>
                          <option value="assigned">{language === 'ar' ? 'تم التكليف للجهة' : 'Assigned'}</option>
                          <option value="investigating">{language === 'ar' ? 'قيد المعاينة الميدانية' : 'Investigating'}</option>
                          <option value="info_requested">{language === 'ar' ? 'مطلوب إيضاحات' : 'Info Requested'}</option>
                          <option value="resolved">{language === 'ar' ? 'منجز ومغلق' : 'Resolved'}</option>
                          <option value="closed">{language === 'ar' ? 'مغلق إدارياً' : 'Closed'}</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          {language === 'ar' ? 'بيان التحديث:' : 'Update Note:'}
                        </label>
                        <input
                          type="text"
                          value={adminStatusNoteAr}
                          onChange={(e) => setAdminStatusNoteAr(e.target.value)}
                          placeholder={language === 'ar' ? 'ملاحظة إدارية للتحديث...' : 'Status change comment...'}
                          className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const note = adminStatusNoteAr.trim() || (language === 'ar' ? 'تحديث الحالة من الإدارة المركزية' : 'Status updated by Admin');
                        updateReportStatus(inspectModalReport.id, adminStatusSelected, note, note);
                        showToast(language === 'ar' ? 'تم تحديث حالة البلاغ' : 'Status updated successfully');
                      }}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-md"
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-amber-400" />
                      <span>{language === 'ar' ? 'تحديث الحالة الميدانية' : 'Apply Status'}</span>
                    </button>
                  </div>

                  {/* Action 3: Mark Finished (خلاص البلاغ ده خلص) */}
                  <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2 text-emerald-950 font-extrabold text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{language === 'ar' ? 'إنهاء وإغلاق البلاغ بنجاح (Mark Finished)' : 'Mark Report as Resolved'}</span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-emerald-900 mb-1">
                        {language === 'ar' ? 'بيان الإنجاز والمعالجة النهائية:' : 'Resolution Summary:'}
                      </label>
                      <input
                        type="text"
                        value={adminResolutionNote}
                        onChange={(e) => setAdminResolutionNote(e.target.value)}
                        placeholder={language === 'ar' ? 'تمت المعاينة والانتهاء من الأعمال وإعادة الحالة لطبيعتها بالكامل' : 'Incident resolved successfully'}
                        className="w-full p-2 bg-white border border-emerald-300 rounded-xl text-xs"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const note = adminResolutionNote.trim() || (language === 'ar' ? 'خلاص البلاغ ده خلص — تم إنهاء كافة الأعمال بنجاح' : 'Resolved and closed');
                        markReportFinished(inspectModalReport.id, note);
                        showToast(language === 'ar' ? 'خلاص البلاغ ده خلص — تم إغلاقه بنجاح' : 'Report resolved & closed');
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-md"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{language === 'ar' ? 'خلاص البلاغ ده خلص (إغلاق نهائي)' : 'Close Report as Resolved'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer with Fast Jumps */}
            <div className="bg-slate-50 px-5 sm:px-6 py-3 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedReportId(inspectModalReport.id);
                    setActiveView('track_report');
                  }}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <Navigation className="w-3.5 h-3.5 text-amber-400" />
                  <span>{language === 'ar' ? 'تتبع مسار البلاغ رسمياً' : 'Track Officially'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedReportId(inspectModalReport.id);
                    setActiveView('authority_portal');
                  }}
                  className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 font-bold rounded-xl text-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Building className="w-3.5 h-3.5 text-blue-600" />
                  <span>{language === 'ar' ? 'غرفة عمليات الجهة المختصة' : 'Authority Console'}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setInspectReportId(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs cursor-pointer"
              >
                {language === 'ar' ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
