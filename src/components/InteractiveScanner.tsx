import React from 'react';
import { ScanResult, GitHubUser } from '../types';
import { runRealSecurityScan, searchGitHubRepos, GitHubRepoSummary } from '../services/apiService';
import { GitHubImportModal } from './GitHubImportModal';
import { getStoredGitHubUser, saveStoredGitHubUser, saveStoredGitHubToken } from '../services/offlineStorage';
import { Play, Loader2, GitBranch, Terminal, RotateCw, Code2, AlertTriangle, Search, Check, Github } from 'lucide-react';

interface InteractiveScannerProps {
  onScanComplete: (result: ScanResult) => void;
  lang?: 'ar' | 'en';
}

export function InteractiveScanner({ onScanComplete, lang = 'en' }: InteractiveScannerProps) {
  const isAr = lang === 'ar';
  const [scanMode, setScanMode] = React.useState<'repo' | 'code'>('repo');
  const [repoInput, setRepoInput] = React.useState('expressjs/express');
  const [branchInput, setBranchInput] = React.useState('master');
  const [isScanning, setIsScanning] = React.useState(false);
  const [progress, setProgress] = React.useState<number>(0);
  const [stage, setStage] = React.useState<number>(0);
  const [currentStatusText, setCurrentStatusText] = React.useState<string>('');
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // GitHub user & modal state
  const [showGitHubModal, setShowGitHubModal] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState<GitHubUser | null>(getStoredGitHubUser);

  const handleUserChange = (user: GitHubUser | null) => {
    setCurrentUser(user);
    saveStoredGitHubUser(user);
    if (user?.token) {
      saveStoredGitHubToken(user.token);
    } else if (!user) {
      saveStoredGitHubToken(null);
    }
  };

  // Search & autocomplete
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<GitHubRepoSummary[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);

  // Custom code input
  const defaultSnippet = `// Production Payment & User API Route
import express from "express";
import { db } from "../database";

const router = express.Router();
const STRIPE_SECRET = "sk_demo_mock_stripe_key_remediated_example"; // Demo key

router.post("/login", async (req, res) => {
  // Vulnerable SQL query
  const query = "SELECT * FROM users WHERE email = '" + req.body.email + "' AND password = '" + req.body.password + "'";
  const user = await db.query(query);
  
  // Sensitive token in logs
  console.log("User token generated: " + req.headers.authorization);
  
  // Potential SSRF
  if (req.body.webhookUrl) {
    await fetch(req.body.webhookUrl, { method: "POST", body: JSON.stringify(user) });
  }
  
  res.json({ status: "success", user });
});

export default router;`;

  const [customCode, setCustomCode] = React.useState(defaultSnippet);
  const [customFilePath, setCustomFilePath] = React.useState('src/api/auth.ts');

  const popularRealRepos = [
    { name: 'expressjs/express', branch: 'master', desc: 'Fast, unopinionated web framework for Node.js' },
    { name: 'pallets/flask', branch: 'main', desc: 'Python microframework for web development' },
    { name: 'facebook/react', branch: 'main', desc: 'The library for web and native user interfaces' },
    { name: 'gin-gonic/gin', branch: 'master', desc: 'High performance HTTP web framework in Go' },
  ];

  // Search debouncer
  React.useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchGitHubRepos(searchQuery.trim());
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleStartRealScan = async (targetRepo = repoInput, targetBranch = branchInput) => {
    if (isScanning) return;
    setIsScanning(true);
    setErrorMessage(null);
    setStage(1);
    setProgress(15);
    setCurrentStatusText(isAr ? 'الاتصال بواجهة GitHub API وقراءة شجرة المستودع...' : 'Connecting to GitHub API & resolving tree...');

    try {
      // Stage 2: Fetch files
      setTimeout(() => {
        setStage(2);
        setProgress(40);
        setCurrentStatusText(isAr ? 'سحب ملفات الكود الحقيقية وفحص المسارات المستهدفة...' : 'Pulling source files from repository...');
      }, 700);

      // Stage 3: Send to Gemini 3.8 Flash
      setTimeout(() => {
        setStage(3);
        setProgress(70);
        setCurrentStatusText(isAr ? 'تحليل تدفق البيانات والأسرار بواسطة Google Gemini 3.8 Flash...' : 'Executing contextual reasoning with Google Gemini 3.8 Flash...');
      }, 1500);

      let scanResult: ScanResult;

      if (scanMode === 'code') {
        scanResult = await runRealSecurityScan('custom-code-sandbox', 'main', [
          { path: customFilePath, content: customCode }
        ]);
      } else {
        scanResult = await runRealSecurityScan(targetRepo, targetBranch);
      }

      setStage(4);
      setProgress(100);
      setCurrentStatusText(isAr ? 'اكتمل الفحص وتم تجميع الوثائق الثلاثية بنجاح!' : 'Audit complete · Artifacts compiled!');

      setTimeout(() => {
        setIsScanning(false);
        onScanComplete(scanResult);
      }, 500);
    } catch (err: any) {
      console.error('Scan failed:', err);
      setIsScanning(false);
      let cleanMsg = err.message || 'خطأ أثناء الاتصال';
      if (cleanMsg.includes('503') || cleanMsg.includes('high demand') || cleanMsg.includes('UNAVAILABLE')) {
        cleanMsg = isAr
          ? 'خوادم الفحص تشهد ضغطاً مؤقتاً، يرجى إعادة المحاولة خلال ثوانٍ أو فحص الكود المباشر.'
          : 'Audit service is experiencing temporary high demand, please retry in a moment or audit custom code.';
      } else if (cleanMsg.startsWith('{') && cleanMsg.endsWith('}')) {
        try {
          const parsed = JSON.parse(cleanMsg);
          cleanMsg = parsed?.error?.message || parsed?.message || cleanMsg;
        } catch {
          // ignore
        }
      }

      setErrorMessage(
        isAr
          ? `تعذر إكمال الفحص: ${cleanMsg}`
          : `Audit error: ${cleanMsg}`
      );
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-xl p-6 sm:p-8 shadow-2xs transition-colors">
      {/* Header section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-7">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-xs font-mono font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              {isAr ? 'فحص الأكواد المباشر' : 'Live Repository Audit'}
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">
            {isAr ? 'فحص أمان الكود الفعلي لأي مستودع GitHub' : 'Audit Real Code from Any GitHub Repository'}
          </h3>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1 max-w-xl leading-relaxed">
            {isAr
              ? 'يتم سحب الملفات الحقيقية عبر GitHub API وإخضاعها للفحص بواسطة Google Gemini 3.8 Flash لرصد الثغرات والأسرار وحساب درجات الأمان الفعلية.'
              : 'Pulls live code files via GitHub REST API and performs deep semantic vulnerability detection using Google Gemini 3.8 Flash.'}
          </p>
        </div>

        {/* Scan mode toggle: Repo vs Direct Code */}
        <div className="flex items-center p-1 bg-neutral-100 dark:bg-neutral-950 rounded-lg border border-neutral-200 dark:border-neutral-800 text-xs">
          <button
            onClick={() => setScanMode('repo')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
              scanMode === 'repo' ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-2xs font-semibold' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>{isAr ? 'مستودع GitHub' : 'GitHub Repository'}</span>
          </button>

          <button
            onClick={() => setScanMode('code')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
              scanMode === 'code' ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-2xs font-semibold' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>{isAr ? 'كود مخصص' : 'Paste Code'}</span>
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-xs text-red-700 dark:text-red-300 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold block">{isAr ? 'تنبيه في عملية الفحص:' : 'Scan Error:'}</span>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {scanMode === 'repo' ? (
        <div className="space-y-4">
          {/* Real repository selection inputs */}
          <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-neutral-400">
                <GitBranch className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={repoInput}
                onChange={e => {
                  let val = e.target.value;
                  setRepoInput(val);
                  // Clean up for search query
                  const cleaned = val.replace(/^(https?:\/\/)?(www\.)?github\.com\//i, '').replace(/\.git$/i, '');
                  setSearchQuery(cleaned);
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter' && repoInput.trim() && !isScanning) {
                    handleStartRealScan();
                  }
                }}
                disabled={isScanning}
                placeholder={isAr ? 'رابط GitHub أو اسم المستودع (مثال: owner/repo أو https://github.com/...)' : 'GitHub URL or repo name (e.g. owner/repo or https://github.com/...)'}
                className="w-full bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 focus:border-neutral-900 dark:focus:border-neutral-100 rounded-lg py-2.5 px-3.5 text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 font-mono placeholder-neutral-400 focus:outline-hidden transition-colors shadow-2xs"
              />

              {/* GitHub search dropdown if results exist */}
              {searchResults.length > 0 && (
                <div className="absolute z-30 left-0 right-0 top-full mt-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-xl max-h-56 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800">
                  {searchResults.map(sr => (
                    <button
                      key={sr.fullName}
                      type="button"
                      onClick={() => {
                        setRepoInput(sr.fullName);
                        setBranchInput(sr.defaultBranch || 'main');
                        setSearchResults([]);
                      }}
                      className="w-full p-2.5 text-left flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-xs cursor-pointer"
                    >
                      <div>
                        <div className="font-mono text-neutral-900 dark:text-neutral-100 font-medium">{sr.fullName}</div>
                        <div className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-1">{sr.description || 'No description'}</div>
                      </div>
                      <span className="text-[10px] text-neutral-400 font-mono">★ {sr.stars}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-full sm:w-32">
              <input
                type="text"
                value={branchInput}
                onChange={e => setBranchInput(e.target.value)}
                disabled={isScanning}
                placeholder="Branch"
                className="w-full min-h-[44px] bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 focus:border-neutral-900 dark:focus:border-neutral-100 rounded-lg py-2.5 px-3 text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 font-mono placeholder-neutral-400 focus:outline-hidden transition-colors text-center shadow-2xs"
              />
            </div>

            <button
              onClick={() => handleStartRealScan()}
              disabled={isScanning || !repoInput.trim()}
              className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 bg-neutral-950 hover:bg-neutral-850 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-white disabled:opacity-50 text-white font-medium rounded-lg text-xs sm:text-sm transition-all shadow-2xs flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
            >
              {isScanning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isAr ? 'جارٍ التحليل...' : 'Analyzing...'}</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isAr ? 'بدء الفحص' : 'Launch Audit'}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowGitHubModal(true)}
              className="w-full sm:w-auto min-h-[44px] px-4 py-2.5 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-750 text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700 font-medium rounded-lg text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer shadow-2xs"
              title={isAr ? 'استيراد مستودعاتك العامة والخاصة' : 'Browse & import your repositories'}
            >
              <Github className="w-3.5 h-3.5" />
              <span>{isAr ? 'مستودعاتي' : 'My Repos'}</span>
            </button>
          </div>

          {/* GitHub Connection Status & Quick Launch Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs">
            {currentUser ? (
              <div className="flex items-center gap-2.5">
                <img src={currentUser.avatarUrl} alt={currentUser.login} className="w-5 h-5 rounded-full object-cover" />
                <span className="text-neutral-700 dark:text-neutral-300">
                  {isAr ? 'حساب GitHub المتصل:' : 'Connected GitHub:'} <strong className="font-mono text-neutral-900 dark:text-white">@{currentUser.login}</strong>
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-1.5 py-0.2 rounded font-mono">
                  {currentUser.publicRepos} {isAr ? 'مستودع' : 'repos'}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
                <Github className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
                <span>{isAr ? 'قم بربط حساب GitHub لعرض وفحص جميع مستودعاتك بضغطة زر واحدة' : 'Connect your GitHub account to browse & audit all your repositories in 1-click'}</span>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowGitHubModal(true)}
              className="flex items-center gap-1.5 font-semibold text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
            >
              <Github className="w-3.5 h-3.5" />
              <span>{currentUser ? (isAr ? 'استعراض مستودعاتي وإطلاق الفحص' : 'Explore Repositories & Launch Audit') : (isAr ? 'تسجيل الدخول عبر GitHub' : 'Sign in with GitHub')}</span>
            </button>
          </div>

          {/* Real repository quick links */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-neutral-500 dark:text-neutral-400 font-medium">
              {isAr ? 'نماذج مستودعات للمعاينة:' : 'Explore live repos:'}
            </span>
            {popularRealRepos.map(pr => (
              <button
                key={pr.name}
                onClick={() => {
                  setRepoInput(pr.name);
                  setBranchInput(pr.branch);
                  handleStartRealScan(pr.name, pr.branch);
                }}
                disabled={isScanning}
                className="px-2.5 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-mono text-[11px] border border-neutral-200 dark:border-neutral-700 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {pr.name}
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Direct Code Input Mode */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
            <div className="flex-1">
              <label className="block text-xs text-neutral-600 dark:text-neutral-400 mb-1">
                {isAr ? 'مسار الملف البرمجي المستهدف:' : 'Target file path:'}
              </label>
              <input
                type="text"
                value={customFilePath}
                onChange={e => setCustomFilePath(e.target.value)}
                className="w-full bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 focus:border-neutral-900 dark:focus:border-neutral-100 rounded-lg p-2 font-mono text-xs text-neutral-900 dark:text-neutral-100 focus:outline-hidden"
              />
            </div>
            <div className="w-full sm:w-auto">
              <button
                onClick={() => handleStartRealScan()}
                disabled={isScanning || !customCode.trim()}
                className="w-full sm:w-auto px-5 py-2.5 bg-neutral-950 hover:bg-neutral-850 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-white disabled:opacity-50 text-white font-medium rounded-lg text-xs sm:text-sm transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer min-h-[42px]"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{isAr ? 'جارٍ التحليل...' : 'Auditing...'}</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{isAr ? 'فحص الكود' : 'Audit Code'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs text-neutral-600 dark:text-neutral-400 mb-1">
              {isAr ? 'الصق الكود البرمجي هنا (يدعم JS, TS, Python, Go, PHP, Java):' : 'Paste source code here (JS, TS, Python, Go, PHP, Java):'}
            </label>
            <textarea
              rows={8}
              value={customCode}
              onChange={e => setCustomCode(e.target.value)}
              className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 focus:border-neutral-900 dark:focus:border-neutral-100 rounded-lg p-3 font-mono text-xs text-neutral-900 dark:text-neutral-100 dir-ltr text-left leading-relaxed resize-none focus:outline-hidden"
              placeholder="// Paste real code here..."
            />
          </div>
        </div>
      )}

      {/* Progress & Stage Pipeline Visualizer */}
      {isScanning && (
        <div className="space-y-4 pt-6 mt-6 border-t border-neutral-200 dark:border-neutral-800 animate-fadeIn">
          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-neutral-900 dark:text-neutral-100 font-mono font-medium flex items-center gap-2">
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
                <span>{currentStatusText}</span>
              </span>
              <span className="text-neutral-500 dark:text-neutral-400 font-mono tabular-nums font-bold">
                {progress}%
              </span>
            </div>

            <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-neutral-900 dark:bg-white h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* 4 Pipeline Stages (Minimalist unboxed labels) */}
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-2.5 pt-2 text-xs">
            <div className={`p-2.5 rounded-md border flex items-center gap-2 transition-colors ${
              stage >= 1 ? 'bg-neutral-50 dark:bg-neutral-800/80 border-neutral-300 dark:border-neutral-600 text-neutral-900 dark:text-white font-medium' : 'border-neutral-200 dark:border-neutral-800 text-neutral-400'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${stage >= 1 ? 'bg-emerald-500' : 'bg-neutral-300 dark:bg-neutral-700'}`} />
              <span className="truncate">{isAr ? '1. اتصال GitHub API' : '1. GitHub API Call'}</span>
            </div>

            <div className={`p-2.5 rounded-md border flex items-center gap-2 transition-colors ${
              stage >= 2 ? 'bg-neutral-50 dark:bg-neutral-800/80 border-neutral-300 dark:border-neutral-600 text-neutral-900 dark:text-white font-medium' : 'border-neutral-200 dark:border-neutral-800 text-neutral-400'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${stage >= 2 ? 'bg-emerald-500' : 'bg-neutral-300 dark:bg-neutral-700'}`} />
              <span className="truncate">{isAr ? '2. سحب الكود الحقيقي' : '2. Raw Code Extraction'}</span>
            </div>

            <div className={`p-2.5 rounded-md border flex items-center gap-2 transition-colors ${
              stage >= 3 ? 'bg-neutral-50 dark:bg-neutral-800/80 border-neutral-300 dark:border-neutral-600 text-neutral-900 dark:text-white font-medium' : 'border-neutral-200 dark:border-neutral-800 text-neutral-400'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${stage >= 3 ? 'bg-emerald-500' : 'bg-neutral-300 dark:bg-neutral-700'}`} />
              <span className="truncate">{isAr ? '3. تحليل Gemini 3.8 Flash' : '3. Gemini 3.8 Flash Reasoning'}</span>
            </div>

            <div className={`p-2.5 rounded-md border flex items-center gap-2 transition-colors ${
              stage >= 4 ? 'bg-neutral-50 dark:bg-neutral-800/80 border-neutral-300 dark:border-neutral-600 text-neutral-900 dark:text-white font-medium' : 'border-neutral-200 dark:border-neutral-800 text-neutral-400'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${stage >= 4 ? 'bg-emerald-500' : 'bg-neutral-300 dark:bg-neutral-700'}`} />
              <span className="truncate">{isAr ? '4. الوثائق والترقيع' : '4. Artifact Trinity & Diffs'}</span>
            </div>
          </div>
        </div>
      )}

      {showGitHubModal && (
        <GitHubImportModal
          onClose={() => setShowGitHubModal(false)}
          onSelectRepo={(fullName, branch) => {
            setRepoInput(fullName);
            const targetBranch = branch || 'main';
            setBranchInput(targetBranch);
            setScanMode('repo');
            handleStartRealScan(fullName, targetBranch);
          }}
          currentUser={currentUser}
          onUserChange={handleUserChange}
          lang={lang}
        />
      )}
    </div>
  );
}
