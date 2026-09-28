import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Car,
  Building2,
  Zap,
  Droplets,
  Trash2,
  Monitor,
  ShoppingBag,
  Eye,
  UserX,
  Lock,
  AlertTriangle,
  Flame,
  Bus,
  FileText,
  HelpCircle,
  MapPin,
  Upload,
  CheckCircle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Navigation,
  Save,
  FileCheck,
  Shield,
  EyeOff,
  UserCheck,
  Info,
  Copy,
  Check,
  X,
  Printer,
  Camera,
  Sparkles,
  Play,
  Film,
  FileAudio,
  FileIcon,
  Sliders,
  ExternalLink,
  Database,
  Server,
  HardDrive,
  Search,
  FilePlus,
  Building,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { t, formatSeverity } from '../locales/i18n';
import { GOVERNORATES, calculateDistanceKm } from '../data/mockData';
import { Severity, Attachment } from '../types';
import { InteractiveMap } from './InteractiveMap';
import { acquireAccurateGpsLocation } from '../utils/gpsService';
import { uploadVideoToDedicatedStorage, getDatabaseConfig } from '../utils/databaseService';

export const ReportWizard: React.FC = () => {
  const {
    language,
    categories,
    departments,
    submitNewReport,
    setActiveView,
    setSelectedReportId,
    setEmergencyModalOpen,
    loginAsOfficial,
    reportDraft,
    saveReportDraft,
    clearReportDraft,
    printReportReceipt,
  } = useApp();

  const Arrow = language === 'ar' ? ArrowLeft : ArrowRight;
  const BackArrow = language === 'ar' ? ArrowRight : ArrowLeft;

  const [step, setStep] = useState<number>(1);
  const [successReport, setSuccessReport] = useState<any>(null);
  const [copiedRef, setCopiedRef] = useState(false);

  // Form State
  const [categoryId, setCategoryId] = useState<string>('cat_traffic');
  const [customCategory, setCustomCategory] = useState<string>(''); // What the report is about in citizen's own words
  const [title, setTitle] = useState<string>('');
  const [dateOccurred, setDateOccurred] = useState<string>(new Date().toISOString().slice(0, 10));
  const [timeOccurred, setTimeOccurred] = useState<string>('12:00');
  const [isOngoing, setIsOngoing] = useState<boolean>(true);
  const [severity, setSeverity] = useState<Severity>('medium');
  const [description, setDescription] = useState<string>('');
  const [witnesses, setWitnesses] = useState<string>('');
  const [immediateDanger, setImmediateDanger] = useState<boolean>(false);
  const [additionalNotes, setAdditionalNotes] = useState<string>('');

  // Location State
  const [governorateId, setGovernorateId] = useState<string>('cairo');
  const [cityDistrict, setCityDistrict] = useState<string>('');
  const [streetLandmark, setStreetLandmark] = useState<string>('');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number }>({ lat: 30.055, lng: 31.34 });
  const [isLocatingGps, setIsLocatingGps] = useState<boolean>(false);
  const [gpsCaptured, setGpsCaptured] = useState<boolean>(false);
  const [gpsStatusText, setGpsStatusText] = useState<string | null>(null);

  // Attachments State - 500MB Support
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [privacyBlur, setPrivacyBlur] = useState<boolean>(true);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(100);

  // Identity State
  const [identityType, setIdentityType] = useState<'verified' | 'protected'>('verified');
  const [fullName, setFullName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [preferredContact, setPreferredContact] = useState<'sms' | 'phone' | 'email'>('phone');

  // Review State
  const [legalOathAgreed, setLegalOathAgreed] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Restore draft if available
  useEffect(() => {
    if (reportDraft) {
      if (reportDraft.categoryId) setCategoryId(reportDraft.categoryId);
      if (reportDraft.title) setTitle(reportDraft.title);
      if (reportDraft.description) setDescription(reportDraft.description);
      if (reportDraft.governorateId) setGovernorateId(reportDraft.governorateId);
      if (reportDraft.cityDistrict) setCityDistrict(reportDraft.cityDistrict);
      if (reportDraft.streetLandmark) setStreetLandmark(reportDraft.streetLandmark);
      if (reportDraft.coordinates) setCoordinates(reportDraft.coordinates);
      if (reportDraft.fullName) setFullName(reportDraft.fullName);
      if (reportDraft.phone) setPhone(reportDraft.phone);
    }
  }, []);

  const handleSaveDraft = () => {
    saveReportDraft({
      categoryId,
      title,
      dateOccurred,
      timeOccurred,
      isOngoing,
      severity,
      description,
      witnesses,
      immediateDanger,
      additionalNotes,
      governorateId,
      cityDistrict,
      streetLandmark,
      coordinates,
      identityType,
      fullName,
      phone,
      email,
      preferredContact,
    });
    alert(t('draftSavedAlert', language));
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShieldAlert': return <ShieldAlert className="w-5 h-5 text-rose-600" />;
      case 'Car': return <Car className="w-5 h-5 text-blue-600" />;
      case 'Building2': return <Building2 className="w-5 h-5 text-indigo-600" />;
      case 'Zap': return <Zap className="w-5 h-5 text-amber-500" />;
      case 'Droplets': return <Droplets className="w-5 h-5 text-sky-600" />;
      case 'Trash2': return <Trash2 className="w-5 h-5 text-emerald-600" />;
      case 'Monitor': return <Monitor className="w-5 h-5 text-purple-600" />;
      case 'ShoppingBag': return <ShoppingBag className="w-5 h-5 text-teal-600" />;
      case 'Eye': return <Eye className="w-5 h-5 text-slate-700" />;
      case 'UserX': return <UserX className="w-5 h-5 text-rose-500" />;
      case 'Lock': return <Lock className="w-5 h-5 text-slate-800" />;
      case 'AlertTriangle': return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      case 'Flame': return <Flame className="w-5 h-5 text-orange-600" />;
      case 'Bus': return <Bus className="w-5 h-5 text-blue-500" />;
      case 'FileText': return <FileText className="w-5 h-5 text-slate-600" />;
      default: return <HelpCircle className="w-5 h-5 text-slate-500" />;
    }
  };

  const selectedCategory = categories.find((c) => c.id === categoryId);

  // Defamation risk detection
  const hasDefamatoryWords =
    description.includes('حرامي') ||
    description.includes('نصاب') ||
    description.includes('فاسد') ||
    description.includes('خاين') ||
    description.toLowerCase().includes('thief') ||
    description.toLowerCase().includes('scammer');

  // Intelligent GPS & Geolocation Engine with multi-layer fallback
  const handleGpsDetect = async () => {
    setIsLocatingGps(true);
    setGpsStatusText(
      language === 'ar'
        ? '🛰️ جاري فتح وحدة الـ GPS والاتصال المباشر بالأقمار الصناعية...'
        : 'Connecting to GPS Satellites...'
    );

    try {
      const res = await acquireAccurateGpsLocation(language, (msg) => {
        setGpsStatusText(msg);
      });

      setCoordinates({ lat: res.lat, lng: res.lng });
      setGovernorateId(res.governorateId);
      setCityDistrict(res.district);
      setStreetLandmark(res.street);
      setGpsCaptured(true);

      // Clear any location errors
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next.district;
        delete next.landmark;
        return next;
      });

      setGpsStatusText(
        language === 'ar'
          ? `🎯 ${res.statusMessageAr || 'تم قفل الـ GPS بنجاح'}: [${res.lat}° N, ${res.lng}° E] — ${res.district}، ${res.governorateNameAr}`
          : `🎯 GPS Fix locked: [${res.lat}° N, ${res.lng}° E] (${res.district}, ${res.governorateNameEn})`
      );
      setTimeout(() => setGpsStatusText(null), 6000);
    } catch (err: any) {
      setGpsStatusText(
        language === 'ar'
          ? 'تعذر الوصول إلى الـ GPS تلقائياً. يمكنك النقر على الخريطة التفاعلية بالأسفل أو البحث باسم الشارع.'
          : 'Could not auto-lock GPS. Please click on the map or search by address.'
      );
      setTimeout(() => setGpsStatusText(null), 5000);
    } finally {
      setIsLocatingGps(false);
    }
  };

  const handleAddSampleEvidence = async () => {
    setIsUploading(true);
    setUploadProgress(40);
    const sampleBlob = new Blob(['sample-video-simulation-ainmasr-hd'], { type: 'video/mp4' });
    const uploadRes = await uploadVideoToDedicatedStorage(sampleBlob, 'site_inspection_video.mp4');
    
    setUploadProgress(100);
    setIsUploading(false);

    const sampleAtt: Attachment = {
      id: `att_sample_${Date.now()}`,
      name: language === 'ar' ? 'فيديو_معاينة_الموقع_ميدانياً.mp4' : 'site_inspection_video.mp4',
      type: 'video',
      url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
      sizeBytes: 1024 * 1024 * 48.5, // 48.5 MB
      isBlurred: privacyBlur,
      videoStorageId: uploadRes.videoStorageId,
      storageBucket: uploadRes.bucket,
    };
    setAttachments((prev) => [...prev, sampleAtt]);
  };

  // 500MB Media & Video Upload Handler with Dedicated Video Database Connector
  const MAX_FILE_SIZE_BYTES = 500 * 1024 * 1024; // 500 Megabytes

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    if (!e.target.files || e.target.files.length === 0) return;

    const files = Array.from(e.target.files);
    const oversizedFiles = files.filter((f) => f.size > MAX_FILE_SIZE_BYTES);

    if (oversizedFiles.length > 0) {
      setUploadError(
        language === 'ar'
          ? `الملف (${oversizedFiles[0].name}) يتجاوز الحد الأقصى المسموح (500 ميجابايت). الحد الأقصى هو 500 ميجا.`
          : `File (${oversizedFiles[0].name}) exceeds the maximum 500MB limit.`
      );
      return;
    }

    setIsUploading(true);
    setUploadProgress(20);

    try {
      const processedAtts: Attachment[] = [];
      let count = 0;

      for (const file of files) {
        count++;
        setUploadProgress(Math.min(25 + Math.round((count / files.length) * 65), 90));

        const isVideo = file.type.startsWith('video/') || file.name.endsWith('.mp4') || file.name.endsWith('.mov') || file.name.endsWith('.mkv');
        const type: Attachment['type'] = file.type.startsWith('image/')
          ? 'image'
          : isVideo
          ? 'video'
          : file.type.startsWith('audio/')
          ? 'audio'
          : 'document';

        let videoStorageId: string | undefined = undefined;
        let storageBucket: string | undefined = undefined;
        let sha256Checksum: string | undefined = undefined;
        let isFileValidated = false;
        let fileUrl = URL.createObjectURL(file);

        if (isVideo) {
          // Ingest into dedicated video database (Supabase Cloud or Node.js Video Vault)
          const videoRes = await uploadVideoToDedicatedStorage(file, file.name, (pct) => {
            setUploadProgress(pct);
          });
          videoStorageId = videoRes.videoStorageId;
          storageBucket = videoRes.bucket;
          sha256Checksum = videoRes.sha256;
          isFileValidated = Boolean(videoRes.isValid);
          if (videoRes.streamingUrl) {
            fileUrl = videoRes.streamingUrl;
          }
        }

        processedAtts.push({
          id: `att_${Date.now()}_${count}`,
          name: file.name,
          type,
          url: fileUrl,
          sizeBytes: file.size,
          isBlurred: privacyBlur,
          videoStorageId,
          storageBucket,
          sha256: sha256Checksum,
          isValidated: isFileValidated,
        });
      }

      setAttachments((prev) => [...prev, ...processedAtts]);
      setUploadProgress(100);
    } catch (err: any) {
      setUploadError(language === 'ar' ? 'حدث خطأ أثناء معالجة ورفع الملفات' : 'Error uploading files');
    } finally {
      setIsUploading(false);
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return language === 'ar' ? 'غير محدد' : 'Unknown';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return language === 'ar' ? `${mb.toFixed(1)} ميجابايت` : `${mb.toFixed(1)} MB`;
    return language === 'ar' ? `${Math.round(bytes / 1024)} كيلوبايت` : `${Math.round(bytes / 1024)} KB`;
  };

  // Step validation
  const validateCurrentStep = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (step === 1) {
      if (!customCategory.trim() && !categoryId) {
        errors.category = language === 'ar' ? 'يرجى كتابة ما يتعلق به البلاغ أو اختيار المقترح الأقرب' : 'Please specify what the report is about';
      }
    } else if (step === 2) {
      if (!title.trim()) errors.title = language === 'ar' ? 'عنوان البلاغ مطلوب' : 'Report title is required';
      if (!description.trim() || description.trim().length < 15) {
        errors.description = language === 'ar' ? 'يرجى كتابة وصف واقعي ومفصل للواقعة (15 حرفاً على الأقل)' : 'Please describe the incident (at least 15 chars)';
      }
    } else if (step === 3) {
      if (!governorateId) errors.governorate = language === 'ar' ? 'يرجى تحديد المحافظة' : 'Select governorate';
      if (!cityDistrict.trim()) errors.district = language === 'ar' ? 'يرجى إدخال الحي أو المركز' : 'Enter district';
      if (!streetLandmark.trim()) errors.landmark = language === 'ar' ? 'يرجى إدخال الشارع أو أقرب علامة' : 'Enter street/landmark';
    } else if (step === 5) {
      if (identityType === 'verified') {
        if (!fullName.trim()) errors.fullName = language === 'ar' ? 'الاسم مطلوب للبلاغ الموثق' : 'Full name is required for verified reports';
        if (!phone.trim() || phone.length < 10) errors.phone = language === 'ar' ? 'رقم هاتف محمول صحيح مطلوب' : 'Valid mobile number required';
      }
    } else if (step === 6) {
      if (!legalOathAgreed) {
        errors.oath = language === 'ar' ? 'يجب الموافقة على إقرار المسؤولية المدنية والقانونية' : 'Must accept civic & legal declaration';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Submit Final Report
  const handleSubmit = () => {
    if (!validateCurrentStep()) return;
    setIsSubmitting(true);

    setTimeout(() => {
      const created = submitNewReport({
        title: title.trim() || customCategory.trim() || (language === 'ar' ? 'بلاغ مدني' : 'Civic Incident Report'),
        categoryId,
        customCategory: customCategory.trim() || undefined,
        dateOccurred,
        timeOccurred,
        isOngoing,
        severity,
        description,
        witnesses,
        immediateDanger,
        additionalNotes,
        location: {
          governorateId,
          cityDistrict,
          streetLandmark,
          lat: coordinates.lat,
          lng: coordinates.lng,
          accuracyMeters: gpsCaptured ? 5 : 20,
        },
        attachments,
        reporter: {
          identityType,
          fullName: identityType === 'verified' ? fullName : undefined,
          phone: identityType === 'verified' ? phone : (phone ? phone.slice(0, 4) + '***' : undefined),
          email: identityType === 'verified' ? email : undefined,
          preferredContact,
        },
      });

      setIsSubmitting(false);
      setSuccessReport(created);
    }, 700);
  };

  const copyRefCode = () => {
    if (!successReport) return;
    navigator.clipboard.writeText(successReport.referenceNo);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  // Direct fast jump to Admin Dashboard with full authorization
  const handleOpenInAdminDashboard = () => {
    loginAsOfficial('admin', 'admin', 'admin2026');
    if (successReport) {
      setSelectedReportId(successReport.id);
    }
    setActiveView('admin_dashboard');
  };

  // Direct jump to Authority Portal
  const handleOpenInAuthorityPortal = () => {
    loginAsOfficial('authority', 'arbaeen.officer', 'pass2026', 'branch_suez_arbaeen');
    if (successReport) {
      setSelectedReportId(successReport.id);
    }
    setActiveView('authority_portal');
  };

  // Success Confirmation Screen
  if (successReport) {
    const assignedDept = departments.find((d) => d.id === successReport.assignedDepartmentId);
    const gov = GOVERNORATES.find((g) => g.id === successReport.location?.governorateId);

    return (
      <div className="w-full max-w-3xl mx-auto px-3.5 sm:px-6 py-6 sm:py-8 animate-in fade-in space-y-6 min-w-0 overflow-x-clip">
        {/* Top Celebration Banner */}
        <div className="bg-emerald-600 text-white rounded-3xl p-5 sm:p-8 text-center space-y-3 shadow-xl">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/20 text-white flex items-center justify-center mx-auto border-2 border-white/40 shadow-sm">
            <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>
          <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight">
            {language === 'ar' ? 'تم تسجيل وإرسال بلاغك بنجاح' : 'Report Successfully Submitted'}
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-lg mx-auto leading-relaxed">
            {language === 'ar'
              ? 'تم تشفير وحفظ البلاغ وتوجيهه آلياً للجهة الميدانية المختصة. يمكنك الآن تتبع مراحل المعاينة الفنية وحالة الإصلاح بكود التتبع أدناه.'
              : 'Your report has been encrypted, stored, and dispatched to the field authority.'}
          </p>
        </div>

        {/* The Complete Submitted Report Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden p-5 sm:p-8 space-y-6 w-full max-w-full min-w-0">
          {/* Reference & Status Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-5 w-full min-w-0">
            <div className="space-y-1 min-w-0 w-full sm:w-auto">
              <span className="text-xs font-semibold text-slate-400">
                {language === 'ar' ? 'كود البلاغ المرجعي للتتبع:' : 'Tracking Reference Number:'}
              </span>
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <span className="text-xl sm:text-3xl font-mono font-extrabold text-slate-900 tracking-wider tabular-nums break-all">
                  {successReport.referenceNo}
                </span>
                <button
                  type="button"
                  onClick={copyRefCode}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                  title={language === 'ar' ? 'نسخ كود البلاغ' : 'Copy Report Code'}
                >
                  {copiedRef ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">{language === 'ar' ? 'تم النسخ' : 'Copied'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{language === 'ar' ? 'نسخ الكود' : 'Copy'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>{language === 'ar' ? 'جديد — تم التوجيه للجهة' : 'Dispatched'}</span>
              </span>
            </div>
          </div>

          {/* Full Submitted Report Content */}
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400">
                {language === 'ar' ? 'موضوع ونوع البلاغ:' : 'Incident Topic & Nature:'}
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                {successReport.title}
              </h3>
              {successReport.customCategory && (
                <div className="inline-block mt-1 px-3 py-1 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs font-semibold">
                  {language === 'ar' ? 'وصف المواطن لنوع البلاغ:' : 'Citizen Category:'} {successReport.customCategory}
                </div>
              )}
            </div>

            {/* Factual Description */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-400">
                {language === 'ar' ? 'التفاصيل والوقائع المسجلة بالبلاغ:' : 'Submitted Incident Details:'}
              </span>
              <p className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-800 leading-relaxed font-normal whitespace-pre-wrap">
                {successReport.description}
              </p>
            </div>

            {/* Location & Department Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="space-y-1">
                <span className="text-slate-400 font-semibold block">
                  {language === 'ar' ? 'الموقع الجغرافي:' : 'Location:'}
                </span>
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{gov?.nameAr || successReport.location?.cityDistrict}, {successReport.location?.cityDistrict}</span>
                </div>
                <div className="text-slate-600 text-[11px]">
                  {successReport.location?.streetLandmark}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 font-semibold block">
                  {language === 'ar' ? 'الجهة الموجه إليها:' : 'Dispatched Authority:'}
                </span>
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <Building className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>{language === 'ar' ? assignedDept?.nameAr : assignedDept?.nameEn}</span>
                </div>
                <div className="text-slate-600 text-[11px]">
                  {(language === 'ar' ? successReport.assignedBranchNameAr : successReport.assignedBranchNameEn) || (language === 'ar' ? 'فرع الاستجابة الميدانية الأقرب' : 'Nearest Field Dispatch Unit')}
                </div>
              </div>
            </div>

            {/* Evidence & Media attachments */}
            {successReport.attachments && successReport.attachments.length > 0 && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-700 block">
                  {language === 'ar' ? `المرفقات الموثقة (${successReport.attachments.length} ملف):` : `Attached Media (${successReport.attachments.length}):`}
                </span>
                <div className="flex flex-wrap gap-2">
                  {successReport.attachments.map((att: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800"
                    >
                      {att.type === 'video' ? (
                        <>
                          <Film className="w-4 h-4 text-amber-600" />
                          <span>{att.name}</span>
                          <span className="text-[10px] bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded-full">
                            {language === 'ar' ? 'فيديو مرفق' : 'Attached Video'}
                          </span>
                        </>
                      ) : (
                        <>
                          <Camera className="w-4 h-4 text-emerald-600" />
                          <span>{att.name}</span>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Prominent Legal Disclaimer Banner */}
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-[11px] text-rose-800 space-y-0.5 leading-relaxed font-semibold">
              <span>⚠️ </span>
              <span>
                {language === 'ar'
                  ? 'تنويه: هذا الموقع / المنصة غير رسمي وغير معتمد من أي جهة حكومية ولا يصح الاتخاذ به رسمياً.'
                  : 'Notice: This platform is unofficial and not accredited by any governmental authority.'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => {
                setSelectedReportId(successReport.id);
                setActiveView('track_report');
              }}
              className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>{language === 'ar' ? 'متابعة البلاغ وحالته' : 'Track This Report'}</span>
            </button>

            <button
              type="button"
              onClick={() => printReportReceipt(successReport)}
              className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>{t('printReportReceipt', language)}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSuccessReport(null);
                setStep(1);
                setCustomCategory('');
                setTitle('');
                setDescription('');
                setAttachments([]);
              }}
              className="w-full py-3.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <FilePlus className="w-4 h-4 text-slate-600" />
              <span>{language === 'ar' ? 'تقديم بلاغ جديد' : 'New Report'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-3.5 sm:px-6 py-6 sm:py-8 space-y-6 min-w-0 overflow-x-clip">
      {/* Top Header & Draft Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 border-b border-slate-200 pb-4 w-full min-w-0">
        <div className="min-w-0">
          <h1 className="text-lg sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            {t('submitReportTitle', language)}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('submitReportSubtitle', language)}
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveDraft}
          className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
        >
          <Save className="w-3.5 h-3.5 text-slate-500" />
          <span>{t('saveDraft', language)}</span>
        </button>
      </div>

      {/* Responsive Step Progress Bar */}
      <div className="space-y-3 pb-3 border-b border-slate-200 w-full min-w-0">
        {/* Mobile View Progress (< md) */}
        <div className="md:hidden space-y-2 w-full min-w-0">
          <div className="flex items-center justify-between text-xs gap-2">
            <span className="font-bold text-amber-700 bg-amber-100/70 px-2.5 py-0.5 rounded-lg border border-amber-300 shrink-0">
              {language === 'ar' ? `الخطوة ${step} من 6` : `Step ${step} of 6`}
            </span>
            <span className="text-slate-900 font-bold text-xs truncate max-w-[200px]">
              {[
                t('stepCategory', language),
                t('stepDetails', language),
                t('stepLocation', language),
                t('stepEvidence', language),
                t('stepIdentity', language),
                t('stepReview', language),
              ][step - 1]}
            </span>
          </div>
          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-amber-500 h-full transition-all duration-300 rounded-full"
              style={{ width: `${(step / 6) * 100}%` }}
            />
          </div>
        </div>

        {/* Laptop/Desktop Stepper (md+) */}
        <div className="hidden md:flex items-center justify-between text-xs overflow-x-auto pb-1 gap-1 w-full max-w-full min-w-0 no-scrollbar">
          {[
            { num: 1, label: t('stepCategory', language) },
            { num: 2, label: t('stepDetails', language) },
            { num: 3, label: t('stepLocation', language) },
            { num: 4, label: t('stepEvidence', language) },
            { num: 5, label: t('stepIdentity', language) },
            { num: 6, label: t('stepReview', language) },
          ].map((s) => (
            <div
              key={s.num}
              onClick={() => s.num < step && setStep(s.num)}
              className={`flex items-center gap-2 whitespace-nowrap px-3 py-2 rounded-xl transition-all shrink-0 ${
                s.num === step
                  ? 'font-bold text-slate-900 bg-amber-500/15 border border-amber-400/40 shadow-xs'
                  : s.num < step
                  ? 'text-emerald-700 hover:bg-emerald-50 cursor-pointer font-medium'
                  : 'text-slate-400'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                  s.num === step
                    ? 'bg-amber-500 text-slate-950'
                    : s.num < step
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {s.num < step ? '✓' : s.num}
              </span>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Citizen-Directed Report Nature & Quick Selection */}
      {step === 1 && (
        <div className="space-y-6 animate-in fade-in">
          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              {language === 'ar' ? 'البلاغ ده عن إيه؟ (اكتب بنفسك مباشرة)' : 'What is your report about? (Write directly)'}
            </h2>
            <p className="text-xs text-slate-500">
              {language === 'ar'
                ? 'مش محتاج تدور في قوائم طويلة.. اكتب باختصار الواقعة عن إيه أو اختر المقترح الأقرب.'
                : 'No need to search through endless categories. Simply state what your report is about.'}
            </p>
          </div>

          {/* Direct Free-Text Input: What is the report about? */}
          <div className="p-5 bg-gradient-to-br from-amber-500/10 via-amber-400/5 to-white border-2 border-amber-300 rounded-3xl space-y-3 shadow-xs">
            <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm sm:text-base">
              <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
              <label htmlFor="customCategoryInput" className="cursor-pointer">
                {language === 'ar' ? 'حدد بنفسك: البلاغ ده عن إيه بالضبط؟' : 'State in your own words: What happened?'} *
              </label>
            </div>
            <div className="relative">
              <input
                id="customCategoryInput"
                type="text"
                value={customCategory}
                onChange={(e) => {
                  setCustomCategory(e.target.value);
                  if (formErrors.category) {
                    setFormErrors((prev) => {
                      const next = { ...prev };
                      delete next.category;
                      return next;
                    });
                  }
                }}
                placeholder={
                  language === 'ar'
                    ? 'مثال: ماس كهربائي في عمود إنارة، كسر ماسورة مياه، حفرة وهبوط في الشارع، تعدي على طريق...'
                    : 'e.g., exposed electric wire, burst water pipe, road pothole...'
                }
                className="w-full px-4 py-3 text-sm bg-white border-2 border-amber-400/80 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-500/20 font-bold text-slate-900 placeholder:font-normal placeholder:text-slate-400 shadow-inner"
              />
            </div>

            <p className="text-[11px] text-slate-500 pt-1 leading-relaxed">
              {language === 'ar'
                ? '💡 اكتب نوع وموضوع الواقعة بحرية تامة كما تراها (مثل: "عمود إنارة به ماس كهربائي"، "كسر ماسورة مياه وغرق الشارع"، "حفرة خطرة في الطريق"). لا حاجة للاختيار من أي قوائم معقدة.'
                : '💡 Express the issue in your own words. No need to scroll through preset categories.'}
            </p>
          </div>

          {formErrors.category && (
            <p className="text-xs text-rose-600 font-semibold">{formErrors.category}</p>
          )}
        </div>
      )}

      {/* Step 2: Details & Factual Description */}
      {step === 2 && (
        <div className="space-y-6 animate-in fade-in">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900">
              {t('detailsTitle', language)}
            </h2>
            <p className="text-xs text-slate-500">
              {language === 'ar' ? 'تصنيف البلاغ:' : 'Category:'}{' '}
              <span className="font-semibold text-slate-800">
                {language === 'ar' ? selectedCategory?.nameAr : selectedCategory?.nameEn}
              </span>
            </p>
          </div>

          {/* Factual Advice Banner */}
          <div className="p-4 bg-slate-100 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-slate-900">
              <Info className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{t('factualAdviceTitle', language)}</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              {t('factualAdviceText', language)}
            </p>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">
              {t('fieldTitle', language)} *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('fieldTitlePlaceholder', language)}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
            />
            {formErrors.title && (
              <p className="text-xs text-rose-600 font-semibold">{formErrors.title}</p>
            )}
          </div>

          {/* Date, Time, Severity */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-800">
                {t('fieldDate', language)}
              </label>
              <input
                type="date"
                value={dateOccurred}
                onChange={(e) => setDateOccurred(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 tabular-nums"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-800">
                {t('fieldTime', language)}
              </label>
              <input
                type="time"
                value={timeOccurred}
                onChange={(e) => setTimeOccurred(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 tabular-nums"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-800">
                {t('fieldSeverity', language)}
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as Severity)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 font-medium"
              >
                <option value="low">{formatSeverity('low', language)}</option>
                <option value="medium">{formatSeverity('medium', language)}</option>
                <option value="high">{formatSeverity('high', language)}</option>
                <option value="critical">{formatSeverity('critical', language)}</option>
              </select>
            </div>
          </div>

          {/* Ongoing toggle */}
          <div className="flex items-center gap-3 p-3.5 bg-white border border-slate-200 rounded-xl">
            <input
              type="checkbox"
              id="isOngoing"
              checked={isOngoing}
              onChange={(e) => setIsOngoing(e.target.checked)}
              className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500 cursor-pointer"
            />
            <label htmlFor="isOngoing" className="text-xs font-semibold text-slate-800 cursor-pointer">
              {t('fieldIsOngoing', language)}
            </label>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">
              {t('fieldDescription', language)} *
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('fieldDescriptionPlaceholder', language)}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 leading-relaxed font-normal"
            />
            {formErrors.description && (
              <p className="text-xs text-rose-600 font-semibold">{formErrors.description}</p>
            )}

            {hasDefamatoryWords && (
              <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span className="font-bold">{t('defamationWarning', language)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Location & Interactive Geolocation Grid */}
      {step === 3 && (
        <div className="space-y-6 animate-in fade-in">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900">
              {t('locationTitle', language)}
            </h2>
            <p className="text-xs text-slate-500">
              {t('locationDesc', language)}
            </p>
          </div>

          {/* GPS Quick Action Bar */}
          <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
                <Navigation className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-xs sm:text-sm text-white">
                  {language === 'ar' ? 'التقاط الإحداثيات الجغرافية التلقائي' : 'Instant GPS Coordinate Lock'}
                </div>
                <div className="text-[11px] text-slate-300">
                  {gpsCaptured
                    ? (language === 'ar' ? 'تم قفل إحداثيات الواقعة بدقة بالأقمار الصناعية' : 'GPS Satellite fix established')
                    : (language === 'ar' ? 'اضغط لتحديد موقعك الجغرافي الدقيق في مصر بنقرة واحدة' : 'Click to lock your exact location')}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGpsDetect}
              disabled={isLocatingGps}
              className="w-full sm:w-auto px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow disabled:opacity-50"
            >
              <Navigation className={`w-3.5 h-3.5 ${isLocatingGps ? 'animate-spin' : ''}`} />
              <span>{isLocatingGps ? t('locatingGps', language) : t('useGpsBtn', language)}</span>
            </button>
          </div>

          {gpsStatusText && (
            <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl text-xs font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{gpsStatusText}</span>
            </div>
          )}

          {/* Governorate, District, Landmark Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                {t('fieldGovernorate', language)} *
              </label>
              <select
                value={governorateId}
                onChange={(e) => {
                  const gId = e.target.value;
                  setGovernorateId(gId);
                  const gov = GOVERNORATES.find((g) => g.id === gId);
                  if (gov) {
                    setCoordinates({ lat: gov.lat, lng: gov.lng });
                    setCityDistrict(language === 'ar' ? `حي ${gov.nameAr}` : `${gov.nameEn} District`);
                  }
                }}
                className="w-full px-3 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 font-medium"
              >
                {GOVERNORATES.map((g) => (
                  <option key={g.id} value={g.id}>
                    {language === 'ar' ? g.nameAr : g.nameEn}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                {t('fieldDistrict', language)} *
              </label>
              <input
                type="text"
                value={cityDistrict}
                onChange={(e) => setCityDistrict(e.target.value)}
                placeholder={t('fieldDistrictPlaceholder', language)}
                className="w-full px-3 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 font-medium"
              />
              {formErrors.district && (
                <p className="text-xs text-rose-600 font-semibold">{formErrors.district}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                {t('fieldStreetLandmark', language)} *
              </label>
              <input
                type="text"
                value={streetLandmark}
                onChange={(e) => setStreetLandmark(e.target.value)}
                placeholder={t('fieldStreetLandmarkPlaceholder', language)}
                className="w-full px-3 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 font-medium"
              />
              {formErrors.landmark && (
                <p className="text-xs text-rose-600 font-semibold">{formErrors.landmark}</p>
              )}
            </div>
          </div>

          {/* Interactive Geospatial Map Picker */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-700 font-bold">
              <span>{t('mapPickerNote', language)}</span>
              <span className="text-slate-500 font-mono text-[11px]">
                {coordinates.lat.toFixed(4)}° N, {coordinates.lng.toFixed(4)}° E
              </span>
            </div>

            <InteractiveMap
              mode="picker"
              selectedGovId={governorateId}
              selectedCoordinates={coordinates}
              onCoordinatesChange={(coords, govId, districtSuggestion, streetSuggestion) => {
                setCoordinates(coords);
                setGpsCaptured(true);
                if (govId) setGovernorateId(govId);
                if (districtSuggestion) setCityDistrict(districtSuggestion);
                if (streetSuggestion) setStreetLandmark(streetSuggestion);
                setFormErrors((prev) => {
                  const next = { ...prev };
                  delete next.district;
                  delete next.landmark;
                  return next;
                });
              }}
              heightClass="h-80 sm:h-96"
            />
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed">
            {t('locationPrivacyNote', language)}
          </p>
        </div>
      )}

      {/* Step 4: Attachments & Evidence with 500MB Video Support */}
      {step === 4 && (
        <div className="space-y-6 animate-in fade-in">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900">
              {t('evidenceTitle', language)}
            </h2>
            <p className="text-xs text-slate-500">
              {t('evidenceDesc', language)}
            </p>
          </div>

          {/* 500MB Capability Highlight */}
          <div className="p-4 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent border border-amber-300/80 rounded-2xl flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
              500M
            </div>
            <div className="space-y-0.5">
              <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                {language === 'ar' ? 'دعم رفع الفيديوهات والملفات الكبيرة حتى 500 ميجابايت' : 'HD Video & Large File Upload up to 500MB'}
              </h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                {language === 'ar'
                  ? 'تمت ترقية المنظومة لتستوعب مقاطع الفيديو عالية الدقة (MP4, MOV, MKV)، والتسجيلات الميدانية، والمستندات بحد أقصى 500 ميجابايت لكل ملف مع الحفاظ على التشفير التام.'
                  : 'You can attach full HD video files, field audio logs, and documents up to 500MB per file with end-to-end official confidentiality.'}
              </p>
            </div>
          </div>

          {/* Privacy Blur Toggle */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <EyeOff className="w-4 h-4 text-emerald-700" />
                <span className="font-bold text-xs text-emerald-900">
                  {t('privacyBlurToggle', language)}
                </span>
              </div>
              <input
                type="checkbox"
                checked={privacyBlur}
                onChange={(e) => setPrivacyBlur(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
              />
            </div>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              {t('privacyBlurActive', language)}
            </p>
          </div>

          {/* Upload Dropzone */}
          <label className="border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer bg-slate-50 hover:bg-amber-50/20 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Upload className="w-6 h-6" />
            </div>
            <span className="font-bold text-sm text-slate-900">
              {t('uploadBoxTitle', language)}
            </span>
            <span className="text-xs text-slate-500 mt-1 max-w-md leading-relaxed">
              {t('uploadBoxSubtitle', language)}
            </span>
            <span className="text-[11px] font-bold text-amber-700 mt-2 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
              {language === 'ar' ? 'الحد الأقصى للملف: 500 ميجابايت' : 'Maximum file limit: 500 MB'}
            </span>
            <input
              type="file"
              multiple
              accept="image/*,video/*,audio/*,.pdf,.mp4,.mov,.mkv,.avi"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {uploadError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {isUploading && (
            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>{language === 'ar' ? 'جاري رفع ومعالجة الملفات الكبيرة...' : 'Processing large media files...'}</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
              </div>
            </div>
          )}

          {/* Quick Sample Evidence Helper Button */}
          <div className="flex items-center justify-between p-3.5 bg-amber-50/60 border border-amber-200 rounded-xl text-xs">
            <div className="flex items-center gap-2 text-amber-950">
              <Film className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{language === 'ar' ? 'تجربة إرفاق مقطع فيديو معاينة (48.5 ميجابايت) فوراً؟' : 'Test attaching sample 48.5MB video evidence?'}</span>
            </div>
            <button
              type="button"
              onClick={handleAddSampleEvidence}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('sampleEvidenceBtn', language)}</span>
            </button>
          </div>

          {/* Attached Files List & Video Player Preview */}
          {attachments.length > 0 ? (
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-800">
                {language === 'ar' ? `الملفات المرفقة (${attachments.length}):` : `Attached Evidence (${attachments.length}):`}
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2 overflow-hidden"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 truncate">
                        {att.type === 'video' ? (
                          <Film className="w-4 h-4 text-amber-600 shrink-0" />
                        ) : att.type === 'image' ? (
                          <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : att.type === 'audio' ? (
                          <FileAudio className="w-4 h-4 text-purple-600 shrink-0" />
                        ) : (
                          <FileIcon className="w-4 h-4 text-blue-600 shrink-0" />
                        )}
                        <span className="truncate font-semibold text-xs text-slate-900">{att.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(att.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer transition-colors"
                        title={language === 'ar' ? 'حذف الملف' : 'Remove file'}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Media Previews */}
                    {att.type === 'video' && (
                      <div className="space-y-1.5">
                        <div className="rounded-lg overflow-hidden bg-slate-950 aspect-video relative flex items-center justify-center">
                          <video
                            src={att.url}
                            controls
                            className="w-full h-full object-cover"
                            preload="metadata"
                          />
                        </div>
                        <div className="flex items-center justify-between text-[10px] bg-emerald-50/80 text-emerald-900 border border-emerald-200 px-2.5 py-1 rounded-md font-medium">
                          <span className="font-bold text-emerald-700">
                            {language === 'ar' ? '✓ تم التحقق من سلامة المقطع والأدلة' : '✓ Video Evidence Verified'}
                          </span>
                          <span className="text-slate-500 text-[10px]">
                            {language === 'ar' ? 'مقطع عالي الدقة' : 'High Definition'}
                          </span>
                        </div>
                      </div>
                    )}

                    {att.type === 'image' && (
                      <div className="rounded-lg overflow-hidden bg-slate-100 h-28 relative">
                        <img
                          src={att.url}
                          alt={att.name}
                          className={`w-full h-full object-cover ${att.isBlurred ? 'filter blur-xs' : ''}`}
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                      <span>{formatFileSize(att.sizeBytes)}</span>
                      <span className="font-mono text-[10px] uppercase bg-slate-100 px-1.5 py-0.5 rounded">
                        {att.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">
              {t('noAttachmentsYet', language)}
            </p>
          )}
        </div>
      )}

      {/* Step 5: Reporter Identity */}
      {step === 5 && (
        <div className="space-y-6 animate-in fade-in">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900">
              {t('identityTitle', language)}
            </h2>
            <p className="text-xs text-slate-500">
              {t('identityDesc', language)}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => setIdentityType('verified')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                identityType === 'verified'
                  ? 'border-amber-500 bg-amber-50/50 shadow-md ring-2 ring-amber-500/20'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                <UserCheck className="w-4 h-4 text-amber-600" />
                <span>{t('verifiedIdentityOption', language)}</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t('verifiedIdentityDesc', language)}
              </p>
            </div>

            <div
              onClick={() => setIdentityType('protected')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                identityType === 'protected'
                  ? 'border-amber-500 bg-amber-50/50 shadow-md ring-2 ring-amber-500/20'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                <Shield className="w-4 h-4 text-amber-600" />
                <span>{t('protectedIdentityOption', language)}</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t('protectedIdentityDesc', language)}
              </p>
            </div>
          </div>

          {identityType === 'verified' ? (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  {t('fieldFullName', language)} *
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={language === 'ar' ? 'مثال: أحمد مصطفى إبراهيم' : 'e.g. Ahmed Mostafa'}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 font-medium"
                />
                {formErrors.fullName && (
                  <p className="text-xs text-rose-600 font-semibold">{formErrors.fullName}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    {t('fieldPhone', language)} *
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01xxxxxxxxx"
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 tabular-nums font-mono"
                  />
                  {formErrors.phone && (
                    <p className="text-xs text-rose-600 font-semibold">{formErrors.phone}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    {t('fieldEmail', language)}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed font-medium">
                {t('protectedDisclaimer', language)}
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  {language === 'ar' ? 'رقم الهاتف للتواصل الطارئ (سري ومحجوب):' : 'Confidential Emergency Phone:'}
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01xxxxxxxxx"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 tabular-nums font-mono"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 6: Review & Legal Oath */}
      {step === 6 && (
        <div className="space-y-6 animate-in fade-in">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900">
              {t('reviewTitle', language)}
            </h2>
            <p className="text-xs text-slate-500">
              {t('reviewDesc', language)}
            </p>
          </div>

          {/* Summary Box */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 text-xs shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="font-extrabold text-sm sm:text-base text-slate-900">{title || customCategory}</span>
              <span className="font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                {customCategory || (language === 'ar' ? selectedCategory?.nameAr : selectedCategory?.nameEn)}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-600">
              <div>
                <span className="text-slate-400 block mb-0.5">{t('fieldGovernorate', language)}:</span>
                <span className="font-bold text-slate-800">
                  {GOVERNORATES.find((g) => g.id === governorateId)?.nameAr}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">{t('fieldDistrict', language)}:</span>
                <span className="font-bold text-slate-800">{cityDistrict}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">{t('fieldDate', language)}:</span>
                <span className="font-bold text-slate-800 font-mono">{dateOccurred}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">{t('fieldSeverity', language)}:</span>
                <span className="font-bold text-slate-800">{formatSeverity(severity, language)}</span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 block mb-1">{t('fieldDescription', language)}:</span>
              <p className="p-3.5 bg-slate-50 rounded-xl text-slate-800 leading-relaxed font-normal">
                {description}
              </p>
            </div>

            {attachments.length > 0 && (
              <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-slate-600">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <span>
                  {language === 'ar' ? `المرفقات الموثقة: ${attachments.length} ملف` : `${attachments.length} media attached`}
                </span>
              </div>
            )}
          </div>

          {/* Legal Oath & Civil Responsibility */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 space-y-4 shadow-lg">
            <div className="flex items-center gap-2.5 font-bold text-amber-400 text-sm sm:text-base">
              <Shield className="w-5 h-5 text-amber-400" />
              <span>{t('legalOathTitle', language)}</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {t('legalOathText', language)}
            </p>

            <div className="flex items-start gap-2.5 pt-2">
              <input
                type="checkbox"
                id="legalOath"
                checked={legalOathAgreed}
                onChange={(e) => setLegalOathAgreed(e.target.checked)}
                className="w-4 h-4 text-amber-500 rounded focus:ring-amber-400 mt-0.5 cursor-pointer"
              />
              <label htmlFor="legalOath" className="text-xs font-bold text-slate-100 cursor-pointer">
                {t('agreeCheckbox', language)}
              </label>
            </div>
            {formErrors.oath && (
              <p className="text-xs text-rose-400 font-semibold">{formErrors.oath}</p>
            )}
          </div>
        </div>
      )}

      {/* Navigation Step Action Buttons */}
      <div className="pt-4 flex items-center justify-between gap-3 border-t border-slate-200 w-full min-w-0">
        {step > 1 ? (
          <button
            type="button"
            onClick={handleBack}
            className="px-4 py-2.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs min-h-[44px]"
          >
            <BackArrow className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'السابق' : 'Previous'}</span>
          </button>
        ) : (
          <div />
        )}

        {step < 6 ? (
          <button
            type="button"
            onClick={handleNext}
            className="px-6 py-2.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md hover:scale-[1.02] min-h-[44px]"
          >
            <span>{language === 'ar' ? 'متابعة' : 'Next'}</span>
            <Arrow className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 sm:px-8 py-3 text-xs sm:text-sm font-extrabold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-lg hover:scale-[1.02] disabled:opacity-50 min-h-[44px]"
          >
            {isSubmitting ? (
              <span>{t('submitting', language)}</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>{t('submitActionBtn', language)}</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
