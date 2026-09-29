import React, { useState, useEffect, useRef } from 'react';
import { GitHubUser, Organization } from '../types';
import { GitArmorLogo } from './GitArmorLogo';
import {
  Shield,
  Bell,
  Moon,
  Sun,
  Globe,
  Github,
  Building2,
  ChevronDown,
  Menu,
  X,
  LogOut,
  FolderGit2,
  Sliders,
} from 'lucide-react';

interface NavbarProps {
  currentView: 'landing' | 'audit' | 'dashboard' | 'features';
  onNavigate: (view: 'landing' | 'audit' | 'dashboard' | 'features') => void;
  onOpenNotifications: () => void;
  onOpenGitHubModal?: () => void;
  onOpenWorkspaces?: () => void;
  onSignOut?: () => void;
  activeOrg?: Organization | null;
  currentUser?: GitHubUser | null;
  unreadCount: number;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  lang: 'ar' | 'en';
  onToggleLang: () => void;
  isOnline: boolean;
}

export function Navbar({
  currentView,
  onNavigate,
  onOpenNotifications,
  onOpenGitHubModal,
  onOpenWorkspaces,
  onSignOut,
  activeOrg,
  currentUser,
  unreadCount,
  isDarkMode,
  onToggleTheme,
  lang,
  onToggleLang,
  isOnline,
}: NavbarProps) {
  const isAr = lang === 'ar';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuOpen]);

  const navItems = [
    { id: 'landing', labelEn: 'Overview', labelAr: 'نظرة عامة' },
    { id: 'audit', labelEn: 'Audit Service', labelAr: 'خدمة الفحص' },
    { id: 'dashboard', labelEn: 'Dashboard', labelAr: 'لوحة الأمان' },
    { id: 'features', labelEn: 'Features', labelAr: 'المميزات' },
  ] as const;

  const navigateTo = (view: 'landing' | 'audit' | 'dashboard' | 'features') => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/85 dark:bg-[#0a0a0d]/85 backdrop-blur-md border-b border-neutral-200/80 dark:border-neutral-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        {/* Left Zone: Minimalist Brand + Partitioned Workspace */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('landing');
            }}
            className="flex items-center gap-2 tracking-tight hover:opacity-90 transition-opacity whitespace-nowrap group"
          >
            <GitArmorLogo size="sm" showWordmark={true} lang={lang} />
          </a>

          {/* Minimalist divider */}
          <span className="hidden sm:inline text-neutral-300 dark:text-neutral-700 font-light select-none text-xs">/</span>

          {/* Minimalist Multi-Tenant Workspace Selector */}
          {onOpenWorkspaces && (
            <button
              onClick={onOpenWorkspaces}
              className="hidden sm:inline-flex items-center gap-1.5 px-2 py-1 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/80 rounded-md transition-colors cursor-pointer max-w-[170px]"
              title={isAr ? 'إدارة مساحات العمل والمؤسسات' : 'Switch Workspace / Organization'}
            >
              <Building2 className="w-3 h-3 text-neutral-400 shrink-0" />
              <span className="truncate font-medium text-[12px]">
                {activeOrg ? activeOrg.name : (isAr ? 'مساحة العمل' : 'Workspace')}
              </span>
              {activeOrg?.tier && (
                <span className="text-[9px] uppercase font-mono px-1 py-0.2 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 border border-neutral-200/60 dark:border-neutral-700/60 font-semibold">
                  {activeOrg.tier}
                </span>
              )}
              <ChevronDown className="w-3 h-3 text-neutral-400 shrink-0" />
            </button>
          )}
        </div>

        {/* Center Zone: Pure Typographic Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 text-[13px] font-medium">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`px-2.5 py-1 rounded-md text-[13px] transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'text-neutral-950 dark:text-white font-medium bg-neutral-100 dark:bg-neutral-800/90'
                    : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-900/60 font-normal'
                }`}
              >
                {isAr ? item.labelAr : item.labelEn}
              </button>
            );
          })}
        </nav>

        {/* Right Zone: Minimalist Utilities & Clean Profile */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Subtle Online Heartbeat Indicator */}
          <div
            className="hidden xl:flex items-center gap-1.5 px-2 py-1 text-[11px] font-mono select-none"
            title={
              isOnline
                ? isAr
                  ? 'المحرك متصل بالإنترنت وقواعد الفحص محدثة'
                  : 'Engine online · Heuristics updated'
                : isAr
                ? 'وضع العمل دون اتصال نشط'
                : 'Offline mode active'
            }
          >
            <span className="relative flex h-2 w-2">
              {isOnline && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isOnline ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              ></span>
            </span>
            <span className="text-neutral-500 dark:text-neutral-400 text-[11px] font-sans">
              {isOnline ? (isAr ? 'متصل' : 'Online') : (isAr ? 'أوفلاين' : 'Offline')}
            </span>
          </div>

          <div className="hidden xl:block h-3.5 w-px bg-neutral-200 dark:bg-neutral-800 mx-0.5" />

          {/* Unified Tool Cluster (Lang, Theme, Notifications) */}
          <div className="flex items-center gap-0.5">
            {/* Language Toggle */}
            <button
              onClick={onToggleLang}
              className="h-8 px-2 rounded-md text-[11px] font-semibold text-neutral-600 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer flex items-center gap-1"
              title={isAr ? 'Switch to English' : 'التحويل للعربية'}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{isAr ? 'EN' : 'عربي'}</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={onToggleTheme}
              className="w-8 h-8 rounded-md flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              title={isDarkMode ? (isAr ? 'الوضع النهاري' : 'Light Mode') : (isAr ? 'الوضع الليلي' : 'Dark Mode')}
            >
              {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
            </button>

            {/* Notifications */}
            <button
              onClick={onOpenNotifications}
              className="relative w-8 h-8 rounded-md flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              title={isAr ? 'التنبيهات' : 'Notifications'}
            >
              <Bell className="w-3.5 h-3.5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-rose-500" />
              )}
            </button>
          </div>

          <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-800 mx-1 hidden sm:block" />

          {/* Logged-In User Profile Pill with Clean Dropdown */}
          {currentUser ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(prev => !prev)}
                className="flex items-center gap-2 py-1 px-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 transition-colors cursor-pointer text-xs"
                title={currentUser.login}
                aria-expanded={userMenuOpen}
              >
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.login}
                  className="w-5 h-5 rounded-full object-cover"
                />
                <span className="font-mono text-xs text-neutral-800 dark:text-neutral-200 truncate max-w-[95px] whitespace-nowrap hidden sm:inline font-medium">
                  {currentUser.login}
                </span>
                <ChevronDown className="w-3 h-3 text-neutral-400 shrink-0" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-1.5 w-52 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-lg py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-2 border-b border-neutral-100 dark:border-neutral-800">
                    <p className="text-[10px] uppercase font-mono text-neutral-400">{isAr ? 'الحساب المتصل' : 'Signed in as'}</p>
                    <p className="text-xs font-semibold text-neutral-900 dark:text-white font-mono truncate">@{currentUser.login}</p>
                  </div>

                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      if (onOpenGitHubModal) onOpenGitHubModal();
                    }}
                    className="w-full text-start px-3 py-2 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <FolderGit2 className="w-3.5 h-3.5 text-neutral-500" />
                    <span>{isAr ? 'إدارة المستودعات والتكامل' : 'Manage Repositories'}</span>
                  </button>

                  {onOpenWorkspaces && (
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        onOpenWorkspaces();
                      }}
                      className="w-full text-start px-3 py-2 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <Building2 className="w-3.5 h-3.5 text-neutral-500" />
                      <span>{isAr ? 'تبديل مساحة العمل' : 'Switch Workspace'}</span>
                    </button>
                  )}

                  {onSignOut && (
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        onSignOut();
                      }}
                      className="w-full text-start px-3 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors flex items-center gap-2 border-t border-neutral-100 dark:border-neutral-800 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{isAr ? 'تسجيل الخروج' : 'Sign Out'}</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Guest / Non-logged in Actions */
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenGitHubModal}
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors cursor-pointer whitespace-nowrap"
                title={isAr ? 'تسجيل الدخول عبر GitHub' : 'Sign in with GitHub'}
              >
                <Github className="w-3.5 h-3.5" />
                <span>{isAr ? 'تسجيل الدخول' : 'Sign In'}</span>
              </button>

              <button
                onClick={() => onNavigate('audit')}
                className="hidden sm:inline-flex px-3 py-1 text-xs font-semibold text-white bg-neutral-950 hover:bg-neutral-850 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 rounded-md transition-colors whitespace-nowrap cursor-pointer shadow-2xs"
              >
                {isAr ? 'بدء الفحص' : 'Launch Audit'}
              </button>
            </div>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(prev => !prev)}
            className="lg:hidden p-1.5 text-neutral-600 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Responsive Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-[#0a0a0d]/95 backdrop-blur-xl animate-in slide-in-from-top-1 duration-150 shadow-xl">
          <div className="max-w-7xl mx-auto px-4 py-3 space-y-3">
            {/* Active Workspace Switcher for Mobile */}
            {onOpenWorkspaces && (
              <div className="pb-2 border-b border-neutral-100 dark:border-neutral-800/80">
                <span className="text-[10px] text-neutral-400 block mb-1 font-mono uppercase">
                  {isAr ? 'مساحة العمل:' : 'Workspace:'}
                </span>
                <button
                  onClick={() => {
                    onOpenWorkspaces();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-neutral-500" />
                    <span className="font-semibold text-neutral-900 dark:text-white text-xs">
                      {activeOrg ? activeOrg.name : 'Workspace'}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 font-bold">
                    {activeOrg ? activeOrg.tier : 'team'}
                  </span>
                </button>
              </div>
            )}

            {/* Navigation links */}
            <div className="space-y-0.5 text-xs font-medium">
              {navItems.map((item) => {
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      navigateTo(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-start py-2 px-2.5 rounded-lg flex items-center justify-between transition-colors ${
                      isActive
                        ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-950 dark:text-white font-semibold'
                        : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900'
                    }`}
                  >
                    <span>{isAr ? item.labelAr : item.labelEn}</span>
                  </button>
                );
              })}
            </div>

            {/* Mobile Actions: GitHub connect & Profile */}
            <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex flex-col gap-2">
              {currentUser ? (
                <div className="flex items-center justify-between p-2 rounded-lg bg-neutral-50 dark:bg-neutral-900 text-xs">
                  <div className="flex items-center gap-2">
                    <img src={currentUser.avatarUrl} alt="" className="w-5 h-5 rounded-full" />
                    <span className="font-mono text-xs">{currentUser.login}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (onOpenGitHubModal) onOpenGitHubModal();
                        setMobileMenuOpen(false);
                      }}
                      className="text-[11px] text-neutral-500 hover:text-neutral-900 dark:hover:text-white underline cursor-pointer"
                    >
                      {isAr ? 'إدارة' : 'Manage'}
                    </button>
                    {onSignOut && (
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          onSignOut();
                        }}
                        className="text-[11px] text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1 cursor-pointer"
                      >
                        <LogOut className="w-3 h-3" />
                        <span>{isAr ? 'خروج' : 'Sign Out'}</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    if (onOpenGitHubModal) onOpenGitHubModal();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700 flex items-center justify-center gap-2"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>{isAr ? 'تسجيل الدخول عبر GitHub' : 'Connect GitHub Account'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
