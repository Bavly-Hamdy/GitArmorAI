import React from 'react';
import { X, Copy, Check } from 'lucide-react';

interface DiffViewerProps {
  patch: string;
  file: string;
  onClose: () => void;
  lang?: 'ar' | 'en';
}

export function DiffViewer({ patch, file, onClose, lang = 'ar' }: DiffViewerProps) {
  const [copied, setCopied] = React.useState(false);
  const isAr = lang === 'ar';

  const handleCopy = () => {
    navigator.clipboard.writeText(patch);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = patch.split('\n');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-950/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span className="text-xs font-mono text-neutral-900 dark:text-white font-medium truncate max-w-[140px] sm:max-w-md">
              {file}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-750 border border-neutral-300 dark:border-neutral-700 rounded-md transition-colors cursor-pointer shadow-2xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? (isAr ? 'تم النسخ' : 'Copied') : (isAr ? 'نسخ الترقيع' : 'Copy Patch')}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-md transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Diff Content */}
        <div className="p-4 overflow-y-auto font-mono text-xs leading-relaxed bg-neutral-50 dark:bg-neutral-950 dir-ltr text-left">
          {lines.map((line, idx) => {
            const isAddition = line.startsWith('+');
            const isDeletion = line.startsWith('-');
            const isHeader = line.startsWith('@@') || line.startsWith('---') || line.startsWith('+++');

            let lineStyle = 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900';
            if (isAddition) lineStyle = 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-400 border-l-2 border-emerald-600 dark:border-emerald-500 pl-2';
            else if (isDeletion) lineStyle = 'bg-rose-50 dark:bg-rose-500/15 text-rose-800 dark:text-rose-400 border-l-2 border-rose-600 dark:border-rose-500 pl-2';
            else if (isHeader) lineStyle = 'text-neutral-900 dark:text-white font-semibold bg-neutral-200/60 dark:bg-neutral-800 px-2 py-0.5 rounded-xs my-1';

            return (
              <div key={idx} className={`py-0.5 px-2.5 transition-colors font-mono ${lineStyle}`}>
                <span className="inline-block w-8 text-neutral-400 dark:text-neutral-600 select-none text-[10px]">
                  {idx + 1}
                </span>
                <span>{line}</span>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="px-5 py-3 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
          <span>{isAr ? 'ترقيع جراحي متوافق مع معايير Git ومختبر بالسياق' : 'Surgical unified patch verified against AST context'}</span>
          <span className="font-mono text-neutral-400">git diff -u</span>
        </div>
      </div>
    </div>
  );
}
