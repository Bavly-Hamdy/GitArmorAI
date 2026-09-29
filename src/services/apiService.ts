import {
  ScanResult,
  Vulnerability,
  GitHubUser,
  UserRepoItem,
  Organization,
  PlatformAuditLog,
  AdminMetrics,
  DualEngineStatus,
  TeamMember,
} from '../types';
import { getStoredGitHubToken } from './offlineStorage';

export interface GitHubRepoSummary {
  fullName: string;
  description: string;
  stars: number;
  language: string;
  defaultBranch: string;
  updatedAt: string;
}

export interface RepoDetails {
  repo: string;
  description: string;
  defaultBranch: string;
  stars: number;
  forks: number;
  openIssues: number;
  totalFiles: number;
  candidateCodeFiles: string[];
  truncated: boolean;
}

export async function fetchGitHubUser(tokenOrUsername?: string): Promise<GitHubUser> {
  const val = (tokenOrUsername || '').trim();
  const isToken = val.startsWith('ghp_') || val.startsWith('github_pat_') || val.startsWith('gho_');

  // Direct live fetch from GitHub API for instantaneous response & complete data
  if (val && !isToken) {
    try {
      const directRes = await fetch(`https://api.github.com/users/${encodeURIComponent(val)}`, {
        headers: { 'Accept': 'application/vnd.github.v3+json' },
      });
      if (directRes.ok) {
        const d = await directRes.json();
        return {
          login: d.login,
          id: d.id,
          avatarUrl: d.avatar_url,
          name: d.name || d.login,
          bio: d.bio || '',
          publicRepos: d.public_repos,
          totalPrivateRepos: 0,
          followers: d.followers || 0,
        };
      }
    } catch (err) {
      console.warn('Direct GitHub user fetch failed, trying local proxy:', err);
    }
  } else if (isToken) {
    try {
      const directRes = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${val}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });
      if (directRes.ok) {
        const d = await directRes.json();
        return {
          login: d.login,
          id: d.id,
          avatarUrl: d.avatar_url,
          name: d.name || d.login,
          bio: d.bio || '',
          publicRepos: d.public_repos,
          totalPrivateRepos: d.total_private_repos || 0,
          followers: d.followers || 0,
          token: val,
        };
      }
    } catch (err) {
      console.warn('Direct GitHub user token fetch failed, trying local proxy:', err);
    }
  }

  // Fallback to local server proxy
  const headers: Record<string, string> = {};
  let url = '/api/github/user';
  if (val) {
    if (isToken) {
      headers['Authorization'] = `Bearer ${val}`;
    } else {
      url += `?username=${encodeURIComponent(val)}`;
    }
  }
  const res = await fetch(url, { headers });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to fetch GitHub profile');
  }
  const data = await res.json();
  return data.user;
}

export async function fetchUserRepositories(token?: string, username?: string): Promise<UserRepoItem[]> {
  const cleanUser = (username || '').trim();
  const cleanToken = (token || '').trim();

  // 1. Direct fetch from GitHub API for authenticated user with token
  if (cleanToken) {
    try {
      const directRes = await fetch('https://api.github.com/user/repos?sort=updated&per_page=100&affiliation=owner,collaborator,organization_member', {
        headers: {
          'Authorization': `Bearer ${cleanToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });
      if (directRes.ok) {
        const data = await directRes.json();
        return data.map((item: any) => ({
          id: item.id,
          name: item.name,
          fullName: item.full_name,
          private: Boolean(item.private),
          htmlUrl: item.html_url,
          description: item.description,
          defaultBranch: item.default_branch || 'main',
          stars: item.stargazers_count,
          forks: item.forks_count,
          language: item.language,
          updatedAt: item.updated_at,
        }));
      }
    } catch (err) {
      console.warn('Direct GitHub repos with token failed, using server fallback:', err);
    }
  }

  // 2. Direct fetch from GitHub API for public user repositories (up to 100)
  if (cleanUser) {
    try {
      const directRes = await fetch(`https://api.github.com/users/${encodeURIComponent(cleanUser)}/repos?sort=updated&per_page=100`, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
        },
      });
      if (directRes.ok) {
        const data = await directRes.json();
        return data.map((item: any) => ({
          id: item.id,
          name: item.name,
          fullName: item.full_name,
          private: Boolean(item.private),
          htmlUrl: item.html_url,
          description: item.description,
          defaultBranch: item.default_branch || 'main',
          stars: item.stargazers_count,
          forks: item.forks_count,
          language: item.language,
          updatedAt: item.updated_at,
        }));
      }
    } catch (err) {
      console.warn('Direct GitHub repos by username failed, using server fallback:', err);
    }
  }

  // 3. Fallback to local server proxy
  const headers: Record<string, string> = {};
  if (cleanToken) {
    headers['Authorization'] = `Bearer ${cleanToken}`;
  }
  const query = cleanUser ? `?username=${encodeURIComponent(cleanUser)}` : '';
  const res = await fetch(`/api/github/user-repos${query}`, { headers });
  if (!res.ok) {
    throw new Error('Failed to fetch user repositories');
  }
  const data = await res.json();
  return data.repos || [];
}

