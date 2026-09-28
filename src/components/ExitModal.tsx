import React from 'react';
import { LogOut, Home, RotateCcw, X, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface ExitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExitModal: React.FC<ExitModalProps> = ({ isOpen, onClose }) => {
  const { language, setActiveView, logout } = useApp();

  if (!isOpen) return null;

  const handleReturnHome = () => {
    setActiveView('home');
    onClose();
  };

  const handleFullExit = () => {
    logout();
    onClose();
    setActiveView('exit_screen');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95"
      >
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-rose-400">
              <LogOut className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">
                {language === 'ar' ? 'الخروج من البرمجية' : 'Exit Ain Masr'}
              </h2>
              <p className="text-xs text-slate-400">
                {language === 'ar' ? 'إنهاء جلسة العمل أو العودة للبداية' : 'Close Session or Return Home'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {language === 'ar'
              ? 'هل ترغب في إنهاء جلسة العمل الحالية والخروج بأمان، أم العودة إلى الشاشة الرئيسية للبرمجية؟'
              : 'Would you like to terminate your current session safely or return to the main introduction screen?'}
          </p>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] text-slate-600 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              {language === 'ar'
                ? 'يتم حفظ كافة البلاغات المسجلة في السجل بأمان، ويمكن استرجاعها بكود التتبع.'
                : 'All submitted reports are securely archived and trackable via reference code.'}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-2">
            <button
              onClick={handleFullExit}
              className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>{language === 'ar' ? 'تأكيد الخروج وإنهاء الجلسة' : 'Confirm Exit & Reset Session'}</span>
            </button>

            <button
              onClick={handleReturnHome}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Home className="w-4 h-4 text-slate-600" />
              <span>{language === 'ar' ? 'العودة للشاشة الرئيسية فقط' : 'Return to Home View'}</span>
            </button>

            <button
              onClick={onClose}
              className="w-full py-2 text-slate-500 hover:text-slate-700 font-semibold text-xs transition-colors cursor-pointer text-center"
            >
              {language === 'ar' ? 'إلغاء ومواصلة العمل' : 'Cancel & Continue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
