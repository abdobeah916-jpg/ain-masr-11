import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  CheckCircle,
  XCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Scale,
  Lock,
  PhoneCall,
  EyeOff,
  Video,
  Share2,
  Zap,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { t } from '../locales/i18n';
import { FAQS } from '../data/mockData';

export const SafetyCenterView: React.FC = () => {
  const { language, setEmergencyModalOpen, setActiveView } = useApp();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-10">
      {/* Hero Banner: The Core Mission */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-[#0e2238] text-white p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-5 shadow-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-xs font-semibold">
          <Video className="w-4 h-4 text-amber-400" />
          <span>{language === 'ar' ? 'البديل الوطني لنشر مقاطع الجرائم على النت' : 'The Official Alternative to Viral Crime Videos'}</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight">
          {t('safetyCenterTitle', language)}
        </h1>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
          {t('safetyCenterSubtitle', language)}
        </p>

        {/* Primary Mission Card: Send It Here, Don't Post It on Social Media */}
        <div className="p-4 sm:p-5 bg-gradient-to-br from-amber-500/15 to-emerald-500/10 border border-amber-400/40 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
            <span>
              {language === 'ar'
                ? '«صوّرت واقعة أو جريمة؟ ابعتها لعين مصر بدل ما تنزل على النت وتعمل بلبلة»'
                : '"Captured a crime on video? Send it to Ain Masr instead of posting it on social media"'}
            </span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed font-normal">
            {language === 'ar'
              ? 'الهدف الأساسي لمنصة «عين مصر» هو القضاء على ظاهرة تصوير الجرائم والمشاجرات والانتهاكات ونشرها على فيسبوك وتيك توك. نشر الفيديوهات على النت يثير الفزع، ويسيء للضحايا وكرامتهم، وينبه الجناة للهروب، كما يعرض ناشر الفيديو للمساءلة القانونية. هنا، يصل دليلك المصور فوراً وبأعلى جودة وسرية مشفرة لأجهزة التحقيق والأمن لتطبيق القانون بحزم وبدون فوضى إلكترونية.'
              : 'Ain Masr was created to eliminate the trend of recording crimes and violent altercations and posting them on social media. Public online circulation causes panic, traumatizes victims, alerts culprits to flee, and exposes uploaders to legal penalties. Here, your raw video evidence is dispatched directly, securely, and confidentially to verified authorities and prosecutors.'}
          </p>
          <div className="pt-2">
            <button
              onClick={() => setActiveView('report_wizard')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
            >
              <span>{language === 'ar' ? 'إرسال فيديو واقعة أو جريمة الآن' : 'Submit Documented Evidence Now'}</span>
              <ArrowRight className={`w-3.5 h-3.5 ${language === 'ar' ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Comparison: Reporting via Ain Masr vs Posting on Social Media */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="font-extrabold text-slate-900 text-base sm:text-lg flex items-center gap-2">
          <Scale className="w-5 h-5 text-amber-600" />
          <span>
            {language === 'ar'
              ? 'مقارنة حاسمة: إرسال الفيديو عبر تطبيق عين مصر أم نشره على السوشيال ميديا؟'
              : 'Critical Comparison: Submitting to Ain Masr vs Viral Social Media Posting'}
          </span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Why Ain Masr Wins */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-3">
            <div className="flex items-center gap-2 font-bold text-emerald-900">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{language === 'ar' ? 'عبر منصة عين مصر (المسار القانوني الصحيح)' : 'Via Ain Masr (Lawful & Secure)'}</span>
            </div>
            {language === 'ar' ? (
              <ul className="space-y-2 text-emerald-800">
                <li className="flex items-start gap-1.5">
                  <span className="font-bold text-emerald-600">✓</span>
                  <span><strong>دليل جنائي معتمد (SHA-256):</strong> حفظ المقطع الأصلي ببصمة مشفرة تمنع الطعن بالتزوير في المحكمة.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="font-bold text-emerald-600">✓</span>
                  <span><strong>حماية سرية المُبلّغ:</strong> هويتك وبياناتك محمية تماماً من أي استهداف أو حرج أو انتقام.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="font-bold text-emerald-600">✓</span>
                  <span><strong>تحرك أمني فوري:</strong> يصل البلاغ مباشرة لضباط المباحث وغرف العمليات والنيابة العامة المختصة.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="font-bold text-emerald-600">✓</span>
                  <span><strong>صون كرامة الضحية والمجتمع:</strong> يمنع استغلال المأساة كـ "تريند" فضائح أو تجارة بالمشاعر.</span>
                </li>
              </ul>
            ) : (
              <ul className="space-y-2 text-emerald-800">
                <li className="flex items-start gap-1.5">
                  <span className="font-bold text-emerald-600">✓</span>
                  <span><strong>Certified Forensic Evidence (SHA-256):</strong> Preserves original video with cryptographic hash preventing judicial tampering challenges.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="font-bold text-emerald-600">✓</span>
                  <span><strong>Whistleblower Anonymity:</strong> Identity and metadata are encrypted and shielded from any social retaliation.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="font-bold text-emerald-600">✓</span>
                  <span><strong>Immediate Police Action:</strong> Direct ingestion to detectives, operations command, and public prosecution.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="font-bold text-emerald-600">✓</span>
                  <span><strong>Victim & Civic Dignity:</strong> Prevents weaponizing tragedies into sensationalized viral scandals.</span>
                </li>
              </ul>
            )}
          </div>

          {/* Social Media Hazards */}
          <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-xl space-y-3">
            <div className="flex items-center gap-2 font-bold text-rose-900">
              <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{language === 'ar' ? 'نشر الفيديو على فيسبوك وتيك توك (المسار الخاطئ)' : 'Viral Social Media (Harmful & Illegal)'}</span>
            </div>
            {language === 'ar' ? (
              <ul className="space-y-2 text-rose-800">
                <li className="flex items-start gap-1.5">
                  <span className="font-bold text-rose-600">✕</span>
                  <span><strong>إنذار الجناة للهروب:</strong> رؤية المجرم للفيديو على النت تمنحه وقتاً لإخفاء أداة الجريمة أو مغادرة المحافظة.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="font-bold text-rose-600">✕</span>
                  <span><strong>مساءلة قانونية للناشر:</strong> يجرّم القانون 175 لسنة 2018 وقانون العقوبات نشر ما ينتهك الخصوصية أو يثير الفزع.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="font-bold text-rose-600">✕</span>
                  <span><strong>وصمة مؤبدة للضحية:</strong> انتشار المقطع يضاعف الأثر النفسي المدمر على الضحايا وأسرهم إلى الأبد.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="font-bold text-rose-600">✕</span>
                  <span><strong>تداول روايات مغلوطة وشائعات:</strong> تحريف الحقيقة واقتطاع السياق يظلم أطرافاً بريئة ويعقد التحقيق.</span>
                </li>
              </ul>
            ) : (
              <ul className="space-y-2 text-rose-800">
                <li className="flex items-start gap-1.5">
                  <span className="font-bold text-rose-600">✕</span>
                  <span><strong>Suspect Alert & Evidence Destruction:</strong> Perpetrators gain advance warning to flee and conceal weapons.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="font-bold text-rose-600">✕</span>
                  <span><strong>Prosecution of Posters:</strong> Law No. 175 of 2018 and the Penal Code strictly criminalize broadcasting privacy violations.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="font-bold text-rose-600">✕</span>
                  <span><strong>Lifelong Stigmatization of Victims:</strong> Viral reposting deepens psychological suffering and ruins families.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="font-bold text-rose-600">✕</span>
                  <span><strong>Disinformation & Rumor Mills:</strong> Context-stripping defames innocent parties and derails official investigations.</span>
                </li>
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Two Column Grid: What to Report vs Prohibited Misuses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* What to report */}
        <div className="bg-white rounded-2xl border border-emerald-200 p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <span>{t('whatToReportTitle', language)}</span>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-700">
            {[
              language === 'ar' ? 'مقاطع وجرائم البلطجة، المشاجرات المسلحة، واستعراض القوة وفرض الإتاوات' : 'Armed thuggery, street gang altercations, force displays, and extortion',
              language === 'ar' ? 'وقائع التحرش والاعتداءات اللفظية والجسدية الموثقة بكاميرات المراقبة أو الهواتف' : 'Harassment, physical assaults, and violent attacks captured on surveillance or phones',
              language === 'ar' ? 'جرائم السرقات، السطو، كسر السيارات والمحلات، وسرقة مهمات الكهرباء والمرافق' : 'Thefts, shop burglaries, vehicle break-ins, and public utility equipment theft',
              language === 'ar' ? 'قيادة الرعونة الخطرة، سباقات الشوارع، ومطاردات السيارات المعرضة لحياة المواطنين' : 'Reckless stunt driving, illegal street racing, and road aggression endangering citizens',
              language === 'ar' ? 'جرائم التعدي الصارخ على أراضي الدولة، البناء المخالف، وتجريف الأراضي الزراعية' : 'Encroachments on state land, illegal structural construction, and farmland destruction',
              language === 'ar' ? 'أوكار تجارة المخدرات، حيازة وتصنيع الأسلحة البيضاء والنارية غير المرخصة' : 'Narcotics trafficking hotspots and illicit firearms/weapons possession',
              language === 'ar' ? 'صفحات النصب الإلكتروني، الابتزاز الرقمي، وانتحال صفة الهيئات الحكومية' : 'Digital extortion, blackmail, cyber fraud syndicates, and phishing portals',
            ].map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold shrink-0">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Why posting online is prohibited / What not to do */}
        <div className="bg-white rounded-2xl border border-rose-200 p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
            <XCircle className="w-5 h-5 text-rose-600" />
            <span>{t('whatNotToReportTitle', language)}</span>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-700">
            {[
              language === 'ar' ? 'حظر نشر الفيديوهات على فيسبوك وتيك توك لإثارة "التريند" أو الفضائح والتشهير' : 'Strictly avoid posting videos on Facebook/TikTok for virality or sensationalist slander',
              language === 'ar' ? 'حظر البلاغات الكيدية أو الملفقة لتصفية الخلافات الشخصية (معاقب عليها جنائياً بحزم)' : 'Strictly no malicious or fabricated claims for personal vengeance (criminally prosecuted)',
              language === 'ar' ? 'النزاعات الأسرية والخلافات العائلية البحتة داخل المنازل التي لا تمثل جريمة أو خطراً عاماً' : 'Private internal marital disagreements that do not involve public harm or crimes',
              language === 'ar' ? 'فبركة أو اقتطاع الفيديوهات ببرامج المونتاج لتغيير حقيقة ما حدث (يفحصها الخادم جنائياً)' : 'Deepfakes or maliciously trimmed media to distort truth (vault verifies cryptographic checksums)',
              language === 'ar' ? 'المخاطرة بحياتك للتصوير أثناء وقوع الخطر الداهم (سلامتك الشخصية أولاً ثم التوثيق بأمان)' : 'Do not risk personal safety to record during active danger (secure yourself first)',
              language === 'ar' ? 'نشر صور تنتهك حرمة الحياة الخاصة لمواطنين آمنين دون مقتضى جنائي أو تصريح قانوني' : 'Circulating media invading private sanctity of innocent individuals without criminal grounds',
            ].map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-rose-600 font-bold shrink-0">✕</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Egyptian Legal Framework Card */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-700">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900">
              {language === 'ar' ? 'الإطار القانوني المصري لحظر النشر والتشهير وحماية الأدلة الجنائية' : 'Egyptian Legal Framework for Evidence Custody & Anti-Defamation'}
            </h3>
            <p className="text-xs text-slate-500">
              {language === 'ar'
                ? 'وفقاً لقانون العقوبات والقانون رقم 175 لسنة 2018 وقانون الإجراءات الجنائية'
                : 'In accordance with Penal Code, Law No. 175 of 2018 on Cybercrime, and Criminal Procedure Code'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700 pt-2">
          <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-1.5">
            <span className="font-bold text-slate-900 block">
              {language === 'ar' ? 'المادتان 25 و26 من قانون مكافحة جرائم تقنية المعلومات' : 'Articles 25 & 26 (Cybercrime Law 175/2018)'}
            </span>
            <p className="text-slate-600 leading-relaxed">
              {language === 'ar'
                ? 'يعاقب بالحبس مدة لا تقل عن 6 أشهر وغرامة تصل إلى 100 ألف جنيه كل من نشر أو أذاع علناً مقاطع تنتهك حرمة الحياة الخاصة أو تتعدى على قيم المجتمع. إرسالك المقطع لعين مصر يحميك من هذه العقوبة لأنه يضعه مباشرة في مسار التحقيق القضائي السري المعتمد.'
                : 'Imposes severe imprisonment and fines for publishing private media publicly. Sending your recordings through Ain Masr preserves your legal immunity by delivering raw material directly to formal prosecution channels.'}
            </p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-1.5">
            <span className="font-bold text-slate-900 block">
              {language === 'ar' ? 'حجية الدليل الرقمي الجنائي (سلسلة الحيازة المشفرة)' : 'Evidentiary Chain of Custody & Judicial Authenticity'}
            </span>
            <p className="text-slate-600 leading-relaxed">
              {language === 'ar'
                ? 'عند إرسال الفيديو هنا، يقوم الخادم باحتساب بصمة تشفيرية فريدة (SHA-256 Checksum) تثبت للنيابة العامة والمحكمة أن الفيديو خام ولم يتعرض للتعديل أو المونتاج، مما يعزز موقف الضحية ويضمن صدور حكم قضائي ناجز ضد الجاني.'
                : 'Every media asset processed through Ain Masr receives a SHA-256 cryptographic checksum, guaranteeing absolute chain of custody and forensic authenticity before the Egyptian judiciary.'}
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-amber-600" />
            <span>{t('faqTitle', language)}</span>
          </h2>
          <p className="text-xs text-slate-500">
            {language === 'ar'
              ? 'إجابات وافية حول كيفية التعامل مع مقاطع الجرائم وسرية بيانات المبلغين'
              : 'Comprehensive answers on how documented crime evidence is handled with full confidentiality'}
          </p>
        </div>

        <div className="space-y-2">
          {FAQS.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm transition-colors"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full text-start p-4 flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold text-slate-900 hover:bg-slate-50 cursor-pointer"
              >
                <span>{language === 'ar' ? faq.qAr : faq.qEn}</span>
                {openFaqIndex === idx ? (
                  <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                )}
              </button>
              {openFaqIndex === idx && (
                <div className="p-4 pt-0 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/60">
                  {language === 'ar' ? faq.aAr : faq.aEn}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
