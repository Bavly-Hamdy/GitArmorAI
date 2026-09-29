import { Vulnerability, SecurityNotification, IntegrationConfig, BillingPlan, TeamMember } from '../types';
import { redactSecretEvidence } from '../services/securityEngine';

export const INITIAL_VULNERABILITIES: Vulnerability[] = [
  {
    id: 'vuln-01',
    title: 'Hardcoded Stripe API Secret Key in Configuration',
    titleAr: 'مفتاح سري مشفر وثابت (Stripe API Key) داخل ملف الإعدادات',
    ruleId: 'gitleaks-rule-stripe-secret',
    cwe: 'CWE-798: Use of Hard-coded Credentials',
    owasp: 'A07:2021-Identification and Authentication Failures',
    severity: 'critical',
    category: 'secrets',
    file: 'src/config/billing.config.ts',
    line: 14,
    description: 'A production live secret key was found committed in source code. This exposes payment infrastructure to unauthorized credit card charges and data exfiltration.',
    descriptionAr: 'تم العثور على مفتاح سري حقيقي لبيئة الإنتاج محفوظاً داخل الكود. هذا يعرض البنية التحتية للمدفوعات لعمليات سرقة وسحب بيانات غير مصرح بها.',
    evidenceRaw: 'export const STRIPE_SECRET = "sk_demo_mock_stripe_key_remediated_example";',
    evidenceRedacted: redactSecretEvidence('export const STRIPE_SECRET = "sk_demo_mock_stripe_key_remediated_example";'),
    remediationSummary: 'Move secret key to server environment variable `process.env.STRIPE_SECRET_KEY` and rotate current key in Stripe Dashboard.',
    remediationSummaryAr: 'نقل المفتاح السري إلى متغيرات البيئة واستدعاؤه عبر process.env مع تدوير المفتاح الحالي فوراً.',
    suggestedPatch: `--- a/src/config/billing.config.ts
+++ b/src/config/billing.config.ts
@@ -12,3 +12,4 @@
-export const STRIPE_SECRET = "sk_demo_mock_stripe_key_remediated_example";
+export const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY || '';
+if (!STRIPE_SECRET && process.env.NODE_ENV === 'production') {
+  throw new Error('STRIPE_SECRET_KEY is mandatory in production');
+}`,
    status: 'open'
  },
  {
    id: 'vuln-02',
    title: 'SQL Injection via String Concatenation in User Authentication',
    titleAr: 'ثغرة حقن SQL عبر دمج النصوص في مسار مصادقة المستخدمين',
    ruleId: 'semgrep-sqli-raw-query',
    cwe: 'CWE-89: SQL Injection',
    owasp: 'A03:2021-Injection',
    severity: 'critical',
    category: 'injection',
    file: 'src/services/userService.ts',
    line: 42,
    description: 'Raw SQL statement is constructed by concatenating unsanitized user email input. Attackers can bypass authentication using payload `\' OR 1=1 --`.',
    descriptionAr: 'يتم بناء استعلام SQL عبر دمج نص البريد الإلكتروني دون معالجة أو تنقية، مما يتيح للمهاجمين تجاوز المصادقة وسرقة قاعدة البيانات.',
    evidenceRaw: 'const query = `SELECT * FROM accounts WHERE email = \'${req.body.email}\' AND status = \'active\'`;',
    evidenceRedacted: 'const query = `SELECT * FROM accounts WHERE email = \'${req.body.email}\' AND status = \'active\'`;',
    remediationSummary: 'Adopt parameterized queries or an ORM prepared statement with bound variables.',
    remediationSummaryAr: 'استخدام الاستعلامات المعلمة (Parameterized Queries) وتمرير المتغيرات بشكل آمن لمنع الحقن.',
    suggestedPatch: `--- a/src/services/userService.ts
+++ b/src/services/userService.ts
@@ -40,3 +40,3 @@
-const query = \`SELECT * FROM accounts WHERE email = '\${req.body.email}' AND status = 'active'\`;
-const result = await db.raw(query);
+const query = 'SELECT * FROM accounts WHERE email = $1 AND status = $2';
+const result = await db.query(query, [req.body.email, 'active']);`,
    status: 'open'
  },
  {
    id: 'vuln-03',
    title: 'Server-Side Request Forgery (SSRF) in Webhook Dispatcher',
    titleAr: 'ثغرة تزوير الطلبات من جانب الخادم (SSRF) في مرسل إشعارات الويب',
    ruleId: 'semgrep-ssrf-unvalidated-fetch',
    cwe: 'CWE-918: Server-Side Request Forgery',
    owasp: 'A10:2021-Server-Side Request Forgery',
    severity: 'high',
    category: 'ssrf',
    file: 'src/controllers/webhookController.ts',
    line: 88,
    description: 'Application sends HTTP requests to arbitrary user-supplied URLs without restricting internal IP ranges (127.0.0.1, 169.254.169.254 cloud metadata).',
    descriptionAr: 'يقوم الخادم بإرسال طلبات HTTP لروابط خارجية يحددها المستخدم دون حظر النطاقات الداخلية وعناوين الميتا داتا السحابية.',
    evidenceRaw: 'const response = await fetch(req.body.targetWebhookUrl, { method: "POST", body: payload });',
    evidenceRedacted: 'const response = await fetch(req.body.targetWebhookUrl, { method: "POST", body: payload });',
    remediationSummary: 'Validate domain against strict allowlist and reject loopback and private IPv4/IPv6 address blocks.',
    remediationSummaryAr: 'التحقق من صحة النطاق مقابل قائمة بيضاء مع حظر الشبكات الخاصة والـ loopback.',
    suggestedPatch: `--- a/src/controllers/webhookController.ts
+++ b/src/controllers/webhookController.ts
@@ -86,3 +86,4 @@
-const response = await fetch(req.body.targetWebhookUrl, { method: "POST", body: payload });
+import { assertSafeOutboundUrl } from '../security/ssrfGuard';
+await assertSafeOutboundUrl(req.body.targetWebhookUrl);
+const response = await fetch(req.body.targetWebhookUrl, { method: "POST", body: payload });`,
    status: 'open'
  },
  {
    id: 'vuln-04',
    title: 'Exposure of Sensitive Bearer Token in System Logs',
    titleAr: 'تسريب رمز وصول حساس (Bearer Token) داخل سجلات النظام',
    ruleId: 'gitarmor-log-leak-token',
    cwe: 'CWE-532: Insertion of Sensitive Information into Log File',
    owasp: 'A09:2021-Security Logging and Monitoring Failures',
    severity: 'medium',
    category: 'logging',
    file: 'src/middleware/authHandler.ts',
    line: 31,
    description: 'HTTP Authorization headers containing user JWT credentials are printed directly to stdout/console.log, where centralized log collectors store them in plaintext.',
    descriptionAr: 'تتم طباعة ترويسة التوثيق بما تحويه من رموز JWT في سجلات النظام العامة مما يؤدي لحفظها كنص صريح.',
    evidenceRaw: 'console.log(`[AUTH-DEBUG] Incoming bearer request: ${req.headers.authorization}`);',
    evidenceRedacted: redactSecretEvidence('console.log(`[AUTH-DEBUG] Incoming bearer request: ${req.headers.authorization}`);'),
    remediationSummary: 'Sanitize logs or redact header values using logger masks.',
    remediationSummaryAr: 'تطبيق قناع تشفير للسجلات وتجريد الترويسات الحساسة قبل طباعتها.',
    suggestedPatch: `--- a/src/middleware/authHandler.ts
+++ b/src/middleware/authHandler.ts
@@ -29,3 +29,3 @@
-console.log(\`[AUTH-DEBUG] Incoming bearer request: \${req.headers.authorization}\`);
+logger.info('[AUTH] Authorization request processed', { userId: req.user?.id });`,
    status: 'open'
  },
  {
    id: 'vuln-05',
    title: 'Missing CSRF Protection on Billing Modification Endpoint',
    titleAr: 'غياب الحماية من تزوير الطلبات عبر المواقع (CSRF) في عمليات ترقية الباقات',
    ruleId: 'semgrep-missing-csrf-token',
    cwe: 'CWE-352: Cross-Site Request Forgery',
    owasp: 'A01:2021-Broken Access Control',
    severity: 'low',
    category: 'auth',
    file: 'src/routes/billing.routes.ts',
    line: 56,
    description: 'POST mutation relies solely on cookies without verifying an anti-CSRF token or SameSite=Strict attribute.',
    descriptionAr: 'الطلب يقبل التعديل معتمداً على الكوكيز دون وجود رمز حماية ضد الـ CSRF.',
    evidenceRaw: 'router.post("/update-tier", updateSubscriptionTier);',
    evidenceRedacted: 'router.post("/update-tier", updateSubscriptionTier);',
    remediationSummary: 'Apply double-submit cookie or state-verifying CSRF protection middleware.',
    remediationSummaryAr: 'تطبيق برمجية وسيطة لفحص رموز الـ CSRF وتعيين SameSite=Strict.',
    suggestedPatch: `--- a/src/routes/billing.routes.ts
+++ b/src/routes/billing.routes.ts
@@ -54,3 +54,3 @@
-router.post("/update-tier", updateSubscriptionTier);
+router.post("/update-tier", verifyCsrfToken, updateSubscriptionTier);`,
    status: 'open'
  }
];

