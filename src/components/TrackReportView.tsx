import React, { useState, useEffect } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  Building,
  MessageSquare,
  Send,
  AlertCircle,
  FileText,
  Star,
  XCircle,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Phone,
  Printer,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { t, formatStatus, formatSeverity } from '../locales/i18n';
import { GOVERNORATES } from '../data/mockData';

export const TrackReportView: React.FC = () => {
  const {
    language,
    reports,
    departments,
    categories,
    selectedReportId,
    setSelectedReportId,
    addClarificationMessage,
    withdrawReport,
    submitReportRating,
    printReportReceipt,
    setActiveView,
  } = useApp();

  const Arrow = language === 'ar' ? ArrowLeft : ArrowRight;

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeReportId, setActiveReportId] = useState<string | null>(selectedReportId || null);
  const [replyText, setReplyText] = useState<string>('');
  const [withdrawModalOpen, setWithdrawModalOpen] = useState<boolean>(false);
  const [withdrawReason, setWithdrawReason] = useState<string>('');
  const [ratingStars, setRatingStars] = useState<number>(5);
  const [ratingComment, setRatingComment] = useState<string>('');
  const [ratingSubmitted, setRatingSubmitted] = useState<boolean>(false);

  // If a report is selected in context, load it
  useEffect(() => {
    if (selectedReportId) {
      setActiveReportId(selectedReportId);
      const rep = reports.find((r) => r.id === selectedReportId);
      if (rep) setSearchQuery(rep.referenceNo);
    }
  }, [selectedReportId, reports]);

  const activeReport = reports.find(
    (r) =>
      r.id === activeReportId ||
      r.referenceNo.trim().toUpperCase() === searchQuery.trim().toUpperCase()
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const found = reports.find(
      (r) => r.referenceNo.trim().toUpperCase() === searchQuery.trim().toUpperCase()
    );
    if (found) {
      setActiveReportId(found.id);
      setSelectedReportId(found.id);
    } else {
      setActiveReportId(null);
    }
  };

  const handleSendClarification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReport || !replyText.trim()) return;
    addClarificationMessage(activeReport.id, replyText.trim(), 'citizen');
    setReplyText('');
  };

  const handleConfirmWithdraw = () => {
    if (!activeReport || !withdrawReason.trim()) return;
    withdrawReport(activeReport.id, withdrawReason.trim());
    setWithdrawModalOpen(false);
    setWithdrawReason('');
  };

  const handleRatingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReport) return;
    submitReportRating(activeReport.id, ratingStars, ratingComment);
    setRatingSubmitted(true);
  };

  const assignedDept = activeReport
    ? departments.find((d) => d.id === activeReport.assignedDepartmentId)
    : null;

  const currentCat = activeReport
    ? categories.find((c) => c.id === activeReport.categoryId)
    : null;

  const gov = activeReport
    ? GOVERNORATES.find((g) => g.id === activeReport.location.governorateId)
    : null;

  return (
    <div className="w-full max-w-4xl mx-auto px-3.5 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8 min-w-0 overflow-x-clip">
      {/* Header & Search Bar */}
      <div className="space-y-3 sm:space-y-4 w-full min-w-0">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-slate-900">
            {t('trackTitle', language)}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('trackDesc', language)}
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full min-w-0">
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 left-3 rtl:left-auto rtl:right-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('trackInputPlaceholder', language)}
              className="w-full pl-9 pr-3 rtl:pr-9 rtl:pl-3 py-2.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono min-w-0"
            />
          </div>
          <button
            type="submit"
            className="px-4 sm:px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shrink-0"
          >
            {t('trackBtn', language)}
          </button>
        </form>
      </div>

      {/* Active Report Details */}
      {activeReport ? (
        <div className="space-y-6 animate-fade-in w-full min-w-0">
          {/* Main Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-5 sm:space-y-6 w-full min-w-0">
            {/* Top row: Ref No & Status */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 w-full min-w-0">
              <div className="space-y-1 min-w-0 w-full sm:w-auto">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-slate-400 font-mono">
                    {t('referenceNo', language)}:
                  </span>
                  <span className="font-mono text-base sm:text-lg font-extrabold text-slate-900 tracking-wider tabular-nums break-all">
                    {activeReport.referenceNo}
                  </span>
                </div>
                <h2 className="text-sm sm:text-lg font-bold text-slate-900">
                  {language === 'en' && activeReport.titleEn ? activeReport.titleEn : activeReport.title}
                </h2>
              </div>

              <div className="flex items-center gap-2 flex-wrap shrink-0">
                <button
                  onClick={() => printReportReceipt(activeReport)}
                  className="px-2.5 sm:px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-md border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                  title={t('printReportReceipt', language)}
                >
                  <Printer className="w-3.5 h-3.5 text-amber-600" />
                  <span className="hidden sm:inline">{t('printReportReceipt', language)}</span>
                </button>
                <span className="px-2.5 sm:px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
                  {formatStatus(activeReport.status, language)}
                </span>
                {activeReport.status !== 'closed' && (
                  <button
                    onClick={() => setWithdrawModalOpen(true)}
                    className="text-xs text-slate-500 hover:text-rose-600 underline cursor-pointer"
                  >
                    {t('withdrawReportBtn', language)}
                  </button>
                )}
              </div>
            </div>

            {/* Metadata Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 text-xs text-slate-600 bg-slate-50 p-3.5 sm:p-4 rounded-xl">
              <div>
                <span className="text-slate-400 block">{t('category', language)}:</span>
                <span className="font-semibold text-slate-800">
                  {language === 'en'
                    ? (activeReport.customCategoryEn || currentCat?.nameEn || activeReport.customCategory || currentCat?.nameAr)
                    : (activeReport.customCategory || currentCat?.nameAr || currentCat?.nameEn)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">{t('severity', language)}:</span>
                <span className="font-semibold text-slate-800">
                  {formatSeverity(activeReport.severity, language)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">{t('governorate', language)}:</span>
                <span className="font-semibold text-slate-800">
                  {language === 'ar' ? gov?.nameAr : gov?.nameEn}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">{t('date', language)}:</span>
                <span className="font-semibold text-slate-800 tabular-nums">
                  {activeReport.dateOccurred} ({activeReport.timeOccurred})
                </span>
              </div>
            </div>

            {/* GPS & Location Precision Card */}
            <div className="p-3.5 bg-slate-900 text-white rounded-xl space-y-2 border border-slate-800 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="font-bold text-amber-300">
                    {language === 'ar' ? 'الإحداثيات الجغرافية الموثقة (GPS):' : 'GPS Coordinates Locked:'}
                  </span>
                  <span className="font-mono text-slate-200 tabular-nums">
                    [{activeReport.location.lat.toFixed(4)}° N, {activeReport.location.lng.toFixed(4)}° E]
                  </span>
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${activeReport.location?.lat || 30.0444},${activeReport.location?.lng || 31.2357}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 text-[11px] font-semibold rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5"
                >
                  <span>{language === 'ar' ? 'عرض على خرائط Google' : 'View on Google Maps'}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="text-[11px] text-slate-300 flex items-center gap-1.5">
                <span className="font-semibold text-slate-400">{language === 'ar' ? 'العنوان الميداني:' : 'Field Address:'}</span>
                <span>
                  {language === 'en' && activeReport.location?.cityDistrictEn ? activeReport.location.cityDistrictEn : (activeReport.location?.cityDistrict || '—')}
                  {activeReport.location?.streetLandmark ? ` — ${language === 'en' && activeReport.location?.streetLandmarkEn ? activeReport.location.streetLandmarkEn : activeReport.location.streetLandmark}` : ''}
                  {' '}({gov ? (language === 'ar' ? gov.nameAr : gov.nameEn) : ''})
                </span>
              </div>
            </div>

            {/* Assigned Department Info */}
            {assignedDept && (
              <div className="p-4 bg-blue-50/60 border border-blue-200/70 rounded-xl text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-700 shrink-0">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-slate-500 block">
                      {t('department', language)}:
                    </span>
                    <span className="font-bold text-slate-900 text-sm">
                      {language === 'ar' ? assignedDept.nameAr : assignedDept.nameEn}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-slate-600">
                  <div className="flex items-center gap-1 font-mono tabular-nums">
                    <Phone className="w-3.5 h-3.5 text-blue-600" />
                    <span>{assignedDept.hotline}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="space-y-1.5 text-xs text-slate-700">
              <span className="font-bold text-slate-900 block">
                {t('fieldDescription', language)}:
              </span>
              <p className="p-4 bg-slate-50 rounded-lg leading-relaxed text-slate-800">
                {language === 'en' && activeReport.descriptionEn ? activeReport.descriptionEn : activeReport.description}
              </p>
            </div>

            {/* Attached Evidence & Video Vault Stream */}
            {activeReport.attachments && activeReport.attachments.length > 0 && (
              <div className="space-y-2 pt-3 border-t border-slate-100">
                <span className="font-bold text-xs text-slate-900 block">
                  {language === 'ar' ? `المرفقات والأدلة الميدانية (${activeReport.attachments.length}):` : `Field Evidence & Media (${activeReport.attachments.length}):`}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeReport.attachments.map((att) => (
                    <div key={att.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                      <div className="flex items-center justify-between font-semibold text-slate-800">
                        <span className="truncate">{att.name}</span>
                        {att.type === 'video' && (
                          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-semibold">
                            {language === 'ar' ? 'فيديو مرفق' : 'Attached Video'}
                          </span>
                        )}
                      </div>
                      {att.type === 'video' ? (
                        <div className="rounded-lg overflow-hidden bg-slate-950 aspect-video flex items-center justify-center">
                          <video src={att.url} controls className="w-full h-full object-cover" />
                        </div>
                      ) : att.type === 'image' ? (
                        <div className="rounded-lg overflow-hidden bg-slate-200 h-28">
                          <img src={att.url} alt={att.name} className="w-full h-full object-cover" />
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Procedural Status Milestones Timeline */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>{t('trackingTimelineTitle', language)}</span>
            </h3>

            <div className="space-y-4 relative before:absolute before:inset-0 before:left-3 rtl:before:left-auto rtl:before:right-3 before:w-0.5 before:bg-slate-200 pl-8 rtl:pl-0 rtl:pr-8">
              {activeReport.statusTimeline.map((item, idx) => (
                <div key={item.id} className="relative text-xs space-y-1">
                  <div className="absolute -left-8 rtl:-left-auto rtl:-right-8 top-0.5 w-6 h-6 rounded-full bg-white border-2 border-amber-500 flex items-center justify-center font-bold text-[10px] text-slate-800">
                    {idx + 1}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">
                      {formatStatus(item.status, language)}
                    </span>
                    <span className="text-slate-400 font-mono text-[11px] tabular-nums">
                      {new Date(item.timestamp).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')}
                    </span>
                  </div>
                  <p className="text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    {language === 'ar' ? item.noteAr : item.noteEn}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Clarification Q&A Thread */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              <span>{t('clarificationSectionTitle', language)}</span>
            </h3>

            {activeReport.clarificationMessages.length > 0 ? (
              <div className="space-y-3">
                {activeReport.clarificationMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3.5 rounded-xl text-xs max-w-xl ${
                      msg.sender === 'authority'
                        ? 'bg-blue-50 border border-blue-200 text-blue-950 me-auto'
                        : 'bg-slate-100 border border-slate-200 text-slate-900 ms-auto'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-bold mb-1 opacity-80">
                      <span>{msg.senderName}</span>
                      <span className="font-mono tabular-nums">
                        {new Date(msg.timestamp).toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US')}
                      </span>
                    </div>
                    <p className="leading-relaxed">{msg.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">
                {language === 'ar'
                  ? 'لا توجد استفسارات أو طلبات إيضاح مطلوبة حالياً من الإدارة المعنية.'
                  : 'No clarifications requested by the inspecting authority at this moment.'}
              </p>
            )}

            {/* Send Reply Box */}
            <form onSubmit={handleSendClarification} className="pt-2 flex gap-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={t('replyPlaceholder', language)}
                className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={!replyText.trim()}
                className="px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{t('sendReplyBtn', language)}</span>
              </button>
            </form>
          </div>

          {/* Citizen Feedback Rating on Resolved Reports */}
          {activeReport.status === 'resolved' && (
            <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm p-6 space-y-4">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>{t('rateHandlingTitle', language)}</span>
              </h3>

              {ratingSubmitted || activeReport.userFeedback ? (
                <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{t('ratingThanks', language)}</span>
                </div>
              ) : (
                <form onSubmit={handleRatingSubmit} className="space-y-3 text-xs">
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRatingStars(star)}
                        className="cursor-pointer p-1"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= ratingStars
                              ? 'text-amber-500 fill-amber-500'
                              : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    value={ratingComment}
                    onChange={(e) => setRatingComment(e.target.value)}
                    placeholder={language === 'ar' ? 'تعليقك حول سرعة الاستجابة وجودة الحل (اختياري)...' : 'Feedback on speed and resolution quality (optional)...'}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none"
                  />

                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    {t('rateSubmitBtn', language)}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      ) : searchQuery ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="font-bold text-slate-900 text-sm">
            {t('trackNotFound', language)}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {language === 'ar'
              ? 'يرجى مراجعة الرقم المرجعي المطبوع في إيصال البلاغ والتأكد من إدخاله بدقة.'
              : 'Please check the reference number on your report receipt and verify it is entered accurately.'}
          </p>
        </div>
      ) : (
        <div className="p-8 sm:p-12 text-center bg-white rounded-3xl border border-slate-200/90 shadow-xs space-y-4 max-w-xl mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-400/40 text-amber-600 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                {language === 'ar' ? 'استعلام فوري وتتبع لحالة بلاغك' : 'Direct & Confidential Report Tracking'}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {language === 'ar'
                  ? 'أدخل الرقم المرجعي لبلاغك في خانة البحث أعلاه (مثال: EGY-2026-XXXX) للاطلاع على نتائج المعاينة الفنية وتوجيهات اللجان ومراحل الإصلاح.'
                  : 'Enter your unique tracking reference number above to check real-time technical updates.'}
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setActiveView('my_reports')}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span>{language === 'ar' ? 'عرض أرشيف بلاغاتي' : 'View My Submitted Reports'}</span>
              </button>
            </div>
          </div>
        )}

      {/* Withdrawal Modal */}
      {withdrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">
              {t('withdrawConfirmTitle', language)}
            </h3>
            <p className="text-xs text-slate-500">
              {t('withdrawConfirmDesc', language)}
            </p>
            <textarea
              rows={3}
              value={withdrawReason}
              onChange={(e) => setWithdrawReason(e.target.value)}
              placeholder={t('withdrawReasonPlaceholder', language)}
              className="w-full p-3 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setWithdrawModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-md cursor-pointer"
              >
                {t('cancelBtn', language)}
              </button>
              <button
                onClick={handleConfirmWithdraw}
                disabled={!withdrawReason.trim()}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-md cursor-pointer disabled:opacity-40"
              >
                {t('confirmWithdrawBtn', language)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
