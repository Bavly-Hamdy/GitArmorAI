import React from 'react';
import { Cpu, GitPullRequest, Lock, Bot, Workflow, Layers, CheckCircle2 } from 'lucide-react';

interface FeaturesBentoProps {
  lang?: 'ar' | 'en';
}

export function FeaturesBento({ lang = 'en' }: FeaturesBentoProps) {
  const isAr = lang === 'ar';

  return (
    <div className="space-y-8">
      {/* Editorial Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2 mb-8">
        <div className="flex items-center justify-center gap-2 text-xs font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          <span>{isAr ? 'المواصفات التقنية' : 'Architecture Specifications'}</span>
          <span className="text-neutral-300 dark:text-neutral-700">/</span>
          <span>{isAr ? 'محرك فحص متقدم' : 'Zero-Fatigue SAST Engine'}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">
          {isAr
            ? 'بنية DevSecOps المتكاملة وهندسة الأمان الذاتي'
            : 'Autonomous DevSecOps Engineering & Architecture'}
        </h2>
        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
          {isAr
            ? 'صُممت منصة GitArmor AI لإنهاء معضلة كثرة الإنذارات الكاذبة وتسريع معالجة الثغرات من أسابيع إلى ثوانٍ دون تعطيل سير عمل المطورين.'
            : 'Engineered to eradicate false-positive fatigue and compress remediation MTTR from weeks to seconds without disrupting developer velocity.'}
        </p>
      </div>

      {/* Clean Minimalist Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Hybrid Detection Engine (Span 2) */}
        <div className="md:col-span-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 sm:p-7 flex flex-col justify-between hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors shadow-2xs">
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-medium text-neutral-500 dark:text-neutral-400">
                01 / {isAr ? 'الفحص الهجين بالسياق' : 'Hybrid Contextual Reasoning'}
              </span>
              <div className="w-7 h-7 rounded-md bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-700 dark:text-neutral-300">
                <Cpu className="w-3.5 h-3.5" />
              </div>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white">
              {isAr
                ? 'دمج الأدوات الحتمية (SAST) مع استنتاج Google Gemini 3.8 Flash'
                : 'Deterministic AST + Google Gemini 3.8 Flash Context'}
            </h3>

            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {isAr
                ? 'لا نعتمد فقط على فحص الكلمات المفتاحية بل نحلل تدفق البيانات الكامل (Dataflow Analysis) وتتبع مسار المدخلات حتى الوصول إلى دوال الاستعلام والـ APIs، مما يستبعد أكثر من 94% من التنبيهات الكاذبة.'
                : 'Traces full inter-file dataflow and taint analysis via deep context window to eliminate false positives while pinpointing real exploit paths.'}
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex flex-wrap items-center gap-2 text-xs">
            <span className="font-mono px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-[11px] border border-neutral-200 dark:border-neutral-700">gitleaks-ast</span>
            <span className="font-mono px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-[11px] border border-neutral-200 dark:border-neutral-700">semgrep-rulepack</span>
            <span className="font-mono px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-[11px] border border-neutral-200 dark:border-neutral-700">Gemini 3.8 Flash</span>
            <span className="font-mono px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-[11px] border border-neutral-200 dark:border-neutral-700">OSV CVE Feed</span>
          </div>
        </div>

        {/* Card 2: Secret Redaction Vault (Span 1) */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 sm:p-7 flex flex-col justify-between hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors shadow-2xs">
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-medium text-neutral-500 dark:text-neutral-400">
                02 / {isAr ? 'حماية وطمس الأسرار' : 'Secret Redaction'}
              </span>
              <div className="w-7 h-7 rounded-md bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-700 dark:text-neutral-300">
                <Lock className="w-3.5 h-3.5" />
              </div>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white">
              {isAr ? 'محرك حجب البيانات الحساسة' : 'Zero-Leak Redaction Engine'}
            </h3>

            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {isAr
                ? 'طمس تلقائي لمفاتيح API وكلمات المرور والرموز المشفرة قبل عرضها في التقارير لمنع أي تسريب ثانوي مع تشفير تام للقيم الأصلية.'
                : 'Automatically masks API credentials, private keys, and passwords before UI rendering or export.'}
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800 font-mono text-[11px] text-neutral-500 dark:text-neutral-400">
            SHA-256 · Redacted by default
          </div>
        </div>

        {/* Card 3: Surgical Auto-Fix PRs (Span 1) */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 sm:p-7 flex flex-col justify-between hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors shadow-2xs">
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-medium text-neutral-500 dark:text-neutral-400">
                03 / {isAr ? 'إصلاح جراحي آمن' : 'Surgical Auto-Fix'}
              </span>
              <div className="w-7 h-7 rounded-md bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-700 dark:text-neutral-300">
                <GitPullRequest className="w-3.5 h-3.5" />
              </div>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white">
              {isAr ? 'طلبات سحب منعزلة لا تلمس main' : 'Isolated PRs · Never Touches Main'}
            </h3>

            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {isAr
                ? 'ينشئ النظام ترقيعات برمجية دقيقة ويفتح Pull Requests على فروع فرعية مخصصة gitarmor/fix-* للمراجعة دون دفع أي كود للإنتاج.'
                : 'Surgical unified diff patches provisioned strictly on separate branches for human review and CI verification.'}
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800 font-mono text-[11px] text-neutral-500 dark:text-neutral-400">
            branch: gitarmor/fix-*
          </div>
        </div>

        {/* Card 4: The Artifact Trinity (Span 2) */}
        <div className="md:col-span-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 sm:p-7 flex flex-col justify-between hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors shadow-2xs">
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-medium text-neutral-500 dark:text-neutral-400">
                04 / {isAr ? 'الوثائق الثلاثية' : 'The Artifact Trinity'}
              </span>
              <div className="w-7 h-7 rounded-md bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-700 dark:text-neutral-300">
                <Layers className="w-3.5 h-3.5" />
              </div>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white">
              {isAr
                ? 'توليد تلقائي: report.md و implementation-plan.md و agent-prompt.txt'
                : 'Triple Automated Artifacts per Scan'}
            </h3>

            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {isAr
                ? 'يحصل المطور على تقرير تدقيق أمني شامل، وخطة عمل تنفيذية مرتبة حسب أولوية السبرنت، وموجه وكيل ذكي جاهز للاستخدام المباشر مع Cursor و Claude Code.'
                : 'Zero-friction handoff: structured audit report, prioritized implementation backlog, and pre-prompted AI agent instruction file.'}
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200/80 dark:border-neutral-700/80 font-mono text-[11px] text-neutral-800 dark:text-neutral-200">
              report.md / .json
            </div>
            <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200/80 dark:border-neutral-700/80 font-mono text-[11px] text-neutral-800 dark:text-neutral-200">
              implementation-plan.md
            </div>
            <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200/80 dark:border-neutral-700/80 font-mono text-[11px] text-neutral-800 dark:text-neutral-200">
              agent-prompt.txt
            </div>
          </div>
        </div>

        {/* Card 5: CI/CD & Project Management Integration */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 sm:p-7 flex flex-col justify-between hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors shadow-2xs">
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-medium text-neutral-500 dark:text-neutral-400">
                05 / {isAr ? 'تكامل سير العمل' : 'Workflow Sync'}
              </span>
              <div className="w-7 h-7 rounded-md bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-700 dark:text-neutral-300">
                <Workflow className="w-3.5 h-3.5" />
              </div>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white">
              {isAr ? 'ربط فوري مع Jira و Slack و GitHub Actions' : 'Jira, Slack & GitHub Actions'}
            </h3>

            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {isAr
                ? 'تحويل الثغرات لتذاكر مهام تلقائية وإرسال إشعارات فورية لفرق التطوير عند أي خطر أمني حرج مع دعم كامل للـ Webhooks.'
                : 'Turn security findings into synchronized task tickets and real-time incident alerts for development squads.'}
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800 font-mono text-[11px] text-neutral-500 dark:text-neutral-400">
            REST API & Webhooks
          </div>
        </div>

        {/* Card 6: AI Co-Pilot Security Architect (Span 2) */}
        <div className="md:col-span-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 sm:p-7 flex flex-col justify-between hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors shadow-2xs">
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-medium text-neutral-500 dark:text-neutral-400">
                06 / {isAr ? 'المساعد التفاعلي Co-Pilot' : 'Autonomous Co-Pilot'}
              </span>
              <div className="w-7 h-7 rounded-md bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-700 dark:text-neutral-300">
                <Bot className="w-3.5 h-3.5" />
              </div>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white">
              {isAr
                ? 'مهندس أمن سيبراني استشاري متاح على مدار الساعة'
                : 'On-Demand Principal DevSecOps Security Engineer'}
            </h3>

            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {isAr
                ? 'يمكنك مناقشة أي ثغرة مكتشفة مع المساعد الذكي، والحصول على سيناريوهات الاختراق وطرق استغلالها من المهاجمين، مع اقتراح كود برمجي محصن ومطابق لأحدث معايير الأمان.'
                : 'Query any vulnerability context, simulate attacker exploit mechanics, and receive verified, drop-in replacement code.'}
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-neutral-900 dark:text-white" />
            <span>{isAr ? 'إجابات مؤسسة على ملفات الكود الفعلية ومعايير OWASP' : 'Grounded on actual code context and CWE taxonomies'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
