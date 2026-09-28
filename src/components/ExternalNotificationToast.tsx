import React from 'react';
import {
  Bell,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  X,
  Building,
  Navigation,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ExternalNotificationToast: React.FC = () => {
  const {
    language,
    externalToast,
    dismissExternalToast,
    setActiveView,
    setSelectedReportId,
    reports,
  } = useApp();

  if (!externalToast) return null;

  const Arrow = language === 'ar' ? ArrowLeft : ArrowRight;

  const handleOpenReport = () => {
    if (externalToast.reportRef) {
      const found = reports.find((r) => r.referenceNo === externalToast.reportRef);
      if (found) {
        setSelectedReportId(found.id);
      }
      setActiveView('track_report');
      dismissExternalToast();
    }
  };

  const getBorderAndBg = () => {
    switch (externalToast.type) {
      case 'resolved':
        return 'border-emerald-500 bg-slate-900 text-white shadow-emerald-950/40 ring-2 ring-emerald-500/30';
      case 'branch_transfer':
        return 'border-amber-500 bg-slate-900 text-white shadow-amber-950/40 ring-2 ring-amber-500/30';
      case 'nearest_routing':
        return 'border-blue-500 bg-slate-900 text-white shadow-blue-950/40 ring-2 ring-blue-500/30';
      default:
        return 'border-amber-400 bg-slate-900 text-white shadow-slate-950/50';
    }
  };

  const getIcon = () => {
    switch (externalToast.type) {
      case 'resolved':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 animate-bounce" />;
      case 'branch_transfer':
        return <Building className="w-5 h-5 text-amber-400 shrink-0 animate-pulse" />;
      case 'nearest_routing':
        return <Navigation className="w-5 h-5 text-blue-400 shrink-0 animate-pulse" />;
      default:
        return <Bell className="w-5 h-5 text-amber-400 shrink-0 animate-pulse" />;
    }
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed bottom-20 sm:bottom-6 right-4 left-4 sm:left-auto sm:right-6 sm:w-[420px] z-50 animate-in slide-in-from-bottom-5 duration-300 pointer-events-auto"
    >
      <div
        className={`rounded-2xl border p-4 shadow-2xl transition-all flex flex-col gap-3 ${getBorderAndBg()}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700">
              {getIcon()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold px-1.5 py-0.5 rounded bg-amber-400/10 border border-amber-400/20">
                  {language === 'ar' ? 'تنبيه فوري مباشر' : 'Live System Notice'}
                </span>
                {externalToast.branchNameAr && (
                  <span className="text-[11px] font-bold text-slate-300 truncate max-w-[160px]">
                    📍 {externalToast.branchNameAr}
                  </span>
                )}
              </div>
              <h4 className="text-sm font-bold text-white mt-1">
                {language === 'ar' ? externalToast.titleAr : externalToast.titleEn}
              </h4>
            </div>
          </div>

          <button
            onClick={dismissExternalToast}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Dismiss alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          {language === 'ar' ? externalToast.messageAr : externalToast.messageEn}
        </p>

        {externalToast.reportRef && (
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <span className="font-mono text-xs text-amber-300 font-bold">
              {externalToast.reportRef}
            </span>
            <button
              onClick={handleOpenReport}
              className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>{language === 'ar' ? 'معاينة البلاغ' : 'View Report'}</span>
              <Arrow className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
