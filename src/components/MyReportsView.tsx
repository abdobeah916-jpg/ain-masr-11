import React, { useState } from 'react';
import {
  FileText,
  Search,
  Filter,
  PlusCircle,
  Clock,
  MapPin,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  Shield,
  Eye,
  Printer,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { t, formatStatus, formatSeverity } from '../locales/i18n';
import { GOVERNORATES } from '../data/mockData';
import { ReportStatus } from '../types';

export const MyReportsView: React.FC = () => {
  const {
    language,
    reports,
    categories,
    departments,
    setActiveView,
    setSelectedReportId,
    printReportReceipt,
  } = useApp();

  const Arrow = language === 'ar' ? ArrowLeft : ArrowRight;
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredReports = reports.filter((rep) => {
    const matchesSearch =
      rep.referenceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rep.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (rep.location?.cityDistrict && rep.location.cityDistrict.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all' ? true : rep.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: ReportStatus) => {
    switch (status) {
      case 'resolved': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'investigating': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'info_requested': return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'submitted': return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'closed': return 'bg-slate-100 text-slate-500 border-slate-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            {t('myReportsTitle', language)}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {t('myReportsDesc', language)}
          </p>
        </div>

        <button
          onClick={() => setActiveView('submit_report')}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t('navSubmit', language)}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 left-3 rtl:left-auto rtl:right-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('search', language)}
            className="w-full pl-9 pr-3 rtl:pr-9 rtl:pl-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Interactive Segmented Filter Controls */}
        <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg overflow-x-auto no-scrollbar w-full max-w-full min-w-0">
          {['all', 'submitted', 'investigating', 'info_requested', 'resolved'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === st
                  ? 'bg-white text-slate-900 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st === 'all' ? t('filterAll', language) : formatStatus(st as ReportStatus, language)}
            </button>
          ))}
        </div>
      </div>

      {/* Reports List */}
      {filteredReports.length > 0 ? (
        <div className="space-y-3">
          {filteredReports.map((rep) => {
            const cat = categories.find((c) => c.id === rep.categoryId);
            const dept = departments.find((d) => d.id === rep.assignedDepartmentId);
            const gov = GOVERNORATES.find((g) => g.id === rep.location.governorateId);

            return (
              <div
                key={rep.id}
                onClick={() => {
                  setSelectedReportId(rep.id);
                  setActiveView('track_report');
                }}
                className="p-5 bg-white rounded-xl border border-slate-200 hover:border-amber-400 hover:shadow-sm transition-all cursor-pointer space-y-3"
              >
                {/* Header line */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-slate-900 tracking-wide tabular-nums">
                      {rep.referenceNo}
                    </span>
                    <span className="text-slate-400" aria-hidden="true">·</span>
                    <span className="text-xs text-slate-500">
                      {language === 'en'
                        ? (rep.customCategoryEn || cat?.nameEn || rep.customCategory || cat?.nameAr)
                        : (rep.customCategory || cat?.nameAr || cat?.nameEn)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        printReportReceipt(rep);
                      }}
                      className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                      title={t('printReportReceipt', language)}
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(
                        rep.status
                      )}`}
                    >
                      {formatStatus(rep.status, language)}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                  {language === 'en' && rep.titleEn ? rep.titleEn : rep.title}
                </h3>

                {/* Metadata text without pills */}
                <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-500 pt-1">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      {gov ? (language === 'ar' ? gov.nameAr : gov.nameEn) : ''}
                      {rep.location?.cityDistrict ? ` — ${language === 'en' && rep.location?.cityDistrictEn ? rep.location.cityDistrictEn : rep.location.cityDistrict}` : ''}
                    </span>
                  </div>

                  <span className="text-slate-300" aria-hidden="true">·</span>

                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="tabular-nums">{rep.dateOccurred}</span>
                  </div>

                  <span className="text-slate-300" aria-hidden="true">·</span>

                  <div>
                    <span className="text-slate-400">{t('department', language)}: </span>
                    <span className="font-medium text-slate-700">
                      {language === 'ar' ? dept?.nameAr : dept?.nameEn}
                    </span>
                  </div>

                  {rep.clarificationMessages.length > 0 && (
                    <>
                      <span className="text-slate-300" aria-hidden="true">·</span>
                      <span className="text-blue-600 font-semibold">
                        {language === 'ar' ? 'توجد استفسارات جارية' : 'Clarifications Active'}
                      </span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
          <FileText className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">
            {t('noReportsYet', language)}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {language === 'ar'
              ? 'عند قيامك بتقديم أي بلاغ أو شكوى مدنية ستظهر في هذه القائمة مع كامل تحديثات المفتشين.'
              : 'When you submit a civic report, it will appear here with live updates from inspectors.'}
          </p>
          <button
            onClick={() => setActiveView('submit_report')}
            className="mt-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
          >
            {t('startNewReport', language)}
          </button>
        </div>
      )}
    </div>
  );
};
