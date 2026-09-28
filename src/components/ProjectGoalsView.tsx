import React from 'react';
import {
  Target,
  GraduationCap,
  Code2,
  Users,
  ShieldCheck,
  CheckCircle2,
  Layers,
  BookOpen,
  Cpu,
  Monitor,
  Video,
  FileText,
  Lock,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ProjectGoalsView: React.FC = () => {
  const { language, setActiveView } = useApp();

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-10 animate-in fade-in">
      {/* Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/40 text-emerald-900 text-xs sm:text-sm font-bold shadow-xs">
          <Target className="w-4 h-4 text-emerald-600" />
          <span>{language === 'ar' ? 'أهداف البرمجية والمشروع' : 'Software Goals & Objectives'}</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
          {language === 'ar' ? 'الأهداف التعليمية والتقنية والمجتمعية للعمل' : 'Educational, Technical & Civic Objectives'}
        </h1>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
          {language === 'ar'
            ? 'تم إعداد وبناء برمجية «عين مصر» استناداً إلى أهداف تربوية وتقنية واضحة تحقق الدمج بين المقررات الدراسية للمرحلة الثانوية والتطبيق العملي لخدمة المجتمع.'
            : 'Ain Masr was engineered based on well-defined educational, technical, and societal goals bridging curriculum with real-world applications.'}
        </p>
      </div>

      {/* Goal Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Category 1: Educational Objectives */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            <GraduationCap className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
              {language === 'ar' ? 'المحور الأول' : 'Pillar 1'}
            </span>
            <h2 className="text-lg font-extrabold text-slate-900">
              {language === 'ar' ? 'الأهداف التعليمية والتربوية' : 'Educational Objectives'}
            </h2>
          </div>

          <ul className="space-y-3 text-xs text-slate-600 leading-relaxed">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                {language === 'ar'
                  ? 'ترسيخ مفهوم «المواطنة الرقمية الإيجابية» لدى الطلاب والشباب وتجنب السلوكيات الرقمية السلبية.'
                  : 'Fostering positive digital citizenship among students and youth.'}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                {language === 'ar'
                  ? 'تدريب المتعلم على التفكير المنطقي وحل المشكلات الحياتية من خلال تطوير برمجيات خدمية متكاملة.'
                  : 'Training learners on algorithmic thinking and solving real community challenges.'}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                {language === 'ar'
                  ? 'تعزيز الوعي بالقوانين والتشريعات الرقمية ومسؤولية الفرد في حماية أمن مجتمعه.'
                  : 'Enhancing legal awareness regarding cybersecurity and digital responsibility.'}
              </span>
            </li>
          </ul>
        </div>

        {/* Category 2: Technical Objectives & Secondary Curriculum */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
            <Code2 className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              {language === 'ar' ? 'المحور الثاني' : 'Pillar 2'}
            </span>
            <h2 className="text-lg font-extrabold text-slate-900">
              {language === 'ar' ? 'الأهداف التقنية والبرمجية' : 'Technical & Software Goals'}
            </h2>
          </div>

          <ul className="space-y-3 text-xs text-slate-600 leading-relaxed">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                {language === 'ar'
                  ? 'التطبيق العملي لمفاهيم لغات الويب (HTML5 و CSS3 و JavaScript) المقررة في المنهج الثانوي.'
                  : 'Applying core high school computer science curriculum concepts in web programming.'}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                {language === 'ar'
                  ? 'تصميم واجهات مستخدم (UI/UX) متجاوبة مع كافة الشاشات والأجهزة وفق المعايير القياسية.'
                  : 'Developing responsive UI/UX architectures adhering to standard usability criteria.'}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                {language === 'ar'
                  ? 'فهم وتطبيق معايير أمن المعلومات والتشفير الرياضي لحماية البيانات وفحص بصمات الأدلة.'
                  : 'Implementing cryptographic hashing (SHA-256) and data privacy standards.'}
              </span>
            </li>
          </ul>
        </div>

        {/* Category 3: Societal & Public Safety Objectives */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              {language === 'ar' ? 'المحور الثالث' : 'Pillar 3'}
            </span>
            <h2 className="text-lg font-extrabold text-slate-900">
              {language === 'ar' ? 'الأهداف المجتمعية والأمنية' : 'Societal & Civic Goals'}
            </h2>
          </div>

          <ul className="space-y-3 text-xs text-slate-600 leading-relaxed">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                {language === 'ar'
                  ? 'القضاء على ظاهرة التشهير وانتهاك خصوصية المواطنين في وقائع الحوادث والمخالفات.'
                  : 'Preventing public doxxing, defamation, and infringement on citizen privacy.'}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                {language === 'ar'
                  ? 'تسريع وصول البلاغات الحرجة (مرافق، طرق، جرائم) إلى الجهات المسؤولة بدقة متناهية.'
                  : 'Accelerating urgent civic incident dispatches to official authorities.'}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                {language === 'ar'
                  ? 'بناء جسر ثقة رقمي بين المواطن ومؤسسات الدولة الخدمية والتنفيذية.'
                  : 'Fostering institutional trust between citizens and civic services.'}
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Prominent High School Curriculum Showcase (البند التاسع والعاشر في استمارة التحكيم) */}
      <div className="p-6 bg-slate-900 text-white rounded-3xl shadow-xl space-y-6 border border-slate-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-white">
                {language === 'ar'
                  ? 'البرمجيات والمناهج التي درسها الطالب بالمرحلة الثانوية والمطبقة في العمل'
                  : 'Secondary School Curriculum & Technologies Applied'}
              </h2>
              <p className="text-xs text-slate-400">
                {language === 'ar'
                  ? 'استيفاء البند (9) و (10) من استمارة تحكيم المشروعات الطلابية'
                  : 'Compliance with Criteria #9 and #10 of the Student Evaluation Rubric'}
              </p>
            </div>
          </div>

          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-xs font-bold">
            {language === 'ar' ? 'تطبيق عملي 100%' : '100% Practical Application'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Item 1 */}
          <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/80 space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-400">
              <Monitor className="w-4 h-4" />
              <span>HTML5 & CSS3</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              {language === 'ar'
                ? 'استخدام لغة هيكلة الصفحات وتنسيقات CSS المتجاوبة لبناء واجهات عصرية تتكيف مع الحاسوب والهاتف والتابلت.'
                : 'Semantic markup and responsive styling across all device viewports.'}
            </p>
          </div>

          {/* Item 2 */}
          <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/80 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sky-400">
              <Code2 className="w-4 h-4" />
              <span>JavaScript & Logic</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              {language === 'ar'
                ? 'البرمجة بلغة JavaScript/TypeScript لإدارة تدفق العمل، التحقق من المدخلات، وتوليد الأكواد المرجعية التلقائية.'
                : 'Client-side script logic, form validations, dynamic routing, and reference generation.'}
            </p>
          </div>

          {/* Item 3 */}
          <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/80 space-y-2">
            <div className="flex items-center gap-2 font-bold text-emerald-400">
              <Layers className="w-4 h-4" />
              <span>قواعد البيانات (Databases)</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              {language === 'ar'
                ? 'تطبيق مفاهيم جداول البيانات والحقول والمفاتيح المرجعية وتخزين سجلات البلاغات وتحديثها لحظياً.'
                : 'Data modeling, primary record keys, state persistence, and audit log histories.'}
            </p>
          </div>

          {/* Item 4 */}
          <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/80 space-y-2">
            <div className="flex items-center gap-2 font-bold text-purple-400">
              <Video className="w-4 h-4" />
              <span>برامج الوسائط المتعددة</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              {language === 'ar'
                ? 'توظيف مشغلات الفيديو، مسجلات الصوت، والخرائط الرقمية (GIS) مع معالجة الرسوميات والأيقونات دون مبالغة.'
                : 'Targeted integration of GIS maps, audio recording, and video players without visual clutter.'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <button
          onClick={() => setActiveView('intro')}
          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors cursor-pointer"
        >
          {language === 'ar' ? '← شاشة المقدمة والتعريف' : '← Software Intro'}
        </button>

        <button
          onClick={() => setActiveView('user_guide')}
          className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
        >
          {language === 'ar' ? 'دليل الاستخدام والتشغيل →' : 'User Guide →'}
        </button>
      </div>
    </div>
  );
};
