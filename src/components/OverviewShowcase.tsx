import React, { useState } from 'react';
import {
  Shield,
  ArrowRight,
  Code2,
  GitPullRequest,
  CheckCircle2,
  Lock,
  Cpu,
  Terminal,
  FileText,
  AlertTriangle,
  Zap,
  Layers,
  ChevronRight,
  Copy,
  Check,
  Eye,
  RefreshCw,
  GitBranch,
  ExternalLink
} from 'lucide-react';

interface OverviewShowcaseProps {
  onLaunchAudit: () => void;
  lang?: 'ar' | 'en';
}

type VulnDemoKey = 'sqli' | 'secrets' | 'ssrf';

interface VulnDemo {
  id: VulnDemoKey;
  titleEn: string;
  titleAr: string;
  cwe: string;
  owasp: string;
  severity: 'critical' | 'high';
  vulnerableCode: string;
  remediatedCode: string;
  diffPatch: string;
  reasoningEn: string;
  reasoningAr: string;
}

const VULN_DEMOS: VulnDemo[] = [
  {
    id: 'sqli',
    titleEn: 'SQL Injection via Untrusted Input',
    titleAr: 'حقن قواعد البيانات (SQL Injection)',
    cwe: 'CWE-89: SQL Injection',
    owasp: 'A03:2021-Injection',
    severity: 'critical',
    vulnerableCode: `// ❌ INSECURE: Direct string concatenation creates SQL injection
router.post('/api/users/lookup', async (req, res) => {
  const { email } = req.body;
  const query = "SELECT id, username, role FROM users WHERE email = '" + email + "'";
  const result = await db.query(query);
  res.json({ user: result.rows[0] });
});`,
    remediatedCode: `// ✅ REMEDIATED: Parameterized query ensures strict input boundary
router.post('/api/users/lookup', async (req, res) => {
  const { email } = req.body;
  const query = "SELECT id, username, role FROM users WHERE email = $1";
  const result = await db.query(query, [email]);
  res.json({ user: result.rows[0] });
});`,
    diffPatch: `@@ -2,3 +2,3 @@
-  const query = "SELECT id, username, role FROM users WHERE email = '" + email + "'";
-  const result = await db.query(query);
+  const query = "SELECT id, username, role FROM users WHERE email = $1";
+  const result = await db.query(query, [email]);`,
    reasoningEn: 'Untrusted user input was interpolated directly into the SQL query buffer. The patch introduces prepared statements with parameterized binds ($1), completely preventing arbitrary SQL execution.',
    reasoningAr: 'كان يتم إدخال بيانات المستخدم مباشرة داخل جملة الاستعلام، مما يسمح بتنفيذ أوامر SQL عشوائية. تم تطبيق Prepared Statement مع ربط المدخلات ($1) لإحباط الهجوم تماماً.'
  },
  {
    id: 'secrets',
    titleEn: 'Exposed Production Cloud Key',
    titleAr: 'تسريب مفتاح سحابي في الكود',
    cwe: 'CWE-798: Hardcoded Credentials',
    owasp: 'A07:2021-Identification & Auth Failures',
    severity: 'critical',
    vulnerableCode: `// ❌ INSECURE: Raw production access key committed in source code
import { S3Client } from '@aws-sdk/client-s3';

const s3 = new S3Client({
  region: 'us-east-1',
  credentials: {
    accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
    secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'
  }
});`,
    remediatedCode: `// ✅ REMEDIATED: Redacted and loaded from verified environment variables
import { S3Client } from '@aws-sdk/client-s3';

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
});`,
    diffPatch: `@@ -5,4 +5,4 @@
-    accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
-    secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'
+    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
+    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!`,
    reasoningEn: 'Hardcoded cloud credentials in version control allow unauthorized infrastructure takeover. The patch replaces raw strings with environment variable bindings and masks active tokens with cryptographic redaction in logs.',
    reasoningAr: 'تضمين مفاتيح AWS في المستودع يعرض البنية التحتية للاختراق. تم استبدال القيم بمتغيرات بيئية مشفرة وطمس المفتاح آلياً في سجلات التدقيق لمنع تسريبه.'
  },
  {
    id: 'ssrf',
    titleEn: 'Server-Side Request Forgery (SSRF)',
    titleAr: 'تزييف طلبات الخادم (SSRF)',
    cwe: 'CWE-918: Server-Side Request Forgery',
    owasp: 'A10:2021-Server-Side Request Forgery',
    severity: 'high',
    vulnerableCode: `// ❌ INSECURE: Fetches arbitrary URL, exposing internal cloud metadata (169.254.169.254)
router.post('/api/fetch-avatar', async (req, res) => {
  const { url } = req.body;
  const response = await fetch(url);
  const data = await response.buffer();
  res.send(data);
});`,
    remediatedCode: `// ✅ REMEDIATED: Validates destination hostname against allowed public protocols and domains
import { isAllowedPublicUrl } from '../utils/security';

router.post('/api/fetch-avatar', async (req, res) => {
  const { url } = req.body;
  if (!isAllowedPublicUrl(url)) {
    return res.status(400).json({ error: 'Prohibited internal network destination' });
  }
  const response = await fetch(url);
  const data = await response.buffer();
  res.send(data);
});`,
    diffPatch: `@@ -3,2 +3,5 @@
+  if (!isAllowedPublicUrl(url)) {
+    return res.status(400).json({ error: 'Prohibited internal network destination' });
+  }
   const response = await fetch(url);`,
    reasoningEn: 'Unfiltered outbound requests can be manipulated by attackers to query private RFC1918 IPs and cloud instance metadata (IMDSv1). The patch enforces domain validation and rejects private subnet targets.',
    reasoningAr: 'الطلبات الصادرة دون تقييد تسمح للمهاجم بالوصول لخدمات السحابة الداخلية (Metadata). تم تطبيق دالة فحص تحظر الشبكات الخاصة والـ Localhost وتسمح فقط بالنطاقات العامة المصرح بها.'
  }
];

