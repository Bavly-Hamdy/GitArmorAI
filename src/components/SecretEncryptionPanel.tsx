import React from 'react';
import { KeyRound, ShieldCheck, Eye, EyeOff, Lock, Copy, Check } from 'lucide-react';
import { redactSecretEvidence } from '../services/securityEngine';

interface SecretEncryptionPanelProps {
  lang?: 'ar' | 'en';
}

export function SecretEncryptionPanel({ lang = 'en' }: SecretEncryptionPanelProps) {
  const isAr = lang === 'ar';
  const defaultSample = `// API Configuration & Secrets
const stripeApiKey = "sk_demo_mock_stripe_key_remediated_example";
const githubToken = "github_pat_EXAMPLE_REDACTION_DEMO_KEY_MOCK";
const awsAccessKey = "AKIAIOSFODNN7EXAMPLE";
const dbUrl = "postgres://admin:SuperSecretPass123!@db.internal:5432/finance";
`;

  const [inputCode, setInputCode] = React.useState(defaultSample);
  const [revealed, setRevealed] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const redactedResult = React.useMemo(() => {
    return redactSecretEvidence(inputCode);
  }, [inputCode]);

  const handleCopy = () => {
    navigator.clipboard.writeText(revealed ? inputCode : redactedResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 sm:p-6 space-y-5 sm:space-y-6 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-800 dark:text-neutral-200 shrink-0">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <span>{isAr ? 'محرك حجب الأسرار وتشفير البيانات' : 'Secret Redaction & Token Vault'}</span>
              <span className="text-[10px] bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 px-2 py-0.5 rounded font-mono">
                SHA-256
              </span>
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {isAr
                ? 'فحص تلقائي وحجب فوري للأسرار الحساسة والرموز الأمنية قبل عرضها لمنع أي تسريب.'
                : 'Automated pattern masking and zero-knowledge encryption for secrets, keys, and credentials.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => setRevealed(!revealed)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-750 rounded-lg transition-colors border border-neutral-300 dark:border-neutral-700 cursor-pointer shadow-2xs"
          >
            {revealed ? <EyeOff className="w-3.5 h-3.5 text-amber-600" /> : <Eye className="w-3.5 h-3.5" />}
            <span>
              {revealed
                ? (isAr ? 'إخفاء الأسرار (Redact)' : 'Mask Secrets')
                : (isAr ? 'كشف البيانات الأصلية' : 'Reveal Raw')}
            </span>
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-neutral-950 hover:bg-neutral-850 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-white rounded-lg transition-colors cursor-pointer shadow-2xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? (isAr ? 'تم النسخ' : 'Copied') : (isAr ? 'نسخ النتيجة' : 'Copy Output')}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input box */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs text-neutral-600 dark:text-neutral-400">
            <span className="font-medium">{isAr ? 'مدخل الكود أو المتغيرات الحساسة:' : 'Source Code or Config:'}</span>
            <span className="text-[11px] font-mono text-neutral-400">Live Input</span>
          </div>
          <textarea
            value={inputCode}
            onChange={e => setInputCode(e.target.value)}
            rows={7}
            className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-lg p-3 font-mono text-xs text-neutral-900 dark:text-white focus:outline-hidden focus:border-neutral-900 dark:focus:border-white dir-ltr text-left resize-none leading-relaxed shadow-2xs"
            placeholder="// Paste code with exposed API keys or tokens..."
          />
        </div>

        {/* Output box */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs text-neutral-600 dark:text-neutral-400">
            <span className="font-medium text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isAr ? 'المخرجات بعد الفحص والحجب الآلي:' : 'Protected / Masked Output:'}</span>
            </span>
            <span className="text-[11px] text-neutral-500 font-mono">
              {revealed ? 'RAW UNMASKED' : 'MASKED SAFE'}
            </span>
          </div>
          <div className="w-full h-[142px] bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-lg p-3 font-mono text-xs overflow-y-auto dir-ltr text-left leading-relaxed shadow-2xs">
            <pre className={revealed ? 'text-amber-800 dark:text-amber-300' : 'text-neutral-800 dark:text-neutral-200'}>
              {revealed ? inputCode : redactedResult}
            </pre>
          </div>
        </div>
      </div>

      {/* Safety specs footer */}
      <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-500 dark:text-neutral-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-neutral-700 dark:text-neutral-300">
            <KeyRound className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-400" />
            <span>{isAr ? 'اكتشاف الأسرار عبر RegEx وسياق AST' : 'Heuristic regex + AST detection'}</span>
          </span>
          <span className="text-neutral-300 dark:text-neutral-700">·</span>
          <span>{isAr ? 'عزل تام لكل عملية' : 'Ephemeral sandbox isolation'}</span>
        </div>

        <span className="text-neutral-400 text-[11px] font-mono">
          TLS 1.3 · Client-Side Redaction
        </span>
      </div>
    </div>
  );
}
