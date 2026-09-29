import React, { useState } from 'react';
import {
  Building,
  CheckCircle2,
  Clock,
  Filter,
  MapPin,
  MessageSquare,
  Send,
  Share2,
  AlertTriangle,
  Lock,
  User,
  Shield,
  Layers,
  ChevronDown,
  BarChart3,
  X,
  Plus,
  ArrowRight,
  ArrowLeft,
  Printer,
  Check,
  Navigation,
  Sparkles,
  RefreshCw,
  Sliders,
  Eye,
  EyeOff,
  Globe,
  Film,
  FileCheck,
  ShieldCheck,
  Play,
  PhoneCall,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { t, formatStatus, formatSeverity } from '../locales/i18n';
import { GOVERNORATES } from '../data/mockData';
import { Report, ReportStatus, AuthorityBranch } from '../types';
import { InteractiveMap } from './InteractiveMap';

export const AuthorityPortalView: React.FC = () => {
  const {
    language,
    reports,
    departments,
    categories,
    currentUser,
    branches,
    currentOfficerBranch,
    setCurrentOfficerBranch,
    transferReportBranch,
    toggleShareReportWithNetwork,
    markReportFinished,
    claimReportForBranch,
    updateReportStatus,
    addInternalNote,
    addClarificationMessage,
    isOfficialAuthenticated,
    loginAsOfficial,
    setActiveView,
    printReportReceipt,
  } = useApp();

  // Authentication Gate States (if visited directly without login)
  const [gateUsername, setGateUsername] = useState('arbaeen.officer');
  const [gatePassword, setGatePassword] = useState('pass2026');
  const [gateBranchId, setGateBranchId] = useState('branch_suez_arbaeen');
  const [gateError, setGateError] = useState<string | null>(null);

  // Portal View States: exclusive to my branch vs shared with me vs finished vs map
  const [viewTab, setViewTab] = useState<'exclusive' | 'shared' | 'finished' | 'map'>('exclusive');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCase, setSelectedCase] = useState<Report | null>(null);

  // Transfer Modal States
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [transferTargetBranchId, setTransferTargetBranchId] = useState<string>('branch_suez_city');
  const [transferReasonText, setTransferReasonText] = useState('');

  // Finish / Resolve Modal States
  const [finishModalOpen, setFinishModalOpen] = useState(false);
  const [finishResolutionNote, setFinishResolutionNote] = useState('');

  // Share with Network Modal States
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareReasonText, setShareReasonText] = useState('');

  // Internal Notes & Clarifications
  const [internalNoteInput, setInternalNoteInput] = useState('');
  const [clarificationInput, setClarificationInput] = useState('');
  const [actionSuccessToast, setActionSuccessToast] = useState<string | null>(null);

  const Arrow = language === 'ar' ? ArrowLeft : ArrowRight;

  const showToast = (msg: string) => {
    setActionSuccessToast(msg);
    setTimeout(() => setActionSuccessToast(null), 3500);
  };

  const handleGateLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setGateError(null);
    const res = loginAsOfficial('authority', gateUsername, gatePassword, gateBranchId);
    if (!res.success) {
      setGateError(res.message || 'بيانات الدخول غير صحيحة');
    }
  };

  // If user is not authenticated as official, show restricted gate
  if (!isOfficialAuthenticated || (currentUser.role !== 'authority' && currentUser.role !== 'admin')) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 animate-in fade-in">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden p-8 space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-600 flex items-center justify-center mx-auto">
            <Building className="w-8 h-8 text-blue-600" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900">
              {language === 'ar' ? 'بوابة الجهات المختصة التشاركية' : 'Competent Authority Collaborative Gate'}
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
              {language === 'ar'
                ? 'نظام أمني عالي التشفير: توجيه تلقائي للبلاغات لأقرب جهة مختصة مع عزل تام يمنع اطلاع أي جهة أخرى على البلاغ إلا في حالة تحويله أو إتاحته رسمياً.'
                : 'Proximity-scoped dispatch system: reports are routed exclusively to the nearest authority branch with zero visibility to other branches.'}
            </p>
          </div>

          {/* 1-Click Fast Clearances */}
          <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl text-start space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-950">
                {language === 'ar' ? 'اختيار النطاق للدخول والتجربة الميدانية:' : 'Instant Operational Clearance:'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => loginAsOfficial('authority', 'arbaeen.officer', 'pass2026', 'branch_suez_arbaeen')}
                className="p-3 bg-blue-700 hover:bg-blue-600 text-white rounded-xl text-start shadow transition-all cursor-pointer"
              >
                <div className="text-xs font-extrabold flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-amber-300" />
                  <span>{language === 'ar' ? 'جهة الأربعين' : 'Al-Arbaeen Branch'}</span>
                </div>
                <div className="text-[10px] text-blue-200 mt-0.5">
                  {language === 'ar' ? 'مفتش الأربعين' : 'Arbaeen Inspector'}
                </div>
              </button>

              <button
                type="button"
                onClick={() => loginAsOfficial('authority', 'suez.officer', 'pass2026', 'branch_suez_city')}
                className="p-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-start shadow transition-all cursor-pointer"
              >
                <div className="text-xs font-extrabold flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-amber-300" />
                  <span>{language === 'ar' ? 'جهة السويس المركزية' : 'Suez Central Authority'}</span>
                </div>
                <div className="text-[10px] text-slate-300 mt-0.5">
                  {language === 'ar' ? 'مفتش السويس' : 'Suez Inspector'}
                </div>
              </button>

              <button
                type="button"
                onClick={() => loginAsOfficial('authority', 'telecom.officer', 'pass2026', 'branch_telecom_cyber')}
                className="p-3 bg-purple-900 hover:bg-purple-800 text-white rounded-xl text-start shadow transition-all cursor-pointer border border-purple-500/40"
              >
                <div className="text-xs font-extrabold flex items-center gap-1.5 text-purple-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
                  <span>{language === 'ar' ? 'هيئة الاتصالات' : 'Telecom Authority'}</span>
                </div>
                <div className="text-[10px] text-purple-300 mt-0.5 truncate">
                  {language === 'ar' ? 'مباحث الإنترنت والابتزاز' : 'Cybercrime & Extortion'}
                </div>
              </button>
            </div>
          </div>

          {gateError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs font-semibold text-rose-700 text-start flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{gateError}</span>
            </div>
          )}

          <form onSubmit={handleGateLogin} className="space-y-4 text-start">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                {t('selectBranchLabel', language)}
              </label>
              <select
                value={gateBranchId}
                onChange={(e) => {
                  const bId = e.target.value;
                  setGateBranchId(bId);
                  if (bId === 'branch_suez_city') {
                    setGateUsername('suez.officer');
                  } else if (bId === 'branch_suez_arbaeen') {
                    setGateUsername('arbaeen.officer');
                  }
                }}
                className="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {language === 'ar' ? b.nameAr : b.nameEn}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-800">
                {t('usernameLabel', language)}
              </label>
              <input
                type="text"
                value={gateUsername}
                onChange={(e) => setGateUsername(e.target.value)}
                placeholder="arbaeen.officer / suez.officer"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-800">
                {t('passwordLabel', language)}
              </label>
              <input
                type="password"
                value={gatePassword}
                onChange={(e) => setGatePassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lock className="w-4 h-4 text-blue-200" />
              <span>{t('loginSubmitBtn', language)}</span>
            </button>
          </form>

          <div className="pt-2">
            <button
              onClick={() => setActiveView('home')}
              className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
            >
              {language === 'ar' ? 'العودة للصفحة الرئيسية كمواطن' : 'Return to Home'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active officer branch info
  const activeBranch = currentOfficerBranch || branches[0];

  // Helper: Can my branch see this report?
  // Strict rule: Sensitive cyber extortion reports go EXCLUSIVELY to Telecom Authority (branch_telecom_cyber).
  // Regular reports are isolated to nearest branch unless shared.
  const canMyBranchSeeReport = (report: Report) => {
    if (currentUser.role === 'admin') return true;

    const isSensitiveCyber =
      report.categoryId === 'cat_cyber_extortion' || Boolean(report.isSensitive);

    // If it's a sensitive cyber extortion/bullying report, ONLY Telecom Authority can see it
    if (isSensitiveCyber) {
      return (
        activeBranch.id === 'branch_telecom_cyber' ||
        currentUser.branchId === 'branch_telecom_cyber' ||
        currentUser.departmentId === 'dept_telecom_cyber'
      );
    }

    // Telecom Authority only sees cyber/telecom cases
    if (activeBranch.id === 'branch_telecom_cyber') {
      return (
        report.assignedBranchId === 'branch_telecom_cyber' ||
        report.categoryId === 'cat_cybercrime' ||
        report.categoryId === 'cat_cyber_extortion'
      );
    }

    if (report.assignedBranchId === activeBranch.id) return true;
    if (report.isSharedWithNetwork === true) return true;
    if (report.sharedWithBranchIds && report.sharedWithBranchIds.includes(activeBranch.id)) return true;
    return false;
  };

  const isReportExclusiveToMine = (report: Report) => {
    return report.assignedBranchId === activeBranch.id;
  };

  const isReportFinished = (report: Report) => {
    return report.isCompleted || report.status === 'resolved' || report.status === 'closed';
  };

  // Filtered reports strictly adhering to Proximity & Isolation Rules
  const visibleReports = reports.filter((r) => canMyBranchSeeReport(r));

  const filteredReports = visibleReports.filter((r) => {
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        r.title.toLowerCase().includes(q) ||
        r.referenceNo.toLowerCase().includes(q) ||
        (r.assignedBranchNameAr && r.assignedBranchNameAr.toLowerCase().includes(q)) ||
        (r.location?.cityDistrict && r.location.cityDistrict.toLowerCase().includes(q));
      if (!match) return false;
    }

    if (viewTab === 'exclusive') {
      // Direct jurisdiction: routed to my branch as nearest location and not finished
      return isReportExclusiveToMine(r) && !isReportFinished(r);
    }
    if (viewTab === 'shared') {
      // Shared with my branch or broadcast from another branch
      return !isReportExclusiveToMine(r) && !isReportFinished(r);
    }
    if (viewTab === 'finished') {
      // Finished cases
      return isReportFinished(r);
    }
    return true; // map handles all visible
  });

  // Strict Scoped Counts
  const exclusiveCount = visibleReports.filter((r) => isReportExclusiveToMine(r) && !isReportFinished(r)).length;
  const sharedCount = visibleReports.filter((r) => !isReportExclusiveToMine(r) && !isReportFinished(r)).length;
  const finishedCount = visibleReports.filter((r) => isReportFinished(r)).length;

  // Actions
  const handleOpenTransferModal = (report: Report, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedCase(report);
    const other = branches.find((b) => b.id !== report.assignedBranchId) || branches[1];
    setTransferTargetBranchId(other.id);
    setTransferReasonText(
      language === 'ar'
        ? 'تحويل للاختصاص المكاني المشترك واستكمال المعاينة الميدانية'
        : 'Transferred for spatial proximity and inspection'
    );
    setTransferModalOpen(true);
  };

  const handleConfirmTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase) return;
    transferReportBranch(selectedCase.id, transferTargetBranchId, transferReasonText);
    setTransferModalOpen(false);
    showToast(language === 'ar' ? 'تم تحويل البلاغ للجهة المحددة بنجاح' : 'Report transferred successfully');
    const updated = reports.find((r) => r.id === selectedCase.id);
    if (updated) setSelectedCase(updated);
  };

  const handleOpenShareModal = (report: Report, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedCase(report);
    setShareReasonText(
      language === 'ar'
        ? 'تنسيق ميداني عاجل يستلزم إشراك بقية الجهات وغرف العمليات المجاورة'
        : 'Cross-jurisdiction field coordination'
    );
    setShareModalOpen(true);
  };

  const handleConfirmShare = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase) return;
    toggleShareReportWithNetwork(selectedCase.id, true, shareReasonText);
    setShareModalOpen(false);
    showToast(language === 'ar' ? 'تمت إتاحة البلاغ لكافة الجهات في الشبكة' : 'Report shared with network');
    const updated = reports.find((r) => r.id === selectedCase.id);
    if (updated) setSelectedCase(updated);
  };

  const handleRevokeShare = (report: Report, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    toggleShareReportWithNetwork(report.id, false);
    showToast(language === 'ar' ? 'تم إلغاء المشاركة — البلاغ محصور على فرعك فقط الآن' : 'Sharing revoked; local only');
    const updated = reports.find((r) => r.id === report.id);
    if (updated) setSelectedCase(updated);
  };

  const handleOpenFinishModal = (report: Report, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedCase(report);
    setFinishResolutionNote(
      language === 'ar'
        ? 'تمت المعاينة والانتهاء من أعمال الإصلاح الميداني بالكامل وإعادة الحالة لطبيعتها.'
        : 'Inspection and field repairs finalized, restored to normal.'
    );
    setFinishModalOpen(true);
  };

  const handleConfirmFinish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase) return;
    markReportFinished(selectedCase.id, finishResolutionNote);
    setFinishModalOpen(false);
    showToast(language === 'ar' ? 'خلاص البلاغ ده خلص — تم إغلاقه بنجاح' : 'Report finished & closed');
    const updated = reports.find((r) => r.id === selectedCase.id);
    if (updated) setSelectedCase(updated);
  };

  const handleAddInternalNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase || !internalNoteInput.trim()) return;
    addInternalNote(selectedCase.id, internalNoteInput.trim());
    setInternalNoteInput('');
    showToast(language === 'ar' ? 'تمت إضافة مذكرة الفحص بنجاح' : 'Internal note recorded');
  };

  const handleSendClarificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase || !clarificationInput.trim()) return;
    addClarificationMessage(selectedCase.id, clarificationInput.trim(), 'authority');
    setClarificationInput('');
    showToast(language === 'ar' ? 'تم إرسال استفسار الاستيضاح للمواطن' : 'Clarification sent');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Toast Alert */}
      {actionSuccessToast && (
        <div className="fixed top-20 right-6 left-6 sm:left-auto sm:w-96 z-50 p-4 bg-emerald-900 text-white rounded-xl shadow-2xl border border-emerald-500/40 flex items-center gap-3 animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{actionSuccessToast}</span>
        </div>
      )}

      {/* Top Banner: Strict Proximity Isolation Context & Fast Branch Switcher */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-400">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white flex items-center gap-2">
                <span>{language === 'ar' ? 'غرفة عمليات الجهة المختصة' : 'Authority Operations Console'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                  {language === 'ar' ? 'عزل مكاني مشفر' : 'Proximity Isolated'}
                </span>
              </h1>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
            {language === 'ar'
              ? 'مبدأ الخصوصية الصارم: كل بلاغ يذهب حصرياً لأقرب نقطة اختصاص ميدانية ولا يظهر لأي جهة أخرى إلا إذا قرر فرعكم تحويله أو إتاحته رسمياً.'
              : 'Strict Isolation Principle: each report routes exclusively to the nearest local unit and remains completely invisible to other authorities unless explicitly transferred or broadcast.'}
          </p>
        </div>

        {/* Current Officer Branch Context & Switcher (للتجربة السريعة بين الفروع) */}
        <div className="p-3 bg-slate-800/90 rounded-xl border border-slate-700 flex items-center gap-3 w-full md:w-auto">
          <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
          <div className="text-xs flex-1">
            <span className="text-slate-400 block text-[10px]">
              {language === 'ar' ? 'الفرع الميداني النشط حالياً:' : 'Your Active Branch:'}
            </span>
            <select
              value={activeBranch.id}
              onChange={(e) => {
                const found = branches.find((b) => b.id === e.target.value);
                if (found) setCurrentOfficerBranch(found);
              }}
              className="bg-slate-900 border border-slate-700 text-amber-300 font-bold text-xs rounded-lg px-2 py-1 mt-0.5 focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer"
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {language === 'ar' ? b.nameAr : b.nameEn}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Scoped Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Tab 1: Exclusive to My Branch */}
        <button
          onClick={() => setViewTab('exclusive')}
          className={`p-4 rounded-xl border transition-all text-start cursor-pointer ${
            viewTab === 'exclusive'
              ? 'bg-blue-50 border-blue-500 shadow-sm ring-2 ring-blue-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-blue-700 font-semibold mb-1">
            <span>{language === 'ar' ? 'بلاغات فرعي الحصرية' : 'Exclusive to My Branch'}</span>
            <Lock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-blue-900 font-mono tabular-nums">
            {exclusiveCount}
          </div>
          <div className="text-[10px] text-blue-600 font-medium mt-1">
            {language === 'ar' ? 'أقرب مكان — محجوبة عن الباقين' : 'Nearest point — private'}
          </div>
        </button>

        {/* Tab 2: Shared or Transferred to Me */}
        <button
          onClick={() => setViewTab('shared')}
          className={`p-4 rounded-xl border transition-all text-start cursor-pointer ${
            viewTab === 'shared'
              ? 'bg-purple-50 border-purple-400 shadow-sm ring-2 ring-purple-400/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-purple-700 font-semibold mb-1">
            <span>{language === 'ar' ? 'محولة أو مشتركة معي' : 'Shared / Transferred to Me'}</span>
            <Share2 className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-extrabold text-purple-900 font-mono tabular-nums">
            {sharedCount}
          </div>
          <div className="text-[10px] text-purple-600 font-medium mt-1">
            {language === 'ar' ? 'أتاحتها جهات أخرى للتنسيق' : 'Broadcasted by sisters'}
          </div>
        </button>

        {/* Tab 3: Finished / Resolved */}
        <button
          onClick={() => setViewTab('finished')}
          className={`p-4 rounded-xl border transition-all text-start cursor-pointer ${
            viewTab === 'finished'
              ? 'bg-emerald-50 border-emerald-500 shadow-sm ring-2 ring-emerald-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-emerald-800 font-semibold mb-1">
            <span>{language === 'ar' ? 'خلاص خلصت ✅' : 'Finished & Closed'}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-900 font-mono tabular-nums">
            {finishedCount}
          </div>
          <div className="text-[10px] text-emerald-700 font-bold mt-1">
            {language === 'ar' ? 'تمت المعاينة والإصلاح' : 'Resolved cases'}
          </div>
        </button>

        {/* Security Isolation Status Card */}
        <div className="p-4 bg-slate-900 text-white rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-amber-400 font-semibold mb-1">
            <span>{language === 'ar' ? 'بروتوكول الحصر المكاني' : 'Spatial Security'}</span>
            <Shield className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-sm font-extrabold text-white mt-1">
            {language === 'ar' ? '🔒 عزل تام ومحكم' : '🔒 100% Isolated'}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 leading-tight">
            {language === 'ar' ? 'بقية الجهات لا تعلم بوجود البلاغ' : 'Other units blind to your cases'}
          </div>
        </div>
      </div>

      {/* Navigation Tabs and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs font-semibold">
          <button
            onClick={() => setViewTab('exclusive')}
            className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              viewTab === 'exclusive'
                ? 'bg-blue-600 text-white font-bold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>
              {language === 'ar'
                ? `واردة لفرعي الحصري (${activeBranch.nameAr})`
                : `My Branch Exclusive (${activeBranch.nameEn})`}
            </span>
            <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-white text-[10px] font-mono">{exclusiveCount}</span>
          </button>

          <button
            onClick={() => setViewTab('shared')}
            className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              viewTab === 'shared'
                ? 'bg-purple-700 text-white font-bold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'محولة أو مشتركة معي' : 'Shared / Transferred'}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-white text-[10px] font-mono">{sharedCount}</span>
          </button>

          <button
            onClick={() => setViewTab('finished')}
            className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              viewTab === 'finished'
                ? 'bg-emerald-700 text-white font-bold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'خلاص خلصت ✅' : 'Finished'}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-white text-[10px] font-mono">{finishedCount}</span>
          </button>

          <button
            onClick={() => setViewTab('map')}
            className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              viewTab === 'map'
                ? 'bg-slate-800 text-amber-400 font-bold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-amber-500" />
            <span>{language === 'ar' ? 'الخريطة الميدانية' : 'Map'}</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'ar' ? 'بحث بالرقم المرجعي أو العنوان...' : 'Search by ref, title...'}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Main Content Area */}
      {viewTab === 'map' ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="mb-3 text-xs text-slate-500 flex items-center justify-between">
            <span>
              {language === 'ar'
                ? `الخريطة تعرض فقط البلاغات المصرح لـ [${activeBranch.nameAr}] برؤيتها (${visibleReports.length} بلاغ). البلاغات الحصرية للفروع الأخرى معزولة تماماً.`
                : `Showing only cases authorized for [${activeBranch.nameEn}]. Other branches' cases are strictly hidden.`}
            </span>
          </div>
          <InteractiveMap
            mode="viewer"
            reports={visibleReports}
            onSelectReport={(repId) => {
              const found = reports.find((item) => item.id === repId);
              if (found) setSelectedCase(found);
            }}
            heightClass="h-[520px]"
          />
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReports.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-2">
              <Shield className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-700">
                {language === 'ar' ? 'لا توجد بلاغات في هذا القسم' : 'No reports in this category'}
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                {language === 'ar'
                  ? 'بفضل العزل المكاني، تقتصر شاشتك على البلاغات الواردة لأقرب نقطة تابعة لك أو ما تم تحويله لك رسمياً.'
                  : 'Due to proximity scoping, only reports disptached to your branch or officially shared with you appear here.'}
              </p>
            </div>
          ) : (
            filteredReports.map((report) => {
              const isMine = isReportExclusiveToMine(report);
              const finished = isReportFinished(report);
              const isShared = report.isSharedWithNetwork;

              return (
                <div
                  key={report.id}
                  onClick={() => setSelectedCase(report)}
                  className={`bg-white rounded-2xl border p-4 sm:p-5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                    finished
                      ? 'border-emerald-200 bg-emerald-50/20'
                      : isMine
                      ? 'border-blue-300 ring-1 ring-blue-500/20'
                      : 'border-purple-200 bg-purple-50/15'
                  }`}
                >
                  {/* Left Column: Badges & Details */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-extrabold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                        {report.referenceNo}
                      </span>

                      {/* Isolation Status Badge */}
                      {finished ? (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{language === 'ar' ? 'خلاص خلص (مغلق ومحلول)' : 'Finished & Closed'}</span>
                        </span>
                      ) : isMine ? (
                        isShared ? (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                            <Globe className="w-3.5 h-3.5 text-amber-600" />
                            <span>{language === 'ar' ? 'متاح للشبكة (قرر فرعكم إظهاره للتنسيق)' : 'Shared with Network'}</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-300 flex items-center gap-1">
                            <Lock className="w-3.5 h-3.5 text-blue-600" />
                            <span>{language === 'ar' ? '🔒 حصري لفرعك ومحجوب عن باقي الجهات' : '🔒 Proximity Exclusive (Hidden to Others)'}</span>
                          </span>
                        )
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-900 border border-purple-300 flex items-center gap-1">
                          <Share2 className="w-3.5 h-3.5 text-purple-600" />
                          <span>
                            {language === 'ar'
                              ? `مشترك من: [${report.assignedBranchNameAr || 'جهة أخرى'}]`
                              : `Shared from: [${report.assignedBranchNameEn || 'Sister Branch'}]`}
                          </span>
                        </span>
                      )}

                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                        {formatSeverity(report.severity, language)}
                      </span>

                      {report.distanceToBranchKm !== undefined && (
                        <span className="text-[11px] text-slate-500 font-mono">
                          📍 {report.distanceToBranchKm} {language === 'ar' ? 'كم من موقع الفرع' : 'km away'}
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {language === 'en' && report.titleEn ? report.titleEn : report.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {language === 'en' && report.location?.cityDistrictEn ? report.location.cityDistrictEn : (report.location?.cityDistrict || '—')}
                          {report.location?.streetLandmark ? ` — ${language === 'en' && report.location?.streetLandmarkEn ? report.location.streetLandmarkEn : report.location.streetLandmark}` : ''}
                        </span>
                      </span>
                      <span>•</span>
                      <span>{report.dateOccurred} ({report.timeOccurred})</span>
                    </div>
                  </div>

                  {/* Right Column: Controlled Authority Actions */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                    {/* Share / Revoke Sharing Toggle Button */}
                    {!finished && isMine && (
                      isShared ? (
                        <button
                          type="button"
                          onClick={(e) => handleRevokeShare(report, e)}
                          className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold rounded-lg border border-amber-300 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                          title={language === 'ar' ? 'إلغاء المشاركة وإعادة الحصر على فرعي فقط' : 'Revoke sharing'}
                        >
                          <EyeOff className="w-3.5 h-3.5 text-amber-700" />
                          <span>{language === 'ar' ? 'حصر على فرعي فقط' : 'Make Private'}</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => handleOpenShareModal(report, e)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-blue-100 text-blue-900 text-xs font-bold rounded-lg border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                          title={language === 'ar' ? 'إظهار ومشاركة البلاغ مع بقية الجهات للتنسيق' : 'Share with network'}
                        >
                          <Globe className="w-3.5 h-3.5 text-blue-600" />
                          <span>{language === 'ar' ? 'مشاركة مع الجهات' : 'Share to Network'}</span>
                        </button>
                      )
                    )}

                    {/* Transfer Button */}
                    {!finished && (
                      <button
                        type="button"
                        onClick={(e) => handleOpenTransferModal(report, e)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-amber-100 hover:text-amber-900 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        title={language === 'ar' ? 'تحويل البلاغ لجهة أخرى' : 'Transfer'}
                      >
                        <Share2 className="w-3.5 h-3.5 text-amber-600" />
                        <span>{language === 'ar' ? 'تحويل لجهة ثانية' : 'Transfer'}</span>
                      </button>
                    )}

                    {/* Mark as Finished ("خلاص البلاغ ده خلص") */}
                    {!finished && (
                      <button
                        type="button"
                        onClick={(e) => handleOpenFinishModal(report, e)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow transition-colors flex items-center gap-1.5 cursor-pointer"
                        title={language === 'ar' ? 'خلاص البلاغ ده خلص (إنهاء وإغلاق)' : 'Finish & Close'}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{language === 'ar' ? 'خلاص خلص (إغلاق)' : 'Finish'}</span>
                      </button>
                    )}

                    {/* Inspect Button */}
                    <button
                      type="button"
                      onClick={() => setSelectedCase(report)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span>{language === 'ar' ? 'المعاينة' : 'Inspect'}</span>
                      <Arrow className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Share with Network Modal */}
      {shareModalOpen && selectedCase && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in"
          onClick={() => setShareModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
          >
            <div className="bg-blue-900 text-white px-6 py-4 flex items-center justify-between border-b border-blue-800">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm">
                  {language === 'ar' ? 'إظهار ومشاركة البلاغ لبقية الجهات' : 'Share Report with Network'}
                </h3>
              </div>
              <button
                onClick={() => setShareModalOpen(false)}
                className="p-1 text-blue-200 hover:text-white rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmShare} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-1 text-blue-950">
                <span className="font-bold block">
                  {language === 'ar' ? 'البلاغ المستهدف:' : 'Report:'}{' '}
                  <span className="font-mono text-blue-900">{selectedCase.referenceNo}</span>
                </span>
                <p className="text-[11px] text-blue-800">{selectedCase.title}</p>
                <div className="text-[11px] text-blue-900 pt-1 font-semibold">
                  {language === 'ar'
                    ? '🔒 تنبيه: البلاغ حالياً محجوب تماماً عن بقية الجهات. عند تأكيد المشاركة، سيصبح مرئياً لغرف العمليات المجاورة لدعم التنسيق الميداني.'
                    : 'Notice: This report is currently hidden from other authorities. Sharing will make it visible across the operations network.'}
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-800">
                  {language === 'ar' ? 'سبب المشاركة ومذكرة التنسيق:' : 'Reason for Network Sharing:'}
                </label>
                <textarea
                  rows={3}
                  value={shareReasonText}
                  onChange={(e) => setShareReasonText(e.target.value)}
                  placeholder={language === 'ar' ? 'اكتب مبرر إشراك بقية الجهات...' : 'Reason...'}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShareModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl shadow cursor-pointer flex items-center gap-1.5"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>{language === 'ar' ? 'تأكيد الإظهار للجهات' : 'Confirm Network Sharing'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer to Sister Branch Modal */}
      {transferModalOpen && selectedCase && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in"
          onClick={() => setTransferModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
          >
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm">
                  {language === 'ar' ? 'تحويل البلاغ لجهة أخرى' : 'Transfer Report to Sister Authority'}
                </h3>
              </div>
              <button
                onClick={() => setTransferModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmTransfer} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1 text-amber-950">
                <span className="font-bold block">
                  {language === 'ar' ? 'البلاغ المحال:' : 'Target Case:'}{' '}
                  <span className="font-mono text-amber-900">{selectedCase.referenceNo}</span>
                </span>
                <p className="text-[11px] text-amber-800">{selectedCase.title}</p>
                <div className="text-[11px] font-bold text-amber-900 pt-1">
                  {language === 'ar' ? 'الجهة المحيلة حالياً:' : 'Current Assignee:'}{' '}
                  {activeBranch.nameAr}
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-800">
                  {language === 'ar' ? 'الجهة المطلوب التحويل إليها:' : 'Target Authority Branch:'}
                </label>
                <select
                  value={transferTargetBranchId}
                  onChange={(e) => setTransferTargetBranchId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 cursor-pointer"
                >
                  {branches
                    .filter((b) => b.id !== selectedCase.assignedBranchId)
                    .map((b) => (
                      <option key={b.id} value={b.id}>
                        {language === 'ar' ? b.nameAr : b.nameEn} ({b.district})
                      </option>
                    ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-800">
                  {t('transferReason', language)}
                </label>
                <textarea
                  rows={3}
                  value={transferReasonText}
                  onChange={(e) => setTransferReasonText(e.target.value)}
                  placeholder={language === 'ar' ? 'اكتب سبب التحويل ومذكرة التنسيق...' : 'Reason for transfer...'}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setTransferModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shadow cursor-pointer flex items-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{t('confirmTransfer', language)}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Finish Report ("خلاص البلاغ ده خلص") Modal */}
      {finishModalOpen && selectedCase && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in"
          onClick={() => setFinishModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
          >
            <div className="bg-emerald-900 text-white px-6 py-4 flex items-center justify-between border-b border-emerald-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm">
                  {language === 'ar' ? 'إنهاء وإغلاق البلاغ رسمياً (خلاص البلاغ ده خلص)' : 'Finish & Close Report'}
                </h3>
              </div>
              <button
                onClick={() => setFinishModalOpen(false)}
                className="p-1 text-emerald-200 hover:text-white rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmFinish} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1 text-emerald-950">
                <span className="font-bold block">
                  {language === 'ar' ? 'البلاغ المنجز:' : 'Report:'}{' '}
                  <span className="font-mono text-emerald-900">{selectedCase.referenceNo}</span>
                </span>
                <p className="text-[11px] text-emerald-800">{selectedCase.title}</p>
                <div className="text-[11px] font-bold text-emerald-900 pt-1">
                  {language === 'ar' ? 'الجهة القائمة بالإغلاق:' : 'Closing Branch:'}{' '}
                  {activeBranch.nameAr}
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-800">
                  {language === 'ar' ? 'بيان الأعمال المنجزة ومذكرة الإغلاق:' : 'Resolution & Closure Statement:'}
                </label>
                <textarea
                  rows={3}
                  value={finishResolutionNote}
                  onChange={(e) => setFinishResolutionNote(e.target.value)}
                  placeholder={language === 'ar' ? 'تفاصيل ما تم تنفيذه على أرض الواقع...' : 'Field resolution details...'}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setFinishModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  {language === 'ar' ? 'تراجع' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{language === 'ar' ? 'تأكيد الإنهاء والإغلاق (خلاص خلص)' : 'Confirm Finish & Close'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Case Details Drawer */}
      {selectedCase && !transferModalOpen && !finishModalOpen && !shareModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/60 backdrop-blur-xs animate-in fade-in"
          onClick={() => setSelectedCase(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl h-full bg-white shadow-2xl flex flex-col overflow-hidden text-xs"
          >
            {/* Drawer Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-extrabold text-amber-400">
                  {selectedCase.referenceNo}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                  {formatStatus(selectedCase.status, language)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => printReportReceipt(selectedCase)}
                  className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3 h-3" />
                  <span>{language === 'ar' ? 'إيصال رسمي' : 'Receipt'}</span>
                </button>
                <button
                  onClick={() => setSelectedCase(null)}
                  className="p-1 text-slate-400 hover:text-white rounded cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Drawer Scrollable Content */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              {/* Proximity Isolation Banner */}
              <div
                className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  isReportFinished(selectedCase)
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : isReportExclusiveToMine(selectedCase)
                    ? 'bg-blue-50 border-blue-300 text-blue-950'
                    : 'bg-purple-50 border-purple-300 text-purple-950'
                }`}
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider block text-slate-500">
                    {language === 'ar' ? 'حالة التوجيه والعزل المكاني:' : 'Proximity Dispatch Status:'}
                  </span>
                  <div className="font-extrabold text-sm mt-0.5 flex items-center gap-1.5">
                    {isReportFinished(selectedCase) ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>
                          {language === 'ar'
                            ? `خلاص البلاغ ده خلص — مغلق بواسطة [${selectedCase.completedByBranchAr || activeBranch.nameAr}]`
                            : `Finished & Closed by [${selectedCase.completedByBranchAr || activeBranch.nameEn}]`}
                        </span>
                      </>
                    ) : isReportExclusiveToMine(selectedCase) ? (
                      selectedCase.isSharedWithNetwork ? (
                        <>
                          <Globe className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>
                            {language === 'ar'
                              ? `متاح للشبكة (قرر فرعكم [${activeBranch.nameAr}] إظهاره للتنسيق)`
                              : `Broadcast to Network`}
                          </span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4 text-blue-600 shrink-0" />
                          <span>
                            {language === 'ar'
                              ? `🔒 محصور على فرعك [${activeBranch.nameAr}] فقط ولا يعلم عنه أحد سواكم`
                              : `🔒 Proximity Exclusive to [${activeBranch.nameEn}]`}
                          </span>
                        </>
                      )
                    ) : (
                      <>
                        <Share2 className="w-4 h-4 text-purple-600 shrink-0" />
                        <span>
                          {language === 'ar'
                            ? `مشترك من فرع: [${selectedCase.assignedBranchNameAr || 'جهة أخرى'}]`
                            : `Shared from: [${selectedCase.assignedBranchNameEn || 'Sister Branch'}]`}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Direct quick action buttons */}
                {!isReportFinished(selectedCase) && (
                  <div className="flex items-center gap-1.5 shrink-0 pt-2 sm:pt-0">
                    {isReportExclusiveToMine(selectedCase) && (
                      selectedCase.isSharedWithNetwork ? (
                        <button
                          type="button"
                          onClick={(e) => handleRevokeShare(selectedCase, e)}
                          className="px-2.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold rounded-lg border border-amber-300 transition-colors flex items-center gap-1"
                        >
                          <EyeOff className="w-3 h-3 text-amber-800" />
                          <span>{language === 'ar' ? 'إلغاء الإتاحة' : 'Make Private'}</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleOpenShareModal(selectedCase)}
                          className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-2xs transition-colors flex items-center gap-1"
                        >
                          <Globe className="w-3 h-3" />
                          <span>{language === 'ar' ? 'إظهار للجهات' : 'Share'}</span>
                        </button>
                      )
                    )}

                    <button
                      type="button"
                      onClick={() => handleOpenTransferModal(selectedCase)}
                      className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-800 font-bold rounded-lg border border-slate-300 shadow-2xs transition-colors flex items-center gap-1"
                    >
                      <Share2 className="w-3 h-3 text-amber-600" />
                      <span>{language === 'ar' ? 'تحويل' : 'Transfer'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenFinishModal(selectedCase)}
                      className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg shadow-2xs transition-colors flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" />
                      <span>{language === 'ar' ? 'إغلاق البلاغ' : 'Finish'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Title and details */}
              <div className="space-y-1">
                <h2 className="text-base font-bold text-slate-900 leading-snug">
                  {language === 'en' && selectedCase.titleEn ? selectedCase.titleEn : selectedCase.title}
                </h2>
                <div className="text-xs text-slate-500">
                  {language === 'en' && selectedCase.location?.cityDistrictEn ? selectedCase.location.cityDistrictEn : (selectedCase.location?.cityDistrict || '—')}
                  {selectedCase.location?.streetLandmark ? ` — ${language === 'en' && selectedCase.location?.streetLandmarkEn ? selectedCase.location.streetLandmarkEn : selectedCase.location.streetLandmark}` : ''}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 leading-relaxed">
                {language === 'en' && selectedCase.descriptionEn ? selectedCase.descriptionEn : selectedCase.description}
              </div>

              {/* Citizen Contact & Field Location Details (Visible to Authority) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-blue-50/80 border border-blue-200 rounded-xl text-xs">
                {/* Citizen Information */}
                <div className="space-y-1.5">
                  <div className="font-extrabold text-blue-950 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-700" />
                    <span>{language === 'ar' ? 'بيانات المواطن المبلّغ:' : 'Reporter Details:'}</span>
                  </div>
                  <div className="text-slate-800 font-bold">
                    {selectedCase.reporter?.fullName || (language === 'ar' ? 'مواطن / مقيم' : 'Citizen')}
                  </div>
                  {selectedCase.reporter?.phone && (
                    <div className="flex items-center gap-2 pt-0.5">
                      <span className="text-[11px] text-slate-500">{language === 'ar' ? 'رقم الهاتف:' : 'Phone:'}</span>
                      <a
                        href={`tel:${selectedCase.reporter.phone}`}
                        className="font-mono font-extrabold text-emerald-800 hover:text-emerald-950 bg-emerald-100/80 px-2 py-0.5 rounded border border-emerald-300 flex items-center gap-1"
                        dir="ltr"
                      >
                        <PhoneCall className="w-3 h-3 text-emerald-600" />
                        <span>{selectedCase.reporter.phone}</span>
                      </a>
                    </div>
                  )}
                  {selectedCase.reporter?.identityType && (
                    <div className="text-[10px] text-slate-600">
                      {language === 'ar' ? 'نوع الهوية: ' : 'Identity: '}
                      <span className="font-semibold text-blue-900">
                        {selectedCase.reporter.identityType === 'verified'
                          ? language === 'ar' ? 'هوية موثقة' : 'Verified'
                          : language === 'ar' ? 'هوية محمية' : 'Protected'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Field Location */}
                <div className="space-y-1.5 border-t sm:border-t-0 sm:border-r border-blue-200/80 sm:pr-3">
                  <div className="font-extrabold text-blue-950 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-700" />
                    <span>{language === 'ar' ? 'الموقع الجغرافي للمعاينة الميدانية:' : 'Field Inspection Location:'}</span>
                  </div>
                  <div className="text-slate-800 font-bold">
                    {selectedCase.location?.cityDistrict || (language === 'ar' ? 'نطاق جغرافي عام' : 'General Area')}
                    {selectedCase.location?.streetLandmark ? ` — ${selectedCase.location.streetLandmark}` : ''}
                  </div>
                  <div className="text-[11px] text-slate-600 font-mono flex items-center gap-1">
                    <span>GPS:</span>
                    <span className="bg-white/80 px-1.5 py-0.5 rounded border border-blue-200">
                      {selectedCase.location?.lat.toFixed(4)}, {selectedCase.location?.lng.toFixed(4)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Attachments Privacy Shield / Admin-Only Access */}
              {selectedCase.attachments && selectedCase.attachments.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                    <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-amber-600" />
                      <span>{language === 'ar' ? 'الأدلة والمرفقات التوثيقية' : 'Evidence & Documentation'}</span>
                      <span className="text-xs text-slate-500 font-normal">({selectedCase.attachments.length})</span>
                    </h4>
                    <span className="text-[10px] text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-300">
                      {language === 'ar' ? 'الخزنة الجنائية المشفرة (500MB)' : 'Encrypted Video Vault'}
                    </span>
                  </div>

                  {currentUser.role === 'admin' ? (
                    /* Admin has full access to photos & videos */
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedCase.attachments.map((att) => (
                        <div key={att.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                          <div className="flex items-center gap-2 truncate">
                            {att.type === 'video' ? (
                              <Film className="w-4 h-4 text-amber-600 shrink-0" />
                            ) : (
                              <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                            )}
                            <span className="truncate font-bold text-slate-900">{att.name}</span>
                          </div>

                          {att.type === 'video' && (
                            <div className="space-y-1.5">
                              <div className="rounded-lg overflow-hidden bg-black aspect-video flex items-center justify-center">
                                <video
                                  src={att.videoStorageId ? `/api/videos/stream/${att.videoStorageId}` : att.url}
                                  controls
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                                <span className="text-emerald-700 font-bold">
                                  {language === 'ar' ? '✓ تدفق HTTP 206 مباشر' : '✓ Live HTTP 206 Stream'}
                                </span>
                                <span className="truncate max-w-[120px]">{att.videoStorageId || 'vid_vault'}</span>
                              </div>
                            </div>
                          )}

                          {att.type === 'image' && (
                            <img src={att.url} alt={att.name} className="w-full h-28 object-cover rounded-lg" />
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* Regular Authority Branch: Privacy Shield protects sensitive media */
                    <div className="p-4 bg-gradient-to-br from-amber-50/80 via-slate-50 to-amber-100/50 border border-amber-300/80 rounded-2xl space-y-2 text-start">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-amber-950 font-extrabold text-xs">
                          <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>{language === 'ar' ? '🔒 المرفقات الحساسة (الصور والفيديوهات) محمية ببروتوكول الخصوصية' : '🔒 Sensitive Photos & Videos Protected'}</span>
                        </div>
                        <span className="text-[10px] bg-amber-200/80 text-amber-900 font-bold px-2 py-0.5 rounded border border-amber-300">
                          {language === 'ar' ? 'صلاحية الأدمن بانل فقط' : 'Admin Panel Only'}
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed">
                        {language === 'ar'
                          ? `يحتوي هذا البلاغ على عدد (${selectedCase.attachments.length}) من الأدلة المرفقة (صور/فيديوهات). حمايةً لحرمة الحياة الخاصة للمواطنين ومنع تداول الصور الشخصية بين الفروع الميدانية، تكون المعاينة الكاملة للصور ومقاطع الفيديو التوثيقية متاحة حصرياً للمشرف العام عبر لوحة التحكم المركزية (الأدمن بانل).`
                          : `This case contains (${selectedCase.attachments.length}) sensitive photo/video attachments. Under privacy regulations, media preview is strictly limited to the Central Admin Panel.`}
                      </p>

                      <div className="pt-2 border-t border-amber-200/70 flex flex-wrap items-center justify-between gap-2 text-[11px] text-amber-900">
                        <div className="flex items-center gap-1.5 font-medium">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{language === 'ar' ? 'الأدلة الجنائية محفوظة ومؤمنة في الخزنة المركزية المشفرة' : 'Forensic chain-of-custody preserved in secure vault'}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveView('admin_dashboard')}
                          className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-colors cursor-pointer text-[10px]"
                        >
                          {language === 'ar' ? 'فتح لوحة المشرف العام (الأدمن)' : 'Open Admin Panel'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Status Timeline */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-1">
                  {language === 'ar' ? 'مسار الفحص والتحويلات الميدانية' : 'Progress & Branch Transfer Log'}
                </h4>
                <div className="space-y-2">
                  {selectedCase.statusTimeline.map((tl) => (
                    <div
                      key={tl.id}
                      className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 space-y-0.5 text-[11px]"
                    >
                      <div className="flex items-center justify-between text-slate-500 font-semibold">
                        <span className="font-bold text-slate-800">
                          {formatStatus(tl.status, language)}
                        </span>
                        <span>{new Date(tl.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed">
                        {language === 'ar' ? tl.noteAr : tl.noteEn}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Internal Notes */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-1">
                  {language === 'ar' ? 'مذكرات الفحص الميداني الداخلية' : 'Internal Inspection Notes'}
                </h4>

                {selectedCase.internalNotes.length > 0 ? (
                  <div className="space-y-1.5">
                    {selectedCase.internalNotes.map((inNote) => (
                      <div key={inNote.id} className="p-2.5 bg-amber-50/60 border border-amber-200 rounded-lg">
                        <div className="font-bold text-amber-900 text-[11px] mb-0.5">
                          {inNote.authorName} ({inNote.departmentName})
                        </div>
                        <div className="text-slate-700 text-[11px] leading-relaxed">{inNote.note}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-xs">{language === 'ar' ? 'لا توجد مذكرات داخلية حتى الآن.' : 'No notes yet.'}</p>
                )}

                <form onSubmit={handleAddInternalNoteSubmit} className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={internalNoteInput}
                    onChange={(e) => setInternalNoteInput(e.target.value)}
                    placeholder={language === 'ar' ? 'أضف مذكرة فحص ميدانية جديدة...' : 'Add inspection note...'}
                    className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{language === 'ar' ? 'إضافة' : 'Add'}</span>
                  </button>
                </form>
              </div>

              {/* Clarification with Citizen */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-1">
                  {language === 'ar' ? 'استيضاحات موجهة للمواطن' : 'Citizen Inquiries'}
                </h4>

                {selectedCase.clarificationMessages.length > 0 ? (
                  <div className="space-y-1.5">
                    {selectedCase.clarificationMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`p-2.5 rounded-lg border text-[11px] ${
                          msg.sender === 'authority'
                            ? 'bg-blue-50 border-blue-200 text-blue-900'
                            : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        }`}
                      >
                        <div className="font-bold mb-0.5">{msg.senderName}</div>
                        <div>{msg.content}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-xs">{language === 'ar' ? 'لم يتم إرسال أي استفسار للمواطن.' : 'No inquiries sent yet.'}</p>
                )}

                <form onSubmit={handleSendClarificationSubmit} className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={clarificationInput}
                    onChange={(e) => setClarificationInput(e.target.value)}
                    placeholder={language === 'ar' ? 'اكتب استفساراً استيضاحياً للمواطن...' : 'Ask citizen...'}
                    className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{language === 'ar' ? 'إرسال' : 'Send'}</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
