import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  ShieldCheck,
  Globe,
  User,
  X,
  PhoneCall,
  Building,
  UserCheck,
  Sliders,
  LogOut,
  Bell,
  Check,
  PlusCircle,
  Home,
  BookOpen,
  Target,
  Sparkles,
  Search,
  FileText,
  ChevronLeft,
  ChevronRight,
  Shield,
  HelpCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { t } from '../locales/i18n';
import { ExitModal } from './ExitModal';

export const Navbar: React.FC = () => {
  const {
    language,
    setLanguage,
    currentUser,
    activeView,
    setActiveView,
    setEmergencyModalOpen,
    setAuthModalOpen,
    isOfficialAuthenticated,
    isCitizenAuthenticated,
    logout,
    notifications,
    markAllNotificationsAsRead,
    setSelectedReportId,
    currentOfficerBranch,
    reports,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [exitModalOpen, setExitModalOpen] = useState(false);
  const [secretClickCount, setSecretClickCount] = useState(0);

  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const triggerButtonRef = useRef<HTMLButtonElement | null>(null);
  const isRTL = language === 'ar';

  // Lock background scrolling and manage focus when the full-screen drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      // Focus close button for accessibility
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 50);

      return () => {
        document.body.style.overflow = originalOverflow;
      };
    } else {
      // Return focus to menu trigger when closed
      triggerButtonRef.current?.focus();
    }
  }, [mobileMenuOpen]);

  // Accessible keyboard listener (Escape key to dismiss drawer)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        e.preventDefault();
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  // Discreet access for authorized personnel without polluting public citizen menu
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const unreadNotifsCount = notifications.filter((n) => !n.read).length;
  const Arrow = isRTL ? ChevronLeft : ChevronRight;

  // Platform navigation directory items (Clean & accessible for citizens)
  const navLinks = [
    {
      id: 'home',
      label: t('navHome', language),
      desc: isRTL ? 'الواجهة الرئيسية وإحصائيات المنظومة والخدمات الحية' : 'Platform home, live metrics, and civic services overview',
      icon: Home,
    },
    {
      id: 'intro',
      label: isRTL ? 'المقدمة والتعريف' : 'Project Intro',
      desc: isRTL ? 'التعريف بمنظومة عين مصر وأهميتها الوطنية ومكافحة التشهير' : 'Overview of Ain Masr and legal evidence preservation mission',
      icon: Sparkles,
    },
    {
      id: 'goals',
      label: isRTL ? 'أهداف البرمجية' : 'Software Goals',
      desc: isRTL ? 'الأهداف التشغيلية وحماية المواطنين وفق القانون 175 لسنة 2018' : 'Operational objectives & statutory legal compliance',
      icon: Target,
    },
    {
      id: 'user_guide',
      label: isRTL ? 'دليل الاستخدام' : 'User Guide',
      desc: isRTL ? 'شرح خطوات توثيق وتسجيل البلاغات والاستعلام عنها خطوة بخطوة' : 'Step-by-step reporting and reference tracking manual',
      icon: BookOpen,
    },
    {
      id: 'submit_report',
      label: t('navSubmit', language),
      desc: isRTL ? 'تسجيل واقعة جديدة ورفع الأدلة المصورة مع خيار السرية التامة بالداخل' : 'Document an incident with video evidence and confidential options',
      icon: PlusCircle,
      highlight: true,
    },
    {
      id: 'track_report',
      label: t('navTrack', language),
      desc: isRTL ? 'الاستعلام الفوري عن حالة وتطورات البلاغ بالرقم المرجعي أو الهاتف' : 'Inquire about investigation updates via reference number',
      icon: Search,
    },
    ...(isCitizenAuthenticated
      ? [
          {
            id: 'my_reports',
            label: t('navMyReports', language),
            desc: isRTL ? 'أرشيف بلاغاتك المدنية السابقة ومتابعة قرارات الجهات' : 'Your personal submitted reports archive and status updates',
            icon: FileText,
          },
        ]
      : []),
    {
      id: 'safety_center',
      label: t('navSafety', language),
      desc: isRTL ? 'إرشادات السلامة العامة وأرقام الطوارئ والأسئلة الشائعة' : 'Safety instructions, emergency protocols, and common questions',
      icon: ShieldCheck,
    },
  ];

  // Header quick links visible on desktop
  const desktopHeaderLinks = [
    { id: 'home', label: t('navHome', language) },
    { id: 'intro', label: isRTL ? 'المقدمة' : 'Intro' },
    { id: 'goals', label: isRTL ? 'أهداف البرمجية' : 'Goals' },
    { id: 'user_guide', label: isRTL ? 'دليل الاستخدام' : 'User Guide' },
    { id: 'track_report', label: t('navTrack', language) },
    { id: 'safety_center', label: t('navSafety', language) },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#091524]/95 text-white border-b border-slate-800/80 shadow-md backdrop-blur-md">
        {/* Subtle Egyptian Flag Hairline Accent */}
        <div className="h-0.5 flex w-full">
          <div className="flex-1 bg-red-600" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-slate-900" />
        </div>

        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4 w-full min-w-0">
          {/* Brand & Crest */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink-0">
            <div className="flex items-center gap-2 sm:gap-2.5 text-start group min-w-0">
              <button
                type="button"
                onClick={handleLogoIconClick}
                title={isRTL ? 'منصة عين مصر' : 'Ain Masr'}
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
                  {isRTL ? 'عين مصر' : 'Ain Masr'}
                </span>
                <span className="text-[9px] sm:text-[10px] text-slate-400 tracking-wider font-medium truncate hidden sm:block">
                  {isRTL ? 'المنصة الوطنية الموحدة' : 'National Civic Platform'}
                </span>
              </button>
            </div>
          </div>

          {/* Desktop Navigation Links (Unfolded horizontally in the header bar) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 min-w-0" aria-label="Desktop Navigation">
            {desktopHeaderLinks.map((link) => {
              const isActive = activeView === link.id;
              return (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => handleNavClick(link.id)}
                  className={`px-2.5 xl:px-3 py-1.5 rounded-xl text-xs xl:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Action Controls & Drawer Trigger */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Direct "Submit Report" CTA button */}
            <button
              type="button"
              onClick={() => handleNavClick('submit_report')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-extrabold text-xs rounded-xl shadow-md shadow-amber-500/10 transition-all cursor-pointer active:scale-95"
              title={isRTL ? 'تسجيل بلاغ مدني جديد' : 'Submit Report'}
            >
              <PlusCircle className="w-3.5 h-3.5 text-slate-950" />
              <span className="truncate">{isRTL ? 'تسجيل بلاغ +' : 'New Report +'}</span>
            </button>

            {/* Emergency Hotlines Button */}
            <button
              type="button"
              onClick={() => setEmergencyModalOpen(true)}
              aria-label={t('emergencyHotlinesBtn', language)}
              className="p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-bold text-rose-300 bg-rose-950/70 hover:bg-rose-900 border border-rose-800/70 rounded-xl transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap shadow-2xs"
              title={t('emergencyHotlinesBtn', language)}
            >
              <PhoneCall className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              <span className="hidden xl:inline">{t('emergencyHotlinesBtn', language)}</span>
              <span className="text-[11px] xl:hidden">122/123</span>
            </button>

            {/* Notifications Center */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="p-1.5 sm:p-2 text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer relative"
                title={t('notificationsTitle', language)}
                aria-expanded={notifDropdownOpen}
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
                    isRTL ? 'left-0' : 'right-0'
                  } mt-2 w-72 sm:w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl py-2 z-50 text-xs`}
                >
                  <div className="px-4 py-2 border-b border-slate-800 flex items-center justify-between">
                    <span className="font-bold text-white text-xs">
                      {t('notificationsTitle', language)}
                    </span>
                    {unreadNotifsCount > 0 && (
                      <button
                        type="button"
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
                            <span>{isRTL ? notif.titleAr : notif.titleEn}</span>
                            {notif.branchNameAr && (
                              <span className="text-[9px] text-amber-400 font-mono">
                                {notif.branchNameAr}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 line-clamp-2">
                            {isRTL ? notif.messageAr : notif.messageEn}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Citizen / Official Authenticated Badge */}
            {isOfficialAuthenticated ? (
              <div className="flex items-center gap-1.5">
                <div
                  onClick={() => {
                    if (currentUser.role === 'admin') {
                      setActiveView('admin_dashboard');
                    } else {
                      setActiveView('authority_portal');
                    }
                  }}
                  className="hidden md:flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-amber-500/15 border border-amber-500/30 rounded-xl text-amber-300 cursor-pointer hover:bg-amber-500/25 transition-colors"
                  title={isRTL ? 'الانتقال إلى لوحة مهامك الرسمية' : 'Go to official dashboard'}
                >
                  {currentUser.role === 'admin' ? (
                    <>
                      <Sliders className="w-3.5 h-3.5 text-rose-400" />
                      <span>{t('loginRoleHead', language)}</span>
                    </>
                  ) : (
                    <>
                      <Building className="w-3.5 h-3.5 text-blue-400" />
                      <span className="truncate max-w-[120px]">
                        {currentOfficerBranch?.nameAr || currentUser.branchNameAr || t('loginRoleAuthority', language)}
                      </span>
                    </>
                  )}
                </div>

                <button
                  type="button"
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
                  className="flex items-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1.5 text-xs font-semibold bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-300 cursor-pointer hover:bg-emerald-500/20 transition-colors"
                  title={isRTL ? 'حسابك كمواطن ومتابعة بلاغاتك' : 'Your Profile'}
                >
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate max-w-[70px] sm:max-w-[110px]">
                    {currentUser.name}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={logout}
                  className="p-1.5 sm:px-2 sm:py-1.5 text-xs font-semibold text-slate-300 hover:text-rose-300 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap"
                  title={t('logoutBtn', language)}
                >
                  <LogOut className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setAuthModalOpen(true)}
                className="p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-bold text-amber-300 hover:text-slate-950 bg-amber-500/20 hover:bg-amber-400 border border-amber-500/40 rounded-xl transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap shadow-xs"
                title={isRTL ? 'تسجيل دخول المواطنين' : 'Citizen Log In'}
              >
                <User className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isRTL ? 'دخول المواطنين' : 'Log In'}</span>
              </button>
            )}

            {/* Language Switcher */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="px-2 sm:px-2.5 py-1.5 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 rounded-xl transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap"
              title="تبديل اللغة / Switch Language"
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden xs:inline">{isRTL ? 'English' : 'عربي'}</span>
              <span className="xs:hidden">{isRTL ? 'EN' : 'ع'}</span>
            </button>

            {/* Easy Program Exit Button */}
            <button
              type="button"
              onClick={() => setExitModalOpen(true)}
              className="p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-bold text-rose-300 hover:text-white bg-rose-950/70 hover:bg-rose-900 border border-rose-800/80 rounded-xl transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap shadow-2xs"
              title={isRTL ? 'الخروج من البرمجية بسهولة' : 'Exit Software'}
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden xs:inline">{isRTL ? 'خروج' : 'Exit'}</span>
            </button>

            {/* SLIDE-IN OVERLAY / FULL-SCREEN DRAWER TRIGGER BUTTON */}
            <button
              ref={triggerButtonRef}
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className={`p-2 sm:px-3 sm:py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-xs group focus-visible:ring-2 focus-visible:ring-amber-400 ${
                mobileMenuOpen
                  ? 'bg-amber-500 text-slate-950 border border-amber-400'
                  : 'text-amber-400 hover:text-amber-300 bg-slate-800/90 hover:bg-slate-700 border border-amber-500/40'
              }`}
              aria-label={isRTL ? 'فتح القائمة الشاملة' : 'Open platform menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="main-navigation-drawer"
              title={isRTL ? 'فتح القائمة الشاملة' : 'Open Navigation Drawer'}
            >
              {/* Three Lines / Hamburger Icon */}
              <div className="flex flex-col justify-center items-center gap-1 w-5 h-5 pointer-events-none">
                <span
                  className={`block h-0.5 w-4 rounded-full transition-transform duration-200 ${
                    mobileMenuOpen ? 'bg-slate-950 rotate-45 translate-y-1.5' : 'bg-amber-400'
                  }`}
                />
                <span
                  className={`block h-0.5 w-4 rounded-full transition-opacity duration-200 ${
                    mobileMenuOpen ? 'opacity-0' : 'bg-amber-400'
                  }`}
                />
                <span
                  className={`block h-0.5 w-4 rounded-full transition-transform duration-200 ${
                    mobileMenuOpen ? 'bg-slate-950 -rotate-45 -translate-y-1.5' : 'bg-amber-400'
                  }`}
                />
              </div>
              <span
                className={`text-xs font-extrabold hidden sm:inline ${
                  mobileMenuOpen ? 'text-slate-950' : 'text-white'
                }`}
              >
                {isRTL ? 'القائمة' : 'Menu'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* FULL-SCREEN SLIDE-IN OVERLAY DRAWER
          Rendered via createPortal directly into document.body to break out of all parent stacking contexts.
          Provides full screen coverage, smooth backdrop dimming, accessible drawer container, and easy dismiss. */}
      {mobileMenuOpen && typeof document !== 'undefined' && createPortal(
        <div
          id="main-navigation-drawer"
          role="dialog"
          aria-modal="true"
          aria-labelledby="drawer-heading"
          className="fixed inset-0 z-[9999] flex text-white font-sans animate-in fade-in duration-200"
        >
          {/* Dimmed Backdrop with Blur — Clicking anywhere on overlay dismisses the drawer */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm cursor-pointer transition-opacity"
          />

          {/* Slide-In Drawer Container (anchors to right in RTL, left in LTR) */}
          <aside
            tabIndex={-1}
            className={`relative z-10 w-full max-w-full sm:max-w-xl md:max-w-2xl bg-slate-900 border-slate-700/80 shadow-2xl h-full flex flex-col justify-between overflow-hidden ${
              isRTL
                ? 'mr-0 ml-auto border-l border-slate-800'
                : 'ml-0 mr-auto border-r border-slate-800'
            }`}
          >
            {/* Top Hairline Egyptian Flag Accent inside the drawer */}
            <div className="h-1 flex w-full shrink-0">
              <div className="flex-1 bg-red-600" />
              <div className="flex-1 bg-white" />
              <div className="flex-1 bg-slate-900" />
            </div>

            {/* Drawer Header with Crest, Title, and Close Button */}
            <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-md shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h2 id="drawer-heading" className="text-base sm:text-lg font-black text-white">
                    {isRTL ? 'عين مصر — القائمة الشاملة' : 'Ain Masr — Navigation Menu'}
                  </h2>
                  <p className="text-xs text-amber-400 font-medium">
                    {isRTL ? 'المنظومة الوطنية الموحدة للبلاغات المدنية' : 'National Civic Safety Platform'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="hidden sm:inline text-[10px] text-slate-400 font-mono px-2 py-1 rounded bg-slate-800 border border-slate-700">
                  ESC
                </span>
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-slate-400 hover:text-white bg-slate-800/90 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-amber-400"
                  aria-label={isRTL ? 'إغلاق القائمة' : 'Close menu'}
                >
                  <X className="w-5 h-5 text-amber-400" />
                  <span className="text-xs font-bold text-slate-200">{isRTL ? 'إغلاق' : 'Close'}</span>
                </button>
              </div>
            </div>

            {/* Drawer Scrollable Body Content */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
              {/* Highlighted Primary Call-to-Action: Submit New Civic Report */}
              <button
                type="button"
                onClick={() => handleNavClick('submit_report')}
                className="w-full p-4 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-extrabold rounded-2xl shadow-lg shadow-amber-500/15 flex items-center justify-between transition-all cursor-pointer group active:scale-[0.99] border border-amber-300/40"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-950/15 flex items-center justify-center shrink-0">
                    <PlusCircle className="w-6 h-6 text-slate-950" />
                  </div>
                  <div className="text-start">
                    <div className="text-sm font-black tracking-tight">
                      {isRTL ? 'تسجيل وتوثيق بلاغ مدني جديد' : 'Submit New Civic Incident Report'}
                    </div>
                    <div className="text-xs text-slate-900/80 font-medium">
                      {isRTL ? 'إرفاق الأدلة المصورة مع خيار البلاغ السري بالداخل' : 'Attach video evidence with confidential protection inside'}
                    </div>
                  </div>
                </div>
                <Arrow className="w-5 h-5 text-slate-950 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform shrink-0" />
              </button>

              {/* Navigation Sections Grid */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
                  {isRTL ? 'أقسام وخدمات المنصة' : 'Platform Directory'}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {navLinks.map((item) => {
                    const IconComponent = item.icon;
                    const isActive = activeView === item.id;
                    if (item.id === 'submit_report') return null; // already highlighted above

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleNavClick(item.id)}
                        className={`p-3.5 rounded-2xl text-start transition-all cursor-pointer flex items-start gap-3 group relative border focus-visible:ring-2 focus-visible:ring-amber-400 ${
                          isActive
                            ? 'bg-amber-500/20 border-amber-500/50 shadow-sm'
                            : 'bg-slate-950/50 border-slate-800 hover:bg-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        <div
                          className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${
                            isActive
                              ? 'bg-amber-500/30 text-amber-300'
                              : 'bg-slate-850 text-slate-300 group-hover:text-amber-400 group-hover:bg-slate-800'
                          }`}
                        >
                          <IconComponent className="w-5 h-5" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <span
                              className={`text-xs sm:text-sm font-bold truncate ${
                                isActive ? 'text-amber-300' : 'text-white group-hover:text-amber-300'
                              }`}
                            >
                              {item.label}
                            </span>
                            <Arrow className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors shrink-0" />
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                            {item.desc}
                          </p>
                        </div>

                        {isActive && (
                          <span className="absolute top-2 left-2 rtl:left-auto rtl:right-2 w-2 h-2 rounded-full bg-amber-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Official Workspace Status Indicator (ONLY visible if official logged in) */}
              {isOfficialAuthenticated && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Building className="w-5 h-5 text-amber-400" />
                    <div>
                      <div className="text-xs font-bold text-amber-300">
                        {currentUser.role === 'admin'
                          ? t('loginRoleHead', language)
                          : (currentOfficerBranch?.nameAr || currentUser.branchNameAr || 'غرفة العمليات الرسمية')}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {isRTL ? 'حساب رسمي نشط لجهة الاختصاص' : 'Active official staff credentials'}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      if (currentUser.role === 'admin') {
                        setActiveView('admin_dashboard');
                      } else {
                        setActiveView('authority_portal');
                      }
                    }}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    {isRTL ? 'دخول لوحة المهام' : 'Open Workspace'}
                  </button>
                </div>
              )}
            </div>

            {/* Drawer Footer Actions & Fast Utilities */}
            <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/80 space-y-3 shrink-0">
              <div className="grid grid-cols-2 gap-2">
                {/* Emergency Hotlines Trigger */}
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setEmergencyModalOpen(true);
                  }}
                  className="p-2.5 bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/70 rounded-xl text-start flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <PhoneCall className="w-4 h-4 text-rose-400 animate-pulse shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-rose-200 truncate">
                      {isRTL ? 'أرقام الطوارئ' : 'Emergency'}
                    </div>
                    <div className="text-[10px] text-rose-300/80 font-mono">122 / 123 / 180</div>
                  </div>
                </button>

                {/* Citizen Login or Profile */}
                {isCitizenAuthenticated ? (
                  <div
                    onClick={() => handleNavClick('my_reports')}
                    className="p-2.5 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-800/60 rounded-xl text-start flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <UserCheck className="w-4 h-4 text-emerald-300 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-emerald-200 truncate">{currentUser.name}</div>
                      <div className="text-[10px] text-emerald-400/90">{isRTL ? 'بلاغاتي المسجلة' : 'My Reports'}</div>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setAuthModalOpen(true);
                    }}
                    className="p-2.5 bg-slate-850 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-start flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <User className="w-4 h-4 text-amber-400 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">
                        {isRTL ? 'دخول المواطنين' : 'Citizen Login'}
                      </div>
                      <div className="text-[10px] text-slate-400">{isRTL ? 'لإرسال البلاغات' : 'To submit'}</div>
                    </div>
                  </button>
                )}
              </div>

              {/* Language Switch & Safe Software Exit Row */}
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/80 text-xs">
                <button
                  type="button"
                  onClick={toggleLanguage}
                  className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Globe className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isRTL ? 'Switch to English' : 'التحويل إلى العربية'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setExitModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-lg text-rose-400 hover:text-rose-200 hover:bg-rose-950/40 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{isRTL ? 'خروج من البرمجية' : 'Exit Software'}</span>
                </button>
              </div>
            </div>
          </aside>
        </div>,
        document.body
      )}

      {/* Exit Software Modal Dialog */}
      <ExitModal isOpen={exitModalOpen} onClose={() => setExitModalOpen(false)} />
    </>
  );
};
