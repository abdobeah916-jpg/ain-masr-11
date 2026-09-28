import React, { useState } from 'react';
import {
  ShieldCheck,
  Globe,
  User,
  Menu,
  X,
  PhoneCall,
  Building,
  UserCheck,
  Sliders,
  LogOut,
  Bell,
  Check,
  PlusCircle,
  DoorOpen,
  Sparkles,
  BookOpen,
  Target,
  FileText,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { t } from '../locales/i18n';
import { UserRole } from '../types';
import { ExitModal } from './ExitModal';

export const Navbar: React.FC = () => {
  const {
    language,
    setLanguage,
    currentUser,
    switchRole,
    activeView,
    setActiveView,
    setEmergencyModalOpen,
    setAuthModalOpen,
    setAuthDefaultTab,
    isOfficialAuthenticated,
    isCitizenAuthenticated,
    logout,
    notifications,
    markAllNotificationsAsRead,
    setSelectedReportId,
    currentOfficerBranch,
    departments,
    reports,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [exitModalOpen, setExitModalOpen] = useState(false);
  const [secretClickCount, setSecretClickCount] = useState(0);

  const handleLogoIconClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newCount = secretClickCount + 1;
    if (newCount >= 3) {
      setSecretClickCount(0);
      setActiveView('staff_portal');
    } else {
      setSecretClickCount(newCount);
      setTimeout(() => setSecretClickCount(0), 1200);
      handleNavClick('home');
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  const handleNavClick = (view: string) => {
    setActiveView(view);
    setMobileMenuOpen(false);
    setNotifDropdownOpen(false);
  };

  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  const navLinks = [
    { id: 'home', label: t('navHome', language) },
    { id: 'intro', label: language === 'ar' ? 'المقدمة' : 'Intro' },
    { id: 'goals', label: language === 'ar' ? 'أهداف البرمجية' : 'Goals' },
    { id: 'user_guide', label: language === 'ar' ? 'دليل الاستخدام' : 'User Guide' },
    { id: 'submit_report', label: t('navSubmit', language) },
    { id: 'track_report', label: t('navTrack', language) },
    { id: 'safety_center', label: t('navSafety', language) },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#091524]/95 text-white border-b border-slate-800/80 shadow-md backdrop-blur-md">
      {/* Subtle Egyptian Flag Hairline Accent */}
      <div className="h-0.5 flex w-full">
        <div className="flex-1 bg-red-600" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-slate-900" />
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-3 w-full min-w-0">
        {/* Brand & Crest */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="flex items-center gap-2 sm:gap-2.5 text-start group min-w-0">
            <button
              type="button"
              onClick={handleLogoIconClick}
              title={language === 'ar' ? 'منصة عين مصر' : 'Ain Masr'}
              className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform cursor-pointer"
            >
              <ShieldCheck className="w-5 h-5 text-slate-950" />
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('home')}
              className="flex flex-col text-start cursor-pointer group min-w-0"
            >
              <span className="text-sm sm:text-lg font-extrabold tracking-tight text-white group-hover:text-amber-400 transition-colors truncate">
                {language === 'ar' ? 'عين مصر' : 'Ain Masr'}
              </span>
              <span className="text-[9px] sm:text-[10px] text-slate-400 tracking-wider font-medium truncate hidden sm:block">
                {language === 'ar' ? 'المنصة الوطنية الموحدة' : 'National Civic Platform'}
              </span>
            </button>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-xs xl:text-sm font-medium">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeView === link.id
                  ? 'bg-amber-500/15 text-amber-300 font-bold border border-amber-400/30 shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {link.label}
            </button>
          ))}

          {/* Authority Portal when official is authenticated */}
          {isOfficialAuthenticated && currentUser.role === 'authority' && (
            <button
              onClick={() => handleNavClick('authority_portal')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeView === 'authority_portal'
                  ? 'bg-blue-500/20 text-blue-300 font-bold border border-blue-400/30'
                  : 'text-blue-300 hover:text-white hover:bg-slate-800/60 font-semibold'
              }`}
            >
              <Building className="w-3.5 h-3.5 text-blue-400" />
              <span>{t('navAuthority', language)}</span>
            </button>
          )}

          {isOfficialAuthenticated && currentUser.role === 'admin' && (
            <button
              onClick={() => handleNavClick('admin_dashboard')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeView === 'admin_dashboard'
                  ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-400/30'
                  : 'text-amber-300 hover:text-white hover:bg-slate-800/60 font-semibold'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('navAdmin', language)}</span>
            </button>
          )}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Direct "Submit Report" CTA button */}
          <button
            type="button"
            onClick={() => handleNavClick('submit_report')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-extrabold text-xs rounded-xl shadow-md shadow-amber-500/10 transition-all cursor-pointer active:scale-95"
          >
            <PlusCircle className="w-3.5 h-3.5 text-slate-950" />
            <span>{language === 'ar' ? 'تسجيل بلاغ +' : 'New Report +'}</span>
          </button>

          {/* Emergency Hotlines Button */}
          <button
            onClick={() => setEmergencyModalOpen(true)}
            aria-label={t('emergencyHotlinesBtn', language)}
            className="p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-bold text-rose-300 bg-rose-950/70 hover:bg-rose-900 border border-rose-800/70 rounded-xl transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap shadow-2xs"
            title={t('emergencyHotlinesBtn', language)}
          >
            <PhoneCall className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            <span className="hidden md:inline">{t('emergencyHotlinesBtn', language)}</span>
            <span className="hidden xs:inline md:hidden text-[11px]">122/123</span>
          </button>

          {/* Notifications Center */}
          <div className="relative">
            <button
              onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
              className="p-1.5 sm:p-2 text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer relative"
              title={t('notificationsTitle', language)}
            >
              <Bell className="w-4 h-4 text-amber-400" />
              {unreadNotifsCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center -top-1 -right-1 absolute">
                  {unreadNotifsCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {notifDropdownOpen && (
              <div
                className={`absolute ${
                  language === 'ar' ? 'left-0' : 'right-0'
                } mt-2 w-72 sm:w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl py-2 z-50 text-xs animate-in`}
              >
                <div className="px-4 py-2 border-b border-slate-800 flex items-center justify-between">
                  <span className="font-bold text-white text-xs">
                    {t('notificationsTitle', language)}
                  </span>
                  {unreadNotifsCount > 0 && (
                    <button
                      onClick={markAllNotificationsAsRead}
                      className="text-[11px] text-amber-400 hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" />
                      <span>{t('markAllRead', language)}</span>
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-800">
                  {notifications.length === 0 ? (
                    <p className="p-4 text-center text-slate-400 text-xs">
                      {t('noNotifications', language)}
                    </p>
                  ) : (
                    notifications.slice(0, 8).map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          if (notif.reportRef) {
                            const found = reports.find((r) => r.referenceNo === notif.reportRef);
                            if (found) setSelectedReportId(found.id);
                            setActiveView('track_report');
                          }
                          setNotifDropdownOpen(false);
                        }}
                        className={`p-3 text-start hover:bg-slate-800/80 cursor-pointer transition-colors ${
                          !notif.read ? 'bg-slate-800/40' : ''
                        }`}
                      >
                        <div className="font-bold text-slate-200 mb-0.5 flex items-center justify-between">
                          <span>{language === 'ar' ? notif.titleAr : notif.titleEn}</span>
                          {notif.branchNameAr && (
                            <span className="text-[9px] text-amber-400 font-mono">
                              {notif.branchNameAr}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 line-clamp-2">
                          {language === 'ar' ? notif.messageAr : notif.messageEn}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Authentication & Persona Gate */}
          {isOfficialAuthenticated ? (
            <div className="flex items-center gap-1.5">
              <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-amber-500/15 border border-amber-500/30 rounded-xl text-amber-300">
                {currentUser.role === 'admin' ? (
                  <>
                    <Sliders className="w-3.5 h-3.5 text-rose-400" />
                    <span>{t('loginRoleHead', language)}</span>
                  </>
                ) : (
                  <>
                    <Building className="w-3.5 h-3.5 text-blue-400" />
                    <span className="truncate max-w-[130px]">
                      {currentOfficerBranch?.nameAr || currentUser.branchNameAr || t('loginRoleAuthority', language)}
                    </span>
                  </>
                )}
              </div>

              <button
                onClick={logout}
                className="p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-semibold text-rose-300 hover:text-white bg-rose-950/70 hover:bg-rose-900 border border-rose-800/80 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                title={t('logoutBtn', language)}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t('logoutBtn', language)}</span>
              </button>
            </div>
          ) : isCitizenAuthenticated ? (
            <div className="flex items-center gap-1">
              <div
                onClick={() => setActiveView('my_reports')}
                className="flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-300 cursor-pointer hover:bg-emerald-500/20 transition-colors"
                title={language === 'ar' ? 'حسابك كمواطن' : 'Your Profile'}
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate max-w-[70px] sm:max-w-[120px]">
                  {currentUser.name}
                </span>
              </div>

              <button
                onClick={logout}
                className="p-1.5 sm:px-2 sm:py-1.5 text-xs font-semibold text-slate-300 hover:text-rose-300 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap"
                title={t('logoutBtn', language)}
              >
                <LogOut className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAuthModalOpen(true)}
              className="p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 rounded-xl transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap"
              title={language === 'ar' ? 'تسجيل الدخول' : 'Log In'}
            >
              <User className="w-3.5 h-3.5 text-slate-300" />
              <span className="hidden sm:inline">{language === 'ar' ? 'تسجيل الدخول' : 'Log In'}</span>
            </button>
          )}

          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="px-2 sm:px-2.5 py-1.5 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 rounded-xl transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap"
            title="تبديل اللغة / Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden xs:inline">{language === 'ar' ? 'English' : 'عربي'}</span>
            <span className="xs:hidden">{language === 'ar' ? 'EN' : 'ع'}</span>
          </button>

          {/* Easy Program Exit Button (Criterion #15) */}
          <button
            type="button"
            onClick={() => setExitModalOpen(true)}
            className="p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-bold text-rose-300 hover:text-white bg-rose-950/70 hover:bg-rose-900 border border-rose-800/80 rounded-xl transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap shadow-2xs"
            title={language === 'ar' ? 'الخروج من البرمجية بسهولة' : 'Exit Software'}
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden xs:inline">{language === 'ar' ? 'خروج' : 'Exit'}</span>
          </button>

          {/* Mobile hamburger menu */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-900/95 px-4 py-3 space-y-1.5 animate-in fade-in">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
              className={`block w-full text-start px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                activeView === link.id
                  ? 'bg-amber-500/15 text-amber-300 font-bold border border-amber-500/20'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              {link.label}
            </button>
          ))}

          {isOfficialAuthenticated && currentUser.role === 'authority' && (
            <button
              onClick={() => handleNavClick('authority_portal')}
              className={`flex items-center justify-between w-full text-start px-3.5 py-2.5 rounded-xl text-sm font-medium ${
                activeView === 'authority_portal'
                  ? 'bg-blue-500/20 text-blue-300 font-bold'
                  : 'text-blue-300 hover:bg-slate-800'
              }`}
            >
              <span>{t('navAuthority', language)}</span>
              <Building className="w-4 h-4 text-blue-400" />
            </button>
          )}

          {isOfficialAuthenticated && currentUser.role === 'admin' && (
            <button
              onClick={() => handleNavClick('admin_dashboard')}
              className={`flex items-center justify-between w-full text-start px-3.5 py-2.5 rounded-xl text-sm font-medium ${
                activeView === 'admin_dashboard'
                  ? 'bg-amber-500/20 text-amber-300 font-bold'
                  : 'text-amber-300 hover:bg-slate-800'
              }`}
            >
              <span>{t('navAdmin', language)}</span>
              <Sliders className="w-4 h-4 text-amber-400" />
            </button>
          )}

          <div className="pt-2 border-t border-slate-800 space-y-1.5">
            {isOfficialAuthenticated ? (
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-start px-3.5 py-2.5 text-rose-400 font-semibold text-sm flex items-center gap-2 hover:bg-slate-800 rounded-xl"
              >
                <LogOut className="w-4 h-4" />
                <span>{t('logoutBtn', language)}</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setAuthModalOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full text-start px-3.5 py-2.5 text-slate-300 hover:text-white font-semibold text-sm flex items-center gap-2 hover:bg-slate-800 rounded-xl"
              >
                <User className="w-4 h-4 text-slate-400" />
                <span>{language === 'ar' ? 'تسجيل الدخول' : 'Log In'}</span>
              </button>
            )}

            {/* Mobile Exit App Button */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setExitModalOpen(true);
              }}
              className="w-full text-start px-3.5 py-2.5 text-rose-300 hover:text-white font-semibold text-sm flex items-center gap-2 bg-rose-950/40 hover:bg-rose-900/60 rounded-xl transition-colors border border-rose-900/60"
            >
              <LogOut className="w-4 h-4 text-rose-400" />
              <span>{language === 'ar' ? 'الخروج من البرمجية' : 'Exit Software'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Exit Software Modal Dialog */}
      <ExitModal isOpen={exitModalOpen} onClose={() => setExitModalOpen(false)} />
    </header>
  );
};
