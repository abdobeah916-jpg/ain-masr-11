import React from 'react';
import {
  Printer,
  X,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Building,
  QrCode,
  FileText,
} from 'lucide-react';
import { Report } from '../types';
import { useApp } from '../context/AppContext';
import { t, formatStatus, formatSeverity } from '../locales/i18n';
import { GOVERNORATES } from '../data/mockData';

interface ReportReceiptModalProps {
  report: Report | null;
  onClose: () => void;
}

export const ReportReceiptModal: React.FC<ReportReceiptModalProps> = ({ report, onClose }) => {
  const { language, departments, categories } = useApp();

  if (!report) return null;

  const assignedDept = departments.find((d) => d.id === report.assignedDepartmentId);
  const currentCat = categories.find((c) => c.id === report.categoryId);
  const gov = GOVERNORATES.find((g) => g.id === report.location.governorateId);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[95vh]"
      >
        {/* Modal Controls Bar (hidden during print) */}
        <div className="bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-bold">
              {t('printReportReceipt', language)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'طباعة / حفظ PDF' : 'Print / Save PDF'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 overflow-y-auto space-y-6 print:p-0 print:m-0 font-sans text-slate-900">
          {/* Official Document Header */}
          <div className="border-b-2 border-slate-900 pb-5 flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500 flex items-center justify-center text-amber-700">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
                  {language === 'ar' ? 'منصة عين مصر — Ain Masr' : 'Ain Masr Civic Platform'}
                </h1>
              </div>
              <p className="text-xs text-slate-600">
                {language === 'ar'
                  ? 'المنظومة الوطنية الموحدة للبلاغات المدنية ومكافحة الشائعات'
                  : 'National Unified Digital Platform for Responsible Civic Reporting'}
              </p>
              <p className="text-[10px] text-slate-500">
                {language === 'ar'
                  ? 'وثيقة إلكترونية رسمية صادرة بموجب أحكام القانون رقم 175 لسنة 2018'
                  : 'Official electronic certificate issued under Egyptian Law No. 175 of 2018'}
              </p>
            </div>

            {/* Official Stamp Box */}
            <div className="text-center p-3 border-2 border-dashed border-amber-600/40 rounded-xl bg-amber-50/30">
              <div className="text-[10px] uppercase font-mono tracking-widest text-amber-800 font-bold">
                {language === 'ar' ? 'ختم التحقق الرقمي' : 'Digital Verification'}
              </div>
              <div className="text-base font-extrabold font-mono text-slate-900 my-1">
                {report.referenceNo}
              </div>
              <div className="text-[9px] text-slate-500">
                {new Date().toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
              </div>
            </div>
          </div>

          {/* Reference Banner */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs text-slate-500 block">
                {language === 'ar' ? 'الرقم المرجعي الموحد للبلاغ:' : 'Unified Tracking Reference:'}
              </span>
              <span className="text-2xl font-mono font-extrabold text-slate-900 tracking-wider tabular-nums">
                {report.referenceNo}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">
                {language === 'ar' ? 'الحالة الإجرائية الحالية:' : 'Current Status:'}
              </span>
              <span className="px-3 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
                {formatStatus(report.status, language)}
              </span>
            </div>
          </div>

          {/* Incident Details Grid */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
              {language === 'ar' ? 'بيانات الواقعة المسجلة' : 'Incident Specifics'}
            </h3>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">{t('fieldTitle', language)}:</span>
                <span className="font-bold text-slate-800">
                  {language === 'en' && report.titleEn ? report.titleEn : report.title}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">{t('category', language)}:</span>
                <span className="font-bold text-slate-800">
                  {report.customCategory || (language === 'ar' ? currentCat?.nameAr : currentCat?.nameEn)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">{language === 'ar' ? 'تاريخ وتوقيت الواقعة' : 'Date & Time'}:</span>
                <span className="font-semibold text-slate-800 tabular-nums">
                  {report.dateOccurred} — {report.timeOccurred}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">{t('severity', language)}:</span>
                <span className="font-semibold text-slate-800">
                  {formatSeverity(report.severity, language)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">{language === 'ar' ? 'المحافظة والحي' : 'Governorate & District'}:</span>
                <span className="font-semibold text-slate-800">
                  {gov ? (language === 'ar' ? gov.nameAr : gov.nameEn) : ''}
                  {report.location?.cityDistrict ? ` — ${language === 'en' && report.location?.cityDistrictEn ? report.location.cityDistrictEn : report.location.cityDistrict}` : ''}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">{language === 'ar' ? 'الشارع وأقرب علامة' : 'Street & Landmark'}:</span>
                <span className="font-semibold text-slate-800">
                  {language === 'en' && report.location?.streetLandmarkEn ? report.location.streetLandmarkEn : (report.location?.streetLandmark || '—')}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <span className="text-slate-400 block text-xs mb-1">
                {language === 'ar' ? 'الوصف الموضوعي للوقائع' : 'Factual Description'}:
              </span>
              <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
                {language === 'en' && report.descriptionEn ? report.descriptionEn : report.description}
              </p>
            </div>
          </div>

          {/* Department Dispatch Info */}
          <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-blue-700" />
              <div>
                <span className="text-slate-500 block text-[11px]">
                  {language === 'ar' ? 'الجهة الحكومية الموجه إليها البلاغ:' : 'Assigned Government Department:'}
                </span>
                <span className="font-bold text-blue-900">
                  {language === 'ar' ? assignedDept?.nameAr : assignedDept?.nameEn}
                </span>
              </div>
            </div>

            <div className="text-end">
              <span className="text-[10px] text-slate-500 block">
                {language === 'ar' ? 'نوع قيد الهوية:' : 'Identity Protocol:'}
              </span>
              <span className="font-bold text-slate-800">
                {report.reporter.identityType === 'verified'
                  ? (language === 'ar' ? 'مواطن موثق' : 'Verified Citizen')
                  : (language === 'ar' ? 'هوية محمية وسرية' : 'Protected Identity')}
              </span>
            </div>
          </div>

          {/* Legal Notice Footer */}
          <div className="border-t border-slate-200 pt-4 text-[10px] text-slate-500 space-y-1">
            <p className="leading-relaxed">
              {language === 'ar'
                ? 'إخلاء مسؤولية وسرية: هذا الإيصال صادر إلكترونياً من منصة عين مصر. البلاغات سرية ومحمية قانوناً ولا يجوز تداول هذا المستند أو نشره على مواقع التواصل الاجتماعي لما يشكله ذلك من مخالفة لأحكام قانون مكافحة جرائم تقنية المعلومات رقم 175 لسنة 2018.'
                : 'Confidentiality & Legal Notice: This electronic receipt is issued by Ain Masr. Reports are strictly confidential by law and must not be disseminated on social media platforms under provisions of Egyptian Cybercrime Law No. 175 of 2018.'}
            </p>
            <p className="font-mono text-slate-400">
              Ain Masr Civic Systems · ID: {report.id} · Generated: {new Date().toISOString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
