import React from 'react';
import { ArtifactTrinity } from '../types';
import { FileText, Download, Copy, Check, X, Shield, Terminal, ListOrdered } from 'lucide-react';

interface ArtifactTrinityModalProps {
  artifacts: ArtifactTrinity;
  repository: string;
  onClose: () => void;
  lang?: 'ar' | 'en';
}

export function ArtifactTrinityModal({ artifacts, repository, onClose, lang = 'ar' }: ArtifactTrinityModalProps) {
  const [activeTab, setActiveTab] = React.useState<'report' | 'plan' | 'prompt' | 'json'>('report');
  const [copied, setCopied] = React.useState(false);
  const isAr = lang === 'ar';

  const getContent = () => {
    switch (activeTab) {
      case 'report':
        return { text: artifacts.reportMarkdown, filename: 'report.md', ext: 'markdown' };
      case 'plan':
        return { text: artifacts.implementationPlanMarkdown, filename: 'implementation-plan.md', ext: 'markdown' };
      case 'prompt':
        return { text: artifacts.agentPromptText, filename: 'agent-prompt.txt', ext: 'text' };
      case 'json':
        return { text: artifacts.reportJson, filename: 'report.json', ext: 'json' };
    }
  };

  const current = getContent();

  const handleCopy = () => {
    navigator.clipboard.writeText(current.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([current.text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = current.filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-neutral-950/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[94vh] sm:max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-md bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-800 dark:text-neutral-200 shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <span>{isAr ? 'الوثائق الثلاثية للأمان' : 'The Artifact Trinity'}</span>
                <span className="text-[11px] text-neutral-500 font-mono truncate max-w-[120px] sm:max-w-none">({repository})</span>
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                {isAr
                  ? 'مخرجات الفحص الثلاثية: تقرير التدقيق، خطة التنفيذ بالأولويات، وموجه الوكيل الذكي'
                  : 'Automated post-scan outputs: audit report, prioritized implementation plan, and agent prompt'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-md transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Bar & Action Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-6 py-2.5 bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-1.5 p-1 bg-neutral-200/60 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs overflow-x-auto scrollbar-none whitespace-nowrap">
            <button
              onClick={() => setActiveTab('report')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                activeTab === 'report'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>report.md</span>
            </button>

            <button
              onClick={() => setActiveTab('plan')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                activeTab === 'plan'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5" />
              <span>plan.md</span>
            </button>

            <button
              onClick={() => setActiveTab('prompt')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                activeTab === 'prompt'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>agent-prompt.txt</span>
            </button>

            <button
              onClick={() => setActiveTab('json')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                activeTab === 'json'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <span className="font-mono text-[10px]">{'{ }'}</span>
              <span>report.json</span>
            </button>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-750 border border-neutral-300 dark:border-neutral-700 rounded-md transition-colors cursor-pointer shadow-2xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? (isAr ? 'تم النسخ' : 'Copied') : (isAr ? 'نسخ' : 'Copy')}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-neutral-950 hover:bg-neutral-850 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-white rounded-md transition-colors cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isAr ? 'تنزيل الملف' : 'Download'}</span>
            </button>
          </div>
        </div>

        {/* Content Viewer */}
        <div className="flex-1 p-3.5 sm:p-6 overflow-y-auto bg-neutral-50 dark:bg-neutral-950 font-mono text-xs leading-relaxed text-neutral-800 dark:text-neutral-200 dir-ltr text-left">
          <pre className="whitespace-pre-wrap break-all">{current.text}</pre>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 text-xs text-neutral-500 dark:text-neutral-400">
          <span>
            {isAr
              ? 'جاهز للاستخدام المباشر مع Cursor أو Windsurf أو وكلاء الذكاء الاصطناعي المحليين'
              : 'Directly ingestible into Cursor, Windsurf, Claude Code, or Local AI Agents'}
          </span>
          <span className="font-mono text-neutral-900 dark:text-white font-medium">{current.filename}</span>
        </div>
      </div>
    </div>
  );
}