export async function searchGitHubRepos(query: string): Promise<GitHubRepoSummary[]> {
  try {
    if (!query || query.trim().length < 2) return [];
    const res = await fetch(`/api/github/search-repos?q=${encodeURIComponent(query.trim())}`);
    if (!res.ok) {
      return [];
    }
    const data = await res.json();
    return data.repos || [];
  } catch (err) {
    return [];
  }
}

export async function fetchGitHubRepoDetails(repo: string, branch?: string): Promise<RepoDetails | null> {
  try {
    const branchParam = branch ? `&branch=${encodeURIComponent(branch)}` : '';
    const res = await fetch(`/api/github/repo-details?repo=${encodeURIComponent(repo)}${branchParam}`);
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Failed to fetch repo details (${res.status})`);
    }
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch repo details:', err);
    throw err;
  }
}

export async function runRealSecurityScan(
  repo: string,
  branch: string = 'main',
  customFiles?: { path: string; content: string }[]
): Promise<ScanResult> {
  const token = getStoredGitHubToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch('/api/scan/analyze', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      repo,
      branch,
      customFiles,
      githubToken: token || undefined,
    }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Security audit failed with status ${res.status}`);
  }

  const data = await res.json();
  return data as ScanResult;
}

export async function queryCopilotAI(
  message: string,
  vulnContext?: Vulnerability,
  repoContext?: string,
  history?: { sender: 'copilot' | 'user'; text: string }[]
): Promise<string> {
  const res = await fetch('/api/copilot/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      vulnContext,
      repoContext,
      history,
    }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to reach AI Co-Pilot');
  }

  const data = await res.json();
  return data.text;
}

export async function testWebhook(webhookUrl: string): Promise<{ success: boolean; message: string; durationMs?: number }> {
  const res = await fetch('/api/webhook/test', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ webhookUrl }),
  });

  const data = await res.json();
  if (!res.ok && !data.error) {
    throw new Error(`Webhook test returned HTTP ${res.status}`);
  }

  return {
    success: data.success ?? res.ok,
    message: data.message || data.error || 'Tested webhook',
    durationMs: data.durationMs,
  };
}

export async function createRemediationPullRequest(
  vulnId: string,
  repo: string,
  branch: string,
  suggestedPatch: string,
  githubToken?: string,
  file?: string,
  commitMode: 'pr' | 'direct' = 'pr'
): Promise<{
  success: boolean;
  prUrl?: string;
  commitUrl?: string;
  commitSha?: string;
  branch: string;
  instructions: string[];
  isLiveGitHubPR?: boolean;
  isLiveGitHubCommit?: boolean;
  commitMode?: 'pr' | 'direct';
  commitMessage?: string;
  error?: string;
}> {
  const res = await fetch('/api/remediate/pr', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      vulnId,
      repo,
      branch,
      suggestedPatch,
      githubToken,
      file,
      commitMode,
    }),
  });

  const data = await res.json();
  if (!res.ok && data.error) {
    throw new Error(data.error);
  }
  return data;
}

// Dual-Engine Database Services
export async function fetchDualEngineStatus(): Promise<DualEngineStatus> {
  const res = await fetch('/api/db/status');
  if (!res.ok) {
    throw new Error('Failed to fetch dual-engine database status');
  }
  return await res.json();
}

