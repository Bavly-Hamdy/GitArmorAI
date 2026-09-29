export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low';
export type FindingStatus = 'open' | 'fixing' | 'pr_open' | 'resolved' | 'ignored';
export type ScanStatus = 'idle' | 'cloning' | 'parsing' | 'analyzing' | 'completed' | 'failed';

export interface Vulnerability {
  id: string;
  title: string;
  titleAr: string;
  ruleId: string;
  cwe: string;
  owasp: string;
  owaspCategory?: string;
  severity: SeverityLevel;
  category: 'secrets' | 'sast' | 'injection' | 'ssrf' | 'auth' | 'logging' | 'sca' | 'performance' | 'rate-limit' | 'errors' | 'headers';
  file: string;
  line: number;
  description: string;
  descriptionAr: string;
  evidenceRaw: string;
  evidenceRedacted: string;
  remediationSummary: string;
  remediationSummaryAr: string;
  suggestedPatch: string;
  status: FindingStatus;
  prUrl?: string;
  prBranch?: string;
}

export interface GitHubUser {
  login: string;
  id: number;
  avatarUrl: string;
  name?: string;
  bio?: string;
  publicRepos: number;
  totalPrivateRepos?: number;
  followers?: number;
  token?: string;
}

export interface UserRepoItem {
  id: number;
  name: string;
  fullName: string;
  private: boolean;
  htmlUrl: string;
  description: string | null;
  defaultBranch: string;
  stars: number;
  forks: number;
  language: string | null;
  updatedAt: string;
}

export interface ComplianceStandard {
  id: 'iso27001' | 'soc2' | 'gdpr' | 'hipaa' | 'pci_dss';
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  complianceRate: number;
  passedControls: number;
  totalControls: number;
  status: 'compliant' | 'warning' | 'non_compliant';
}

export interface SecurityScoreBreakdown {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  totalFindings: number;
  penalty: number;
}

export interface ArtifactTrinity {
  reportMarkdown: string;
  reportJson: string;
  implementationPlanMarkdown: string;
  agentPromptText: string;
}

export interface ScanResult {
  id: string;
  scanId?: string;
  repository: string;
  repoFullName?: string;
  branch: string;
  commitSha: string;
  timestamp: string;
  status: ScanStatus;
  progress: number;
  currentStep: string;
  currentStepAr: string;
  score: SecurityScoreBreakdown;
  securityScore?: number;
  findings: Vulnerability[];
  artifacts: ArtifactTrinity;
  scannedFiles?: { path: string; size: number }[];
}

export interface SecurityNotification {
  id: string;
  title: string;
  titleAr: string;
  message: string;
  messageAr: string;
  timestamp: string;
  severity: SeverityLevel;
  read: boolean;
  repo: string;
  targetScanId?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'devsecops' | 'developer';
  avatar: string;
  lastActive: string;
  assignedTasks: number;
}

export interface IntegrationConfig {
  id: 'jira' | 'trello' | 'slack' | 'github_actions';
  name: string;
  nameAr: string;
  connected: boolean;
  targetChannelOrProject?: string;
  webhookUrl?: string;
  autoSyncPRs: boolean;
  notifyOnCritical: boolean;
}

export interface BillingPlan {
  id: 'free' | 'pro' | 'team';
  name: string;
  nameAr: string;
  priceUSD: number;
  billingPeriod: 'monthly' | 'yearly';
  scansLimit: number;
  scansUsed: number;
  aiTokensLimit: number;
  aiTokensUsed: number;
  autoFixEnabled: boolean;
  teamSeats: number;
  features: string[];
  featuresAr: string[];
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  tier: 'free' | 'pro' | 'team';
  owner: string;
  createdAt: string;
  scansLimit: number;
  scansUsed: number;
  aiTokensLimit: number;
  aiTokensUsed: number;
  aiSpendUSD: number;
  linkedRepos: string[];
  members: TeamMember[];
}

export interface PlatformAuditLog {
  id: string;
  action: string;
  actionAr: string;
  actor: string;
  orgId: string;
  repo: string;
  details: string;
  severity: SeverityLevel;
  timestamp: string;
}

export interface AdminMetrics {
  totalScans: number;
  totalVulnerabilitiesDetected: number;
  surgicalPrsOpened: number;
  totalTokensConsumed: number;
  geminiSpendUSD: number;
  activeTenants: number;
  firestoreConnected: boolean;
  localStorageSynced: boolean;
  modelBreakdown?: {
    model: string;
    calls: number;
    tokens: number;
    costUSD: number;
  }[];
}

export interface DualEngineStatus {
  engine: string;
  firestore: {
    status: 'connected' | 'syncing' | 'error';
    provider: string;
    region: string;
  };
  localDb: {
    path: string;
    exists: boolean;
    sizeBytes: number;
    lastSync: string;
    recordCount: number;
  };
}
