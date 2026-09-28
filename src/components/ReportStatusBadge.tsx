import React from 'react';
import {
  Clock,
  Activity,
  CheckCircle2,
  Repeat,
  HelpCircle,
  Lock,
  AlertCircle,
  Copy,
  FileText,
  Search,
} from 'lucide-react';
import { ReportStatus, Language } from '../types';

export interface ReportStatusBadgeProps {
  status: ReportStatus;
  isCompleted?: boolean;
  language?: Language;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showLiveIndicator?: boolean;
  className?: string;
}

interface StatusConfig {
  labelAr: string;
  labelEn: string;
  sublabelAr: string;
  sublabelEn: string;
  icon: React.ComponentType<{ className?: string }>;
  containerClasses: string;
  dotColor: string;
  pulseDot?: boolean;
}

export const ReportStatusBadge: React.FC<ReportStatusBadgeProps> = ({
  status,
  isCompleted = false,
  language = 'ar',
  size = 'sm',
  showLiveIndicator = true,
  className = '',
}) => {
  // If isCompleted is true, normalize to resolved
  const effectiveStatus: ReportStatus = isCompleted && status !== 'closed' ? 'resolved' : status;

  const configs: Record<ReportStatus, StatusConfig> = {
    submitted: {
      labelAr: 'قيد الانتظار (وارد جديد)',
      labelEn: 'Pending (New Influx)',
      sublabelAr: 'بانتظار مباشرة اللجنة',
      sublabelEn: 'Awaiting triage',
      icon: Clock,
      containerClasses:
        'bg-amber-50 text-amber-900 border-amber-300/80 shadow-2xs dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-800/60',
      dotColor: 'bg-amber-500',
      pulseDot: true,
    },
    under_review: {
      labelAr: 'قيد المراجعة والتدقيق',
      labelEn: 'Under Review',
      sublabelAr: 'تدقيق أولي للمعلومات',
      sublabelEn: 'Initial screening',
      icon: Search,
      containerClasses:
        'bg-amber-50/90 text-amber-900 border-amber-300 shadow-2xs dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-800/60',
      dotColor: 'bg-amber-500',
      pulseDot: true,
    },
    assigned: {
      labelAr: 'تم التوجيه للجهة المختصة',
      labelEn: 'Assigned to Unit',
      sublabelAr: 'بعهدة الفرع الميداني',
      sublabelEn: 'Dispatched to branch',
      icon: Activity,
      containerClasses:
        'bg-sky-50 text-sky-900 border-sky-300 shadow-2xs dark:bg-sky-950/40 dark:text-sky-200 dark:border-sky-800/60',
      dotColor: 'bg-sky-500',
      pulseDot: true,
    },
    investigating: {
      labelAr: 'قيد المعاينة الميدانية (جاري العمل)',
      labelEn: 'In-Progress (Field Action)',
      sublabelAr: 'لجنة الفحص في الموقع',
      sublabelEn: 'Field team deployed',
      icon: Activity,
      containerClasses:
        'bg-blue-50 text-blue-900 border-blue-300 shadow-2xs dark:bg-blue-950/40 dark:text-blue-200 dark:border-blue-800/60',
      dotColor: 'bg-blue-600',
      pulseDot: true,
    },
    forwarded: {
      labelAr: 'محال لفرع / جهة أخرى',
      labelEn: 'Forwarded / Transferred',
      sublabelAr: 'إحالة للاختصاص',
      sublabelEn: 'Inter-branch re-route',
      icon: Repeat,
      containerClasses:
        'bg-indigo-50 text-indigo-900 border-indigo-300 shadow-2xs dark:bg-indigo-950/40 dark:text-indigo-200 dark:border-indigo-800/60',
      dotColor: 'bg-indigo-600',
      pulseDot: false,
    },
    info_requested: {
      labelAr: 'مطلوب إيضاحات من المواطن',
      labelEn: 'Info Requested',
      sublabelAr: 'استفسار قيد الرد',
      sublabelEn: 'Clarification pending',
      icon: HelpCircle,
      containerClasses:
        'bg-purple-50 text-purple-900 border-purple-300 shadow-2xs dark:bg-purple-950/40 dark:text-purple-200 dark:border-purple-800/60',
      dotColor: 'bg-purple-600',
      pulseDot: true,
    },
    resolved: {
      labelAr: 'تم الإنجاز والمعالجة بنجاح',
      labelEn: 'Resolved & Completed',
      sublabelAr: 'أُغلقت بالكامل',
      sublabelEn: 'Action verified',
      icon: CheckCircle2,
      containerClasses:
        'bg-emerald-50 text-emerald-950 border-emerald-300/90 shadow-2xs dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-800/60',
      dotColor: 'bg-emerald-600',
      pulseDot: false,
    },
    closed: {
      labelAr: 'مغلق إدارياً',
      labelEn: 'Closed',
      sublabelAr: 'منتهي الصلاحية أو مسحوب',
      sublabelEn: 'Archived file',
      icon: Lock,
      containerClasses:
        'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
      dotColor: 'bg-slate-500',
      pulseDot: false,
    },
    rejected: {
      labelAr: 'مرفوض مع بيان السبب',
      labelEn: 'Rejected with Note',
      sublabelAr: 'لا يقع ضمن الاختصاص',
      sublabelEn: 'Outside jurisdiction',
      icon: AlertCircle,
      containerClasses:
        'bg-rose-50 text-rose-900 border-rose-300 shadow-2xs dark:bg-rose-950/40 dark:text-rose-200 dark:border-rose-800/60',
      dotColor: 'bg-rose-600',
      pulseDot: false,
    },
    duplicate: {
      labelAr: 'بلاغ مكرر (مدمج)',
      labelEn: 'Duplicate (Merged)',
      sublabelAr: 'ضُم لبلاغ رئيسي سابق',
      sublabelEn: 'Linked to primary',
      icon: Copy,
      containerClasses:
        'bg-zinc-100 text-zinc-800 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700',
      dotColor: 'bg-zinc-500',
      pulseDot: false,
    },
    draft: {
      labelAr: 'مسودة محلية غير مرسلة',
      labelEn: 'Local Draft',
      sublabelAr: 'محفوظة في المتصفح',
      sublabelEn: 'Not submitted yet',
      icon: FileText,
      containerClasses:
        'bg-slate-100 text-slate-700 border-slate-200 border-dashed dark:bg-slate-800 dark:text-slate-400',
      dotColor: 'bg-slate-400',
      pulseDot: false,
    },
  };

  const config = configs[effectiveStatus] || configs.submitted;
  const IconComponent = config.icon;

  const sizeClasses = {
    xs: 'px-2 py-0.5 text-[10px] gap-1',
    sm: 'px-2.5 py-1 text-[11px] gap-1.5',
    md: 'px-3 py-1.5 text-xs gap-2',
    lg: 'px-3.5 py-2 text-sm gap-2.5',
  };

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-4.5 h-4.5',
  };

  return (
    <span
      className={`inline-flex items-center font-bold rounded-xl border transition-all select-none ${sizeClasses[size]} ${config.containerClasses} ${className}`}
      title={language === 'ar' ? config.sublabelAr : config.sublabelEn}
    >
      {/* Live State Pulse Dot */}
      {showLiveIndicator && (
        <span className="relative flex h-2 w-2 shrink-0">
          {config.pulseDot && (
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.dotColor}`}
            />
          )}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dotColor}`} />
        </span>
      )}

      {/* Status Icon */}
      <IconComponent className={`${iconSizes[size]} shrink-0`} />

      {/* Status Label */}
      <span className="whitespace-nowrap tracking-tight font-extrabold">
        {language === 'ar' ? config.labelAr : config.labelEn}
      </span>
    </span>
  );
};
