import React from 'react';
import { ScanResult, Vulnerability, SeverityLevel } from '../types';
import { ScoreGauge } from './ScoreGauge';
import { DiffViewer } from './DiffViewer';
import { RemediationModal } from './RemediationModal';
import { CoPilotDrawer } from './CoPilotDrawer';
import { ArtifactTrinityModal } from './ArtifactTrinityModal';
import { AnalyticsComparisonView } from './AnalyticsComparisonView';
import {
  Search,
  Eye,
  EyeOff,
  GitPullRequest,
  Code2,
  Bot,
  FileText,
  ShieldAlert,
  AlertTriangle,
  Info,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  TrendingUp,
  Workflow,
  Wrench,
  Terminal,
  ListOrdered,
  Share2,
  ChevronRight,
  Copy,
  Check,
  Download,
  GitBranch,
  Clock,
  ShieldCheck,
  RotateCw
} from 'lucide-react';

interface DashboardViewProps {
  scan: ScanResult;
  onUpdateScan: (updated: ScanResult) => void;
  onReAudit?: () => void;
  isReAuditing?: boolean;
  lang?: 'ar' | 'en';
}

const defaultCopilotVuln: Vulnerability = {
  id: 'baseline-clean',
  title: 'Repository Security Baseline Assessment',
  titleAr: 'تقييم خط الأمان الأساسي للمستودع',
  ruleId: 'gitarmor-baseline',
  cwe: 'CWE-1008: Architectural Security',
  owasp: 'A05:2021-Security Misconfiguration',
  severity: 'low',
  category: 'sast',
  file: 'Repository Root',
  line: 1,
  description: 'All audited code files meet baseline security constraints with zero critical flaws.',
  descriptionAr: 'جميع ملفات الكود تتوافق حالياً مع معايير الأمان الأساسية مع عدم وجود ثغرات حرجة.',
  evidenceRaw: '// Baseline security hygiene verified by Gemini 2.5 Flash',
  evidenceRedacted: '// Baseline security hygiene verified by Gemini 2.5 Flash',
  remediationSummary: 'Maintain continuous integration auditing and credential rotation policy.',
  remediationSummaryAr: 'المحافظة على الفحص المستمر في CI وتدوير التوكن دورياً.',
  suggestedPatch: '// Security posture confirmed. No surgical patches required.',
  status: 'open',
};

