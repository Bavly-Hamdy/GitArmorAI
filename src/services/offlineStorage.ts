import { ScanResult, Vulnerability, IntegrationConfig, SecurityNotification } from '../types';
import { INITIAL_VULNERABILITIES, INITIAL_NOTIFICATIONS, INITIAL_INTEGRATIONS } from '../data/mockData';
import { calculateSecurityScore, generateArtifactTrinity } from './securityEngine';

const STORAGE_KEYS = {
  ACTIVE_SCAN: 'gitarmor_active_scan',
  SCANS_HISTORY: 'gitarmor_scans_history',
  NOTIFICATIONS: 'gitarmor_notifications',
  INTEGRATIONS: 'gitarmor_integrations',
  THEME: 'gitarmor_theme',
  LANG: 'gitarmor_lang',
  OFFLINE_MODE: 'gitarmor_offline_mode',
  ENCRYPTION_SETTINGS: 'gitarmor_encryption_settings',
  GITHUB_USER: 'gitarmor_user',
  GITHUB_TOKEN: 'gitarmor_github_token',
  ACTIVE_ORG: 'gitarmor_active_org'
};

export function clearAllSessionData(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.GITHUB_USER);
    localStorage.removeItem(STORAGE_KEYS.GITHUB_TOKEN);
    // Legacy support cleanup
    localStorage.removeItem('gitarmor_github_user');
  } catch (err) {
    console.error('Failed to clear session data:', err);
  }
}

export function getInitialScan(): ScanResult {
  const stored = localStorage.getItem(STORAGE_KEYS.ACTIVE_SCAN);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // fallback
    }
  }

  const findings = [...INITIAL_VULNERABILITIES];
  const score = calculateSecurityScore(findings);
  const artifacts = generateArtifactTrinity('fintech-secure/core-api', 'main', 'c8f49a21b3d7', score, findings);

  const initialScan: ScanResult = {
    id: 'scan-muk80-prod',
    repository: 'fintech-secure/core-api',
    branch: 'main',
    commitSha: 'c8f49a21b3d7',
    timestamp: new Date().toLocaleString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    status: 'completed',
    progress: 100,
    currentStep: 'Audit Completed · Artifacts Compiled',
    currentStepAr: 'اكتمل الفحص بنجاح · تم توليد الوثائق الثلاثية',
    score,
    findings,
    artifacts
  };

  localStorage.setItem(STORAGE_KEYS.ACTIVE_SCAN, JSON.stringify(initialScan));
  return initialScan;
}

export function saveActiveScan(scan: ScanResult): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_SCAN, JSON.stringify(scan));
    const history = getScansHistory();
    const existingIdx = history.findIndex(s => s.id === scan.id);
    if (existingIdx >= 0) {
      history[existingIdx] = scan;
    } else {
      history.unshift(scan);
    }
    localStorage.setItem(STORAGE_KEYS.SCANS_HISTORY, JSON.stringify(history.slice(0, 10)));
  } catch (err) {
    console.error('Failed to persist scan locally:', err);
  }
}

export function getScansHistory(): ScanResult[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SCANS_HISTORY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return [];
}

export function getNotifications(): SecurityNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return INITIAL_NOTIFICATIONS;
}

export function saveNotifications(notifications: SecurityNotification[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  } catch {
    // ignore
  }
}

export function getStoredIntegrations(): IntegrationConfig[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INTEGRATIONS);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return INITIAL_INTEGRATIONS;
}

export function saveStoredIntegrations(integrations: IntegrationConfig[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.INTEGRATIONS, JSON.stringify(integrations));
  } catch {
    // ignore
  }
}

export function getStoredTheme(): 'light' | 'dark' {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.THEME);
    if (raw === 'dark' || raw === 'light') return raw;
  } catch {
    // fallback
  }
  return 'light';
}

export function saveStoredTheme(theme: 'light' | 'dark'): void {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  } catch {
    // ignore
  }
}

export function getStoredLang(): 'ar' | 'en' {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LANG);
    if (raw === 'ar' || raw === 'en') return raw;
  } catch {
    // fallback
  }
  return 'en';
}

export function saveStoredLang(lang: 'ar' | 'en'): void {
  try {
    localStorage.setItem(STORAGE_KEYS.LANG, lang);
  } catch {
    // ignore
  }
}

