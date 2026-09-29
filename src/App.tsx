import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { OverviewShowcase } from './components/OverviewShowcase';
import { AuditServiceView } from './components/AuditServiceView';
import { DashboardView } from './components/DashboardView';
import { WorkspaceModal } from './components/WorkspaceModal';
import { FeaturesBento } from './components/FeaturesBento';
import { SecretEncryptionPanel } from './components/SecretEncryptionPanel';
import { TeamAnalytics } from './components/TeamAnalytics';
import { NotificationsDrawer } from './components/NotificationsDrawer';
import { GitHubImportModal } from './components/GitHubImportModal';
import { Footer } from './components/Footer';
import { ErrorBoundary } from './components/ErrorBoundary';
import {
  getInitialScan,
  saveActiveScan,
  getNotifications,
  saveNotifications,
  getStoredGitHubUser,
  saveStoredGitHubUser,
  saveStoredGitHubToken,
  getStoredTheme,
  saveStoredTheme,
  getStoredOrg,
  saveStoredOrg,
  getStoredLang,
  saveStoredLang,
  clearAllSessionData
} from './services/offlineStorage';
import { runRealSecurityScan } from './services/apiService';
import { ScanResult, SecurityNotification, GitHubUser, Organization } from './types';
import { Shield, Activity, CheckCircle2, RotateCw } from 'lucide-react';

function parseCurrentRoute() {
  if (typeof window === 'undefined') return { view: 'landing' as const, scanId: null };
  const path = window.location.pathname;
  if (path.startsWith('/scans/')) {
    const scanId = path.replace(/^\/scans\/?/, '').split('/')[0];
    return { view: 'dashboard' as const, scanId: scanId || null };
  }
  if (path === '/audit' || path === '/scanner') return { view: 'audit' as const, scanId: null };
  if (path === '/dashboard') return { view: 'dashboard' as const, scanId: null };
  if (path === '/features') return { view: 'features' as const, scanId: null };
  return { view: 'landing' as const, scanId: null };
}

