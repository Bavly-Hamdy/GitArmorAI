import React from 'react';
import { GitArmorLogo } from './GitArmorLogo';

interface FooterProps {
  onNavigate: (view: 'landing' | 'audit' | 'dashboard' | 'features') => void;
  lang?: 'ar' | 'en';
}

export function Footer({ onNavigate, lang = 'en' }: FooterProps) {
  const isAr = lang === 'ar';

  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-xs text-neutral-600 dark:text-neutral-400 py-12 mt-16 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <GitArmorLogo size="sm" showWordmark={true} lang={lang} />
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              {isAr
                ? 'منصة DevSecOps سحابية مستقلة لفحص أمان الكود تلقائياً ومعالجة الثغرات جراحياً عبر استنتاج الذكاء الاصطناعي.'
                : 'Autonomous DevSecOps platform for continuous vulnerability auditing and surgical code remediation.'}
            </p>
          </div>

          {/* Product links */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-neutral-900 dark:text-white uppercase tracking-wider font-mono">
              {isAr ? 'المنتج' : 'Product'}
            </h4>
            <ul className="space-y-1.5">
              <li>
                <button
                  onClick={() => onNavigate('audit')}
                  className="hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
                >
                  {isAr ? 'خدمة الفحص الأمني (Scanner)' : 'Security Scanner Service'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
                >
                  {isAr ? 'لوحة الأمان التفاعلية' : 'Security Dashboard'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('features')}
                  className="hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
                >
                  {isAr ? 'الفحص الهجين و Gemini' : 'Hybrid SAST & Gemini'}
                </button>
              </li>
              <li>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>{isAr ? 'مجاني ومفتوح المصدر 100%' : '100% Free & Open-Source'}</span>
                </span>
              </li>
            </ul>
          </div>

          {/* Standards & Guidelines */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-neutral-900 dark:text-white uppercase tracking-wider font-mono">
              {isAr ? 'المعايير الأمنية' : 'Security Standards'}
            </h4>
            <ul className="space-y-1.5">
              <li>
                <span className="text-neutral-500 dark:text-neutral-400 font-mono">
                  OWASP Top 10 (2021)
                </span>
              </li>
              <li>
                <span className="text-neutral-500 dark:text-neutral-400 font-mono">
                  CWE / SANS Top 25
                </span>
              </li>
              <li>
                <span className="text-neutral-500 dark:text-neutral-400 font-mono">
                  SOC 2 & ISO 27001
                </span>
              </li>
            </ul>
          </div>

          {/* Compliance & Standards */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-neutral-900 dark:text-white uppercase tracking-wider font-mono">
              {isAr ? 'الامتثال والمعايير' : 'Compliance'}
            </h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              {isAr
                ? 'متوافق مع أطر OWASP Top 10 ومعايير ISO 27001 و SOC 2 Type II وتشفير تام في بيئة معزولة.'
                : 'OWASP Top 10, CWE / SANS, ISO 27001, and SOC 2 Type II verified architecture.'}
            </p>
          </div>
        </div>

        {/* Hairline Divider & Bottom Copyright */}
        <div className="pt-6 border-t border-neutral-100 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-400 text-center sm:text-start">
          <div>
            © {new Date().getFullYear()} GitArmor AI. {isAr ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-[11px] sm:text-xs font-mono">
            <span>Deterministic SAST</span>
            <span>·</span>
            <span>Zero-Leak Redaction</span>
            <span>·</span>
            <span>No-Slop Design</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