export function getStoredGitHubToken(): string | null {
  try {
    const directToken = localStorage.getItem(STORAGE_KEYS.GITHUB_TOKEN);
    if (directToken && directToken.trim()) return directToken.trim();
    const user = getStoredGitHubUser();
    if (user?.token && typeof user.token === 'string') return user.token.trim();
  } catch {
    // fallback
  }
  return null;
}

export function saveStoredGitHubToken(token: string | null): void {
  try {
    if (token && token.trim()) {
      localStorage.setItem(STORAGE_KEYS.GITHUB_TOKEN, token.trim());
      const user = getStoredGitHubUser();
      if (user && user.token !== token.trim()) {
        user.token = token.trim();
        localStorage.setItem(STORAGE_KEYS.GITHUB_USER, JSON.stringify(user));
      }
    } else {
      localStorage.removeItem(STORAGE_KEYS.GITHUB_TOKEN);
      const user = getStoredGitHubUser();
      if (user && user.token) {
        delete user.token;
        localStorage.setItem(STORAGE_KEYS.GITHUB_USER, JSON.stringify(user));
      }
    }
  } catch {
    // ignore
  }
}

export function getStoredGitHubUser(): any | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GITHUB_USER) || localStorage.getItem('gitarmor_github_user');
    if (raw) {
      const parsed = JSON.parse(raw);
      // Automatically purge legacy mock user
      if (parsed?.login === 'hamdy-morgan') {
        localStorage.removeItem(STORAGE_KEYS.GITHUB_USER);
        localStorage.removeItem('gitarmor_github_user');
        localStorage.removeItem(STORAGE_KEYS.GITHUB_TOKEN);
        return null;
      }
      // Attach stored token if not in user object
      if (!parsed.token) {
        const storedToken = localStorage.getItem(STORAGE_KEYS.GITHUB_TOKEN);
        if (storedToken && storedToken.trim()) {
          parsed.token = storedToken.trim();
        }
      }
      return parsed;
    }
  } catch {
    // fallback
  }
  return null;
}

export function saveStoredGitHubUser(user: any | null): void {
  try {
    if (user && user.login !== 'hamdy-morgan') {
      localStorage.setItem(STORAGE_KEYS.GITHUB_USER, JSON.stringify(user));
      if (user.token && typeof user.token === 'string' && user.token.trim()) {
        localStorage.setItem(STORAGE_KEYS.GITHUB_TOKEN, user.token.trim());
      }
    } else {
      localStorage.removeItem(STORAGE_KEYS.GITHUB_USER);
      localStorage.removeItem('gitarmor_github_user');
      localStorage.removeItem(STORAGE_KEYS.GITHUB_TOKEN);
    }
  } catch {
    // ignore
  }
}

export function getStoredOrg(): any | null {
  try {
    const raw = localStorage.getItem('gitarmor_active_org');
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return {
    id: 'org-fintech-secure',
    name: 'Fintech Secure Corp',
    slug: 'fintech-secure',
    tier: 'team',
    owner: 'Bavly-Hamdy',
    createdAt: '2026-01-15T09:00:00Z',
    scansLimit: 500,
    scansUsed: 128,
    aiTokensLimit: 5000000,
    aiTokensUsed: 1842900,
    aiSpendUSD: 1.47,
    linkedRepos: [
      'Bavly-Hamdy/Clinic_OS',
      'Bavly-Hamdy/BIS-Smart-Grader-V2',
      'Bavly-Hamdy/BOSSLA-CAREER-PRO',
      'Bavly-Hamdy/focusos',
      'Bavly-Hamdy/gitarmor-ai',
    ],
    members: [
      {
        id: 'mem-1',
        name: 'Bavly Hamdy',
        email: 'bavly.hamdy@gitarmor.dev',
        role: 'owner',
        avatar: 'https://avatars.githubusercontent.com/u/100946403?v=4',
        lastActive: 'الآن',
        assignedTasks: 4,
      },
    ],
  };
}

export function saveStoredOrg(org: any): void {
  try {
    localStorage.setItem('gitarmor_active_org', JSON.stringify(org));
  } catch {
    // ignore
  }
}