export const INITIAL_NOTIFICATIONS: SecurityNotification[] = [
  {
    id: 'notif-01',
    title: 'Critical Secret Detected in Branch',
    titleAr: 'تم رصد مفتاح سري حرج في فرع الكود',
    message: 'Stripe API live key exposed in billing.config.ts (Line 14). Immediate rotation advised.',
    messageAr: 'مفتاح Stripe حقيقي مكشوف في billing.config.ts (سطر 14). يُوصى بتدويره فوراً.',
    timestamp: '2 mins ago',
    severity: 'critical',
    read: false,
    repo: 'fintech-secure/core-api'
  },
  {
    id: 'notif-02',
    title: 'SQL Injection Blocked on CI Gate',
    titleAr: 'تم منع دمج ثغرة SQL Injection في فحص CI',
    message: 'Pull Request #42 failed security threshold (Score 58/100). Auto-fix branch created.',
    messageAr: 'فشل فحص الأمان لطلب السحب #42 (الدرجة 58/100). تم تجهيز فرع الإصلاح التلقائي.',
    timestamp: '18 mins ago',
    severity: 'critical',
    read: false,
    repo: 'fintech-secure/core-api'
  },
  {
    id: 'notif-03',
    title: 'Automated PR Created: gitarmor/fix-vuln-01',
    titleAr: 'تم فتح طلب سحب تلقائي: gitarmor/fix-vuln-01',
    message: 'Surgical patch submitted to gitarmor/fix-vuln-01. Ready for developer review.',
    messageAr: 'تم رفع ترقيع جراحي للفرع gitarmor/fix-vuln-01 وجاهز للمراجعة والدمج.',
    timestamp: '1 hour ago',
    severity: 'low',
    read: true,
    repo: 'acme-corp/payment-service'
  }
];