export function OverviewShowcase({ onLaunchAudit, lang = 'en' }: OverviewShowcaseProps) {
  const isAr = lang === 'ar';
  const [activeVulnTab, setActiveVulnTab] = useState<VulnDemoKey>('sqli');
  const [codeViewMode, setCodeViewMode] = useState<'diff' | 'vulnerable' | 'remediated'>('diff');
  const [copied, setCopied] = useState(false);

  const currentDemo = VULN_DEMOS.find(d => d.id === activeVulnTab) || VULN_DEMOS[0];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-24">
      {/* 1. The Core Paradigm Shift: Why GitArmor AI? */}
      <section id="why-gitarmor" className="space-y-10 scroll-mt-20">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200/80 dark:border-neutral-700/80">
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-900 dark:bg-white" />
            <span>{isAr ? 'المفهوم الأساسي' : 'The Core Paradigm'}</span>
            <span className="text-neutral-400">/</span>
            <span>{isAr ? 'تطور تدقيق الأمان' : 'DevSecOps Evolution'}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-bold text-neutral-900 dark:text-white tracking-tight">
            {isAr
              ? 'إنهاء إرهاق الإنذارات الكاذبة: من الرصد إلى العلاج التلقائي'
              : 'Beyond Static Scanners: Autonomous Verification & Surgical Remediation'}
          </h2>

          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-2xl mx-auto">
            {isAr
              ? 'أدوات SAST التقليدية تُغرق المطورين بمئات الإنذارات السطحية وتترك عبء الإصلاح اليدوي على عاتقهم. GitArmor AI تفحص شجرة الكود (AST) وتستنتج السياق البرمجي بالذكاء الاصطناعي لتفتح طلب سحب (PR) جراحي جاهز للدمج بضغطة زر واحدة.'
              : 'Legacy scanners flood engineering teams with noisy alerts and abandon them at the remediation phase. GitArmor AI combines deterministic AST parsing with Gemini deep reasoning to eliminate false positives and open atomic pull requests.'}
          </p>
        </div>

        {/* Comparison Grid: Old Way vs. GitArmor Way */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card: Traditional SAST */}
          <div className="p-6 sm:p-8 bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
              <span className="text-xs font-mono uppercase tracking-wider text-neutral-500">
                {isAr ? 'الأدوات التقليدية' : 'Traditional SAST Tools'}
              </span>
              <span className="text-xs font-mono text-rose-600 dark:text-rose-400 font-semibold">
                {isAr ? 'إرهاق وتعطيل' : 'High Friction'}
              </span>
            </div>

            <ul className="space-y-4 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
              <li className="flex items-start gap-3">
                <span className="text-rose-500 font-bold text-base leading-none">✕</span>
                <span>
                  <strong className="text-neutral-900 dark:text-neutral-200 font-semibold">
                    {isAr ? 'أكثر من 70% إنذارات كاذبة: ' : '70%+ False Alarm Rate: '}
                  </strong>
                  {isAr
                    ? 'مطابقة نصوص وكلمات مجردة دون إدراك ما إذا كانت المدخلات خضعت لتعقيم أو تحقق مسبق.'
                    : 'Simple regex matching flags sanitized variables, creating alert fatigue.'}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-rose-500 font-bold text-base leading-none">✕</span>
                <span>
                  <strong className="text-neutral-900 dark:text-neutral-200 font-semibold">
                    {isAr ? 'علاج يدوي بطيء (MTTR): ' : 'Manual Remediation Overhead: '}
                  </strong>
                  {isAr
                    ? 'تكتفي بإصدار تقرير طويل يثقل كاهل المطورين ويستغرق أسابيع للإصلاح اليدوي.'
                    : 'Dumps endless PDF/JSON reports on engineers without writing a single line of patch.'}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-rose-500 font-bold text-base leading-none">✕</span>
                <span>
                  <strong className="text-neutral-900 dark:text-neutral-200 font-semibold">
                    {isAr ? 'تسريب الأسرار في السجلات: ' : 'Unsafe Secret Exposure: '}
                  </strong>
                  {isAr
                    ? 'عرض المفاتيح والرموز الحساسة بنصها الصريح داخل ملفات السجلات والتقارير.'
                    : 'Prints plaintext credentials directly into scan logs without proactive masking.'}
                </span>
              </li>
            </ul>
          </div>

          {/* Card: GitArmor AI */}
          <div className="p-6 sm:p-8 bg-white dark:bg-[#111115] border border-neutral-300 dark:border-neutral-700 rounded-2xl shadow-sm space-y-5 relative overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 flex items-center justify-center font-bold text-[10px]">
                  <Shield className="w-3 h-3" />
                </div>
                <span className="text-xs font-mono uppercase tracking-wider font-semibold text-neutral-900 dark:text-white">
                  GitArmor AI
                </span>
              </div>
              <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                {isAr ? 'علاج آلي جراحي' : 'Autonomous DevSecOps'}
              </span>
            </div>

            <ul className="space-y-4 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-neutral-900 dark:text-white font-semibold">
                    {isAr ? 'تأكيد حقيقي بنسبة 94%: ' : '94% Verified Signal: '}
                  </strong>
                  {isAr
                    ? 'تتبع كامل لمسار البيانات (Dataflow & Taint Analysis) وفهم دوال التعقيم وحلقات المعالجة.'
                    : 'Contextual reasoning verifies if tainted user input actually reaches executable sinks.'}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-neutral-900 dark:text-white font-semibold">
                    {isAr ? 'طلبات سحب (PRs) بضغطة زر: ' : '1-Click Surgical Pull Requests: '}
                  </strong>
                  {isAr
                    ? 'كتابة Patch دقيق وإنشاء فرع منعزل في GitHub مع فحص التراجع دون لمس الإنتاج مباشرة.'
                    : 'Autonomously branches, writes precision diffs, and opens reviewable PRs without touching main.'}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-neutral-900 dark:text-white font-semibold">
                    {isAr ? 'طمس وتشفير فوري للأسرار: ' : 'Cryptographic Redaction by Default: '}
                  </strong>
                  {isAr
                    ? 'طمس تلقائي لأي مفتاح API أو كلمة مرور قبل إرسالها لأي جهة أو حفظها في التقارير.'
                    : 'Automated token masking prevents production secrets from leaking into audit payloads.'}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 2. Step-by-Step Architecture Pipeline */}
      <section id="how-it-works" className="space-y-12 scroll-mt-20">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="flex items-center justify-center gap-2 text-xs font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            <span>{isAr ? 'دورة العمل الآلية' : 'Autonomous Pipeline'}</span>
            <span className="text-neutral-300 dark:text-neutral-700">/</span>
            <span>{isAr ? 'من الكود إلى الـ PR' : 'Code to Pull Request'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">
            {isAr ? 'كيف يعمل GitArmor AI؟' : 'How GitArmor AI Operates'}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
            {isAr
              ? 'أربع مراحل متزامنة تضمن سلامة الكود، التوثيق الشامل، وحماية بيئات الإنتاج من التعديل العشوائي.'
              : 'A 4-phase deterministic pipeline ensuring continuous security posture and zero production risk.'}
          </p>
        </div>

        {/* 4 Pipeline Stages */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Phase 1 */}
          <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-3 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-neutral-400 font-semibold">PHASE 01</span>
              <div className="w-6 h-6 rounded bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-600 dark:text-neutral-300">
                <Code2 className="w-3.5 h-3.5" />
              </div>
            </div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
              {isAr ? 'سحب الكود وفحص الـ AST' : 'Ephemeral Ingestion & AST'}
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {isAr
                ? 'استنساخ مؤقت في الذاكرة دون حفظ الكود، وتحليل بنيوي شامل للأكواد عبر لغات متعددة (JS/TS, Python, Go).'
                : 'Sandboxed in-memory clone. Constructs deep Abstract Syntax Trees to map variables, imports, and calls.'}
            </p>
            <div className="pt-2 font-mono text-[10px] text-neutral-500">
              Tree-sitter · AST Graph
            </div>
          </div>

          {/* Phase 2 */}
          <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-3 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-neutral-400 font-semibold">PHASE 02</span>
              <div className="w-6 h-6 rounded bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-600 dark:text-neutral-300">
                <Cpu className="w-3.5 h-3.5" />
              </div>
            </div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
              {isAr ? 'الاستنتاج السياقي بـ Gemini' : 'Contextual Reasoning'}
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {isAr
                ? 'تحليل تدفق البيانات والتحقق من وجود فلاتر حماية لاستبعاد البلاغات الكاذبة وتحديد مسار الاستغلال الفعلي.'
                : 'Gemini evaluates cross-file taint paths, confirms exploitability, and maps to CWE & OWASP matrices.'}
            </p>
            <div className="pt-2 font-mono text-[10px] text-neutral-500">
              Gemini 2.5 · Zero False-Positives
            </div>
          </div>

          {/* Phase 3 */}
          <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-3 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-neutral-400 font-semibold">PHASE 03</span>
              <div className="w-6 h-6 rounded bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-600 dark:text-neutral-300">
                <Layers className="w-3.5 h-3.5" />
              </div>
            </div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
              {isAr ? 'توليد الوثائق الثلاثية' : 'The Artifact Trinity'}
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {isAr
                ? 'تجهيز تقرير شامل (Markdown) وخطة تصليح للآلات (YAML) وأمر جاهز لنماذج الوكلاء (Agent Prompt).'
                : 'Generates security-report.md, plan.yaml for CI/CD runners, and agent-prompt.txt for coding agents.'}
            </p>
            <div className="pt-2 font-mono text-[10px] text-neutral-500">
              Markdown · YAML · Agent TXT
            </div>
          </div>

          {/* Phase 4 */}
          <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-3 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-neutral-400 font-semibold">PHASE 04</span>
              <div className="w-6 h-6 rounded bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-600 dark:text-neutral-300">
                <GitPullRequest className="w-3.5 h-3.5" />
              </div>
            </div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
              {isAr ? 'فتح طلب سحب منعزل (PR)' : 'Atomic Pull Request'}
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {isAr
                ? 'إنشاء فرع منفصل في GitHub وتطبيق الـ Diff الجراحي وفتح PR جاهز للمراجعة دون تعريض فرع main.'
                : 'Spawns gitarmor/fix-* branch, applies unified diff patch, and opens reviewable GitHub PR.'}
            </p>
            <div className="pt-2 font-mono text-[10px] text-neutral-500">
              Safe Branching · Protected Main
            </div>
          </div>
        </div>
      </section>

      {/* 3. Interactive Vulnerability & Surgical Remediation Simulator */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="flex items-center justify-center gap-2 text-xs font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            <span>{isAr ? 'محاكاة تفاعلية' : 'Interactive Sandbox'}</span>
            <span className="text-neutral-300 dark:text-neutral-700">/</span>
            <span>{isAr ? 'معاينة نماذج الثغرات والإصلاح' : 'Live Patch Simulator'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">
            {isAr ? 'شاهد كيف يعالج GitArmor AI الثغرات' : 'See How GitArmor AI Patches Flaws'}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
            {isAr
              ? 'اختر نوع الثغرة أدناه لمعاينة الكود المصاب، وتعديل الـ Diff الجراحي، والتفسير الأمني المستنتج.'
              : 'Select a vulnerability vector below to inspect how GitArmor generates precision surgical diffs.'}
          </p>
        </div>

        {/* Simulator Box */}
        <div className="bg-white dark:bg-[#111115] border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm overflow-hidden">
          {/* Top Vector Selector Tabs */}
          <div className="flex flex-wrap items-center justify-between border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/60 p-2 sm:px-4 gap-2">
            <div className="flex flex-wrap items-center gap-1 sm:gap-2">
              {VULN_DEMOS.map(demo => {
                const isActive = activeVulnTab === demo.id;
                return (
                  <button
                    key={demo.id}
                    onClick={() => setActiveVulnTab(demo.id)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white shadow-2xs border border-neutral-200/80 dark:border-neutral-700'
                        : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${demo.severity === 'critical' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                    <span>{isAr ? demo.titleAr : demo.titleEn}</span>
                  </button>
                );
              })}
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center gap-1 bg-neutral-200/60 dark:bg-neutral-800/80 p-0.5 rounded-lg text-xs font-mono">
              <button
                onClick={() => setCodeViewMode('diff')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  codeViewMode === 'diff'
                    ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white font-semibold shadow-2xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
                }`}
              >
                Unified Diff
              </button>
              <button
                onClick={() => setCodeViewMode('vulnerable')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  codeViewMode === 'vulnerable'
                    ? 'bg-white dark:bg-neutral-900 text-rose-600 dark:text-rose-400 font-semibold shadow-2xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
                }`}
              >
                Before
              </button>
              <button
                onClick={() => setCodeViewMode('remediated')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  codeViewMode === 'remediated'
                    ? 'bg-white dark:bg-neutral-900 text-emerald-600 dark:text-emerald-400 font-semibold shadow-2xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
                }`}
              >
                After
              </button>
            </div>
          </div>

          {/* Meta Bar */}
          <div className="px-5 py-3 border-b border-neutral-100 dark:border-neutral-800/80 flex flex-wrap items-center justify-between gap-3 text-xs font-mono bg-white dark:bg-[#111115]">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium">
                {currentDemo.cwe}
              </span>
              <span className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium">
                {currentDemo.owasp}
              </span>
              <span className="px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-semibold">
                {currentDemo.severity.toUpperCase()}
              </span>
            </div>

            <button
              onClick={() => handleCopy(
                codeViewMode === 'diff'
                  ? currentDemo.diffPatch
                  : codeViewMode === 'vulnerable'
                  ? currentDemo.vulnerableCode
                  : currentDemo.remediatedCode
              )}
              className="inline-flex items-center gap-1.5 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors cursor-pointer text-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? (isAr ? 'تم النسخ' : 'Copied') : (isAr ? 'نسخ الكود' : 'Copy Snippet')}</span>
            </button>
          </div>

          {/* Code Viewer Body */}
          <div className="p-4 sm:p-6 bg-neutral-950 text-neutral-100 font-mono text-xs sm:text-[13px] leading-relaxed overflow-x-auto min-h-[180px]">
            <pre className="selection:bg-neutral-800">
              {codeViewMode === 'diff' && currentDemo.diffPatch}
              {codeViewMode === 'vulnerable' && currentDemo.vulnerableCode}
              {codeViewMode === 'remediated' && currentDemo.remediatedCode}
            </pre>
          </div>

          {/* AI Security Reasoning Box */}
          <div className="p-4 sm:p-5 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 flex items-start gap-3 text-xs leading-relaxed">
            <div className="w-6 h-6 rounded bg-neutral-900 dark:bg-neutral-800 text-white dark:text-neutral-200 flex items-center justify-center shrink-0 mt-0.5 font-mono text-[10px] font-bold">
              AI
            </div>
            <div className="space-y-1">
              <span className="font-semibold text-neutral-900 dark:text-white font-mono text-[11px] block">
                {isAr ? 'استنتاج وتفسير المعالجة (Gemini Reasoning):' : 'Gemini Autonomous Verification & Analysis:'}
              </span>
              <p className="text-neutral-600 dark:text-neutral-300">
                {isAr ? currentDemo.reasoningAr : currentDemo.reasoningEn}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Enterprise Standards & Security Guarantees */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="flex items-center justify-center gap-2 text-xs font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            <span>{isAr ? 'المعايير والأمان' : 'Compliance & Governance'}</span>
            <span className="text-neutral-300 dark:text-neutral-700">/</span>
            <span>{isAr ? 'حماية بيانات الكود' : 'Enterprise Isolation'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">
            {isAr ? 'مُصمم لأعلى معايير الخصوصية المؤسسية' : 'Enterprise Security by Default'}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
            {isAr
              ? 'ضمانات صارمة لحماية أسرار وسلامة الكود المصدري وفقاً للمعايير الدولية للأمان السيبراني.'
              : 'Built to meet the zero-trust security expectations of modern software engineering squads.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-3">
            <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-800 dark:text-neutral-200">
              <Lock className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              {isAr ? 'عدم حفظ الأكواد إطلاقاً' : 'Zero Code Retention'}
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {isAr
                ? 'يتم فحص الكود في بيئة معزولة مؤقتة بالذاكرة وتُحذف فور انتهاء الجلسة. لا يتم استخدام كودك لتدريب أي نماذج عامة.'
                : 'Audits run in ephemeral scratch containers. Raw source files are never stored persistently or used to train models.'}
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-3">
            <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-800 dark:text-neutral-200">
              <GitBranch className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              {isAr ? 'حماية الفروع الرئيسية (main)' : 'Protected Branch Invariant'}
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {isAr
                ? 'لا يتم إرسال أي Commits مباشرة لفرع الإنتاج. جميع الإصلاحات تصدر كفروع منفصلة خاضعة لمراجعة المطورين والـ CI.'
                : 'GitArmor enforces read-only access on main/master branches. All proposed diffs are submitted via isolated PR branches.'}
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-3">
            <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-800 dark:text-neutral-200">
              <Shield className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              {isAr ? 'تغطية معايير OWASP و CWE' : 'Global Standards Mapping'}
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {isAr
                ? 'توافق مباشر مع تصنيفات OWASP Top 10 ومعايير CWE/SANS Top 25 ومواصفات تدقيق SOC 2 Type II.'
                : 'Every vulnerability is cross-referenced with official CWE indices, OWASP 2021 classifications, and audit logs.'}
            </p>
          </div>
        </div>
      </section>

      {/* 5. Big Dedicated CTA Banner */}
      <section className="p-8 sm:p-12 bg-neutral-950 text-white dark:bg-[#111116] dark:text-white border border-neutral-800 dark:border-neutral-800 rounded-2xl sm:rounded-3xl shadow-xl relative overflow-hidden">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium bg-neutral-900 text-neutral-300 dark:bg-neutral-850 dark:text-neutral-300 border border-neutral-800 dark:border-neutral-750">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>{isAr ? 'مجاني ومفتوح بالكامل · فحص خلال 60 ثانية' : '100% Free & Open-Source · Ready in 60s'}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">
            {isAr
              ? 'افحص مستودعك البرمجي الآن واكتشف الثغرات مجاناً'
              : 'Audit Your First Repository in Less Than a Minute'}
          </h2>

          <p className="text-xs sm:text-sm text-neutral-400 dark:text-neutral-400 leading-relaxed">
            {isAr
              ? 'انتقل إلى خدمة الفحص الأمني المخصصة، اربط مستودع GitHub أو الصق عنوان المشروع لتبدأ أول فحص AST واستنتاج سياقي مستقل دون أي رسوم.'
              : 'Head directly to our dedicated Security Scanner service to analyze any repository or code snippet with precision at zero cost.'}
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onLaunchAudit}
              className="w-full sm:w-auto min-h-[46px] px-8 py-3.5 bg-white text-neutral-950 hover:bg-neutral-100 font-semibold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{isAr ? 'الانتقال إلى خدمة الفحص الأمني' : 'Go to Security Scanner Service'}</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
