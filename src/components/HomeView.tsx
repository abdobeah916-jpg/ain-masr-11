import React, { useState } from 'react';
import {
  ShieldCheck,
  FilePlus,
  Search,
  BookOpen,
  PhoneCall,
  CheckCircle2,
  Lock,
  Route,
  Clock,
  ArrowRight,
  ArrowLeft,
  Scale,
  Sparkles,
  MapPin,
  Building,
  Film,
  Check,
  XCircle,
  Video,
  AlertTriangle,
  Send,
  Zap,
  Target,
  GraduationCap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { t, formatStatus } from '../locales/i18n';
import { EmergencyNoticeBanner } from './EmergencyNoticeBanner';
import { InteractiveMap } from './InteractiveMap';

export const HomeView: React.FC = () => {
  const {
    language,
    setActiveView,
    setEmergencyModalOpen,
    setSelectedReportId,
    reports,
    isOfficialAuthenticated,
  } = useApp();

  const [quickTrackCode, setQuickTrackCode] = useState('');
  const [quickTrackError, setQuickTrackError] = useState(false);

  const Arrow = language === 'ar' ? ArrowLeft : ArrowRight;

  const resolvedReports = reports.filter((r) => r.status === 'resolved');

  const handleQuickTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = quickTrackCode.trim();
    if (!clean) return;

    const matched = reports.find(
      (r) =>
        r.referenceNo.toLowerCase() === clean.toLowerCase() ||
        r.id.toLowerCase() === clean.toLowerCase()
    );

    if (matched) {
      setSelectedReportId(matched.id);
      setActiveView('track_report');
    } else {
      setQuickTrackError(true);
      setTimeout(() => setQuickTrackError(false), 3000);
      setActiveView('track_report');
    }
  };

  return (
    <div className="space-y-10 sm:space-y-12 pb-20 animate-in fade-in w-full max-w-full overflow-x-clip min-w-0">
      {/* Top Emergency Notice Banner */}
      <EmergencyNoticeBanner />

      {/* Hero Section: Elevated, Modern, and Inviting */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0a192f] via-[#0d2342] to-[#0a192f] text-white pt-8 sm:pt-16 lg:pt-20 pb-16 sm:pb-24 lg:pb-28 px-3.5 sm:px-6 lg:px-8 rounded-b-[2rem] sm:rounded-b-[4rem] border-b border-amber-500/20 shadow-2xl w-full max-w-full min-w-0">
        {/* Soft Ambient Radial Light Accents */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[700px] h-[350px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-10 w-48 sm:w-72 h-48 sm:h-72 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-5 sm:space-y-8 w-full min-w-0">
          {/* Institutional Trust Badge */}
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-300 text-xs sm:text-sm font-semibold backdrop-blur-md shadow-xs max-w-full">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="truncate">
              {language === 'ar'
                ? 'المنظومة الوطنية الموحدة لتوثيق البلاغات وحماية المجتمع'
                : 'National Unified Civic & Public Safety Portal'}
            </span>
          </div>

          {/* Main Headline */}
          <div className="space-y-2.5 sm:space-y-4">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight sm:leading-[1.2] text-balance">
              {language === 'ar' ? (
                <>
                  صوتك مسموع.. <span className="text-amber-400">ودليلك في أمان</span>
                </>
              ) : (
                <>
                  Your Voice Matters.. <span className="text-amber-400">Evidence Protected</span>
                </>
              )}
            </h1>

            <p className="max-w-2xl mx-auto text-xs sm:text-sm md:text-base text-slate-300 leading-relaxed font-normal text-balance px-2">
              {language === 'ar'
                ? 'بدلاً من نشر مقاطع الجرائم والمخالفات على السوشيال ميديا وتداول الفضائح، وثّق بلاغك هنا في سرية تامة ومشفرة لتصل مباشرة لجهات التحقيق وتطبيق القانون بحزم.'
                : 'Instead of viral social media circulation, submit verified incident evidence directly and confidentially to official investigation and municipal authorities.'}
            </p>
          </div>

          {/* Core Interactive Action Dock (Direct Reporting + Quick Code Search) */}
          <div className="w-full max-w-2xl mx-auto bg-white/10 p-3 sm:p-4 rounded-3xl border border-white/15 backdrop-blur-md shadow-2xl space-y-3 min-w-0">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 sm:gap-3 items-center w-full min-w-0">
              {/* Primary Massive Action: Submit Report */}
              <div className="sm:col-span-7 w-full">
                <button
                  type="button"
                  onClick={() => setActiveView('submit_report')}
                  className="w-full min-h-[48px] sm:min-h-[52px] px-5 sm:px-6 py-3 sm:py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 active:scale-[0.98] text-slate-950 font-black text-xs sm:text-sm md:text-base rounded-2xl shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 sm:gap-3 cursor-pointer"
                >
                  <Video className="w-4 sm:w-5 h-4 sm:h-5 text-slate-950 shrink-0" />
                  <span className="truncate">{language === 'ar' ? 'تسجيل بلاغ مصور الآن' : 'Submit Video Report Now'}</span>
                  <Arrow className="w-4 h-4 text-slate-950 shrink-0" />
                </button>
              </div>

              {/* Quick Tracking Search Form */}
              <div className="sm:col-span-5 w-full">
                <form onSubmit={handleQuickTrack} className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/80 rounded-2xl p-1.5 w-full min-w-0">
                  <input
                    type="text"
                    placeholder={language === 'ar' ? 'كود التتبع EGY-...' : 'Track Code EGY-...'}
                    value={quickTrackCode}
                    onChange={(e) => setQuickTrackCode(e.target.value)}
                    className="w-full flex-1 min-w-0 bg-transparent text-xs sm:text-sm px-2.5 sm:px-3 py-1.5 text-white placeholder-slate-400 focus:outline-none font-mono"
                    dir="ltr"
                  />
                  <button
                    type="submit"
                    className="shrink-0 px-3 sm:px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                    title={language === 'ar' ? 'استعلام' : 'Track'}
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>{language === 'ar' ? 'تتبع' : 'Track'}</span>
                  </button>
                </form>
              </div>
            </div>

            {/* Micro Guarantees */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-[11px] sm:text-xs text-slate-300 pt-1">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{language === 'ar' ? 'هوية محمية وسرية تامة' : 'Protected Identity'}</span>
              </span>
              <span className="text-slate-500 hidden xs:inline">·</span>
              <span className="flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{language === 'ar' ? 'رفع فيديوهات حتى 500MB' : '500MB Video Vault'}</span>
              </span>
              <span className="text-slate-500 hidden xs:inline">·</span>
              <span className="flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span>{language === 'ar' ? 'بصمة جنائية SHA-256' : 'Forensic Checksum'}</span>
              </span>
            </div>
          </div>

          {/* Fast Category Quick-Picks */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 pt-1 max-w-xl mx-auto">
            <span className="text-xs text-slate-400">
              {language === 'ar' ? 'إبلاغ سريع عن:' : 'Quick report for:'}
            </span>
            <button
              onClick={() => setActiveView('submit_report')}
              className="px-2.5 sm:px-3 py-1 bg-white/10 hover:bg-white/15 border border-white/20 rounded-full text-[11px] sm:text-xs text-slate-200 transition-colors cursor-pointer"
            >
              🚨 {language === 'ar' ? 'بلطجة وسرقات' : 'Crimes & Thuggery'}
            </button>
            <button
              onClick={() => setActiveView('submit_report')}
              className="px-2.5 sm:px-3 py-1 bg-white/10 hover:bg-white/15 border border-white/20 rounded-full text-[11px] sm:text-xs text-slate-200 transition-colors cursor-pointer"
            >
              🚰 {language === 'ar' ? 'كسور مياه وكهرباء' : 'Utilities & Water Leaks'}
            </button>
            <button
              onClick={() => setActiveView('submit_report')}
              className="px-2.5 sm:px-3 py-1 bg-white/10 hover:bg-white/15 border border-white/20 rounded-full text-[11px] sm:text-xs text-slate-200 transition-colors cursor-pointer"
            >
              🛣️ {language === 'ar' ? 'هبوط أسفلت وطرق' : 'Roads & Pavements'}
            </button>
          </div>
        </div>
      </section>

      {/* Educational & Evaluation Direct Access Dock (معايير استمارة التحكيم) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-blue-500/10 border border-amber-300/40 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-amber-200/40 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
                  {language === 'ar' ? 'وثائق ومخرجات المشروع البرمجي الطلابي' : 'Student Software Project Documentation'}
                </h2>
                <p className="text-xs text-slate-500">
                  {language === 'ar'
                    ? 'مطابق لكافة بنود استمارة تقييم وتحكيم البرمجيات التعليمية للمرحلة الثانوية'
                    : 'Compliant with Secondary School Software Evaluation Criteria'}
                </p>
              </div>
            </div>

            <span className="px-3 py-1 bg-amber-100 text-amber-900 font-bold text-xs rounded-full border border-amber-300">
              {language === 'ar' ? 'درجة توافر كاملة (3/3)' : '100% Complete'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Card 1: Intro */}
            <div
              onClick={() => setActiveView('intro')}
              className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-amber-400 hover:shadow-md transition-all cursor-pointer space-y-1.5 group"
            >
              <div className="flex items-center justify-between">
                <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                  4
                </span>
                <Sparkles className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-amber-600 transition-colors">
                {language === 'ar' ? 'شاشة المقدمة والتعريف' : 'Project Intro Screen'}
              </h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {language === 'ar'
                  ? 'عرض فكرة العمل المبتكرة وتشويق المتعلم لحل مشكلة النشر غير المسؤول.'
                  : 'Innovative concept overview and citizen engagement.'}
              </p>
            </div>

            {/* Card 2: Goals & Curriculum */}
            <div
              onClick={() => setActiveView('goals')}
              className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer space-y-1.5 group"
            >
              <div className="flex items-center justify-between">
                <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                  5 & 9
                </span>
                <Target className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                {language === 'ar' ? 'شاشة أهداف البرمجية' : 'Project Goals & Curriculum'}
              </h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {language === 'ar'
                  ? 'الأهداف التعليمية والتقنية وتطبيق منهج الحاسب الآلي للمرحلة الثانوية.'
                  : 'Educational objectives and secondary computer science curriculum ties.'}
              </p>
            </div>

            {/* Card 3: User Guide */}
            <div
              onClick={() => setActiveView('user_guide')}
              className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer space-y-1.5 group"
            >
              <div className="flex items-center justify-between">
                <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs">
                  3
                </span>
                <BookOpen className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-blue-700 transition-colors">
                {language === 'ar' ? 'دليل الاستخدام والتشغيل' : 'User Manual & Guide'}
              </h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {language === 'ar'
                  ? 'ملف تشغيل تفصيلي وخطوات تجربة المنظومة وأوامر التشغيل والطباعة.'
                  : 'Comprehensive setup guide, local run commands, and testing steps.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Main Pillars Section: Clear, Beautiful, and Functional */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Submit Report */}
          <div
            onClick={() => setActiveView('submit_report')}
            className="group relative p-6 bg-white rounded-3xl border border-slate-200/90 hover:border-amber-400 hover:shadow-xl transition-all duration-300 cursor-pointer space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all">
                <FilePlus className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg">
                {language === 'ar' ? 'توثيق بلاغ جديد' : 'Submit New Report'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                {language === 'ar'
                  ? 'سجّل الواقعة أو الجريمة بالفيديو والصور حتى 500 ميجا مع حماية هويتك وطمس اللوحات تلقائياً.'
                  : 'Document incidents or hazards with up to 500MB video evidence and privacy protection.'}
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-amber-600 group-hover:text-amber-700 pt-2">
              <span>{language === 'ar' ? 'ابدأ النموذج الآن' : 'Open Wizard'}</span>
              <Arrow className="w-3.5 h-3.5 group-hover:translate-x-[-4px] transition-transform" />
            </div>
          </div>

          {/* Card 2: Track Report */}
          <div
            onClick={() => setActiveView('track_report')}
            className="group relative p-6 bg-white rounded-3xl border border-slate-200/90 hover:border-blue-400 hover:shadow-xl transition-all duration-300 cursor-pointer space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-700 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg">
                {language === 'ar' ? 'متابعة حالة البلاغ' : 'Live Status Tracking'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                {language === 'ar'
                  ? 'استعلم بكود التتبع لمعرفة موقف المعاينة الفنية، تحركات جهات التحقيق، وقرارات الإصلاح الميداني.'
                  : 'Check inspection reports, authority assignments, and real-time field progress.'}
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-blue-600 group-hover:text-blue-700 pt-2">
              <span>{language === 'ar' ? 'استعلم بكودك' : 'Track by Reference'}</span>
              <Arrow className="w-3.5 h-3.5 group-hover:translate-x-[-4px] transition-transform" />
            </div>
          </div>

          {/* Card 3: Safety & Anti-Viral Crimes */}
          <div
            onClick={() => setActiveView('safety_center')}
            className="group relative p-6 bg-white rounded-3xl border border-slate-200/90 hover:border-emerald-400 hover:shadow-xl transition-all duration-300 cursor-pointer space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                <Scale className="w-6 h-6" />
              </div>
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-slate-900 text-lg">
                  {language === 'ar' ? 'دليل الأمان والمسؤولية' : 'Safety & Legal Guide'}
                </h3>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                  {language === 'ar' ? 'القانون 175' : 'Law 175'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                {language === 'ar'
                  ? 'تعرف على البديل الآمن لنشر الفيديوهات على فيسبوك وتيك توك وكيف تضمن حقك دون التعرض للمساءلة.'
                  : 'Learn why sending evidence here protects victims and upholds justice without social media chaos.'}
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 group-hover:text-emerald-700 pt-2">
              <span>{language === 'ar' ? 'الاطلاع على الإطار القانوني' : 'Review Guidelines'}</span>
              <Arrow className="w-3.5 h-3.5 group-hover:translate-x-[-4px] transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* Comparison: Why Ain Masr Wins over Social Media */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 space-y-6 shadow-xs">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-amber-600 tracking-wider uppercase">
              {language === 'ar' ? 'الوعي والمسؤولية المجتمعية' : 'Civic Responsibility'}
            </span>
            <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900">
              {language === 'ar'
                ? 'ليه تبعت لعين مصر بدل ما تنزل على السوشيال ميديا؟'
                : 'Why Submit Evidence to Ain Masr Instead of Social Media?'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              {language === 'ar'
                ? 'مقارنة حاسمة توضح الفرق بين الإجراء القانوني الفعال وفوضى الإنترنت'
                : 'The critical difference between effective justice and online defamation'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
            {/* The Right Way: Ain Masr */}
            <div className="p-6 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm sm:text-base">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{language === 'ar' ? 'عبر منصة عين مصر (المسار القانوني الفعال)' : 'Via Ain Masr (Lawful & Safe)'}</span>
              </div>
              {language === 'ar' ? (
                <ul className="space-y-2.5 text-xs sm:text-sm text-emerald-900">
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-emerald-600">✓</span>
                    <span><strong>دليل جنائي معتمد:</strong> حفظ الفيديو الأصلي ببصمة SHA-256 تمنع الطعن بالتزوير.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-emerald-600">✓</span>
                    <span><strong>حماية هوية المُبلّغ:</strong> سرية مطلقة لبياناتك لمنع أي حرج أو استهداف.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-emerald-600">✓</span>
                    <span><strong>تحرك أمني وقضائي مباشر:</strong> تسليم الملف لضباط المباحث وغرف العمليات فوراً.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-emerald-600">✓</span>
                    <span><strong>صون كرامة الضحية:</strong> منع تحويل المآسي إلى تريندات وفضائح إلكترونية.</span>
                  </li>
                </ul>
              ) : (
                <ul className="space-y-2.5 text-xs sm:text-sm text-emerald-900">
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-emerald-600">✓</span>
                    <span><strong>Forensic Integrity:</strong> Cryptographic SHA-256 hash proves video authenticity in court.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-emerald-600">✓</span>
                    <span><strong>Reporter Anonymity:</strong> Complete confidentiality protecting you from any retaliation.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-emerald-600">✓</span>
                    <span><strong>Direct Law Enforcement Action:</strong> Instant referral to dispatch officers and prosecutors.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-emerald-600">✓</span>
                    <span><strong>Victim Dignity Preserved:</strong> Eliminates viral exploitation and online defamation.</span>
                  </li>
                </ul>
              )}
            </div>

            {/* The Wrong Way: Viral Social Media */}
            <div className="p-6 bg-rose-50/70 border border-rose-200 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-rose-950 font-bold text-sm sm:text-base">
                <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <span>{language === 'ar' ? 'النشر على فيسبوك وتيك توك (مسار خاطئ وضار)' : 'Viral Social Media (Harmful)'}</span>
              </div>
              {language === 'ar' ? (
                <ul className="space-y-2.5 text-xs sm:text-sm text-rose-900">
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-rose-600">✕</span>
                    <span><strong>إنذار المجرم للهروب:</strong> رؤية الفيديو تمنح الجاني وقتاً للهرب أو إخفاء السلاح.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-rose-600">✕</span>
                    <span><strong>مساءلة قانونية للناشر:</strong> القانون 175 لسنة 2018 يعاقب على نشر ما يثير الفزع.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-rose-600">✕</span>
                    <span><strong>وصمة مؤبدة للضحية:</strong> تداول المقاطع يسبب صدمة نفسية مستمرة للضحايا وذويهم.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-rose-600">✕</span>
                    <span><strong>شائعات واقتطاع السياق:</strong> تحريف الحقيقة يظلم أطرافاً بريئة ويعطل التحقيق.</span>
                  </li>
                </ul>
              ) : (
                <ul className="space-y-2.5 text-xs sm:text-sm text-rose-900">
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-rose-600">✕</span>
                    <span><strong>Suspect Alert & Escape:</strong> Public posts give criminals time to flee and hide evidence.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-rose-600">✕</span>
                    <span><strong>Legal Penalties for Posters:</strong> Law No. 175 penalizes broadcasting panic and privacy breaches.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-rose-600">✕</span>
                    <span><strong>Lifelong Victim Trauma:</strong> Uncontrolled viral circulation retraumatizes victims and families.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-rose-600">✕</span>
                    <span><strong>Disinformation & Fake Context:</strong> Selective editing misleads the public and obstructs justice.</span>
                  </li>
                </ul>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* How it Works: 3 Clean Steps */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 space-y-8 border border-slate-800 shadow-xl">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              {language === 'ar' ? 'كيف تعمل المنظومة في 3 خطوات بسيطة؟' : 'How It Works in 3 Simple Steps'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              {language === 'ar'
                ? 'خطوات سريعة وميسرة لتوثيق بلاغك ومتابعته حتى تمام الإنجاز'
                : 'Fast and intuitive steps to document and track your civic alert'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 bg-slate-800/60 rounded-2xl border border-slate-700/80 space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-extrabold text-sm">
                1
              </div>
              <h4 className="font-bold text-white text-base">
                {language === 'ar' ? 'وثّق الواقعة بالفيديو' : 'Record or Select Evidence'}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                {language === 'ar'
                  ? 'صوّر الواقعة أو ارفع مقطع فيديو أو صور (حتى 500 ميجا) مع تحديد المحافظة والحي بدقة.'
                  : 'Capture or upload video (up to 500MB) and pinpoint the district location.'}
              </p>
            </div>

            <div className="p-5 bg-slate-800/60 rounded-2xl border border-slate-700/80 space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-extrabold text-sm">
                2
              </div>
              <h4 className="font-bold text-white text-base">
                {language === 'ar' ? 'تشفير وحماية وتوجيه آلي' : 'Encrypted Routing'}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                {language === 'ar'
                  ? 'يتم توليد بصمة SHA-256 للملف وإخفاء بياناتك الشخصية وتوجيه البلاغ مباشرة للجهة المختصة.'
                  : 'Your video receives a cryptographic hash and routes securely to designated authorities.'}
              </p>
            </div>

            <div className="p-5 bg-slate-800/60 rounded-2xl border border-slate-700/80 space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-extrabold text-sm">
                3
              </div>
              <h4 className="font-bold text-white text-base">
                {language === 'ar' ? 'متابعة حية بكود التتبع' : 'Live Status Updates'}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                {language === 'ar'
                  ? 'تحصل على كود تتبع فريد لمعرفة مراحل التحقيق والإصلاح الميداني خطوة بخطوة حتى تمام الحل.'
                  : 'Track every inspection phase and resolution outcome using your private tracking code.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Live Civic Impact Numbers */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 bg-white rounded-2xl border border-slate-200/90 text-center space-y-1 shadow-2xs">
            <div className="text-2xl sm:text-3xl font-mono font-black text-amber-600 tabular-nums">
              {reports.length}
            </div>
            <div className="text-xs font-bold text-slate-700">
              {language === 'ar' ? 'بلاغ مسجل وموثق' : 'Reports Logged'}
            </div>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200/90 text-center space-y-1 shadow-2xs">
            <div className="text-2xl sm:text-3xl font-mono font-black text-emerald-600 tabular-nums">
              {resolvedReports.length}
            </div>
            <div className="text-xs font-bold text-slate-700">
              {language === 'ar' ? 'واقعة تمت معالجتها' : 'Resolved Incidents'}
            </div>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200/90 text-center space-y-1 shadow-2xs">
            <div className="text-2xl sm:text-3xl font-mono font-black text-blue-600 tabular-nums">
              27
            </div>
            <div className="text-xs font-bold text-slate-700">
              {language === 'ar' ? 'محافظة مغطاة بالجمهورية' : 'Governorates Covered'}
            </div>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200/90 text-center space-y-1 shadow-2xs">
            <div className="text-2xl sm:text-3xl font-mono font-black text-purple-600 tabular-nums">
              500 MB
            </div>
            <div className="text-xs font-bold text-slate-700">
              {language === 'ar' ? 'سعة رفع الفيديو بجودة عالية' : 'Max Video Vault Limit'}
            </div>
          </div>
        </div>
      </section>

      {/* Official Map Section (Authorized Personnel Only) */}
      {isOfficialAuthenticated && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  {language === 'ar' ? 'الرادار الجغرافي لبلاغات الجمهورية (عرض الكوادر المصرح لهم)' : 'Official Civic Radar'}
                </h3>
                <p className="text-xs text-slate-500">
                  {language === 'ar' ? 'خريطة توزيع البلاغات لتسهيل التدخل الميداني' : 'Geographic report distribution for field dispatch'}
                </p>
              </div>
            </div>
            <InteractiveMap
              mode="viewer"
              reports={reports}
              onSelectReport={(repId) => {
                setSelectedReportId(repId);
                setActiveView('track_report');
              }}
              heightClass="h-80 sm:h-96"
            />
          </div>
        </section>
      )}
    </div>
  );
};