export const INITIAL_INTEGRATIONS: IntegrationConfig[] = [
  {
    id: 'github_actions',
    name: 'GitHub Actions & Webhooks',
    nameAr: 'تكامل GitHub Actions والـ Webhooks',
    connected: true,
    targetChannelOrProject: 'fintech-secure/core-api',
    webhookUrl: 'https://api.gitarmor.dev/webhooks/gh-push',
    autoSyncPRs: true,
    notifyOnCritical: true
  },
  {
    id: 'jira',
    name: 'Jira Software Cloud',
    nameAr: 'نظام إدارة المشاريع Jira',
    connected: true,
    targetChannelOrProject: 'SEC-SPRINT-2026',
    autoSyncPRs: true,
    notifyOnCritical: true
  },
  {
    id: 'slack',
    name: 'Slack Security Alerts',
    nameAr: 'قناة تنبيهات Slack الأمنية',
    connected: true,
    targetChannelOrProject: '#secops-alerts',
    webhookUrl: 'https://hooks.slack.com/services/T00/B00/XXXXX',
    autoSyncPRs: false,
    notifyOnCritical: true
  },
  {
    id: 'trello',
    name: 'Trello Board Sync',
    nameAr: 'لوحة مهام Trello',
    connected: false,
    targetChannelOrProject: 'Security Backlog',
    autoSyncPRs: false,
    notifyOnCritical: false
  }
];

