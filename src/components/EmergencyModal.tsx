import React, { useState } from 'react';
import { Phone, AlertTriangle, X, Check, Shield, Flame, Activity, Zap, Droplets, Wind, Scale, HelpCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { t } from '../locales/i18n';
import { EMERGENCY_HOTLINES } from '../data/mockData';

export const EmergencyModal: React.FC = () => {
  const { language, emergencyModalOpen, setEmergencyModalOpen } = useApp();
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);

  if (!emergencyModalOpen) return null;

  const handleCopy = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedNumber(num);
    setTimeout(() => setCopiedNumber(null), 2500);
  };

  const getIcon = (cat: string) => {
    switch (cat) {
      case 'security': return <Shield className="w-5 h-5 text-blue-600" />;
      case 'medical': return <Activity className="w-5 h-5 text-rose-600" />;
      case 'fire': return <Flame className="w-5 h-5 text-amber-600" />;
      case 'utility': return <Zap className="w-5 h-5 text-amber-500" />;
      case 'consumer': return <Scale className="w-5 h-5 text-emerald-600" />;
      default: return <Phone className="w-5 h-5 text-slate-600" />;
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in"
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-rose-900 text-white p-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-rose-800 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 text-rose-200" />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {t('emergencyDirectoryTitle', language)}
              </h2>
              <p className="text-xs text-rose-200 mt-0.5">
                {t('emergencyDirectorySubtitle', language)}
              </p>
            </div>
          </div>
          <button
            onClick={() => setEmergencyModalOpen(false)}
            aria-label={t('close', language)}
            className="p-1.5 text-rose-200 hover:text-white hover:bg-rose-800/80 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Urgent Alert Banner */}
        <div className="bg-amber-50 border-b border-amber-200 p-4 text-xs text-amber-900 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-2 flex-1">
            <div className="leading-relaxed">
              <span className="font-bold">
                {language === 'ar' ? 'تنبيه قانوني وتشغيلي هام:' : 'Important Operational Notice:'}{' '}
              </span>
              {t('emergencyWarningText', language)}
            </div>

            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-950 rounded-lg text-[11px] leading-relaxed">
              <span className="font-extrabold ml-1">
                {language === 'ar' ? '⚠️ إخلاء مسؤولية رسمي:' : '⚠️ Official Disclaimer:'}
              </span>
              <span>
                {language === 'ar'
                  ? 'هذا التطبيق غير رسمي ولا يصح الاتخاذ به، وغير معتمد من أي جهة حكومية. يُرجى الاتصال بأرقام الطوارئ أدناه مباشرة أو التوجه للقسم المختص.'
                  : 'This application is unofficial, should not be relied upon as an official legal channel, and is not accredited by any government entity. Please call the emergency numbers below directly.'}
              </span>
            </div>
          </div>
        </div>

        {/* Directory List */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          {EMERGENCY_HOTLINES.map((hotline) => (
            <div
              key={hotline.number}
              className="flex items-center justify-between p-3.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-slate-100 shrink-0">
                  {getIcon(hotline.category)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 text-sm">
                      {language === 'ar' ? hotline.nameAr : hotline.nameEn}
                    </span>
                    <span className="font-mono font-bold text-base text-rose-700 tabular-nums">
                      {hotline.number}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    {language === 'ar' ? hotline.descAr : hotline.descEn}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleCopy(hotline.number)}
                  className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors flex items-center gap-1"
                >
                  {copiedNumber === hotline.number ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">{t('copiedNumber', language)}</span>
                    </>
                  ) : (
                    <span>{language === 'ar' ? 'نسخ' : 'Copy'}</span>
                  )}
                </button>

                <a
                  href={`tel:${hotline.number.replace(/\s+/g, '')}`}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{t('callNow', language)}</span>
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 text-center text-xs text-slate-600">
          {language === 'ar'
            ? 'الاتصال بأرقام الطوارئ المصرية مجاني من أي خط أرضي أو محمول.'
            : 'Calls to official Egyptian emergency numbers are toll-free from all landlines and mobiles.'}
        </div>
      </div>
    </div>
  );
};
