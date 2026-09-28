import React from 'react';
import { Power, RotateCcw, ShieldCheck, XCircle, CheckCircle2, Lock } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AppExitedView: React.FC = () => {
  const { language, setActiveView } = useApp();

  const handleCloseTab = () => {
    try {
      window.close();
    } catch (e) {
      // Ignored if browser blocks window.close
    }
  };

  const handleRestart = () => {
    setActiveView('home');
    window.location.hash = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      dir={language === 'ar' ? 'rtl' : 'ltr'}
      className="min-h-screen w-full bg-slate-950 text-white flex flex-col items-center justify-center p-4 sm:p-6 select-none font-sans relative overflow-hidden"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 max-w-lg w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-2xl backdrop-blur-md animate-in zoom-in-95">
        {/* System Shutdown / Exit Icon */}
        <div className="w-20 h-20 rounded-3xl bg-rose-500/15 border-2 border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto shadow-lg shadow-rose-950/50">
          <Power className="w-10 h-10" />
        </div>

        {/* Status Headings */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/70 border border-rose-800 text-rose-300 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span>{language === 'ar' ? 'تم إنهاء الجلسة وإغلاق النظام' : 'System Terminated & Closed'}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {language === 'ar' ? 'تم الخروج من البرمجية بنجاح' : 'You Have Exited The Software'}
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm mx-auto">
            {language === 'ar'
              ? 'تم إغلاق كافة الشاشات وإنهاء جلسة العمل بأمان. يمكنك الآن إغلاق علامة تبويب المتصفح.'
              : 'All active screens and sessions have been safely shut down. You may now close your browser tab.'}
          </p>
        </div>

        {/* Security & Data Assurance Card */}
        <div className="p-4 bg-slate-950/80 border border-slate-800/90 rounded-2xl text-start space-y-2 text-xs text-slate-300">
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{language === 'ar' ? 'حفظ البيانات وسرية السجلات' : 'Data Integrity & Privacy'}</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed pr-6 rtl:pr-6 rtl:pl-0 pl-6">
            {language === 'ar'
              ? 'تم تأمين وتشفير جميع البلاغات المرفوعة، ومسح بيانات الجلسة المؤقتة لحماية الخصوصية.'
              : 'All submitted reports remain securely archived and temporary session traces cleared.'}
          </p>
        </div>

        {/* Control Actions */}
        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={handleCloseTab}
            className="w-full py-3 px-5 bg-rose-600 hover:bg-rose-500 active:scale-98 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-rose-950/50 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <XCircle className="w-4 h-4" />
            <span>{language === 'ar' ? 'إغلاق نافذة / تبويب المتصفح' : 'Close Browser Tab'}</span>
          </button>

          <button
            type="button"
            onClick={handleRestart}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 active:scale-98 text-slate-200 hover:text-white font-bold text-xs rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            <span>{language === 'ar' ? 'إعادة تشغيل البرمجية من جديد' : 'Relaunch Application'}</span>
          </button>
        </div>

        {/* Platform Signature */}
        <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-center gap-1.5 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-500/70" />
          <span>{language === 'ar' ? 'عين مصر - منصة البلاغات المدنية والسلامة العامة' : 'Ain Masr Civic Platform'}</span>
        </div>
      </div>
    </div>
  );
};