export async function syncDualEngineDatabase(): Promise<{ success: boolean; lastSync: string; sizeBytes: number; recordCount: number }> {
  const res = await fetch('/api/db/sync', { method: 'POST' });
  if (!res.ok) {
    throw new Error('Failed to trigger database synchronization');
  }
  return await res.json();
}

// Multi-Tenant Workspace & Organization Management
export async function fetchOrganizations(): Promise<Organization[]> {
  try {
    const res = await fetch('/api/workspaces/orgs');
    if (!res.ok) throw new Error('Failed to fetch organizations');
    const data = await res.json();
    return data.organizations || [];
  } catch (err) {
    console.warn('Failed to load organizations from backend, using fallback:', err);
    return [];
  }
}

export async function createOrganization(name: string, tier: 'free' | 'pro' | 'team' = 'pro', owner: string = 'Bavly-Hamdy'): Promise<Organization> {
  const res = await fetch('/api/workspaces/orgs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, tier, owner }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to create organization');
  }
  const data = await res.json();
  return data.organization;
}

export async function inviteOrgMember(orgId: string, name: string, email: string, role: string): Promise<TeamMember> {
  const res = await fetch('/api/workspaces/invite', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orgId, name, email, role }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to invite team member');
  }
  const data = await res.json();
  return data.member;
}

export async function linkOrgRepo(orgId: string, repo: string): Promise<string[]> {
  const res = await fetch('/api/workspaces/link-repo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orgId, repo }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to link repository');
  }
  const data = await res.json();
  return data.linkedRepos;
}

// Admin Metrics & Platform Audit Logs
export async function fetchAdminMetrics(): Promise<AdminMetrics> {
  const res = await fetch('/api/admin/metrics');
  if (!res.ok) {
    throw new Error('Failed to fetch admin telemetry metrics');
  }
  return await res.json();
}

export async function fetchAuditLogs(orgId?: string, limit: number = 50): Promise<PlatformAuditLog[]> {
  const query = new URLSearchParams();
  if (orgId) query.set('orgId', orgId);
  query.set('limit', limit.toString());

  const res = await fetch(`/api/admin/audit-logs?${query.toString()}`);
  if (!res.ok) {
    throw new Error('Failed to fetch platform audit logs');
  }
  const data = await res.json();
  return data.auditLogs || [];
}

export async function fetchOrgAuditLogs(orgId: string, limit: number = 100): Promise<PlatformAuditLog[]> {
  const res = await fetch(`/api/orgs/${encodeURIComponent(orgId)}/audit?limit=${limit}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch org audit logs: HTTP ${res.status}`);
  }
  const data = await res.json();
  return data.auditLogs || [];
}

// Billing & Pre-Flight Quota Check
export async function checkQuotaGate(orgId?: string): Promise<{
  allowed: boolean;
  orgId: string;
  orgName: string;
  tier: string;
  scansUsed: number;
  scansLimit: number;
  scansRemaining: number;
  aiTokensUsed: number;
  aiTokensLimit: number;
  tokensRemaining: number;
}> {
  const res = await fetch('/api/billing/quota-check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orgId }),
  });
  if (!res.ok) {
    throw new Error('Failed to check pre-flight quota');
  }
  return await res.json();
}

export async function initiateStripeCheckout(planId: string, orgId?: string): Promise<{ success: boolean; sessionUrl: string; tier: string }> {
  const res = await fetch('/api/billing/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ planId, orgId }),
  });
  if (!res.ok) {
    throw new Error('Failed to create Stripe billing session');
  }
  return await res.json();
}

export async function fetchScanById(scanId: string): Promise<ScanResult> {
  const res = await fetch(`/api/scans/${encodeURIComponent(scanId)}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch scan details: HTTP ${res.status}`);
  }
  const data = await res.json();
  return data.scan;
}

export async function fetchScanArtifacts(scanId: string): Promise<{ scanId: string; artifacts: any }> {
  const res = await fetch(`/api/scans/${encodeURIComponent(scanId)}/artifacts`);
  if (!res.ok) {
    throw new Error(`Failed to fetch scan artifacts: HTTP ${res.status}`);
  }
  return await res.json();
}
