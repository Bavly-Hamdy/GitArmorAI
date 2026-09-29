import React from 'react';
import { ArrowRight, CheckCircle2, Github, Terminal } from 'lucide-react';
import { GitArmorEmblem } from './GitArmorLogo';

interface HeroSectionProps {
  onStartFreeAudit: () => void;
  lang?: 'ar' | 'en';
}

export function HeroSection({ onStartFreeAudit, lang = 'en' }: HeroSectionProps) {
  const isAr = lang === 'ar';

  return (
    <section className="relative pt-6 pb-14 lg:pt-12 lg:pb-20">
      <div className="max-w-4xl mx-auto text-center space-y-7">
        {/* Brand Emblem Icon with Ambient Ring */}
        <div className="flex justify-center">
          <div className="p-2 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors">
            <GitArmorEmblem size={40} />
          </div>
        </div>

        {/* Anti-AI Kicker: Clean unboxed monospaced metadata */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] sm:text-xs font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>{isAr ? 'منصة الأمان المستقلة' : 'Autonomous DevSecOps Platform'}</span>
          <span aria-hidden="true" className="text-neutral-300 dark:text-neutral-700">/</span>
          <span>{isAr ? 'فحص حتمي واستنتاج سياقي' : 'Deterministic SAST & Deep Reasoning'}</span>
        </div>

        {/* Minimalist Editorial Headline */}
        <h1 className="text-2xl xs:text-3xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 dark:text-white tracking-tight leading-[1.15] text-balance">
          {isAr ? (
            <>
              فحص أمان الكود تلقائياً
              <br />
              <span className="text-neutral-600 dark:text-neutral-400 font-medium">
                ومعالجة الثغرات جراحياً
              </span>{' '}
              دون تعريض الإنتاج
            </>
          ) : (
            <>
              Autonomous Code Security Audits
              <br />
              <span className="text-neutral-600 dark:text-neutral-400 font-medium">
                & Surgical Auto-Remediation
              </span>
            </>
          )}
        </h1>

        {/* Quiet Editorial Value Proposition */}
        <p className="text-sm sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed px-1">
          {isAr
            ? 'منصة DevSecOps سحابية تفحص الأكواد المصدرية والمستودعات في بيئة منعزلة، ترصد الثغرات الحرجة والأسرار المسربة، وتنشئ طلبات سحب علاجية (Pull Requests) جراحية بضغطة زر واحدة.'
            : 'Production-grade DevSecOps platform combining deterministic AST analysis with Gemini contextual reasoning. Eliminates false positives, masks exposed secrets, and opens surgical PRs.'}
        </p>

        {/* Clean Minimalist Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 pt-2 max-w-sm sm:max-w-none mx-auto w-full">
          <button
            onClick={onStartFreeAudit}
            className="w-full sm:w-auto min-h-[44px] px-6 py-3 bg-neutral-950 hover:bg-neutral-850 dark:bg-neutral-100 dark:hover:bg-white text-white dark:text-neutral-950 font-medium rounded-lg text-xs sm:text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{isAr ? 'الانتقال إلى خدمة الفحص الأمني' : 'Launch Security Scanner'}</span>
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </button>

          <a
            href="#why-gitarmor"
            onClick={(e) => {
              e.preventDefault();
              const el = document.getElementById('why-gitarmor') || document.getElementById('how-it-works');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-full sm:w-auto min-h-[44px] px-6 py-3 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border border-neutral-300 dark:border-neutral-700 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
          >
            <Terminal className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
            <span>{isAr ? 'شرح بنية ونظام المشروع' : 'How the Engine Works'}</span>
          </a>
        </div>

        {/* Proof & Trust Indicators (Clean hairline divider) */}
        <div className="pt-6 sm:pt-8 border-t border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-neutral-500 dark:text-neutral-400 font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-neutral-900 dark:text-neutral-200" />
            <span>{isAr ? 'دون تثبيت أي أدوات محلية' : 'Zero local CLI installation'}</span>
          </div>
          <span className="text-neutral-300 dark:text-neutral-700 hidden sm:inline">·</span>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-neutral-900 dark:text-neutral-200" />
            <span>{isAr ? 'حماية الإنتاج: لا دفع مباشر لـ main' : 'Zero direct commits to protected branches'}</span>
          </div>
          <span className="text-neutral-300 dark:text-neutral-700 hidden sm:inline">·</span>
          <div className="flex items-center gap-2">
            <Github className="w-3.5 h-3.5 text-neutral-900 dark:text-neutral-200" />
            <span>{isAr ? 'تكامل أصلي مع GitHub Actions' : 'GitHub native & Webhooks'}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