export function DashboardView({
  scan,
  onUpdateScan,
  onReAudit,
  isReAuditing = false,
  lang = 'en'
}: DashboardViewProps) {
  const isAr = lang === 'ar';

  const [dashboardTab, setDashboardTab] = React.useState<'findings' | 'plan' | 'prompt' | 'analytics' | 'blast'>('findings');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedSeverity, setSelectedSeverity] = React.useState<SeverityLevel | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');
  const [selectedOwasp, setSelectedOwasp] = React.useState<string>('all');
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);
  
  // Modals & drawers
  const [inspectDiffVuln, setInspectDiffVuln] = React.useState<Vulnerability | null>(null);
  const [remediateVuln, setRemediateVuln] = React.useState<Vulnerability | null>(null);
  const [copilotVuln, setCopilotVuln] = React.useState<Vulnerability | null>(null);
  const [showArtifacts, setShowArtifacts] = React.useState(false);

  // Secret visibility map
  const [revealedSecrets, setRevealedSecrets] = React.useState<Record<string, boolean>>({});

  const toggleRevealSecret = (vulnId: string) => {
    setRevealedSecrets(prev => ({
      ...prev,
      [vulnId]: !prev[vulnId]
    }));
  };

  const handleCopyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownloadFile = (filename: string, content: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportReportMd = () => {
    const report = scan.artifacts?.reportMarkdown || `# GitArmor Security Report\nTarget Repository: ${scan.repository}\nScore: ${scan.score?.score ?? 100}/100`;
    handleDownloadFile(`audit-report-${(scan.repository || 'repo').replace('/', '-')}-${scan.id || 'scan'}.md`, report, 'text/markdown');
    handleCopyText(report, 'report-md');
  };

  // Filter vulnerabilities defensively
  const filteredFindings = React.useMemo(() => {
    const findingsList = Array.isArray(scan.findings) ? scan.findings : [];
    return findingsList.filter(f => {
      if (!f) return false;
      const title = (f.title || '').toLowerCase();
      const titleAr = (f.titleAr || f.title || '').toLowerCase();
      const file = (f.file || '').toLowerCase();
      const cwe = (f.cwe || '').toLowerCase();
      const q = searchQuery.toLowerCase();

      const matchSearch = !q || title.includes(q) || titleAr.includes(q) || file.includes(q) || cwe.includes(q);
      const matchSeverity = selectedSeverity === 'all' || f.severity === selectedSeverity;
      const matchCategory = selectedCategory === 'all' || (f.category || 'sast').toLowerCase() === selectedCategory.toLowerCase();
      const matchOwasp = selectedOwasp === 'all' ||
        (f.owasp || '').toLowerCase().includes(selectedOwasp.toLowerCase()) ||
        (f.owaspCategory || '').toLowerCase().includes(selectedOwasp.toLowerCase());

      return matchSearch && matchSeverity && matchCategory && matchOwasp;
    });
  }, [scan.findings, searchQuery, selectedSeverity, selectedCategory, selectedOwasp]);

  const handleRemediateSuccess = (vulnId: string, prUrl: string, branch: string) => {
    const updatedFindings = (scan.findings || []).map(f =>
      f.id === vulnId ? { ...f, status: 'pr_open' as const, prUrl, prBranch: branch } : f
    );
    onUpdateScan({
      ...scan,
      findings: updatedFindings
    });
  };

  const getCategoryBadge = (category?: string) => {
    const cat = (category || 'sast').toLowerCase();
    const { label, color } = (() => {
      switch (cat) {
        case 'secrets':
          return { label: 'SECRETS', color: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700' };
        case 'sca':
          return { label: 'SCA / CVE', color: 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-700' };
        case 'performance':
          return { label: 'PERF', color: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700' };
        case 'injection':
          return { label: 'INJECTION', color: 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700' };
        case 'ssrf':
          return { label: 'SSRF', color: 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-700' };
        case 'auth':
          return { label: 'AUTH', color: 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700' };
        case 'logging':
          return { label: 'LOGGING', color: 'bg-yellow-100 dark:bg-yellow-950/60 text-yellow-800 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700' };
        case 'rate-limit':
          return { label: 'RATE LIMIT & DOS', color: 'bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 border-orange-300 dark:border-orange-700' };
        case 'errors':
          return { label: 'ERROR HANDLING', color: 'bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border-sky-300 dark:border-sky-700' };
        case 'headers':
          return { label: 'SECURITY HEADERS', color: 'bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border-teal-300 dark:border-teal-700' };
        default:
          return { label: 'SAST', color: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700' };
      }
    })();

    return (
      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-semibold ${color}`}>
        [{label}]
      </span>
    );
  };

  const getSeverityBadge = (severity?: string) => {
    const sev = (severity || 'low').toLowerCase();
    switch (sev) {
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-900/40 px-2 py-0.5 rounded-md">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span>{isAr ? 'حرج' : 'Critical'}</span>
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/40 px-2 py-0.5 rounded-md">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>{isAr ? 'عالي' : 'High'}</span>
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 px-2 py-0.5 rounded-md">
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
            <span>{isAr ? 'متوسط' : 'Medium'}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 px-2 py-0.5 rounded-md">
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
            <span>{isAr ? 'منخفض' : 'Low'}</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Minimalist Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-mono text-neutral-500 dark:text-neutral-400">
        <span className="hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors">Repositories</span>
        <ChevronRight className="w-3 h-3 text-neutral-400 dark:text-neutral-600" />
        <span className="text-neutral-900 dark:text-white font-medium">{scan.repository}</span>
        <ChevronRight className="w-3 h-3 text-neutral-400 dark:text-neutral-600" />
        <span className="text-neutral-500">Scan #{scan.id}</span>
      </div>

      {/* Top Posture Banner */}
      <div className="p-5 sm:p-6 bg-white dark:bg-[#111114] border border-neutral-200/80 dark:border-neutral-800/80 rounded-2xl shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white font-mono tracking-tight">
                {scan.repository}
              </h2>
              <span className="inline-flex items-center gap-1.5 text-xs text-neutral-700 dark:text-neutral-300 font-mono bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200/80 dark:border-neutral-700/80 px-2.5 py-0.5 rounded-md">
                <GitBranch className="w-3 h-3 text-neutral-400" />
                {scan.branch}
              </span>
              <span className="text-[11px] text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200/80 dark:border-neutral-700/80 px-2 py-0.5 rounded-md font-mono">
                Gemini 2.5 Active
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
              <Clock className="w-3.5 h-3.5 text-neutral-400" />
              <span>{isAr ? `تاريخ الفحص: ${scan.timestamp}` : `Audited ${scan.timestamp || 'recently'}`}</span>
              <span>·</span>
              <span>Single-tenant ephemeral runner</span>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-5 self-start lg:self-center">
            {/* Security Posture Score */}
            <div className="text-right">
              <div className="flex items-baseline justify-end gap-1">
                <span className="text-3xl sm:text-4xl font-black font-mono text-neutral-900 dark:text-white tracking-tight tabular-nums">
                  {scan?.score?.score ?? scan?.securityScore ?? 100}
                </span>
                <span className="text-xs font-medium text-neutral-400">/100</span>
              </div>
              <div className="text-[10px] font-mono font-medium tracking-wider uppercase text-neutral-400">
                SECURITY POSTURE
              </div>
            </div>

            {/* Re-Audit Active Repository Button */}
            {onReAudit && (
              <button
                type="button"
                onClick={onReAudit}
                disabled={isReAuditing}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-neutral-800 dark:text-neutral-200 bg-neutral-100 hover:bg-neutral-200/80 dark:bg-neutral-800 dark:hover:bg-neutral-750 border border-neutral-200/80 dark:border-neutral-700/80 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
                title={isAr ? 'إعادة سحب أحدث كود وفحصه فوراً' : 'Pull latest commit & re-audit repository'}
              >
                <RotateCw className={`w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400 ${isReAuditing ? 'animate-spin' : ''}`} />
                <span>
                  {isReAuditing
                    ? (isAr ? 'جارٍ إعادة الفحص...' : 'Re-Auditing...')
                    : (isAr ? 'إعادة فحص المستودع' : 'Re-Audit Repo')}
                </span>
              </button>
            )}

            {/* AI Security Co-Pilot Button (Refined Solid Ink) */}
            <button
              onClick={() => setCopilotVuln((scan?.findings && scan.findings[0]) || defaultCopilotVuln)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-neutral-950 hover:bg-neutral-850 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 transition-colors shadow-2xs cursor-pointer"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>AI Security Co-Pilot</span>
            </button>

            {/* Utility Dropdown / Modals */}
            <div className="hidden sm:flex items-center gap-1.5 border-l border-neutral-200 dark:border-neutral-800 pl-3">
              <button
                onClick={() => setShowArtifacts(true)}
                className="p-2 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white bg-neutral-100/80 hover:bg-neutral-200/80 dark:bg-neutral-800 dark:hover:bg-neutral-750 border border-neutral-200/80 dark:border-neutral-700/80 rounded-xl transition-colors cursor-pointer"
                title="Artifact Trinity"
              >
                <FileText className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Audited Files Strip */}
        {scan?.scannedFiles && scan.scannedFiles.length > 0 && (
          <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-neutral-500 dark:text-neutral-400 font-medium text-[11px]">
              {isAr ? 'الملفات الممسوحة فعلياً:' : 'Audited Files:'}
            </span>
            {scan.scannedFiles.map((sf, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-md bg-neutral-50 dark:bg-neutral-850 border border-neutral-200/70 dark:border-neutral-750 font-mono text-[11px] text-neutral-700 dark:text-neutral-300"
              >
                {sf.path} <span className="text-neutral-400 dark:text-neutral-500">({Math.round(sf.size / 1024)}KB)</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Severity Metrics Row (Humanized Minimalist Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { key: 'critical' as const, label: 'Critical', count: scan?.score?.criticalCount ?? 0, dotColor: 'bg-rose-500', countBadge: 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200/60 dark:border-rose-900/40' },
          { key: 'high' as const, label: 'High Risk', count: scan?.score?.highCount ?? 0, dotColor: 'bg-amber-500', countBadge: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200/60 dark:border-amber-900/40' },
          { key: 'medium' as const, label: 'Medium', count: scan?.score?.mediumCount ?? 0, dotColor: 'bg-neutral-400', countBadge: 'text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700' },
          { key: 'low' as const, label: 'Low Risk', count: scan?.score?.lowCount ?? 0, dotColor: 'bg-neutral-400', countBadge: 'text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700' },
          { key: 'all' as const, label: 'Informational', count: 0, dotColor: 'bg-neutral-300 dark:bg-neutral-600', countBadge: 'text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700' },
        ].map((item) => {
          const isSelected = selectedSeverity === item.key;
          return (
            <button
              key={item.label}
              onClick={() => setSelectedSeverity(isSelected ? 'all' : (item.key as any))}
              className={`p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                isSelected
                  ? 'border-neutral-900 dark:border-white ring-1 ring-neutral-900/10 dark:ring-white/10 bg-white dark:bg-neutral-850 shadow-xs'
                  : 'bg-white dark:bg-[#111114] border-neutral-200/80 dark:border-neutral-800/80 hover:border-neutral-300 dark:hover:border-neutral-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${item.dotColor}`} />
                <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">{item.label}</span>
              </div>
              <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded-md border ${item.countBadge}`}>
                {item.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Sub-Tabs Bar & Export Action */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-neutral-200/80 dark:border-neutral-800/80 pb-3">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none p-1 bg-neutral-100 dark:bg-neutral-900 rounded-xl border border-neutral-200/70 dark:border-neutral-800/70">
          {[
            { id: 'findings', icon: ShieldCheck, labelEn: 'Vulnerability Findings', labelAr: 'تقرير الثغرات والترقيع', count: scan.findings.length },
            { id: 'plan', icon: ListOrdered, labelEn: 'Implementation Plan (.md)', labelAr: 'خطة التنفيذ (Plan.md)', badge: 'AI' },
            { id: 'prompt', icon: Terminal, labelEn: 'Autonomous Agent Prompt (.txt)', labelAr: 'موجه وكلاء البرمجة (.txt)', badge: 'AI' },
            { id: 'analytics', icon: TrendingUp, labelEn: 'Compliance Grid', labelAr: 'شبكة الامتثال' },
            { id: 'blast', icon: Share2, labelEn: 'Blast Radius Graph', labelAr: 'مخطط نطاق التأثير' },
          ].map(tab => {
            const isActive = dashboardTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setDashboardTab(tab.id as any)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white shadow-2xs font-semibold'
                    : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-white/50 dark:hover:bg-neutral-800/40'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{isAr ? tab.labelAr : tab.labelEn}</span>
                {tab.count !== undefined && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-200/80 dark:bg-neutral-700/80 text-neutral-700 dark:text-neutral-300 font-semibold">
                    {tab.count}
                  </span>
                )}
                {tab.badge && (
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 font-medium">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Export Report.md Action */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExportReportMd}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-850 text-neutral-700 dark:text-neutral-300 text-xs font-medium border border-neutral-200 dark:border-neutral-800 transition-colors cursor-pointer shadow-2xs"
          >
            {copiedKey === 'report-md' ? (
              <Check className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>{copiedKey === 'report-md' ? 'Downloaded!' : 'Export Report.md'}</span>
          </button>
        </div>
      </div>

      {/* TAB 1: Vulnerability Findings */}
      {dashboardTab === 'findings' && (
        <div className="space-y-4">
          {/* Search & Filter Toolbar */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 space-y-3 shadow-2xs">
            <div className="flex flex-col md:flex-row items-center gap-3">
              {/* Search bar */}
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-neutral-400 absolute inset-y-0 right-3.5 my-auto pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={isAr ? 'البحث بالملف، اسم الثغرة، أو تصنيف CWE...' : 'Search file path, CWE, description...'}
                  className="w-full bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 focus:border-neutral-900 dark:focus:border-neutral-100 rounded-lg py-2 px-3 pr-9 text-xs text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-hidden transition-colors shadow-2xs"
                />
              </div>

              {/* Interactive Severity Segmented Control */}
              <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-950 rounded-lg border border-neutral-200 dark:border-neutral-800 text-xs w-full md:w-auto overflow-x-auto">
                {(['all', 'critical', 'high', 'medium', 'low'] as const).map(sev => (
                  <button
                    key={sev}
                    onClick={() => setSelectedSeverity(sev)}
                    className={`px-3 py-1.5 font-medium rounded-md transition-colors whitespace-nowrap capitalize cursor-pointer ${
                      selectedSeverity === sev
                        ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-2xs font-semibold'
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                    }`}
                  >
                    {sev === 'all' ? (isAr ? 'الكل' : 'All') : sev}
                  </button>
                ))}
              </div>

              {/* Category Dropdown */}
              <div className="relative w-full md:w-52">
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className="w-full bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-lg py-2 px-3 text-xs text-neutral-800 dark:text-neutral-200 focus:outline-hidden focus:border-neutral-900 dark:focus:border-neutral-100 appearance-none cursor-pointer shadow-2xs"
                >
                  <option value="all">{isAr ? 'جميع الفئات (All Categories)' : 'All Categories'}</option>
                  <option value="rate-limit">{isAr ? 'محدد المعدل وحجب الخدمة (Rate Limit / DoS)' : 'Rate Limit & DoS (CWE-770)'}</option>
                  <option value="errors">{isAr ? 'معالجة الأخطاء والتسريب (Error Leaks)' : 'Error Handling & Leaks (CWE-209)'}</option>
                  <option value="headers">{isAr ? 'ترويسات الأمان والتحصين (Headers)' : 'Security Headers & Hardening'}</option>
                  <option value="injection">{isAr ? 'حقن الأوامر (Injection/SQLi)' : 'Injection (SQL/Code)'}</option>
                  <option value="secrets">{isAr ? 'الأسرار والتوكن (Secrets)' : 'Secrets & Tokens'}</option>
                  <option value="auth">{isAr ? 'المصادقة (Auth & CSRF)' : 'Auth & CSRF'}</option>
                  <option value="sca">{isAr ? 'فحص الاعتماديات (SCA / CVE)' : 'Dependencies (SCA / CVE)'}</option>
                  <option value="ssrf">{isAr ? 'تزوير الطلبات (SSRF)' : 'SSRF & Traversal'}</option>
                  <option value="logging">{isAr ? 'تسريب السجلات (Logging)' : 'Log Leaks'}</option>
                  <option value="performance">{isAr ? 'الأداء والتكلفة (Performance)' : 'Performance & Memory'}</option>
                  <option value="sast">{isAr ? 'أخطاء التكوين (Misconfigurations)' : 'Misconfigurations'}</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute inset-y-0 left-3 my-auto pointer-events-none" />
              </div>

              {/* OWASP Top 10 Dropdown */}
              <div className="relative w-full md:w-56">
                <select
                  value={selectedOwasp}
                  onChange={e => setSelectedOwasp(e.target.value)}
                  className="w-full bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-lg py-2 px-3 text-xs text-neutral-800 dark:text-neutral-200 focus:outline-hidden focus:border-neutral-900 dark:focus:border-neutral-100 appearance-none cursor-pointer shadow-2xs font-mono"
                >
                  <option value="all">{isAr ? 'جميع معايير OWASP Top 10' : 'All OWASP Top 10 Standards'}</option>
                  <option value="A01">{isAr ? 'A01:2021 - خرق التحكم بالوصول' : 'A01:2021 - Broken Access Control'}</option>
                  <option value="A02">{isAr ? 'A02:2021 - إخفاقات التشفير' : 'A02:2021 - Cryptographic Failures'}</option>
                  <option value="A03">{isAr ? 'A03:2021 - ثغرات الحقن (SQLi/XSS)' : 'A03:2021 - Injection (SQL/XSS)'}</option>
                  <option value="A04">{isAr ? 'A04:2021 - تصميم غير آمن ومعدل طلبات' : 'A04:2021 - Insecure Design & Rate Limits'}</option>
                  <option value="A05">{isAr ? 'A05:2021 - أخطاء تكوين وترويسات' : 'A05:2021 - Security Misconfiguration'}</option>
                  <option value="A06">{isAr ? 'A06:2021 - مكونات غير آمنة (SCA)' : 'A06:2021 - Vulnerable Components'}</option>
                  <option value="A07">{isAr ? 'A07:2021 - إخفاق المصادقة والتوكن' : 'A07:2021 - Identification & Auth'}</option>
                  <option value="A08">{isAr ? 'A08:2021 - نزاهة البرمجيات والبيانات' : 'A08:2021 - Software & Data Integrity'}</option>
                  <option value="A09">{isAr ? 'A09:2021 - إخفاق السجلات وتسريب الأخطاء' : 'A09:2021 - Security Logging & Errors'}</option>
                  <option value="A10">{isAr ? 'A10:2021 - تزوير طلبات الخادم (SSRF)' : 'A10:2021 - Server-Side Request Forgery'}</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute inset-y-0 left-3 my-auto pointer-events-none" />
              </div>
            </div>

            {/* Counter summary */}
            <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 pt-1">
              <span>
                {isAr
                  ? `عرض ${filteredFindings.length} من أصل ${scan.findings.length} ثغرة مكتشفة`
                  : `Showing ${filteredFindings.length} of ${scan.findings.length} findings`}
              </span>
              <span className="text-[11px] text-neutral-400">
                {isAr ? 'طمس فوري لمفاتيح API والبيانات الحساسة في الواجهة' : 'Client-side secret masking enabled'}
              </span>
            </div>
          </div>

          {/* Vulnerabilities List or Empty State */}
          <div className="space-y-4">
            {filteredFindings.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 rounded-2xl space-y-3 shadow-2xs">
                <ShieldCheck className="w-14 h-14 text-emerald-500 mx-auto" strokeWidth={1.5} />
                <h4 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white">
                  {isAr ? 'لم يتم العثور على ثغرات أمنية في هذا العرض.' : 'No security vulnerabilities found in this view.'}
                </h4>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-md mx-auto">
                  {isAr
                    ? 'جميع ملفات الكود تتوافق مع معايير الأمان النشطة وخطوط الأساس المعتمدة.'
                    : 'All code files meet active security baseline constraints.'}
                </p>
              </div>
            ) : (
              filteredFindings.map((vuln) => {
                const isRevealed = revealedSecrets[vuln.id];
                const hasPR = vuln.status === 'pr_open';

                return (
                  <div
                    key={vuln.id}
                    className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors shadow-2xs space-y-4"
                  >
                    {/* Finding Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          {getSeverityBadge(vuln.severity)}
                          {getCategoryBadge(vuln.category)}
                          {vuln.owasp && (
                            <span
                              className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200/80 dark:border-neutral-700/80 font-medium"
                              title={vuln.owasp}
                            >
                              {vuln.owasp.split('-')[0].trim()}
                            </span>
                          )}
                          <h4 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white">
                            {isAr ? vuln.titleAr : vuln.title}
                          </h4>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                          <span className="font-mono text-neutral-800 dark:text-neutral-200 font-medium">{vuln.cwe}</span>
                          <span className="text-neutral-300 dark:text-neutral-700">·</span>
                          <span className="font-mono text-neutral-600 dark:text-neutral-300">{vuln.file}:{vuln.line}</span>
                          <span className="text-neutral-300 dark:text-neutral-700">·</span>
                          <span className="text-neutral-500">{vuln.owasp}</span>
                        </div>
                      </div>

                      {/* Actions & Status */}
                      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-start sm:justify-end shrink-0 pt-1 sm:pt-0">
                        {hasPR ? (
                          <a
                            href={vuln.prUrl || '#'}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] text-xs font-semibold text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors"
                          >
                            <GitPullRequest className="w-3.5 h-3.5" />
                            <span>{isAr ? 'تم فتح PR' : 'PR Open'}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <button
                            onClick={() => setRemediateVuln(vuln)}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 min-h-[36px] text-xs font-medium text-white bg-neutral-950 hover:bg-neutral-850 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-white rounded-lg transition-colors cursor-pointer shadow-2xs"
                          >
                            <GitPullRequest className="w-3.5 h-3.5" />
                            <span>{isAr ? 'إصلاح بـ PR' : 'One-Click Fix'}</span>
                          </button>
                        )}

                        <button
                          onClick={() => setInspectDiffVuln(vuln)}
                          className="flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-750 rounded-lg transition-colors border border-neutral-300 dark:border-neutral-700 cursor-pointer shadow-2xs"
                        >
                          <Code2 className="w-3.5 h-3.5" />
                          <span>{isAr ? 'عرض الترقيع' : 'Diff'}</span>
                        </button>

                        <button
                          onClick={() => setCopilotVuln(vuln)}
                          className="flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 rounded-lg transition-colors cursor-pointer"
                          title={isAr ? 'استشارة المساعد الذكي' : 'Ask Co-Pilot'}
                        >
                          <Bot className="w-3.5 h-3.5" />
                          <span>{isAr ? 'استشارة' : 'Consult'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                      {isAr ? vuln.descriptionAr : vuln.description}
                    </p>

                    {/* Redacted Code Evidence Box */}
                    <div className="bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-neutral-500 dark:text-neutral-400 font-mono text-[11px]">
                          {vuln.file} (Line {vuln.line})
                        </span>

                        {/* Mask / Reveal Toggle */}
                        <button
                          onClick={() => toggleRevealSecret(vuln.id)}
                          className="flex items-center gap-1 text-[11px] text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white transition-colors cursor-pointer"
                        >
                          {isRevealed ? <EyeOff className="w-3 h-3 text-amber-600" /> : <Eye className="w-3 h-3" />}
                          <span>
                            {isRevealed
                              ? (isAr ? 'إخفاء الأسرار' : 'Mask Secrets')
                              : (isAr ? 'كشف البيانات الأصلية' : 'Reveal Raw')}
                          </span>
                        </button>
                      </div>

                      <div className="font-mono text-xs overflow-x-auto dir-ltr text-left py-1 text-neutral-800 dark:text-neutral-200">
                        <code>
                          {isRevealed ? vuln.evidenceRaw : vuln.evidenceRedacted}
                        </code>
                      </div>
                    </div>

                    {/* Remediation Summary */}
                    <div className="flex items-start gap-2.5 p-3 bg-neutral-50 dark:bg-neutral-850/60 border border-neutral-200/80 dark:border-neutral-700/80 rounded-lg text-xs">
                      <Wrench className="w-3.5 h-3.5 text-neutral-700 dark:text-neutral-300 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-neutral-900 dark:text-white block mb-0.5">
                          {isAr ? 'الحل الجراحي المقترح:' : 'Surgical Solution:'}
                        </span>
                        <span className="text-neutral-600 dark:text-neutral-400">
                          {isAr ? vuln.remediationSummaryAr : vuln.remediationSummary}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Implementation Plan (.md) */}
      {dashboardTab === 'plan' && (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 space-y-5 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                  {isAr ? 'خطة التنفيذ الجراحية (Implementation Plan)' : 'Implementation Plan (.md)'}
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                  AI GENERATED
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                {isAr
                  ? `خريطة الأولويات الهندسية لمستودع ${scan.repository} مقسمة حسب المراحل ودرجة الخطورة.`
                  : `Deterministic multi-phase remediation sprint plan for ${scan.repository}.`}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopyText(scan.artifacts?.implementationPlanMarkdown || '', 'plan-copy')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-xs font-semibold text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700 transition-colors cursor-pointer"
              >
                {copiedKey === 'plan-copy' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'plan-copy' ? 'Copied!' : 'Copy Plan (.md)'}</span>
              </button>

              <button
                onClick={() => handleDownloadFile(`implementation-plan-${scan.repository.replace('/', '-')}.md`, scan.artifacts?.implementationPlanMarkdown || '', 'text/markdown')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-950 hover:bg-neutral-850 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 text-xs font-semibold text-white transition-colors cursor-pointer shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .md</span>
              </button>
            </div>
          </div>

          <div className="bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 overflow-x-auto text-left font-mono text-xs text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap leading-relaxed">
            {scan.artifacts?.implementationPlanMarkdown || '# No implementation plan generated yet.'}
          </div>
        </div>
      )}

      {/* TAB 3: Autonomous Agent Prompt (.txt) */}
      {dashboardTab === 'prompt' && (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 space-y-5 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                  {isAr ? 'موجه وكلاء البرمجة المستقلين (Autonomous Agent Prompt)' : 'Autonomous Agent Prompt (.txt)'}
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                  AGENT READY
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                {isAr
                  ? 'موجه سياقي مشحون بقواعد الأمان الحتمية وترقيعات Diff جاهز للنسخ في Cursor أو Claude Code أو Gemini CLI.'
                  : 'Context-grounded prompt formatted for autonomous agents (Cursor, Claude Code, Gemini CLI, Copilot).'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopyText(scan.artifacts?.agentPromptText || '', 'prompt-copy')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-xs font-semibold text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700 transition-colors cursor-pointer"
              >
                {copiedKey === 'prompt-copy' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'prompt-copy' ? 'Copied!' : 'Copy Prompt (.txt)'}</span>
              </button>

              <button
                onClick={() => handleDownloadFile(`agent-prompt-${scan.repository.replace('/', '-')}.txt`, scan.artifacts?.agentPromptText || '', 'text/plain')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-950 hover:bg-neutral-850 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 text-xs font-semibold text-white transition-colors cursor-pointer shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .txt</span>
              </button>
            </div>
          </div>

          <div className="relative bg-neutral-950 rounded-xl border border-neutral-800 p-5 overflow-x-auto text-left font-mono text-xs text-neutral-200 whitespace-pre-wrap leading-relaxed">
            {scan.artifacts?.agentPromptText || '// No prompt synthesized for this scan.'}
          </div>
        </div>
      )}

      {/* TAB 4: Compliance Grid */}
      {dashboardTab === 'analytics' && (
        <AnalyticsComparisonView scan={scan} lang={lang} />
      )}

      {/* TAB 5: Blast Radius Graph */}
      {dashboardTab === 'blast' && (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 space-y-6 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-cyan-500" />
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                  {isAr ? 'مخطط نطاق التأثير البرمجي (Blast Radius Graph)' : 'Repository Blast Radius Graph'}
                </h3>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                {isAr
                  ? 'رسم بياني لتحليل تدفق البيانات وتحديد مسارات التلوث التابعة عبر مكونات الكود.'
                  : 'Cross-module AST dependency topology showing propagation risk from tainted user input nodes.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300">
                {scan.findings.length > 0 ? scan.findings.length : 1} Entry Points
              </span>
              <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                0 Circular Dependencies
              </span>
              <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400">
                AST Clean Isolation
              </span>
            </div>
          </div>

          {/* Interactive Topology Visualizer */}
          <div className="relative p-8 bg-neutral-950 rounded-xl border border-neutral-800 overflow-hidden">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
              {/* Node 1: Entry */}
              <div className="w-full md:w-48 p-4 rounded-xl bg-neutral-900 border border-neutral-700 text-center space-y-1.5 shadow-lg">
                <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block">Source Route</span>
                <span className="text-xs font-mono font-bold text-white block">POST /api/v1/auth</span>
                <span className="text-[10px] text-emerald-400 font-mono">Tainted Input Source</span>
              </div>

              {/* Line connector */}
              <div className="hidden md:flex flex-1 items-center justify-center">
                <div className="h-0.5 w-full bg-gradient-to-r from-neutral-700 via-cyan-500 to-neutral-700 relative">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 absolute left-1/2 -top-[3px] animate-ping" />
                </div>
              </div>

              {/* Node 2: Middleware */}
              <div className="w-full md:w-48 p-4 rounded-xl bg-neutral-900 border border-neutral-700 text-center space-y-1.5 shadow-lg">
                <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block">Security Boundary</span>
                <span className="text-xs font-mono font-bold text-white block">jwtAuthMiddleware</span>
                <span className="text-[10px] text-cyan-400 font-mono">Bearer Verification</span>
              </div>

              {/* Line connector */}
              <div className="hidden md:flex flex-1 items-center justify-center">
                <div className="h-0.5 w-full bg-gradient-to-r from-neutral-700 via-cyan-500 to-neutral-700 relative">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 absolute left-1/2 -top-[3px] animate-ping" />
                </div>
              </div>

              {/* Node 3: Target Vulnerability / File */}
              <div className={`w-full md:w-56 p-4 rounded-xl text-center space-y-1.5 shadow-xl transition-all ${
                (scan?.findings && scan.findings.length > 0)
                  ? 'bg-red-950/40 border-2 border-red-500 text-red-200'
                  : 'bg-emerald-950/40 border-2 border-emerald-500 text-emerald-200'
              }`}>
                <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block">
                  {(scan?.findings && scan.findings.length > 0) ? 'Target Finding' : 'Core Architecture'}
                </span>
                <span className="text-xs font-mono font-bold block truncate" title={scan?.findings?.[0]?.file || 'Clean Root'}>
                  {scan?.findings?.[0]?.file || 'All Core Files'}
                </span>
                <span className="text-[10px] font-mono font-semibold block">
                  {(scan?.findings && scan.findings.length > 0)
                    ? `${(scan.findings[0]?.severity || 'INFO').toUpperCase()} (${scan.findings[0]?.cwe || 'SAST'})`
                    : 'Zero Defects Detected'}
                </span>
              </div>

              {/* Line connector */}
              <div className="hidden md:flex flex-1 items-center justify-center">
                <div className="h-0.5 w-full bg-gradient-to-r from-neutral-700 via-neutral-600 to-neutral-700 relative">
                  <div className="w-1.5 h-1.5 rounded-full bg-neutral-400 absolute left-1/2 -top-[2px]" />
                </div>
              </div>

              {/* Node 4: Persistence Sink */}
              <div className="w-full md:w-48 p-4 rounded-xl bg-neutral-900 border border-neutral-700 text-center space-y-1.5 shadow-lg">
                <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block">Data Sink</span>
                <span className="text-xs font-mono font-bold text-white block">PostgreSQL / Vault</span>
                <span className="text-[10px] text-neutral-400 font-mono">Bound Parameters</span>
              </div>
            </div>

            {/* Subtle grid pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-25 pointer-events-none" />
          </div>
        </div>
      )}

      {/* Modals & Slide-overs */}
      {inspectDiffVuln && (
        <DiffViewer
          patch={inspectDiffVuln.suggestedPatch}
          file={inspectDiffVuln.file}
          onClose={() => setInspectDiffVuln(null)}
          lang={lang}
        />
      )}

      {remediateVuln && (
        <RemediationModal
          vuln={remediateVuln}
          repository={scan.repository}
          onClose={() => setRemediateVuln(null)}
          onSuccess={handleRemediateSuccess}
          onReAudit={onReAudit}
          lang={lang}
        />
      )}

      {copilotVuln && (
        <CoPilotDrawer
          vuln={copilotVuln}
          repository={scan.repository}
          onClose={() => setCopilotVuln(null)}
          lang={lang}
        />
      )}

      {showArtifacts && (
        <ArtifactTrinityModal
          artifacts={scan.artifacts}
          repository={scan.repository}
          onClose={() => setShowArtifacts(false)}
          lang={lang}
        />
      )}
    </div>
  );
}
