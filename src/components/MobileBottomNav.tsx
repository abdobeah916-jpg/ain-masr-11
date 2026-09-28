import React from 'react';
import {
  Home,
  Search,
  Plus,
  FileText,
  Shield,
  Building,
  Sliders,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { t } from '../locales/i18n';

export const MobileBottomNav: React.FC = () => {
  const {
    language,
    activeView,
    setActiveView,
    setAuthModalOpen,
    isOfficialAuthenticated,
    currentUser,
  } = useApp();

  const handleNav = (view: string) => {
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProfileClick = () => {
    if (isOfficialAuthenticated) {
      if (currentUser.role === 'admin') {
        setActiveView('admin_dashboard');
      } else {
        setActiveView('authority_portal');
      }
    } else {
      setActiveView('safety_center');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isProfileActive =
    activeView === 'safety_center' ||
    activeView === 'authority_portal' ||
    activeView === 'admin_dashboard';

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-safe transition-all"
    >
      <div className="grid grid-cols-5 items-center h-16 max-w-lg mx-auto px-2">
        {/* Tab 1: الرئيسية */}
        <button
          onClick={() => handleNav('home')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors cursor-pointer ${
            activeView === 'home'
              ? 'text-amber-600 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Home className={`w-5 h-5 transition-transform ${activeView === 'home' ? 'scale-110' : ''}`} />
          <span className="text-[10px] tracking-tight mt-1 truncate">
            {t('navHome', language)}
          </span>
        </button>

        {/* Tab 2: متابعة بلاغ */}
        <button
          onClick={() => handleNav('track_report')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors cursor-pointer ${
            activeView === 'track_report'
              ? 'text-amber-600 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Search className={`w-5 h-5 transition-transform ${activeView === 'track_report' ? 'scale-110' : ''}`} />
          <span className="text-[10px] tracking-tight mt-1 truncate">
            {t('navTrack', language)}
          </span>
        </button>

        {/* Tab 3: إبلاغ فوري (Prominent Center Button) */}
        <div className="flex items-center justify-center -mt-5">
          <button
            onClick={() => handleNav('submit_report')}
            aria-label={t('navSubmit', language)}
            className="w-13 h-13 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/30 border-2 border-white active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Tab 4: بلاغاتي */}
        <button
          onClick={() => handleNav('my_reports')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors cursor-pointer ${
            activeView === 'my_reports'
              ? 'text-amber-600 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className={`w-5 h-5 transition-transform ${activeView === 'my_reports' ? 'scale-110' : ''}`} />
          <span className="text-[10px] tracking-tight mt-1 truncate">
            {t('navMyReports', language)}
          </span>
        </button>

        {/* Tab 5: إما مركز الأمان والسلامة للعامة، أو غرفة العمليات للمسؤول المسجل */}
        <button
          onClick={handleProfileClick}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors cursor-pointer ${
            isProfileActive
              ? 'text-amber-600 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          {isOfficialAuthenticated ? (
            currentUser.role === 'admin' ? (
              <Sliders className="w-5 h-5 text-amber-500" />
            ) : (
              <Building className="w-5 h-5 text-blue-600" />
            )
          ) : (
            <Shield className="w-5 h-5" />
          )}
          <span className="text-[10px] tracking-tight mt-1 truncate font-semibold">
            {isOfficialAuthenticated
              ? currentUser.role === 'admin'
                ? language === 'ar' ? 'الإدارة' : 'Admin'
                : language === 'ar' ? 'الجهة' : 'Authority'
              : t('navSafety', language)}
          </span>
        </button>
      </div>
    </nav>
  );
};
