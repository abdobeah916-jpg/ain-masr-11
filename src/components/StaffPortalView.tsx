import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Building,
  Sliders,
  CheckCircle2,
  KeyRound,
  User,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  MapPin,
  ChevronDown,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const StaffPortalView: React.FC = () => {
  const {
    language,
    setActiveView,
    loginAsOfficial,
    branches,
  } = useApp();

  const Arrow = language === 'ar' ? ArrowLeft : ArrowRight;

  const [roleType, setRoleType] = useState<'authority' | 'admin'>('authority');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('branch_suez_arbaeen');
  const [username, setUsername] = useState<string>('arbaeen.officer');
  const [password, setPassword] = useState<string>('pass2026');
  const [securityToken, setSecurityToken] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const directUrl = `${window.location.origin}${window.location.pathname}?portal=official`;

  const handleCopyDirectUrl = () => {
    try {
      navigator.clipboard.writeText(directUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (e) {
      // fallback
    }
  };

  const handleRoleChange = (role: 'authority' | 'admin') => {
    setRoleType(role);
    setErrorMsg(null);
    setSuccessMsg(null);
    if (role === 'admin') {
      setUsername('admin');
      setPassword('admin2026');
    } else {
      if (selectedBranchId === 'branch_suez_city') {
        setUsername('suez.officer');
      } else if (selectedBranchId === 'branch_cairo_downtown') {
        setUsername('cairo.officer');
      } else {
        setUsername('arbaeen.officer');
      }
      setPassword('pass2026');
    }
  };

  const handleBranchChange = (bId: string) => {
    setSelectedBranchId(bId);
    if (bId === 'branch_suez_city') {
      setUsername('suez.officer');
    } else if (bId === 'branch_cairo_downtown') {
      setUsername('cairo.officer');
    } else if (bId === 'branch_suez_arbaeen') {
      setUsername('arbaeen.officer');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!username.trim() || !password.trim()) {
      setErrorMsg(
        language === 'ar'
          ? 'يرجى إدخال اسم المستخدم وكلمة المرور المشفرة.'
          : 'Please enter official username and password.'
      );
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const res = loginAsOfficial(
        roleType,
        username.trim(),
        password.trim(),
        roleType === 'authority' ? selectedBranchId : undefined
      );

      setIsLoading(false);

      if (res.success) {
        setSuccessMsg(
          language === 'ar'
            ? 'تم التحقق من الهوية الرسمية بنجاح — جاري فتح غرفة العمليات...'
            : 'Clearance verified — opening operational console...'
        );
        setTimeout(() => {
          if (roleType === 'admin') {
            setActiveView('admin_dashboard');
          } else {
            setActiveView('authority_portal');
          }
        }, 500);
      } else {
        setErrorMsg(
          res.message ||
            (language === 'ar'
              ? 'بيانات الدخول غير مصرح بها. يرجى التواصل مع مسؤول أمن المنظومة.'
              : 'Unauthorized official credentials.')
        );
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between relative overflow-hidden animate-in fade-in select-none">
      {/* Background Decorative Tech Grid */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 50%, #d97706 1px, transparent 1px), radial-gradient(circle at 0% 100%, #1e40af 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Standalone Classified Header (مفصول تماماً عن واجهة المواطنين) */}
      <header className="relative z-10 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black tracking-wide text-white">
                {language === 'ar' ? 'جمهورية مصر العربية' : 'Arab Republic of Egypt'}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold border border-amber-500/30">
                RESTRICTED INTRANET
              </span>
            </div>
            <div className="text-xs text-slate-400">
              {language === 'ar'
                ? 'المنظومة الرقمية الموحدة للجهات المختصة وغرف العمليات الميدانية'
                : 'National Dispatch & Field Authorities Operations Network'}
            </div>
          </div>
        </div>

        {/* Back to Citizen Site */}
        <button
          onClick={() => setActiveView('home')}
          className="px-3.5 py-1.5 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <span>{language === 'ar' ? 'العودة لمنصة المواطنين' : 'Exit to Public Portal'}</span>
          <Arrow className="w-3.5 h-3.5" />
        </button>
      </header>

      {/* Main Gateway Card */}
      <main className="relative z-10 flex-1 flex flex-col justify-center items-center px-4 py-8">
        <div className="w-full max-w-lg space-y-5">
          {/* Top Restricted Badge */}
          <div className="text-center space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-xs font-bold tracking-wide">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {language === 'ar'
                  ? 'بوابة الدخول المشفرة للجهات وغرف العمليات'
                  : 'Restricted Government & Operations Dispatch Gateway'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {language === 'ar' ? 'تسجيل دخول الكوادر المعتمدة' : 'Authorized Personnel Clearance'}
            </h1>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              {language === 'ar'
                ? 'هذه الصفحة مخصصة حصرياً للمفتشين الميدانيين وضباط العمليات في الجهات المختصة.'
                : 'Dedicated operational clearance for field inspectors and dispatch units.'}
            </p>
          </div>

          {/* Direct Independent URL Helper (صفحة خارجية مستقلة) */}
          <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-2xl flex items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5 min-w-0">
              <span className="text-[11px] text-amber-400 font-bold block flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>{language === 'ar' ? 'الرابط المباشر الخارجي للجهات (مستقل):' : 'Direct Gateway URL:'}</span>
              </span>
              <p className="text-[10px] text-slate-400 font-mono truncate">
                {directUrl}
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopyDirectUrl}
              className="px-2.5 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/40 text-amber-300 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1 cursor-pointer"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">{language === 'ar' ? 'تم النسخ!' : 'Copied!'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{language === 'ar' ? 'نسخ الرابط' : 'Copy'}</span>
                </>
              )}
            </button>
          </div>

          {/* The Login Card */}
          <div className="bg-slate-900/95 rounded-3xl border border-slate-800 shadow-2xl p-6 sm:p-7 backdrop-blur-xl space-y-5">
            {/* Role Mode Selector */}
            <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => handleRoleChange('authority')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  roleType === 'authority'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Building className="w-4 h-4" />
                <span>{language === 'ar' ? 'جهة مختصة / مفتش ميداني' : 'Authority Officer'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('admin')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  roleType === 'admin'
                    ? 'bg-amber-500 text-slate-950 shadow-lg'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span>{language === 'ar' ? 'رئيس المنظومة (Admin)' : 'System Admin'}</span>
              </button>
            </div>

            {/* Feedback Messages */}
            {errorMsg && (
              <div className="p-3 bg-rose-950/80 border border-rose-800 text-rose-300 rounded-xl text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* If Authority: Branch Selection */}
              {roleType === 'authority' && (
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-400" />
                    <span>{language === 'ar' ? 'الجهة أو النطاق الميداني التابع له:' : 'Operational Branch / District:'}</span>
                  </label>
                  <div className="relative">
                    <select
                      value={selectedBranchId}
                      onChange={(e) => handleBranchChange(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-blue-500 appearance-none pr-8 rtl:pr-3.5 rtl:pl-8 cursor-pointer"
                    >
                      {branches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {language === 'ar' ? b.nameAr : b.nameEn}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 right-3 rtl:right-auto rtl:left-3 pointer-events-none" />
                  </div>
                </div>
              )}

              {/* Username Field */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-300">
                  {language === 'ar' ? 'المعرف الوظيفي أو اسم المستخدم:' : 'Official Identifier / Username:'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute top-1/2 -translate-y-1/2 left-3 rtl:left-auto rtl:right-3" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={roleType === 'admin' ? 'admin' : 'arbaeen.officer'}
                    className="w-full pl-9 pr-3.5 rtl:pr-9 rtl:pl-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-300">
                  {language === 'ar' ? 'كلمة المرور المشفرة:' : 'Encrypted Password:'}
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute top-1/2 -translate-y-1/2 left-3 rtl:left-auto rtl:right-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3.5 rtl:pr-9 rtl:pl-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Optional 2FA Pin */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-300">
                    {language === 'ar' ? 'رمز الأمان الثنائي (OTP / اختياري):' : 'Security Token (Optional):'}
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">RSA-2048</span>
                </div>
                <input
                  type="text"
                  value={securityToken}
                  onChange={(e) => setSecurityToken(e.target.value)}
                  placeholder="6-Digit OTP (e.g. 582910)"
                  maxLength={6}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-400 focus:outline-none focus:border-slate-600 tracking-widest text-center"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
                  roleType === 'admin'
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold'
                    : 'bg-blue-600 hover:bg-blue-500 text-white'
                }`}
              >
                <Lock className="w-4 h-4" />
                <span>
                  {isLoading
                    ? (language === 'ar' ? 'جاري التحقق وفك التشفير...' : 'Authenticating Clearance...')
                    : (language === 'ar' ? 'تسجيل الدخول والتفويض للغرفة' : 'Authenticate & Enter Portal')}
                </span>
              </button>
            </form>

            {/* Quick Preset Buttons for Test Verification */}
            <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-300">
                  {language === 'ar' ? 'تجربة سريعة بنقرة واحدة لاختبار العزل المكاني:' : '1-Click Fast Clearance Presets:'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setRoleType('authority');
                    setSelectedBranchId('branch_suez_arbaeen');
                    setUsername('arbaeen.officer');
                    setPassword('pass2026');
                  }}
                  className={`py-1.5 px-2 rounded-lg text-center transition-colors cursor-pointer text-[10px] font-semibold border ${
                    username === 'arbaeen.officer'
                      ? 'bg-blue-600/30 border-blue-400 text-blue-200'
                      : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                  }`}
                >
                  {language === 'ar' ? '1. مفتش الأربعين (السويس)' : 'Al-Arbaeen Inspector'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRoleType('authority');
                    setSelectedBranchId('branch_suez_city');
                    setUsername('suez.officer');
                    setPassword('pass2026');
                  }}
                  className={`py-1.5 px-2 rounded-lg text-center transition-colors cursor-pointer text-[10px] font-semibold border ${
                    username === 'suez.officer'
                      ? 'bg-blue-600/30 border-blue-400 text-blue-200'
                      : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                  }`}
                >
                  {language === 'ar' ? '2. مفتش السويس المركزية' : 'Suez Central Officer'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRoleType('authority');
                    setSelectedBranchId('branch_cairo_downtown');
                    setUsername('cairo.officer');
                    setPassword('pass2026');
                  }}
                  className={`py-1.5 px-2 rounded-lg text-center transition-colors cursor-pointer text-[10px] font-semibold border ${
                    username === 'cairo.officer'
                      ? 'bg-blue-600/30 border-blue-400 text-blue-200'
                      : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                  }`}
                >
                  {language === 'ar' ? '3. مفتش القاهرة (وسط البلد)' : 'Cairo Downtown Officer'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRoleType('admin');
                    setUsername('admin');
                    setPassword('admin2026');
                  }}
                  className={`py-1.5 px-2 rounded-lg text-center transition-colors cursor-pointer text-[10px] font-semibold border ${
                    username === 'admin'
                      ? 'bg-amber-500/30 border-amber-400 text-amber-200'
                      : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                  }`}
                >
                  {language === 'ar' ? '4. رئيس المنظومة (Admin)' : 'System Admin'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Standalone Classified Footer */}
      <footer className="relative z-10 border-t border-slate-900 bg-slate-950/80 px-6 py-3 text-center text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div>
          {language === 'ar'
            ? 'نظام غرف العمليات المشتركة — مشفر وفق بروتوكولات الأمن القومي السيبراني'
            : 'National Operations Network — Encrypted under National Cyber Protocols'}
        </div>
        <div className="flex items-center gap-2">
          <span>{language === 'ar' ? 'اختصار الدخول السريع:' : 'Quick Shortcut:'}</span>
          <kbd className="px-1.5 py-0.5 bg-slate-800 text-amber-300 border border-slate-700 rounded font-mono text-[10px]">Ctrl + Alt + G</kbd>
        </div>
      </footer>
    </div>
  );
};
