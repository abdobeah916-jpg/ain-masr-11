import React from 'react';
import { PhoneCall, AlertCircle, ShieldAlert } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { t } from '../locales/i18n';

export const EmergencyNoticeBanner: React.FC = () => {
  const { language, setEmergencyModalOpen } = useApp();

  return (
    <aside
      aria-label={language === 'ar' ? 'تنبيه الطوارئ وإخلاء المسؤولية' : 'Emergency Alert & Disclaimer'}
      className="bg-gradient-to-b from-amber-500/10 via-amber-400/5 to-rose-500/10 border-b border-amber-300/40 text-slate-800 px-3.5 sm:px-4 py-2.5 sm:py-3 w-full max-w-full overflow-x-clip min-w-0"
    >
      <div className="max-w-7xl mx-auto space-y-2 w-full min-w-0">
        {/* Row 1: The Initial Emergency Sentence */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs w-full min-w-0">
          <div className="flex items-center gap-2 text-start flex-wrap min-w-0">
            <span className="inline-flex items-center gap-1 font-extrabold text-amber-950 bg-amber-200/90 border border-amber-300/80 px-2.5 py-0.5 rounded-full text-[11px] shrink-0">
              <AlertCircle className="w-3.5 h-3.5 text-amber-900" />
              <span>{t('emergencyWarningTitle', language)}</span>
            </span>
            <span className="text-slate-800 font-bold text-xs sm:text-sm">
              {language === 'ar'
                ? 'للجرائم الجارية، الحرائق، وحالات الخطر الفوري اتصل بالنجدة 122 أو الإسعاف 123 مباشرة.'
                : 'For imminent danger, active violent crimes, or fires, call 122 or 123 immediately.'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setEmergencyModalOpen(true)}
            className="shrink-0 px-3 py-1.5 text-xs font-bold text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-300/80 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-95 w-full sm:w-auto"
          >
            <PhoneCall className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
            <span>{t('emergencyHotlinesBtn', language)} (122 / 123)</span>
          </button>
        </div>

        {/* Row 2: Directly Underneath - Prominent, clean disclaimer as requested */}
        <div className="p-2.5 bg-white/90 border border-amber-200/90 rounded-xl flex items-start gap-2.5 text-xs text-slate-700 shadow-2xs">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-extrabold text-amber-950 ml-1">
              {language === 'ar' ? 'تنويه هام وإخلاء مسؤولية:' : 'Important Notice & Disclaimer:'}
            </span>
            <span className="font-medium text-slate-700">
              {language === 'ar'
                ? 'هذا التطبيق منصة تجريبية غير رسمية ولا يصح الاتخاذ به أو الاعتماد عليه كقناة إبلاغ رسمية، وهو غير معتمد أو تابع لأي جهة حكومية. في حالات الطوارئ والجرائم والمخالفات الجسيمة، يرجى التوجه فوراً للجهات الرسمية المعنية أو الاتصال بأرقام الطوارئ المعتمدة.'
                : 'This application is an unofficial civic prototype; it should not be relied upon as an official legal channel and is NOT accredited, endorsed, or affiliated with any government agency. For real emergencies, please contact official emergency services directly.'}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
