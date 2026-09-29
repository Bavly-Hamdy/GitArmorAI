import React from 'react';
import { ScanResult } from '../types';
import { InteractiveScanner } from './InteractiveScanner';
import { Shield, Lock, Cpu, GitBranch, ArrowLeft, ArrowRight, CheckCircle2, Terminal } from 'lucide-react';

interface AuditServiceViewProps {
  onScanComplete: (result: ScanResult) => void;
  onNavigateHome: () => void;
  lang?: 'ar' | 'en';
}

export function AuditServiceView({
  onScanComplete,
  onNavigateHome,
  lang = 'en'
}: AuditServiceViewProps) {
  const isAr = lang === 'ar';

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-2">
      {/* Top Breadcrumb & Status */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-neutral-200/80 dark:border-neutral-800/80">
        <div className="flex items-center gap-2 text-xs font-mono text-neutral-500 dark:text-neutral-400">
          <button
            onClick={onNavigateHome}
            className="hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer flex items-center gap-1"
          >
            <span>{isAr ? 'الرئيسية (Overview)' : 'Overview'}</span>
          </button>
          <span className="text-neutral-300 dark:text-neutral-700">/</span>
          <span className="text-neutral-900 dark:text-white font-medium">
            {isAr ? 'خدمة الفحص الأمني' : 'Security Scanner Service'}
          </span>
          <span className="text-neutral-300 dark:text-neutral-700">/</span>
          <span className="text-[10px] font-mono bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-1.5 py-0.5 rounded">
            SANDBOX ACTIVE
          </span>
        </div>

        {/* Security Specs Chips */}
        <div className="flex items-center gap-3 text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3 text-neutral-400" />
            <span>Ephemeral Memory</span>
          </span>
          <span className="hidden sm:inline text-neutral-300 dark:text-neutral-700">·</span>
          <span className="flex items-center gap-1">
            <Cpu className="w-3 h-3 text-neutral-400" />
            <span>Gemini 2.5 Flash</span>
          </span>
        </div>
      </div>

      {/* Header Info */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">
          {isAr ? 'منصة الفحص والتدقيق الأمني المستقل' : 'Autonomous DevSecOps Audit Runner'}
        </h1>
        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 max-w-3xl leading-relaxed">
          {isAr
            ? 'اربط مستودعك عبر GitHub أو ابحث في المستودعات العامة أو الصق كوداً برمجياً مخصصاً. يقوم المحرك ببناء شجرة AST متكاملة وتتبع مسار البيانات ورصد الثغرات والأسرار دون لمس فرع الإنتاج.'
            : 'Select any public or private GitHub repository or paste source files directly. GitArmor parses your AST in memory, maps potential dataflow taint paths, and generates precision remediation diffs.'}
        </p>
      </div>

      {/* The Core Service Component */}
      <div className="bg-white dark:bg-[#111115] border border-neutral-200/90 dark:border-neutral-800/90 rounded-2xl shadow-sm p-4 sm:p-7">
        <InteractiveScanner
          onScanComplete={onScanComplete}
          lang={lang}
        />
      </div>

      {/* Quick Runner Tips */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 space-y-1.5">
          <div className="font-semibold text-neutral-900 dark:text-white font-mono flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>{isAr ? 'بيئة منعزلة تماماً' : 'Ephemeral Runner'}</span>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed text-[11px]">
            {isAr
              ? 'تتم معالجة المستودعات في حاوية ذاكرة مؤقتة وتُحذف فور انتهاء التدقيق.'
              : 'Repos are cloned to an in-memory ephemeral volume and pruned immediately.'}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 space-y-1.5">
          <div className="font-semibold text-neutral-900 dark:text-white font-mono flex items-center gap-1.5">
            <GitBranch className="w-3.5 h-3.5 text-neutral-500" />
            <span>{isAr ? 'فروع منعزلة للـ PR' : 'Protected Branch Invariant'}</span>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed text-[11px]">
            {isAr
              ? 'لا يتم إرسال أي Commit مباشر لـ main. تصدر جميع الإصلاحات كفروع gitarmor/fix-*.'
              : 'Main branch remains untouched. Fixes are dispatched to dedicated branches.'}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 space-y-1.5">
          <div className="font-semibold text-neutral-900 dark:text-white font-mono flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-amber-500" />
            <span>{isAr ? 'طمس الأسرار والمفاتيح' : 'Token Masking'}</span>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed text-[11px]">
            {isAr
              ? 'أي مفاتيح سحابية أو أسرار تُطمس آلياً قبل تحليل الذكاء الاصطناعي لحمايتها.'
              : 'Production credentials are automatically redacted before sending AST payloads.'}
          </p>
        </div>
      </div>
    </div>
  );
}
