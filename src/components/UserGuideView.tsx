import React, { useState } from 'react';
import {
  BookOpen,
  Download,
  Printer,
  CheckCircle2,
  Terminal,
  Play,
  Search,
  FileCheck,
  ShieldCheck,
  HelpCircle,
  Laptop,
  Cloud,
  ExternalLink,
  Copy,
  Check,
  Building,
  Sliders,
  User,
  MapPin,
  Lock,
  MessageSquare,
  FileText,
  AlertTriangle,
  RotateCcw,
  Power,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const UserGuideView: React.FC = () => {
  const { language, setActiveView } = useApp();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'deployment' | 'citizen' | 'suez' | 'admin'>('deployment');

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadMarkdown = () => {
    // Download the master USER_GUIDE.md
    const markdownContent = `# 🛡️ الدليل الشامل لتشغيل واستخدام منظومة «عين مصر» (Ain Masr)
المنظومة الوطنية الموحدة للبلاغات المدنية والسلامة العامة
مشروع برمجي تطبيقي تعليمي - متوافق بنسبة 100% مع معايير المشروعات الطلابية للمرحلة الثانوية

---

1. التعريف بالبرمجية وفكرة العمل المبتكرة:
تحويل ثقافة النشر العشوائي والتشهير على منصات التواصل الاجتماعي (التريند) إلى مسار مدني رسمي مشفر يتيح حماية سرية المُبلّغ وتوثيق الأدلة الرقمية بالبصمة الجنائية (SHA-256) وتوجيهها آلياً للجهات المختصة.

2. طرق التشغيل:
- محلياً (Local):
  1) npm install
  2) npm run dev
  3) فتح المتصفح على http://localhost:3000
- سحابياً عبر Vercel (Cloud):
  1) رفع الكود على GitHub.
  2) استيراد المستودع على Vercel.com.
  3) الضغط على Deploy لإنشاء رابط مباشر يعمل أونلاين فورياً.

3. رحلة المواطن (Citizen):
- اختيار تصنيف البلاغ (10 فئات معتمدة).
- إدخال الوصف ومستوى الخطورة.
- تحديد الموقع بدقة عبر الخريطة التفاعلية ونطاقات الأحياء السريعة.
- رفع الفيديوهات (حتى 500MB) مع الفحص الجنائي لبصمة SHA-256 وطمس اللوحات.
- اختيار الهوية (محمية وسرية تماماً أو موثقة).
- الإرسال والحصول على كود تتبع وطباعة إيصال البلاغ.
- متابعة الحالة عبر الجدول الزمني والرد على استفسارات جهة التحقيق.

4. غرفة عمليات جهة السويس المركزية (Suez Operations Branch):
- الاختصاص: أقسام الأربعين، السويس، فيصل، عتاقة، الجناين، وبور توفيق.
- استعراض البلاغات الجغرافية الموجهة للسويس وحساب المسافة بالكيلومترات إلى مقر الفرع.
- فحص الفيديو بالبصمة الجنائية والتأكد من عدم التعديل.
- الخيارات المتاحة: تغيير الحالة (قيد التحقيق الميداني)، شات استيضاح سري مع المواطن، مذكرات داخلية سرية، مشاركة البلاغ عبر الشبكة المركزية، وحل وإغلاق البلاغ مع تقرير الإجراء الميداني.

5. لوحة تحكم الإدارة العليا (Admin Dashboard):
- مراقبة مؤشرات الأداء الحية على مستوى محافظات الجمهورية.
- إدارة كافة البلاغات وتجاوز الاختصاصات.
- محرك قواعد التوجيه الآلي (Routing Engine).
- إدارة الجهات والفروع وتصنيفات البلاغات.
- إدارة المستخدمين والموظفين والصلاحيات.
- مركز الفرز والمراجعة الأمنية والحجر الرقمي.
- سجل التدقيق الأمني الجنائي (Audit Logs) بالثانية واسم الموظف.

6. الخروج السهل والآمن:
- زر خروج مخصص بالشريط العلوي يتيح إنهاء الجلسة وإغلاق النظام بالكامل أو العودة للرئيسية.`;

    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'USER_GUIDE_AIN_MASR.md';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-in fade-in">
      {/* Header with Print & Download Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold">
            <BookOpen className="w-3.5 h-3.5 text-blue-600" />
            <span>{language === 'ar' ? 'دليل الاستخدام والتشغيل الشامل' : 'Master User & Operations Manual'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {language === 'ar' ? 'دليل تشغيل واستخدام برمجية «عين مصر»' : 'Ain Masr Software Operations Guide'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {language === 'ar'
              ? 'وثيقة تفصيلية متكاملة توضح طريقة التشغيل المحلي والسحابي، ورحلة المواطن، وجهة السويس، والإدارة العليا.'
              : 'Complete reference covering Local/Vercel setup, Citizen journey, Suez Operations, and Admin Dashboard.'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            onClick={handleDownloadMarkdown}
            className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            title="تحميل الدليل النصي الكامل بصيغة Markdown"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>{language === 'ar' ? 'تحميل كملف نصي (.md)' : 'Download .md'}</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>{language === 'ar' ? 'طباعة الدليل' : 'Print Guide'}</span>
          </button>
        </div>
      </div>

      {/* Segmented Guide Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-200/80 rounded-2xl overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveTab('deployment')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'deployment' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Terminal className="w-4 h-4 text-amber-500" />
          <span>{language === 'ar' ? '1. طرق التشغيل (Local + Vercel)' : '1. Run & Deploy'}</span>
        </button>

        <button
          onClick={() => setActiveTab('citizen')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'citizen' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <User className="w-4 h-4 text-blue-500" />
          <span>{language === 'ar' ? '2. رحلة المواطن (Citizen Journey)' : '2. Citizen Journey'}</span>
        </button>

        <button
          onClick={() => setActiveTab('suez')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'suez' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building className="w-4 h-4 text-emerald-600" />
          <span>{language === 'ar' ? '3. جهة السويس المركزية' : '3. Suez Operations'}</span>
        </button>

        <button
          onClick={() => setActiveTab('admin')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'admin' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sliders className="w-4 h-4 text-purple-600" />
          <span>{language === 'ar' ? '4. لوحة الإدارة العليا (Admin)' : '4. Admin Dashboard'}</span>
        </button>
      </div>

      {/* Tab 1: Deployment & Running */}
      {activeTab === 'deployment' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Direct Online Access (The easiest path) */}
          <div className="p-6 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-blue-500/10 border-2 border-amber-400/50 rounded-3xl shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 text-amber-900 font-bold text-sm">
              <Cloud className="w-5 h-5 text-amber-600" />
              <span>{language === 'ar' ? 'أولاً: الدخول السحابي المباشر أونلاين (الرابط الأسهل والجاهز)' : 'Direct Online Access'}</span>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">
              {language === 'ar'
                ? 'يمكن لأي محكّم أو مستخدم فتح واستخدام المنظومة فوراً بنقرة واحدة من أي جهاز أو هاتف محمول عبر الرابط المباشر، دون الحاجة لتثبيت أي برامج أو تشغيل أي أوامر:'
                : 'Access the live application immediately from any phone or computer without running any setup:'}
            </p>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shrink-0">
                  🔗
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">رابط المنظومة المباشر أونلاين</span>
                  <a
                    href="https://ain-masr.vercel.app"
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-xs sm:text-sm font-bold text-amber-700 hover:text-amber-800 hover:underline truncate block"
                  >
                    https://ain-masr.vercel.app
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleCopy('https://ain-masr.vercel.app', 'vercel-link')}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedCode === 'vercel-link' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode === 'vercel-link' ? 'تم النسخ!' : 'نسخ الرابط'}</span>
                </button>
                <a
                  href="https://ain-masr.vercel.app"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <span>فتح الرابط</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 bg-white/60 p-2.5 rounded-xl border border-amber-200/50 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>الرابط جاهز ويعمل بكامل وظائفه وقواعد بياناته وتتبع البلاغات أونلاين.</span>
            </div>
          </div>

          {/* Local Run */}
          <div className="p-6 bg-slate-950 text-white rounded-3xl border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center gap-2.5 text-amber-400 font-bold text-sm">
              <Terminal className="w-5 h-5" />
              <span>{language === 'ar' ? 'ثانياً: خطوات التشغيل المحلي على جهاز الحاسوب (Local Run)' : 'Local PC Execution'}</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {language === 'ar'
                ? 'إذا رغبت في تشغيل المنظومة محلياً على حاسوبك الشخصي عبر موجه الأوامر (Terminal):'
                : 'To run the application locally on your PC via Terminal:'}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 block text-[10px]"># الخطوة 1: تثبيت المكتبات</span>
                  <span className="text-emerald-400 font-bold">npm install</span>
                </div>
                <button
                  onClick={() => handleCopy('npm install', 'install')}
                  className="text-slate-400 hover:text-white p-1 rounded transition-colors"
                >
                  {copiedCode === 'install' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 block text-[10px]"># الخطوة 2: تشغيل خادم التطوير</span>
                  <span className="text-amber-400 font-bold">npm run dev</span>
                </div>
                <button
                  onClick={() => handleCopy('npm run dev', 'dev')}
                  className="text-slate-400 hover:text-white p-1 rounded transition-colors"
                >
                  {copiedCode === 'dev' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-[11px] text-slate-300 flex items-center gap-2">
              <Laptop className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                {language === 'ar'
                  ? 'بعد تشغيل الأمر، افتح متصفحك على الرابط المحلي: http://localhost:3000'
                  : 'Open your browser and navigate to: http://localhost:3000'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Citizen Journey */}
      {activeTab === 'citizen' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-xs space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">دليل المستخدم الكامل</span>
              <h2 className="text-lg font-extrabold text-slate-900">رحلة المواطن لتقديم وتتبع بلاغ مدني موثق</h2>
            </div>

            <div className="space-y-4 pt-2">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5 text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-[10px]">1</span>
                  <span>الخطوة 1: اختيار تصنيف البلاغ</span>
                </div>
                <p className="text-slate-600 leading-relaxed pr-7 rtl:pr-7 rtl:pl-0 pl-7 text-[11px]">
                  اختيار نوع الواقعة من بين 10 تصنيفات معتمدة (بلطجة وسرقات، كسور مياه وكهرباء، هبوط طرق، حماية مستهلك، تعديات أراضٍ، تحرش، بيئة، أو تصنيف مخصص).
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5 text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-[10px]">2</span>
                  <span>الخطوة 2: ملء تفاصيل الواقعة ومستوى الخطورة</span>
                </div>
                <p className="text-slate-600 leading-relaxed pr-7 rtl:pr-7 rtl:pl-0 pl-7 text-[11px]">
                  كتابة عنوان ووصف دقيق للحادث، تحديد التاريخ والوقت، وتحديد مستوى الخطورة (منخفض، متوسط، مرتفع، حرج وطارئ)، مع تحديد هل الخطر مستمر أم انتهى.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5 text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-[10px]">3</span>
                  <span>الخطوة 3: تحديد الموقع بالـ GPS والخريطة التفاعلية</span>
                </div>
                <p className="text-slate-600 leading-relaxed pr-7 rtl:pr-7 rtl:pl-0 pl-7 text-[11px]">
                  تحديد الموقع بنقرة واحدة عبر GPS أو النقر على الخريطة التفاعلية مع شريط النطاقات السريعة لأحياء مصر وميادينها (الأربعين بالسويس، مدينة نصر، المعادي، محطة الرمل...).
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5 text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-[10px]">4</span>
                  <span>الخطوة 4: إرفاق الأدلة الرقمية وفحص الهاش الجنائي (SHA-256)</span>
                </div>
                <p className="text-slate-600 leading-relaxed pr-7 rtl:pr-7 rtl:pl-0 pl-7 text-[11px]">
                  رفع الفيديوهات حتى 500 ميجا، صور الحادث، أو تسجيل شهادة صوتية عبر المتصفح. يقوم النظام آلياً باستخراج بصمة التجزئة التشفيرية (SHA-256) لضمان سلامة الدليل أمام جهات التحقيق ومنع التلاعب.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5 text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-[10px]">5</span>
                  <span>الخطوة 5: حماية هوية المُبلّغ (سرية تامة أو بيانات موثقة)</span>
                </div>
                <p className="text-slate-600 leading-relaxed pr-7 rtl:pr-7 rtl:pl-0 pl-7 text-[11px]">
                  اختيار تقديم البلاغ بهوية محمية وسرية 100% (دون إدخال أي اسم أو رقم) لحماية المواطن من الملاحقة، أو بهوية موثقة.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5 text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-[10px]">6</span>
                  <span>الخطوة 6: الإرسال، الكود المرجعي، وطباعة الإيصال</span>
                </div>
                <p className="text-slate-600 leading-relaxed pr-7 rtl:pr-7 rtl:pl-0 pl-7 text-[11px]">
                  استلام كود مرجعي وطني موحد (EGY-2026-XXXX)، مع إمكانية طباعة إيصال رسمي يحتوي على باركود وتفاصيل البلاغ بصيغة PDF.
                </p>
              </div>

              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-1.5 text-xs text-emerald-900">
                <div className="flex items-center gap-2 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>تتبع البلاغ خطوة بخطوة</span>
                </div>
                <p className="leading-relaxed pr-6 rtl:pr-6 rtl:pl-0 pl-6 text-[11px]">
                  من صفحة تتبع البلاغات: إدخال الكود لمتابعة التحديثات الحية من الجهة، والرد على أسئلة المحقق عبر شات الاستيضاح السري.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Suez Operations Branch */}
      {activeTab === 'suez' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-xs space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                  دليل غرفة عمليات جهة السويس المركزية (Suez Central Operations)
                </h2>
                <p className="text-xs text-slate-500">
                  شرح تفصيلي لدور جهة الضبط وكيفية استقبال ومعالجة البلاغات الجغرافية الموجهة للسويس
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
              {/* Point 1: Scope */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <h3 className="font-extrabold text-slate-900 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>نطاق الاختصاص الجغرافي لفرع السويس:</span>
                </h3>
                <p className="text-[11px] text-slate-600">
                  يغطي فرع السويس المركزي (SUEZ-HQ-01) كافة أقسام المحافظة: <strong>قسم الأربعين، قسم السويس، قسم فيصل، قسم عتاقة، قسم الجناين، وميناء بور توفيق</strong>. المقر المركزي: مجمع الإدارات - ميدان الخضر - السويس.
                </p>
              </div>

              {/* Point 2: What appears in the dashboard */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <h3 className="font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Search className="w-4 h-4 text-blue-600" />
                  <span>ماذا يظهر في شاشة ضابط ومسؤول عمليات السويس؟</span>
                </h3>
                <ul className="space-y-1.5 text-[11px] text-slate-600 list-disc pr-5 rtl:pr-5 rtl:pl-0 pl-5">
                  <li><strong>عدادات حية خاصة بالسويس:</strong> عدد البلاغات الواردة، قيد التحقيق، والمحسومة في نطاق المحافظة.</li>
                  <li><strong>قائمة البلاغات الموجهة جغرافياً للسويس:</strong> يتم توجيه أي بلاغ تقع إحداثياته في السويس آلياً إلى هذا الفرع.</li>
                  <li><strong>حساب المسافة الميدانية بالكيلومترات:</strong> يحسب النظام آلياً المسافة الدقيقة بين موقع البلاغ ومقر الفرع بميدان الخضر (مثل: "على بعد 1.8 كم من مقر الفرع").</li>
                </ul>
              </div>

              {/* Point 3: Available Actions */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <h3 className="font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-amber-600" />
                  <span>الإجراءات والخيارات المتاحة لمسؤول جهة السويس (وماذا يترتب عليها):</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                  <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                    <span className="font-bold text-slate-900 block">1. تغيير الحالة إلى "قيد الفحص والتحقيق"</span>
                    <p className="text-slate-500">
                      يؤكد استلام البلاغ وتحريك دورية ميدانية لمعاينة الموقع. يظهر التحديث فورياً للمواطن.
                    </p>
                  </div>

                  <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                    <span className="font-bold text-slate-900 block">2. إرسال استيضاح سري للمواطن</span>
                    <p className="text-slate-500">
                      كتابة سؤال لطلب مزيد من المعطيات من المُبلّغ عبر شات الاستيضاح دون أن يكشف المواطن عن اسمه.
                    </p>
                  </div>

                  <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                    <span className="font-bold text-slate-900 block">3. تدوين مذكرات داخلية سرية</span>
                    <p className="text-slate-500">
                      ملاحظات أمنية وإجرائية بين أفراد الفرع وضباط العمليات لا يراها المواطن نهائياً.
                    </p>
                  </div>

                  <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                    <span className="font-bold text-slate-900 block">4. مشاركة البلاغ عبر الشبكة المركزية</span>
                    <p className="text-slate-500">
                      إتاحة المعاينة لغرف العمليات المشتركة (مثل نجدة السويس أو المرور) للتعامل المشترك.
                    </p>
                  </div>

                  <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1 md:col-span-2">
                    <span className="font-bold text-emerald-800 block">5. حل وإنهاء البلاغ (Resolve Report)</span>
                    <p className="text-slate-500">
                      تسجيل التقرير الإجرائي الميداني النهائي (مثل: "تم ضبط المتهمين وإحالتهم للنيابة" أو "تم إصلاح ماسورة مياه الأربعين")، وتتحول حالة البلاغ للمواطن إلى اللون الأخضر.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Admin Dashboard */}
      {activeTab === 'admin' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-xs space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-bold">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                  دليل لوحة تحكم الإدارة العامة (Admin Dashboard)
                </h2>
                <p className="text-xs text-slate-500">
                  القيادة المركزية العليا للمنظومة على مستوى كافة محافظات مصر
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
                <h3 className="font-extrabold text-slate-900">1. مؤشرات الأداء القومية</h3>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  متابعة إجمالي البلاغات في الـ 27 محافظة، نسبة الإنجاز والحل، معدل زمن الاستجابة، ورسوم بيانية لقطاعات المخالفات.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
                <h3 className="font-extrabold text-slate-900">2. إدارة جميع البلاغات</h3>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  استعراض البلاغات وتصفيتها حسب المحافظة أو الخطورة، مع صلاحية تعديل أو إعادة توجيه أي بلاغ يدوياً.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
                <h3 className="font-extrabold text-slate-900">3. محرك قواعد التوجيه الآلي</h3>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  برمجة وتعديل شروط التوزيع التلقائي للبلاغات حسب المحافظة والتصنيف ومستوى الخطورة وربطها بالجهات.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
                <h3 className="font-extrabold text-slate-900">4. إدارة الجهات والفروع</h3>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  إضافة جهات حكومية ومديريات جديدة، وفروع جغرافية وتحديد إحداثياتها ونطاقات تغطيتها وأرقام هواتفها.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
                <h3 className="font-extrabold text-slate-900">5. إدارة الموظفين والصلاحيات</h3>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  إنشاء وتعيين حسابات الضباط والمسؤولين في الفروع الجغرافية وتعديل الأدوار وإيقاف الحسابات المخالفة.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
                <h3 className="font-extrabold text-slate-900">6. الفرز الأمني وسجل التدقيق</h3>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  حجر البلاغات الكيدية، واستعراض سجل التدقيق الأمني الجنائي (Audit Logs) الذي يسجل كل حركة بالثانية واسم الموظف.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <button
          onClick={() => setActiveView('goals')}
          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors cursor-pointer"
        >
          {language === 'ar' ? '← شاشة أهداف البرمجية' : '← Software Goals'}
        </button>

        <button
          onClick={() => setActiveView('submit_report')}
          className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
        >
          <span>{language === 'ar' ? 'بدء تجربة المنظومة الآن' : 'Start Testing Now'}</span>
          <Play className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
