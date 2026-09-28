import React, { useState } from 'react';
import { ShieldCheck, PhoneCall, Scale, Lock, Globe, ShieldAlert } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { t } from '../locales/i18n';

export const Footer: React.FC = () => {
  const { language, setActiveView, setEmergencyModalOpen } = useApp();
  const [secretFooterClicks, setSecretFooterClicks] = useState(0);

  const handleSecretFooterClick = () => {
    const newCount = secretFooterClicks + 1;
    if (newCount >= 3) {
      setSecretFooterClicks(0);
      setActiveView('staff_portal');
    } else {
      setSecretFooterClicks(newCount);
      setTimeout(() => setSecretFooterClicks(0), 1500);
    }
  };

  return (
    <footer className="bg-[#071322] text-slate-400 text-xs border-t border-slate-800/90 mb-16 md:mb-0">
      {/* Egyptian Flag Hairline Accent */}
      <div className="h-0.5 flex w-full">
        <div className="flex-1 bg-red-600/90" />
        <div className="flex-1 bg-white/80" />
        <div className="flex-1 bg-slate-900" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Mission */}
          <div className="space-y-3.5 md:col-span-2">
            <div className="flex items-center gap-2.5 text-white font-extrabold text-lg">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-md">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span>{language === 'ar' ? 'عين مصر — Ain Masr' : 'Ain Masr Platform'}</span>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed max-w-md">
              {language === 'ar'
                ? 'المنظومة الوطنية الموحدة لتوثيق البلاغات المدنية وحفظ الأدلة الجنائية المصورة بدلاً من نشرها وتداولها على السوشيال ميديا.'
                : 'The unified civic platform for documenting incident video evidence and public safety alerts securely without online defamation.'}
            </p>

            <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-400 text-[11px] leading-relaxed max-w-md space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-amber-400">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'حماية البيانات وسرية البلاغ:' : 'Confidentiality Assurance:'}</span>
              </div>
              <p>
                {language === 'ar'
                  ? 'البلاغات مشفرة ولا تُنشر للعامة حرصاً على سرية وحرمة الحياة الخاصة للمواطنين ومنعاً لأي استهداف أو تشهير وفق القانون رقم 175 لسنة 2018.'
                  : 'All citizen reports and media are encrypted and hidden from public feed in accordance with Law 175 of 2018.'}
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs tracking-wider uppercase">
              {language === 'ar' ? 'خدمات المنظومة' : 'Platform Services'}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => setActiveView('intro')}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  {language === 'ar' ? 'مقدمة البرمجية والتعريف' : 'Project Intro'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveView('goals')}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  {language === 'ar' ? 'أهداف البرمجية والمقرر' : 'Software Goals'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveView('user_guide')}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  {language === 'ar' ? 'دليل الاستخدام والتشغيل' : 'User Guide'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveView('submit_report')}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  {t('navSubmit', language)}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveView('track_report')}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  {t('navTrack', language)}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveView('safety_center')}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  {t('navSafety', language)}
                </button>
              </li>
            </ul>
          </div>

          {/* Emergency & Compliance */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs tracking-wider uppercase">
              {language === 'ar' ? 'طوارئ الجمهورية' : 'Emergency Hotlines'}
            </h4>
            <div className="space-y-2 text-xs">
              <button
                onClick={() => setEmergencyModalOpen(true)}
                className="w-full px-3 py-2 bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/80 text-rose-300 font-bold rounded-xl transition-colors flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <PhoneCall className="w-3.5 h-3.5 text-rose-400" />
                  <span>{language === 'ar' ? 'شرطة النجدة' : 'Police Emergency'}</span>
                </div>
                <span className="font-mono text-amber-300">122</span>
              </button>

              <button
                onClick={() => setEmergencyModalOpen(true)}
                className="w-full px-3 py-2 bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/80 text-rose-300 font-bold rounded-xl transition-colors flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <PhoneCall className="w-3.5 h-3.5 text-rose-400" />
                  <span>{language === 'ar' ? 'هيئة الإسعاف' : 'Ambulance Service'}</span>
                </div>
                <span className="font-mono text-amber-300">123</span>
              </button>

              <button
                onClick={() => setEmergencyModalOpen(true)}
                className="w-full px-3 py-2 bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/80 text-rose-300 font-bold rounded-xl transition-colors flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <PhoneCall className="w-3.5 h-3.5 text-rose-400" />
                  <span>{language === 'ar' ? 'الحماية المدنية' : 'Civil Defense & Fire'}</span>
                </div>
                <span className="font-mono text-amber-300">180</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <div>{t('copyright', language)}</div>
          <div className="flex items-center gap-3">
            <span>{language === 'ar' ? 'المنصة الوطنية الموحدة' : 'National Civic Platform'}</span>
            <span aria-hidden="true">·</span>
            <span
              onClick={handleSecretFooterClick}
              className="text-slate-600 select-none font-mono cursor-default"
            >
              v2.8-Civic
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