export const BILLING_PLANS: BillingPlan[] = [
  {
    id: 'free',
    name: 'Developer Free',
    nameAr: 'المطور (مجانية)',
    priceUSD: 0,
    billingPeriod: 'monthly',
    scansLimit: 10,
    scansUsed: 4,
    aiTokensLimit: 100000,
    aiTokensUsed: 38400,
    autoFixEnabled: false,
    teamSeats: 1,
    features: [
      '1 Monitored GitHub Repository',
      '10 Automated Audits / month',
      'Deterministic SAST & Secrets Scan',
      'The Artifact Trinity (.md, .json, .txt)',
      'Community Discord Support'
    ],
    featuresAr: [
      'مستودع كود واحد على GitHub',
      '10 عمليات فحص أمني شهرياً',
      'فحص الأسرار والثغرات الحتمية',
      'الوثائق الثلاثية (.md, .json, .txt)',
      'دعم عبر مجتمع المطورين'
    ]
  },
  {
    id: 'pro',
    name: 'Pro Security',
    nameAr: 'المحترف (Pro)',
    priceUSD: 49,
    billingPeriod: 'monthly',
    scansLimit: 100,
    scansUsed: 26,
    aiTokensLimit: 2000000,
    aiTokensUsed: 620000,
    autoFixEnabled: true,
    teamSeats: 5,
    features: [
      'Unlimited Public & Private Repositories',
      'Surgical Auto-Remediation PRs (gitarmor/fix-*)',
      'Interactive Co-Pilot AI Security Engineer',
      'Secret Redaction & Token Masking Vault',
      'Jira, Trello, & Slack Integrations',
      'Full CI/CD GitHub Actions Gating'
    ],
    featuresAr: [
      'عدد غير محدود من المستودعات الخاصة والعامة',
      'إنشاء طلبات سحب جراحية تلقائية للحلول',
      'المساعد التفاعلي الذكي Co-Pilot للأمان',
      'محرك حجب وتشفير الأسرار المتقدم',
      'تكامل فوري مع جيرا، تريلو، وسلاك',
      'بوابة أمان كاملة مع GitHub Actions'
    ]
  },
  {
    id: 'team',
    name: 'Enterprise Team',
    nameAr: 'المؤسسات (Team)',
    priceUSD: 199,
    billingPeriod: 'monthly',
    scansLimit: 1000,
    scansUsed: 142,
    aiTokensLimit: 10000000,
    aiTokensUsed: 2100000,
    autoFixEnabled: true,
    teamSeats: 30,
    features: [
      'Multi-Tenant Organization Workspaces',
      'Custom SAST & Compliance Rule Engine',
      'Dedicated Priority Gemini 2.5 Flash Queue',
      'SOC 2 & PCI-DSS Periodic Audit Reports',
      'Custom Webhooks & SLA Guarantee',
      '24/7 Dedicated DevSecOps Architect'
    ],
    featuresAr: [
      'إدارة مساحات عمل المؤسسات المتعددة',
      'محرك قواعد مخصص لمعايير الامتثال',
      'أولوية معالجة قصوى عبر Gemini 2.5',
      'تقارير دورية معتمدة لـ SOC 2 و PCI-DSS',
      'اتفاقية مستوى خدمة SLA ودعم مخصص 24/7'
    ]
  }
];

export const INITIAL_MEMBERS: TeamMember[] = [
  {
    id: 'mem-1',
    name: 'Ahmed Mansour',
    email: 'ahmed@fintech-secure.com',
    role: 'owner',
    avatar: 'AM',
    lastActive: 'Active now',
    assignedTasks: 2
  },
  {
    id: 'mem-2',
    name: 'Sarah Jenkins',
    email: 'sarah.j@fintech-secure.com',
    role: 'devsecops',
    avatar: 'SJ',
    lastActive: '12m ago',
    assignedTasks: 4
  },
  {
    id: 'mem-3',
    name: 'Omar Farooq',
    email: 'omar.f@fintech-secure.com',
    role: 'developer',
    avatar: 'OF',
    lastActive: '1h ago',
    assignedTasks: 1
  }
];
