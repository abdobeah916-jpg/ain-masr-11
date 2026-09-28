import React, { useState } from 'react';
import {
  ShieldCheck,
  User,
  Phone,
  Mail,
  CheckCircle2,
  Lock,
  X,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AuthModal: React.FC = () => {
  const {
    language,
    authModalOpen,
    setAuthModalOpen,
    loginAsCitizen,
  } = useApp();

  // Citizen form state
  const [citizenName, setCitizenName] = useState<string>('أحمد حسام الدين علي');
  const [citizenPhone, setCitizenPhone] = useState<string>('01012345678');
  const [citizenEmail, setCitizenEmail] = useState<string>('citizen@ainmasr.eg.mock');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!authModalOpen) return null;

  const handleCitizenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!citizenPhone.trim() || citizenPhone.trim().length < 10) {
      setErrorMsg(
        language === 'ar'
          ? 'يرجى إدخال رقم هاتف محمول مصري صحيح (11 رقماً).'
          : 'Please enter a valid Egyptian mobile phone number.'
      );
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      loginAsCitizen(citizenName, citizenPhone, citizenEmail);
      setIsSubmitting(false);
      setSuccessMsg(
        language === 'ar'
          ? 'تم تسجيل الدخول وتفعيل حسابك كمواطن / مقيم بنجاح'
          : 'Citizen profile verified and logged in successfully'
      );

      setTimeout(() => {
        setAuthModalOpen(false);
        setErrorMsg(null);
        setSuccessMsg(null);
      }, 500);
    }, 250);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in"
      onClick={() => setAuthModalOpen(false)}
      role="dialog"
      aria-modal="true"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
      >
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-400/40 flex items-center justify-center text-amber-400 select-none">
              <ShieldCheck className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">
                {language === 'ar' ? 'تسجيل دخول المواطنين' : 'Citizen Login'}
              </h2>
              <p className="text-xs text-slate-400">
                {language === 'ar'
                  ? 'منصة عين مصر للبلاغات المدنية والسلامة العامة'
                  : 'Ain Masr Civic & Public Safety System'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setAuthModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informative Banner */}
        <div className="p-3.5 border-b text-xs flex items-start gap-2.5 bg-emerald-50/60 border-emerald-100 text-emerald-950">
          <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
          <p className="leading-relaxed">
            {language === 'ar'
              ? 'أهلاً بك في منصة عين مصر. تسجيلك يتيح لك حفظ بلاغاتك وتتبع قرارات اللجان الميدانية خطوة بخطوة مع كامل سرية بياناتك.'
              : 'Welcome to Ain Masr. Log in to track your reports and receive official responses in real time.'}
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs font-semibold text-rose-700 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs font-semibold text-emerald-700 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* CITIZEN FORM ONLY */}
          <form onSubmit={handleCitizenSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                {language === 'ar' ? 'الاسم بالكامل (أو الاسم المستعار):' : 'Full Name (or alias):'}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 left-3 rtl:left-auto rtl:right-3" />
                <input
                  type="text"
                  value={citizenName}
                  onChange={(e) => setCitizenName(e.target.value)}
                  placeholder={language === 'ar' ? 'مثال: أحمد حسام الدين' : 'e.g. Ahmed Hossam'}
                  className="w-full pl-9 pr-3.5 rtl:pr-9 rtl:pl-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                {language === 'ar' ? 'رقم الهاتف المحمول للتأكيد:' : 'Mobile Phone Number:'} *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 left-3 rtl:left-auto rtl:right-3" />
                <input
                  type="tel"
                  value={citizenPhone}
                  onChange={(e) => setCitizenPhone(e.target.value)}
                  placeholder="01xxxxxxxxx"
                  className="w-full pl-9 pr-3.5 rtl:pr-9 rtl:pl-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 tabular-nums"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                {language === 'ar' ? 'البريد الإلكتروني (اختياري للإشعارات):' : 'Email (Optional):'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 left-3 rtl:left-auto rtl:right-3" />
                <input
                  type="email"
                  value={citizenEmail}
                  onChange={(e) => setCitizenEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3.5 rtl:pr-9 rtl:pl-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? (language === 'ar' ? 'جاري تسجيل الدخول...' : 'Logging in...')
                  : (language === 'ar' ? 'تسجيل الدخول ومتابعة بلاغاتي' : 'Log In & Continue')}
              </span>
            </button>
          </form>

          {/* Privacy Note */}
          <div className="pt-2 border-t border-slate-100 text-center text-[11px] text-slate-400">
            <span>
              {language === 'ar'
                ? '🔒 الاتصال مشفر بالكامل وخاضع لبروتوكول التأمين الوطني الموحد'
                : '🔒 Encrypted end-to-end according to National Civic Standards'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
