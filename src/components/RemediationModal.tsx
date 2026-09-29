import React, { useState } from 'react';
import { Vulnerability } from '../types';
import { createRemediationPullRequest } from '../services/apiService';
import { getStoredGitHubUser, getStoredGitHubToken, saveStoredGitHubToken, saveStoredGitHubUser } from '../services/offlineStorage';
import {
  GitPullRequest,
  GitCommit,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  X,
  ExternalLink,
  Terminal,
  Copy,
  Check,
  Key,
  AlertCircle,
  ArrowRight,
  GitBranch,
  RotateCw,
} from 'lucide-react';

interface RemediationModalProps {
  vuln: Vulnerability;
  repository: string;
  onClose: () => void;
  onSuccess: (vulnId: string, prUrl: string, branch: string) => void;
  onReAudit?: () => void;
  lang?: 'ar' | 'en';
}

export function RemediationModal({ vuln, repository, onClose, onSuccess, onReAudit, lang = 'en' }: RemediationModalProps) {
  const isAr = lang === 'ar';
  const currentUser = getStoredGitHubUser();
  const persistentToken = getStoredGitHubToken() || currentUser?.token || '';

  const [submittingMode, setSubmittingMode] = useState<'pr' | 'direct' | null>(null);
  const [tokenInput, setTokenInput] = useState(persistentToken);
  const [showTokenInput, setShowTokenInput] = useState(!persistentToken);
  const [targetBranch, setTargetBranch] = useState('main');
  const [error, setError] = useState<string | null>(null);
  const [copiedCmd, setCopiedCmd] = useState(false);

  const [result, setResult] = useState<{
    prUrl?: string;
    commitUrl?: string;
    commitSha?: string;
    branch: string;
    instructions: string[];
    isLiveGitHubPR?: boolean;
    isLiveGitHubCommit?: boolean;
    commitMode?: 'pr' | 'direct';
    commitMessage?: string;
  } | null>(null);

  const defaultFixBranch = `gitarmor/patch-${vuln.id}`;

  const handleRemediate = async (mode: 'pr' | 'direct') => {
    setSubmittingMode(mode);
    setError(null);

    // Automatically use stored persistent token or input token
    const activeToken = tokenInput.trim() || persistentToken || getStoredGitHubToken();

    if (!activeToken) {
      setSubmittingMode(null);
      setError(
        isAr
          ? 'يرجى إدخال GitHub Personal Access Token (PAT) لمرة واحدة فقط ليتم حفظه واعتماده لإجراء الـ Commit المباشر.'
          : 'Please enter your GitHub Personal Access Token (PAT) once to save it permanently for live commits.'
      );
      setShowTokenInput(true);
      return;
    }

    try {
      // Always persist token so the user is never asked again!
      saveStoredGitHubToken(activeToken);
      if (currentUser) {
        saveStoredGitHubUser({ ...currentUser, token: activeToken });
      }

      const data = await createRemediationPullRequest(
        vuln.id,
        repository,
        targetBranch,
        vuln.suggestedPatch || '',
        activeToken,
        vuln.file,
        mode
      );

      setResult({
        prUrl: data.prUrl,
        commitUrl: data.commitUrl,
        commitSha: data.commitSha,
        branch: data.branch || (mode === 'direct' ? targetBranch : defaultFixBranch),
        isLiveGitHubPR: data.isLiveGitHubPR,
        isLiveGitHubCommit: data.isLiveGitHubCommit,
        commitMode: mode,
        commitMessage: data.commitMessage,
        instructions: data.instructions || [
          `git fetch origin`,
          `git checkout ${targetBranch}`,
          `git pull origin ${targetBranch}`,
        ],
      });

      onSuccess(vuln.id, data.prUrl || data.commitUrl || '', data.branch || targetBranch);
    } catch (err: any) {
      console.error('Failed to execute remediation:', err);
      setError(err.message || (isAr ? 'فشلت عملية الرفع لـ GitHub. تأكد من صلاحية الـ Token (repo scope).' : 'Failed to push to GitHub. Verify your Personal Access Token permissions.'));
    } finally {
      setSubmittingMode(null);
    }
  };

  const copyGitCommands = () => {
    if (!result?.instructions) return;
    navigator.clipboard.writeText(result.instructions.join('\n'));
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-neutral-950/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl sm:rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 flex items-center justify-center">
              <GitCommit className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                {isAr ? 'الترقيع و الـ Commit المباشر على GitHub' : 'Live GitHub Remediation & Commit Engine'}
              </h3>
              <p className="text-[11px] text-neutral-500 font-mono">
                {repository}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-md transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto">
          {result ? (
            /* Result Success View */
            <div className="text-center py-3 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800 shadow-xs">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <div>
                <h4 className="text-base font-bold text-neutral-900 dark:text-white mb-1">
                  {result.commitMode === 'direct'
                    ? (isAr ? 'تم رفع التعديل وعمل Commit مباشر على GitHub!' : 'Direct Commit Pushed to GitHub Repository!')
                    : (isAr ? 'تم فتح طلب السحب (Pull Request) الحقيقي على GitHub!' : 'Live Pull Request Successfully Opened on GitHub!')}
                </h4>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 max-w-sm mx-auto leading-relaxed">
                  {result.commitMode === 'direct'
                    ? (isAr
                        ? `تم تطبيق الترقيع الجراحي فورياً وعمل Commit للفرع ${result.branch} على المستودع ${repository}.`
                        : `Surgical patch committed directly to branch ${result.branch} in ${repository}.`)
                    : (isAr
                        ? `تم إنشاء الفرع المنعزل ${result.branch} ورفع الـ Commit وفتح طلب السحب للمراجعة.`
                        : `Fix branch ${result.branch} created and PR opened ready for review.`)}
                </p>
              </div>

              {/* Direct GitHub Link Box */}
              {(result.commitUrl || result.prUrl) && (
                <div className="p-3 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs flex items-center justify-between gap-2 shadow-2xs">
                  <div className="flex items-center gap-2 truncate">
                    {result.commitMode === 'direct' ? (
                      <GitCommit className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    ) : (
                      <GitPullRequest className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                    )}
                    <span className="font-mono text-[11px] text-neutral-800 dark:text-neutral-200 truncate">
                      {result.commitUrl || result.prUrl}
                    </span>
                  </div>
                  <a
                    href={result.commitUrl || result.prUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-neutral-950 hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-white rounded-lg transition-colors shrink-0 shadow-2xs cursor-pointer"
                  >
                    <span>{isAr ? 'معاينة على GitHub' : 'View on GitHub'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              {/* Git CLI Sync Commands */}
              <div className="space-y-1.5 text-left dir-ltr">
                <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                  <span className="flex items-center gap-1 font-mono text-[11px]">
                    <Terminal className="w-3 h-3" />
                    <span>Sync locally via terminal:</span>
                  </span>
                  <button
                    type="button"
                    onClick={copyGitCommands}
                    className="flex items-center gap-1 text-[11px] text-neutral-800 dark:text-neutral-200 hover:underline cursor-pointer"
                  >
                    {copiedCmd ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCmd ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800 font-mono text-[11px] text-neutral-200 overflow-x-auto space-y-1">
                  {result.instructions.map((cmd, idx) => (
                    <div key={idx} className="flex gap-2">
                      <span className="text-neutral-500 select-none">$</span>
                      <span>{cmd}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 w-full pt-1">
                {onReAudit && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onReAudit();
                    }}
                    className="flex-1 py-2.5 min-h-[42px] text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>{isAr ? 'إعادة الفحص الآن للتأكد من الترقيع' : 'Re-Audit Now (Verify Fix)'}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 min-h-[42px] text-xs font-bold text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors cursor-pointer"
                >
                  {isAr ? 'إغلاق والعودة للوحة' : 'Close & Return to Dashboard'}
                </button>
              </div>
            </div>
          ) : (
            /* Configure & Launch Remediation View */
            <>
              {/* Target info */}
              <div className="space-y-2 bg-neutral-50 dark:bg-neutral-950 p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs">
                <div className="flex justify-between items-center text-neutral-600 dark:text-neutral-400">
                  <span>{isAr ? 'المستودع:' : 'Repository:'}</span>
                  <span className="font-mono text-neutral-900 dark:text-white font-bold">{repository}</span>
                </div>
                <div className="flex justify-between items-center text-neutral-600 dark:text-neutral-400">
                  <span>{isAr ? 'الفرع المستهدف:' : 'Target Branch:'}</span>
                  <div className="flex items-center gap-1 font-mono text-neutral-900 dark:text-white">
                    <GitBranch className="w-3 h-3 text-neutral-500" />
                    <input
                      type="text"
                      value={targetBranch}
                      onChange={e => setTargetBranch(e.target.value)}
                      className="bg-transparent border-b border-neutral-300 dark:border-neutral-700 w-16 text-center text-xs focus:outline-hidden"
                    />
                  </div>
                </div>
                <div className="flex justify-between items-center text-neutral-600 dark:text-neutral-400">
                  <span>{isAr ? 'الملف المراد ترقيعه:' : 'File to Patch:'}</span>
                  <span className="font-mono text-neutral-900 dark:text-white truncate max-w-[240px]">
                    {vuln.file}:{vuln.line}
                  </span>
                </div>
              </div>

              {/* GitHub Token Authentication Card (Saved once & reused) */}
              <div className="p-3.5 bg-neutral-50/90 dark:bg-neutral-950/90 rounded-xl border border-neutral-200 dark:border-neutral-800">
                {!showTokenInput && (persistentToken || currentUser?.token) ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-900 dark:text-white">
                          <span>{isAr ? 'تم التحقق من GitHub Token مسبقاً' : 'GitHub Token Authenticated'}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold">
                            {isAr ? 'جاهز' : 'READY'}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono">
                          @{currentUser?.login || 'user'} · {isAr ? 'محفوظ من تسجيل الدخول (لن يُطلب منك مجدداً)' : 'Saved from login (1-click active)'}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowTokenInput(true)}
                      className="text-[11px] text-neutral-500 hover:text-neutral-900 dark:hover:text-white underline cursor-pointer"
                    >
                      {isAr ? 'تغيير' : 'Change'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                        <Key className="w-3.5 h-3.5 text-amber-500" />
                        <span>
                          {isAr ? 'أدخل GitHub Token مرة واحدة فقط لحفظه:' : 'Enter GitHub Token once to save permanently:'}
                        </span>
                      </span>
                      {persistentToken && (
                        <button
                          type="button"
                          onClick={() => setShowTokenInput(false)}
                          className="text-[11px] text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
                        >
                          {isAr ? 'إلغاء' : 'Cancel'}
                        </button>
                      )}
                    </div>

                    <input
                      type="password"
                      value={tokenInput}
                      onChange={e => setTokenInput(e.target.value)}
                      placeholder={isAr ? 'أدخل Personal Access Token (ghp_...)' : 'Enter Personal Access Token (ghp_...)'}
                      className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg px-3 py-2 text-xs font-mono placeholder-neutral-400 text-neutral-900 dark:text-white focus:outline-hidden focus:border-neutral-900 dark:focus:border-white shadow-2xs"
                    />

                    <div className="flex items-center justify-between text-[11px] text-neutral-500">
                      <span>{isAr ? 'سيتم حفظه تلقائياً ولن يُطلب مجدداً' : 'Will be saved once and never asked again'}</span>
                      <a
                        href="https://github.com/settings/tokens/new?scopes=repo,read:user"
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 font-medium"
                      >
                        <span>{isAr ? 'توليد Token من GitHub' : 'Generate Token'}</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Surgical Unified Diff Preview */}
              {vuln.suggestedPatch && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400">
                    <span className="font-semibold">{isAr ? 'معاينة كود الترقيع الجراحي (Diff):' : 'Surgical Patch Preview:'}</span>
                    <span className="font-mono text-[10px] text-neutral-500">git diff -u</span>
                  </div>
                  <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 font-mono text-[11px] leading-relaxed overflow-x-auto max-h-32 dir-ltr text-left">
                    {vuln.suggestedPatch.split('\n').map((line, idx) => {
                      const isAddition = line.startsWith('+');
                      const isDeletion = line.startsWith('-');
                      const isHeader = line.startsWith('@@') || line.startsWith('---') || line.startsWith('+++');
                      let style = 'text-neutral-400';
                      if (isAddition) style = 'text-emerald-400 bg-emerald-950/40 px-1 rounded-xs';
                      else if (isDeletion) style = 'text-rose-400 bg-rose-950/40 px-1 rounded-xs';
                      else if (isHeader) style = 'text-neutral-200 font-semibold';
                      return (
                        <div key={idx} className={style}>
                          {line}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-lg text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Dual Action Execution Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleRemediate('direct')}
                  disabled={submittingMode !== null}
                  className="w-full py-2.5 min-h-[44px] text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 rounded-lg transition-all flex items-center justify-center gap-2 shadow-xs hover:shadow-md cursor-pointer disabled:opacity-50"
                >
                  {submittingMode === 'direct' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{isAr ? 'جارٍ رفع الكود وعمل الـ Commit المباشر...' : 'Pushing direct commit to repository...'}</span>
                    </>
                  ) : (
                    <>
                      <GitCommit className="w-4 h-4" />
                      <span>{isAr ? 'رفع التعديل و عمل Commit مباشر على GitHub' : 'Direct Commit & Push to Repository'}</span>
                      <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                    </>
                  )}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleRemediate('pr')}
                    disabled={submittingMode !== null}
                    className="flex-1 py-2.5 min-h-[40px] text-xs font-semibold text-neutral-800 dark:text-neutral-200 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-750 border border-neutral-300 dark:border-neutral-700 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {submittingMode === 'pr' ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>{isAr ? 'جارٍ إنشاء الفرع والـ PR...' : 'Opening Pull Request...'}</span>
                      </>
                    ) : (
                      <>
                        <GitPullRequest className="w-3.5 h-3.5" />
                        <span>{isAr ? 'فتح طلب سحب (Pull Request)' : 'Create Pull Request (PR)'}</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 min-h-[40px] text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
                  >
                    {isAr ? 'إلغاء' : 'Cancel'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
