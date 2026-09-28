import React from 'react';
import {
  ShieldCheck,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Video,
  FileCheck,
  Scale,
  Lock,
  Eye,
  AlertTriangle,
  Share2,
  CheckCircle2,
  BookOpen,
  Target,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ProjectIntroView: React.FC = () => {
  const { language, setActiveView } = useApp();
  const isRtl = language === 'ar';
  const Arrow = isRtl ? ArrowLeft : ArrowRight;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-10 animate-in fade-in">
      {/* Hero Badge & Title */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-900 text-xs sm:text-sm font-bold shadow-xs">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>{language === 'ar' ? 'شاشة المقدمة والتعريف بالبرمجية' : 'Introduction & Software Overview'}</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
          {language === 'ar' ? (
            <>
              مشروع برمجية <span className="text-amber-600">«عين مصر»</span> للبلاغات المدنية
            </>
          ) : (
            <>
              Software Introduction: <span className="text-amber-600">«Ain Masr»</span> Civic Safety
            </>
          )}
        </h1>

        <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
          {language === 'ar'
            ? 'برمجية تطبيقية تفاعلية تم تطويرها بهدف تحويل ثقافة النشر العشوائي والفضائح على وسائل التواصل الاجتماعي إلى مسار مدني مسؤول يحمي خصوصية المجتمع ويصون الأدلة الرقمية.'
            : 'An interactive applied educational software designed to transform viral social media circulation into an official, encrypted civic pipeline.'}
        </p>
      </div>

      {/* Interactive Story / Comparison: The Problem vs The Solution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Negative Route: Social Media Spread */}
        <div className="bg-rose-50/70 border-2 border-rose-200 rounded-3xl p-6 space-y-4 relative overflow-hidden">
          <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center font-bold shadow-md">
            <AlertTriangle className="w-5 h-5" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
              {language === 'ar' ? 'الواقع التقليدي الخاطئ' : 'The Traditional Negative Path'}
            </span>
            <h2 className="text-lg font-extrabold text-rose-950">
              {language === 'ar' ? 'النشر على السوشيال ميديا وسباق التريند' : 'Social Media Viral Outcry'}
            </h2>
          </div>

          <ul className="space-y-2.5 text-xs text-rose-900 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-rose-500 font-bold">✕</span>
              <span>
                {language === 'ar'
                  ? 'انتهاك خصوصية الضحايا وعائلاتهم والتشهير العلني بالأبرياء قبل ثبوت الإدانة.'
                  : 'Infringes on victim privacy and defames innocent citizens before due process.'}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-500 font-bold">✕</span>
              <span>
                {language === 'ar'
                  ? 'فقدان الأدلة الرقمية لقيمتها الجنائية بسبب ضغط الفيديو وقصّه وتعديله ببرامج المونتاج.'
                  : 'Digital evidence loses forensic credibility due to compression and alterations.'}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-500 font-bold">✕</span>
              <span>
                {language === 'ar'
                  ? 'تعريض المُبلّغ للملاحقة أو الانتقام لعدم وجود حماية رسمية لهويته.'
                  : 'Exposes the whistleblower to retaliation due to unshielded identities.'}
              </span>
            </li>
          </ul>
        </div>

        {/* Positive Route: Ain Masr */}
        <div className="bg-emerald-50/70 border-2 border-emerald-200 rounded-3xl p-6 space-y-4 relative overflow-hidden">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md">
            <ShieldCheck className="w-5 h-5" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              {language === 'ar' ? 'الحل البرمجي المبتكر' : 'The Innovative Software Solution'}
            </span>
            <h2 className="text-lg font-extrabold text-emerald-950">
              {language === 'ar' ? 'منظومة عين مصر الرقمية المشفرة' : 'Ain Masr Encrypted Civic Platform'}
            </h2>
          </div>

          <ul className="space-y-2.5 text-xs text-emerald-900 leading-relaxed">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                {language === 'ar'
                  ? 'حماية كاملة لهوية المُبلّغ وسرية معلوماته بقوة بروتوكولات الأمان الرقمي.'
                  : 'Total whistleblower privacy and encrypted identity protection.'}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                {language === 'ar'
                  ? 'توثيق الأدلة الرقمية بالبصمة التشفيرية (SHA-256) للحفاظ على الحجية القانونية للمقطع.'
                  : 'Court-admissible cryptographic hashing (SHA-256) to ensure media integrity.'}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                {language === 'ar'
                  ? 'توجيه آلي جغرافي مباشر لغرفة عمليات الجهة المسؤولة وتتبع الحالة بالرقم المرجعي.'
                  : 'Direct automated geographic dispatch to the jurisdiction with live reference tracking.'}
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Core Highlights / Software Architecture Cards */}
      <div className="space-y-4">
        <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 text-center">
          {language === 'ar' ? 'المزايا الجوهرية للبرمجية' : 'Core Architectural Pillars'}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2.5 hover:border-amber-400 transition-colors">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-sm text-slate-900">
              {language === 'ar' ? 'سرية وخصوصية مشفرة' : 'Encrypted Privacy'}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {language === 'ar'
                ? 'إمكانية تقديم البلاغ بهوية محمية دون كشف اسم المُبلّغ لضمان أعلى درجات الأمان الشخصي.'
                : 'Anonymous protected submission options safeguarding citizen identity.'}
            </p>
          </div>

          <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2.5 hover:border-amber-400 transition-colors">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
              <Video className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-sm text-slate-900">
              {language === 'ar' ? 'توثيق وسائط عالية الدقة' : 'Forensic Media Ingestion'}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {language === 'ar'
                ? 'دعم رفع الفيديوهات والصور والتسجيلات الصوتية مع فحص فني جنائي لسلامة المقطع.'
                : 'Accepts photos, HD videos, and audio notes with integrity validation.'}
            </p>
          </div>

          <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2.5 hover:border-amber-400 transition-colors">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-sm text-slate-900">
              {language === 'ar' ? 'التوافق مع القوانين واللوائح' : 'Legal Compliance'}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {language === 'ar'
                ? 'متوافقة مع أحكام قانون حماية البيانات الشخصية رقم 151 لسنة 2020 ومكافحة جرائم تقنية المعلومات.'
                : 'Compliant with Egyptian Cybercrime and Personal Data Protection laws.'}
            </p>
          </div>

          <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2.5 hover:border-amber-400 transition-colors">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
              <FileCheck className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-sm text-slate-900">
              {language === 'ar' ? 'تتبع لحظي وإيصال رقمي' : 'Live Tracking & Receipt'}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {language === 'ar'
                ? 'توليد كود موحد وإيصال استلام رسمي قابل للطباعة لمتابعة مجريات البلاغ أولاً بأول.'
                : 'Generates a unique tracking code with printable official submission receipts.'}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Launchpad to Explore Other Sections */}
      <div className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-start">
          <h2 className="text-base sm:text-lg font-extrabold">
            {language === 'ar' ? 'جاهز لاستكشاف أهداف ودليل تشغيل البرمجية؟' : 'Ready to explore Goals & User Guide?'}
          </h2>
          <p className="text-xs text-slate-300">
            {language === 'ar'
              ? 'اطّلع على الأهداف التعليمية والمقررات الدراسية المطبقة، أو ابدأ بتسجيل بلاغ تجريبي.'
              : 'Review educational objectives or test the live reporting pipeline.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap justify-center shrink-0">
          <button
            onClick={() => setActiveView('goals')}
            className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Target className="w-4 h-4" />
            <span>{language === 'ar' ? 'أهداف البرمجية' : 'Software Goals'}</span>
          </button>
          <button
            onClick={() => setActiveView('user_guide')}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span>{language === 'ar' ? 'دليل الاستخدام والتشغيل' : 'User Guide'}</span>
          </button>
          <button
            onClick={() => setActiveView('submit_report')}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>{language === 'ar' ? 'تجربة تقديم بلاغ' : 'Test Report'}</span>
            <Arrow className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