export default function App() {
  const [activeScan, setActiveScan] = useState<ScanResult>(getInitialScan);
  const [notifications, setNotifications] = useState<SecurityNotification[]>(getNotifications);
  const [currentUser, setCurrentUser] = useState<GitHubUser | null>(getStoredGitHubUser);
  const [activeOrg, setActiveOrg] = useState<Organization | null>(getStoredOrg);
  
  const [currentView, setCurrentView] = useState<'landing' | 'audit' | 'dashboard' | 'features'>(() => {
    return parseCurrentRoute().view;
  });
  const [lang, setLang] = useState<'ar' | 'en'>(getStoredLang);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => getStoredTheme() === 'dark');
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [githubModalOpen, setGithubModalOpen] = useState(false);
  const [workspacesOpen, setWorkspacesOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isReAuditing, setIsReAuditing] = useState(false);

  const handleReAuditCurrentRepo = async () => {
    if (!activeScan?.repository || isReAuditing) return;
    setIsReAuditing(true);
    triggerToast(
      lang === 'ar'
        ? `جارٍ إعادة فحص ${activeScan.repository} وسحب أحدث Commit...`
        : `Re-auditing ${activeScan.repository} on latest commit...`
    );

    try {
      const scanResult = await runRealSecurityScan(activeScan.repository, activeScan.branch || 'main');
      handleScanComplete(scanResult);
      triggerToast(
        lang === 'ar'
          ? `اكتملت إعادة الفحص بنجاح! النتيجة الحالية: ${scanResult.score?.score ?? 100}/100`
          : `Re-audit complete! Current score: ${scanResult.score?.score ?? 100}/100`
      );
    } catch (err: any) {
      triggerToast(lang === 'ar' ? `فشلت إعادة الفحص: ${err.message}` : `Re-audit failed: ${err.message}`);
    } finally {
      setIsReAuditing(false);
    }
  };

  const handleOrgChange = (org: Organization) => {
    setActiveOrg(org);
    saveStoredOrg(org);
    triggerToast(
      lang === 'ar'
        ? `تم التبديل إلى مساحة عمل: ${org.name}`
        : `Switched to workspace: ${org.name}`
    );
  };

  const handleUserChange = (user: GitHubUser | null) => {
    setCurrentUser(user);
    saveStoredGitHubUser(user);
    if (user?.token) {
      saveStoredGitHubToken(user.token);
    } else if (!user) {
      saveStoredGitHubToken(null);
    }
    triggerToast(
      user
        ? (lang === 'ar' ? `مرحباً بك ${user.name || user.login} - تم ربط حساب GitHub وتفعيل التوكن بنجاح` : `Connected as ${user.login} · Token active`)
        : (lang === 'ar' ? 'تم تسجيل الخروج من GitHub' : 'Disconnected from GitHub')
    );
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    clearAllSessionData();
    triggerToast(lang === 'ar' ? 'تم تسجيل الخروج بنجاح ومسح الجلسة النشطة' : 'Signed out successfully. Session data cleared.');
    setCurrentView('landing');
  };

  const handleImportAndScanRepo = async (repoFullName: string, branch: string) => {
    triggerToast(lang === 'ar' ? `جارٍ سحب وفحص ${repoFullName} عبر Gemini...` : `Deep scanning ${repoFullName}...`);
    try {
      const scanResult = await runRealSecurityScan(repoFullName, branch || 'main');
      handleScanComplete(scanResult);
    } catch (err: any) {
      triggerToast(lang === 'ar' ? `خطأ أثناء الفحص: ${err.message}` : `Audit failed: ${err.message}`);
    }
  };

  // Sync scan updates
  const handleUpdateScan = (updated: ScanResult) => {
    setActiveScan(updated);
    saveActiveScan(updated);
  };

  // Sync notifications
  const handleMarkAllNotificationsAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    saveNotifications(updated);
  };



  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Online/Offline listener
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      triggerToast(lang === 'ar' ? 'تمت استعادة الاتصال بالإنترنت' : 'Back online');
    };
    const handleOffline = () => {
      setIsOnline(false);
      triggerToast(lang === 'ar' ? 'تم الانتقال إلى وضع عدم الاتصال (Offline)' : 'Switched to offline mode');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [lang]);

  // Sync document direction and dark mode class
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.className = 'bg-[#0a0a0d] text-neutral-100 antialiased selection:bg-neutral-800 selection:text-white min-h-screen';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.className = 'bg-[#fafafa] text-neutral-900 antialiased selection:bg-neutral-950 selection:text-white min-h-screen';
    }
  }, [lang, isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      saveStoredTheme(next ? 'dark' : 'light');
      return next;
    });
  };

  const toggleLang = () => {
    setLang(prev => {
      const next = prev === 'ar' ? 'en' : 'ar';
      saveStoredLang(next);
      return next;
    });
  };

  // Handle route and view navigation with history synchronization
  const handleNavigate = (view: 'landing' | 'audit' | 'dashboard' | 'features', targetScanId?: string) => {
    setCurrentView(view);
    const sid = targetScanId || activeScan?.id;
    if (view === 'landing') {
      window.history.pushState(null, '', '/');
    } else if (view === 'audit') {
      window.history.pushState(null, '', '/audit');
    } else if (view === 'dashboard') {
      window.history.pushState(null, '', sid ? `/scans/${sid}` : '/dashboard');
    } else if (view === 'features') {
      window.history.pushState(null, '', '/features');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Sync route on mount and on browser back/forward
  useEffect(() => {
    const syncRouteFromLocation = async () => {
      const { view, scanId } = parseCurrentRoute();
      setCurrentView(view);
      if (scanId) {
        try {
          const res = await fetch(`/api/scans/${encodeURIComponent(scanId)}`);
          if (res.ok) {
            const data = await res.json();
            const fetched = data.scan || data;
            if (fetched && (fetched.findings || fetched.id)) {
              setActiveScan(fetched);
              saveActiveScan(fetched);
            }
          }
        } catch (e) {
          console.warn('Could not load scan from URL:', e);
        }
      }
    };

    syncRouteFromLocation();

    const handlePopState = () => {
      syncRouteFromLocation();
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleScanComplete = (newScan: ScanResult) => {
    handleUpdateScan(newScan);
    // Add real-time notification
    const criticals = newScan.score?.criticalCount ?? 0;
    const newNotif: SecurityNotification = {
      id: `notif-${Date.now()}`,
      title: `Audit Completed: ${newScan.repository}`,
      titleAr: `اكتمل الفحص بنجاح: ${newScan.repository}`,
      message: `Identified ${newScan.findings?.length ?? 0} findings. Score: ${newScan.score?.score ?? 100}/100 (${newScan.score?.grade ?? 'A'}).`,
      messageAr: `تم رصد ${newScan.findings?.length ?? 0} ثغرات أمنية. التقييم النهائي: ${newScan.score?.score ?? 100}/100.`,
      timestamp: 'الآن',
      severity: criticals > 0 ? 'critical' : 'medium',
      read: false,
      repo: newScan.repository,
      targetScanId: newScan.id
    };
    const updatedNotifs = [newNotif, ...notifications];
    setNotifications(updatedNotifs);
    saveNotifications(updatedNotifs);

    triggerToast(lang === 'ar' ? 'اكتمل الفحص وتم تجهيز لوحة التحكم والوثائق الثلاثية!' : 'Audit complete! Dashboard & Artifact Trinity ready.');
    setCurrentView('dashboard');
    window.history.pushState({ scanId: newScan.id }, '', `/scans/${newScan.id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className={`min-h-screen flex flex-col font-sans bg-[#fafafa] dark:bg-[#0a0a0d] text-neutral-900 dark:text-neutral-100 transition-colors duration-200 ${isDarkMode ? 'dark' : ''}`}>
      {/* Toast banner */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 text-xs font-medium rounded-lg shadow-lg border border-neutral-800 dark:border-neutral-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Global Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenNotifications={() => setNotificationsOpen(true)}
        onOpenGitHubModal={() => setGithubModalOpen(true)}
        onOpenWorkspaces={() => setWorkspacesOpen(true)}
        onSignOut={handleSignOut}
        activeOrg={activeOrg}
        currentUser={currentUser}
        unreadCount={unreadCount}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        lang={lang}
        onToggleLang={toggleLang}
        isOnline={isOnline}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentView === 'landing' && (
          <div className="space-y-24">
            {/* 1. Hero Section */}
            <HeroSection
              onStartFreeAudit={() => handleNavigate('audit')}
              lang={lang}
            />

            {/* 2. Comprehensive Overview Showcase, Architecture & Interactive Simulator */}
            <OverviewShowcase
              onLaunchAudit={() => handleNavigate('audit')}
              lang={lang}
            />

            {/* 3. Core Capabilities Bento Grid */}
            <section>
              <FeaturesBento lang={lang} />
            </section>

            {/* 4. Secret Redaction & Token Masking Tool */}
            <section className="space-y-4">
              <div className="text-center max-w-xl mx-auto space-y-1 mb-6">
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                  {lang === 'ar' ? 'تجربة حية لمحرك طمس الأسرار' : 'Interactive Secret Redaction Tool'}
                </h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  {lang === 'ar'
                    ? 'يمكنك تجربة كتابة أو لصق كود يحتوي على مفاتيح API لمعاينة كيفية طمسها آلياً'
                    : 'Paste code with API tokens or DB passwords to see live pattern-based masking'}
                </p>
              </div>
              <SecretEncryptionPanel lang={lang} />
            </section>

            {/* 5. Team Velocity & Compliance Metrics */}
            <section className="space-y-4">
              <div className="text-center max-w-xl mx-auto space-y-1 mb-6">
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                  {lang === 'ar' ? 'مؤشرات الأمان وتقارير المستودع الحقيقية' : 'Repository Security Telemetry & Audit Posture'}
                </h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  {lang === 'ar'
                    ? 'بيانات حقيقية مستخرجة مباشرة من نتائج فحص المستودع وحالة التوافق مع المعايير الدولية'
                    : 'Live posture telemetry computed directly from active repository AST findings'}
                </p>
              </div>
              <TeamAnalytics
                findings={activeScan.findings}
                repository={activeScan.repository}
                lang={lang}
              />
            </section>
          </div>
        )}

        {currentView === 'audit' && (
          <AuditServiceView
            onScanComplete={handleScanComplete}
            onNavigateHome={() => handleNavigate('landing')}
            lang={lang}
          />
        )}

        {currentView === 'dashboard' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <span>{lang === 'ar' ? 'لوحة التحكم والتدقيق الأمني' : 'Security Audit Dashboard'}</span>
                  <span className="text-[10px] font-mono bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 px-2 py-0.5 rounded">
                    LIVE
                  </span>
                </h2>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                  {lang === 'ar'
                    ? 'فحص شامل لتدفق البيانات والأسرار واقتراح حلول برمجية فورية بطلبات سحب منعزلة'
                    : 'Continuous dataflow audit, secret redactor, and surgical auto-fix PR manager'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleReAuditCurrentRepo}
                  disabled={isReAuditing}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-neutral-950 hover:bg-neutral-850 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
                  title={lang === 'ar' ? 'إعادة فحص المستودع الحالي' : 'Re-audit current repository'}
                >
                  <RotateCw className={`w-3.5 h-3.5 ${isReAuditing ? 'animate-spin' : ''}`} />
                  <span>
                    {isReAuditing
                      ? (lang === 'ar' ? 'جارٍ إعادة الفحص...' : 'Re-Auditing...')
                      : (lang === 'ar' ? 'إعادة فحص المستودع' : 'Re-Audit Repo')}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleNavigate('audit')}
                  className="px-3.5 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 rounded-lg transition-colors cursor-pointer shadow-2xs"
                >
                  {lang === 'ar' ? 'فحص مستودع آخر' : 'Audit New Repo'}
                </button>
              </div>
            </div>

            <ErrorBoundary fallbackTitle={lang === 'ar' ? 'حدث خطأ أثناء عرض لوحة التحكم' : 'Error rendering dashboard view'}>
              <DashboardView
                scan={activeScan}
                onUpdateScan={handleUpdateScan}
                onReAudit={handleReAuditCurrentRepo}
                isReAuditing={isReAuditing}
                lang={lang}
              />
            </ErrorBoundary>
          </div>
        )}

        {currentView === 'features' && (
          <div className="space-y-12 py-6">
            <FeaturesBento lang={lang} />
            <SecretEncryptionPanel lang={lang} />
          </div>
        )}


      </main>

      {/* Workspace & Multi-Tenant Organization Modal */}
      <WorkspaceModal
        isOpen={workspacesOpen}
        onClose={() => setWorkspacesOpen(false)}
        currentOrg={activeOrg}
        onSelectOrg={handleOrgChange}
        lang={lang}
      />

      {/* Slide-over Notifications Drawer */}
      {notificationsOpen && (
        <NotificationsDrawer
          notifications={notifications}
          onClose={() => setNotificationsOpen(false)}
          onMarkAllAsRead={handleMarkAllNotificationsAsRead}
          onSelectNotification={(notif) => {
            setNotificationsOpen(false);
            setCurrentView('dashboard');
          }}
          lang={lang}
        />
      )}



      {/* GitHub Repositories Import Modal */}
      {githubModalOpen && (
        <GitHubImportModal
          onClose={() => setGithubModalOpen(false)}
          onSelectRepo={(fullName, branch) => {
            setGithubModalOpen(false);
            handleImportAndScanRepo(fullName, branch);
          }}
          currentUser={currentUser}
          onUserChange={handleUserChange}
          lang={lang}
        />
      )}

      {/* Quiet Footer */}
      <Footer
        onNavigate={setCurrentView}
        lang={lang}
      />
    </div>
  );
}
