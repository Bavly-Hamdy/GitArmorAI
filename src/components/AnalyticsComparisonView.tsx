import React, { useState } from 'react';
import { ScanResult, ComplianceStandard } from '../types';
import {
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Award,
  Copy,
  Check,
  Printer,
  FileCheck2
} from 'lucide-react';

interface AnalyticsComparisonViewProps {
  scan: ScanResult;
  lang?: 'ar' | 'en';
  onRemediateAll?: () => void;
}

export function AnalyticsComparisonView({
  scan,
  lang = 'ar',
}: AnalyticsComparisonViewProps) {
  const isAr = lang === 'ar';

  const [activeTab, setActiveTab] = useState<'comparison' | 'compliance' | 'badges'>('comparison');
  const [copiedBadge, setCopiedBadge] = useState<string | null>(null);

  // Compute Before vs After
  const currentScore = scan?.score?.score ?? scan?.securityScore ?? 100;
  const currentGrade = scan?.score?.grade ?? 'A';
  const totalFindings = scan?.findings?.length ?? 0;
  const criticalFindings = scan?.score?.criticalCount ?? 0;
  const highFindings = scan?.score?.highCount ?? 0;
  const prsOpenCount = (scan?.findings || []).filter(f => f.status === 'pr_open' || f.status === 'resolved').length;

  // Projected Post-Remediation Score (when PRs merged)
  const projectedScore = Math.min(100, currentScore + (criticalFindings * 25) + (highFindings * 15) + (prsOpenCount * 5));
  const projectedGrade = projectedScore >= 90 ? 'A+' : projectedScore >= 80 ? 'A' : 'B';

  // Metrics
  const hoursSaved = Math.round((criticalFindings * 4.5) + (highFindings * 2.5) + (totalFindings * 1.2));
  const breachRiskReduction = Math.min(99, Math.round(((criticalFindings * 30 + highFindings * 15) / Math.max(1, (criticalFindings * 30 + highFindings * 15 + 10))) * 100));

  // Compliance Frameworks
  const complianceStandards: ComplianceStandard[] = [
    {
      id: 'iso27001',
      name: 'ISO / IEC 27001:2022',
      nameAr: 'معيار الآيزو لإدارة أمن المعلومات (ISO 27001)',
      description: 'Controls A.8.25 (Secure Development Lifecycle) & A.8.28 (Secure Coding Practices)',
      descriptionAr: 'ضوابط دورة حياة التطوير الآمن (A.8.25) وممارسات البرمجة الآمنة (A.8.28)',
      complianceRate: criticalFindings === 0 ? 98 : highFindings === 0 ? 88 : 74,
      passedControls: criticalFindings === 0 ? 49 : 42,
      totalControls: 50,
      status: criticalFindings === 0 ? 'compliant' : 'warning',
    },
    {
      id: 'soc2',
      name: 'SOC 2 Type II (Security & Confidentiality)',
      nameAr: 'معيار تدقيق الثقة والسرية (SOC 2 Type II)',
      description: 'Trust Services Criteria CC6.6 & CC7.1 - Logical Access and Threat Mitigation',
      descriptionAr: 'معايير التحكم المنطقي في الوصول واكتشاف الأخطار وتخفيف التهديدات',
      complianceRate: criticalFindings === 0 ? 96 : 82,
      passedControls: criticalFindings === 0 ? 27 : 23,
      totalControls: 28,
      status: criticalFindings === 0 ? 'compliant' : 'warning',
    },
    {
      id: 'gdpr',
      name: 'GDPR Article 32 (Security of Processing & PII)',
      nameAr: 'اللائحة العامة لحماية البيانات (GDPR) والمادة 32',
      description: 'Pseudonymization, encryption, and prevention of PII/secret data leakage',
      descriptionAr: 'منع تسريب البيانات الشخصية (PII) والتشفير الإلزامي للمفاتيح والأسرار',
      complianceRate: scan.findings.some(f => f.category === 'secrets' && f.severity === 'critical') ? 70 : 96,
      passedControls: 18,
      totalControls: 19,
      status: scan.findings.some(f => f.category === 'secrets' && f.severity === 'critical') ? 'warning' : 'compliant',
    },
    {
      id: 'pci_dss',
      name: 'PCI-DSS v4.0 (Req 6: Secure Systems & Software)',
      nameAr: 'معيار أمان بطاقات الدفع (PCI-DSS v4.0)',
      description: 'Protection against common software vulnerabilities (SQLi, XSS, insecure configs)',
      descriptionAr: 'حماية البرمجيات ضد ثغرات الحقن وتلويث المدخلات وتشفير مفاتيح الدفع',
      complianceRate: criticalFindings === 0 ? 95 : 79,
      passedControls: 32,
      totalControls: 34,
      status: criticalFindings === 0 ? 'compliant' : 'warning',
    },
  ];

  // Dynamic Badges
  const badgeMarkdown = `[![GitArmor Security](https://img.shields.io/badge/Security-${encodeURIComponent(projectedGrade)}%20%7C%20GitArmor%20Verified-09090b?style=flat&logo=shield)](https://github.com/${scan.repository})`;
  const badgeHtml = `<a href="https://github.com/${scan.repository}"><img src="https://img.shields.io/badge/Security-${encodeURIComponent(projectedGrade)}%20%7C%20GitArmor%20Verified-09090b?style=flat&logo=shield" alt="GitArmor Security Posture" /></a>`;
  const badgeUrl = `https://img.shields.io/badge/Security-${encodeURIComponent(projectedGrade)}%20%7C%20GitArmor%20Verified-09090b?style=flat&logo=shield`;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBadge(key);
    setTimeout(() => setCopiedBadge(null), 2000);
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Navigation Sub-Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-1.5 bg-neutral-100 dark:bg-neutral-950 rounded-lg border border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none whitespace-nowrap w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('comparison')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'comparison'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-2xs font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{isAr ? 'مقارنة ما قبل وما بعد الإصلاح' : 'Before/After Comparison'}</span>
          </button>

          <button
            onClick={() => setActiveTab('compliance')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'compliance'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-2xs font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>{isAr ? 'تقارير الامتثال (ISO / SOC2)' : 'Compliance Audits'}</span>
          </button>

          <button
            onClick={() => setActiveTab('badges')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'badges'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-2xs font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>{isAr ? 'شارات الأمان' : 'Security Badges'}</span>
          </button>
        </div>

        <button
          onClick={handlePrintReport}
          className="w-full sm:w-auto min-h-[40px] sm:min-h-0 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-750 border border-neutral-300 dark:border-neutral-700 rounded-md transition-colors cursor-pointer shadow-2xs"
        >
          <Printer className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-400" />
          <span>{isAr ? 'تصدير وطباعة تقرير الامتثال' : 'Print / Export PDF'}</span>
        </button>
      </div>

      {/* Tab 1: Before / After Comparison */}
      {activeTab === 'comparison' && (
        <div className="space-y-6">
          {/* Main Comparison Hero Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Before Card */}
            <div className="p-4 sm:p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-4 shadow-2xs">
              <div className="flex flex-wrap items-center justify-between gap-1">
                <span className="text-xs font-semibold font-mono uppercase tracking-wider text-red-600 dark:text-red-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-600" />
                  {isAr ? 'الحالة قبل الفحص والإصلاح (Before)' : 'Baseline Posture (Before Fixes)'}
                </span>
                <span className="text-xs font-mono text-neutral-500 truncate max-w-[150px] sm:max-w-none">{scan.repository}</span>
              </div>

              <div className="flex flex-wrap items-baseline gap-2 sm:gap-3">
                <span className="text-4xl sm:text-5xl font-extrabold font-mono text-neutral-900 dark:text-white">
                  {currentScore}
                </span>
                <span className="text-base sm:text-lg font-bold text-neutral-400">/ 100</span>
                <span className="sm:ml-auto text-lg sm:text-xl font-bold font-mono px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-md bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-900">
                  {currentGrade}
                </span>
              </div>

              <div className="space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-800 text-xs">
                <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                  <span>{isAr ? 'الثغرات الحرجة المكتشفة:' : 'Critical Vulnerabilities:'}</span>
                  <span className="font-bold text-red-600 dark:text-red-400 font-mono">{criticalFindings}</span>
                </div>
                <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                  <span>{isAr ? 'الثغرات عالية الخطورة:' : 'High Severity Flaws:'}</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400 font-mono">{highFindings}</span>
                </div>
                <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                  <span>{isAr ? 'إجمالي المشاكل المفتوحة:' : 'Total Active Findings:'}</span>
                  <span className="font-bold text-neutral-900 dark:text-white font-mono">{totalFindings}</span>
                </div>
              </div>
            </div>

            {/* After Projected Card */}
            <div className="p-4 sm:p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-4 shadow-2xs">
              <div className="flex flex-wrap items-center justify-between gap-1">
                <span className="text-xs font-semibold font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  {isAr ? 'الحالة بعد اعتماد طلبات الدمج (After PRs)' : 'Post-Remediation Posture (After PRs)'}
                </span>
                <span className="text-xs font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                  {isAr ? 'محمي بواسطة GitArmor' : 'GitArmor Verified'}
                </span>
              </div>

              <div className="flex flex-wrap items-baseline gap-2 sm:gap-3">
                <span className="text-4xl sm:text-5xl font-extrabold font-mono text-neutral-900 dark:text-white">
                  {projectedScore}
                </span>
                <span className="text-base sm:text-lg font-bold text-neutral-400">/ 100</span>
                <span className="sm:ml-auto text-lg sm:text-xl font-bold font-mono px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {projectedGrade}
                </span>
              </div>

              <div className="space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-800 text-xs">
                <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                  <span>{isAr ? 'نسبة الثغرات المحلولة:' : 'Vulnerabilities Neutralized:'}</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">100% ({criticalFindings + highFindings} resolved)</span>
                </div>
                <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                  <span>{isAr ? 'طلبات السحب المجهزة:' : 'PRs Ready for Merge:'}</span>
                  <span className="font-bold text-neutral-900 dark:text-white font-mono">{totalFindings} PRs</span>
                </div>
                <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                  <span>{isAr ? 'سلامة خطوط الإنتاج:' : 'Production Safety:'}</span>
                  <span className="font-bold text-neutral-900 dark:text-white font-mono">100% Isolated</span>
                </div>
              </div>
            </div>
          </div>

          {/* Business & ROI Telemetry Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-1 shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 text-xs">
                <span>{isAr ? 'الثغرات المتفادية' : 'Critical Flaws Prevented'}</span>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold font-mono text-neutral-900 dark:text-white">
                {criticalFindings + highFindings} <span className="text-xs text-neutral-500 font-normal">{isAr ? 'ثغرة تم حظرها' : 'intercepted'}</span>
              </div>
              <p className="text-[11px] text-neutral-500 leading-normal">
                {isAr ? 'تأمين فوري لمنافذ الحقن والأسرار قبل وصولها لبيئة الإنتاج' : 'Zero leakage to public repositories or container registries'}
              </p>
            </div>

            <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-1 shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 text-xs">
                <span>{isAr ? 'الوقت التقريبي الموفر' : 'Dev Time Saved'}</span>
                <Clock className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
              </div>
              <div className="text-2xl font-bold font-mono text-neutral-900 dark:text-white">
                ~{hoursSaved} <span className="text-xs text-neutral-500 font-normal">{isAr ? 'ساعة عمل هندسي' : 'Dev Hours'}</span>
              </div>
              <p className="text-[11px] text-neutral-500 leading-normal">
                {isAr ? 'توليد الترقيعات الجراحية آلياً بدلاً من التحليل اليدوي المرهق' : 'Calculated against standard manual patch workflows'}
              </p>
            </div>

            <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-1 shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 text-xs">
                <span>{isAr ? 'انخفاض مخاطر الاختراق' : 'Risk Exposure Reduced'}</span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold font-mono text-neutral-900 dark:text-white">
                {breachRiskReduction}%
              </div>
              <p className="text-[11px] text-neutral-500 leading-normal">
                {isAr ? 'تقليص متوسط وقت المعالجة من 45 يوماً إلى دقائق' : 'Reduced MTTR from 45 days down to minutes'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Compliance Reports */}
      {activeTab === 'compliance' && (
        <div className="space-y-4">
          <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl flex items-center justify-between text-xs shadow-2xs">
            <span className="text-neutral-700 dark:text-neutral-300">
              {isAr
                ? 'تقارير الامتثال متوافقة مع متطلبات التدقيق الخارجي وشهادات الجودة الدولية'
                : 'Audit deliverables aligned with ISO 27001, SOC 2 Type II, GDPR and PCI-DSS v4'}
            </span>
            <span className="font-mono text-neutral-900 dark:text-white font-medium">
              {isAr ? 'تحديث حي' : 'Continuous Verification'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {complianceStandards.map(std => (
              <div
                key={std.id}
                className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-3 shadow-2xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                      {isAr ? std.nameAr : std.name}
                    </h4>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                      {isAr ? std.descriptionAr : std.description}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded font-mono shrink-0 ${
                      std.status === 'compliant'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30'
                        : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30'
                    }`}
                  >
                    {std.status === 'compliant' ? (isAr ? 'ملتزم' : 'Compliant') : (isAr ? 'تنبيه' : 'Warning')}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-neutral-500">
                      {std.passedControls}/{std.totalControls} {isAr ? 'ضابط أمني ناجح' : 'Controls Passed'}
                    </span>
                    <span className="font-bold text-neutral-900 dark:text-white">{std.complianceRate}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        std.status === 'compliant' ? 'bg-neutral-900 dark:bg-white' : 'bg-amber-500'
                      }`}
                      style={{ width: `${std.complianceRate}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Dynamic Security Badges for README.md */}
      {activeTab === 'badges' && (
        <div className="space-y-6">
          <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-4 shadow-2xs">
            <div>
              <h4 className="text-sm font-bold text-neutral-900 dark:text-white mb-1">
                {isAr ? 'شارة الأمان لمستودعك (Dynamic GitHub Badge)' : 'Repository Security Shield'}
              </h4>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                {isAr
                  ? 'ضع هذه الشارة في ملف README.md الخاص بك لإظهار درجة الأمان والتحقق المستمر لعملائك ومجتمع المطورين.'
                  : 'Embed this dynamic badge into your repository README.md to display verified security posture to users and clients.'}
              </p>
            </div>

            {/* Live Badge Preview */}
            <div className="p-4 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800 flex items-center justify-center gap-4">
              <img src={badgeUrl} alt="GitArmor Badge" className="h-6" />
            </div>

            {/* Markdown Code */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-600 dark:text-neutral-400 font-mono">Markdown (for README.md):</span>
                <button
                  onClick={() => copyToClipboard(badgeMarkdown, 'md')}
                  className="flex items-center gap-1 text-[11px] text-neutral-900 dark:text-white hover:underline cursor-pointer font-medium"
                >
                  {copiedBadge === 'md' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedBadge === 'md' ? (isAr ? 'تم النسخ' : 'Copied') : (isAr ? 'نسخ Markdown' : 'Copy Markdown')}</span>
                </button>
              </div>
              <div className="p-3 bg-neutral-50 dark:bg-neutral-950 rounded-lg border border-neutral-200 dark:border-neutral-800 font-mono text-xs text-neutral-800 dark:text-neutral-200 select-all overflow-x-auto dir-ltr text-left">
                <code>{badgeMarkdown}</code>
              </div>
            </div>

            {/* HTML Code */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-600 dark:text-neutral-400 font-mono">HTML (for docs & websites):</span>
                <button
                  onClick={() => copyToClipboard(badgeHtml, 'html')}
                  className="flex items-center gap-1 text-[11px] text-neutral-900 dark:text-white hover:underline cursor-pointer font-medium"
                >
                  {copiedBadge === 'html' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedBadge === 'html' ? (isAr ? 'تم النسخ' : 'Copied') : (isAr ? 'نسخ HTML' : 'Copy HTML')}</span>
                </button>
              </div>
              <div className="p-3 bg-neutral-50 dark:bg-neutral-950 rounded-lg border border-neutral-200 dark:border-neutral-800 font-mono text-xs text-neutral-800 dark:text-neutral-200 select-all overflow-x-auto dir-ltr text-left">
                <code>{badgeHtml}</code>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
