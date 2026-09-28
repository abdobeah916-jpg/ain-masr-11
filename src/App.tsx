/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { EmergencyModal } from './components/EmergencyModal';
import { AuthModal } from './components/AuthModal';
import { ReportReceiptModal } from './components/ReportReceiptModal';
import { ExternalNotificationToast } from './components/ExternalNotificationToast';
import { HomeView } from './components/HomeView';
import { ReportWizard } from './components/ReportWizard';
import { TrackReportView } from './components/TrackReportView';
import { MyReportsView } from './components/MyReportsView';
import { AuthorityPortalView } from './components/AuthorityPortalView';
import { AdminDashboardView } from './components/AdminDashboardView';
import { StaffPortalView } from './components/StaffPortalView';
import { SafetyCenterView } from './components/SafetyCenterView';
import { ProjectIntroView } from './components/ProjectIntroView';
import { ProjectGoalsView } from './components/ProjectGoalsView';
import { UserGuideView } from './components/UserGuideView';
import { AppExitedView } from './components/AppExitedView';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Footer } from './components/Footer';

const AppContent: React.FC = () => {
  const {
    activeView,
    setActiveView,
    receiptModalReport,
    setReceiptModalReport,
    isOfficialAuthenticated,
    currentUser,
  } = useApp();

  // Check URL query parameters and hash on load / change for external direct entrance
  useEffect(() => {
    const handleUrlGateway = () => {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const portalParam = searchParams.get('portal');
        const hash = window.location.hash.toLowerCase();

        if (portalParam === 'official' || portalParam === 'authority' || portalParam === 'admin' || hash === '#staff' || hash === '#official') {
          if (isOfficialAuthenticated) {
            if (currentUser.role === 'admin' || portalParam === 'admin') {
              setActiveView('admin_dashboard');
            } else {
              setActiveView('authority_portal');
            }
          } else {
            setActiveView('staff_portal');
          }
        }
      } catch (e) {
        // ignore url parse error in sandbox
      }
    };

    handleUrlGateway();
    window.addEventListener('hashchange', handleUrlGateway);
    window.addEventListener('popstate', handleUrlGateway);
    return () => {
      window.removeEventListener('hashchange', handleUrlGateway);
      window.removeEventListener('popstate', handleUrlGateway);
    };
  }, [isOfficialAuthenticated, currentUser.role, setActiveView]);

  // Global Discreet Hotkey for Official Personnel (Ctrl + Alt + G or Alt + Shift + A)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Hotkey: Ctrl + Alt + G
      if ((e.ctrlKey || e.metaKey) && e.altKey && (e.key === 'g' || e.key === 'G' || e.key === 'ل')) {
        e.preventDefault();
        setActiveView(activeView === 'staff_portal' ? 'home' : 'staff_portal');
      }
      // Alternative: Alt + Shift + A
      if (e.altKey && e.shiftKey && (e.key === 'a' || e.key === 'A' || e.key === 'ش')) {
        e.preventDefault();
        setActiveView(activeView === 'staff_portal' ? 'home' : 'staff_portal');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeView, setActiveView]);

  // If viewing the isolated Staff Portal, render as a dedicated standalone intranet system
  if (activeView === 'staff_portal') {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans">
        <ExternalNotificationToast />
        <main className="flex-1">
          <StaffPortalView />
        </main>
      </div>
    );
  }

  // If the user completely exited and shut down the software
  if (activeView === 'exit_screen') {
    return <AppExitedView />;
  }

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-clip bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar />
      <EmergencyModal />
      <AuthModal />
      <ExternalNotificationToast />
      {receiptModalReport && (
        <ReportReceiptModal
          report={receiptModalReport}
          onClose={() => setReceiptModalReport(null)}
        />
      )}

      <main className="flex-1 w-full max-w-full overflow-x-clip min-w-0 pb-20 md:pb-6">
        {activeView === 'home' && <HomeView />}
        {activeView === 'intro' && <ProjectIntroView />}
        {activeView === 'goals' && <ProjectGoalsView />}
        {activeView === 'user_guide' && <UserGuideView />}
        {activeView === 'submit_report' && <ReportWizard />}
        {activeView === 'track_report' && <TrackReportView />}
        {activeView === 'my_reports' && <MyReportsView />}
        {activeView === 'authority_portal' && <AuthorityPortalView />}
        {activeView === 'admin_dashboard' && <AdminDashboardView />}
        {(activeView === 'safety_center' || activeView === 'faq' || activeView === 'terms') && (
          <SafetyCenterView />
        )}
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
