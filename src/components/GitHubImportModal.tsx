import React, { useState, useEffect } from 'react';
import { GitHubUser, UserRepoItem } from '../types';
import { fetchGitHubUser, fetchUserRepositories } from '../services/apiService';
import { getStoredGitHubToken, saveStoredGitHubToken, saveStoredGitHubUser } from '../services/offlineStorage';
import {
  Github,
  Key,
  Shield,
  Search,
  ExternalLink,
  Lock,
  Globe2,
  Star,
  GitFork,
  ArrowRight,
  CheckCircle2,
  Loader2,
  X,
  RefreshCw,
  LogOut,
  User,
  Play,
  Sparkles,
  GitBranch,
  Calendar,
  ShieldCheck
} from 'lucide-react';

interface GitHubImportModalProps {
  onClose: () => void;
  onSelectRepo: (repoFullName: string, branch: string) => void;
  currentUser: GitHubUser | null;
  onUserChange: (user: GitHubUser | null) => void;
  lang?: 'ar' | 'en';
}

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: 'bg-blue-500',
  JavaScript: 'bg-yellow-400',
  Python: 'bg-emerald-500',
  Go: 'bg-cyan-500',
  Java: 'bg-orange-500',
  PHP: 'bg-indigo-400',
  Ruby: 'bg-red-500',
  Rust: 'bg-amber-600',
  C: 'bg-neutral-500',
  'C++': 'bg-pink-500',
  'C#': 'bg-purple-500',
  HTML: 'bg-orange-600',
  CSS: 'bg-blue-400',
};

export function GitHubImportModal({
  onClose,
  onSelectRepo,
  currentUser,
  onUserChange,
  lang = 'en',
}: GitHubImportModalProps) {
  const isAr = lang === 'ar';

  // Default to token method so users connect once and never get prompted again
  const [authMethod, setAuthMethod] = useState<'token' | 'username'>('token');
  const [usernameInput, setUsernameInput] = useState('');
  const [tokenInput, setTokenInput] = useState(getStoredGitHubToken() || currentUser?.token || '');
  const [loading, setLoading] = useState(false);
  const [reposLoading, setReposLoading] = useState(false);
  const [repos, setRepos] = useState<UserRepoItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'public' | 'private'>('all');
  const [error, setError] = useState<string | null>(null);

  // Load user repositories
  const loadRepos = async (user: GitHubUser | null) => {
    if (!user) {
      setRepos([]);
      return;
    }
    setReposLoading(true);
    setError(null);
    try {
      const activeToken = user.token || getStoredGitHubToken() || undefined;
      const data = await fetchUserRepositories(activeToken, user.login);
      setRepos(data);
    } catch (err: any) {
      console.warn('Could not load repos:', err);
      setError(isAr ? 'تعذر جلب قائمة المستودعات من GitHub API' : 'Could not fetch repositories from GitHub API');
    } finally {
      setReposLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadRepos(currentUser);
    }
  }, [currentUser]);

  // Connect via Username
  const handleConnectUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    const uname = usernameInput.trim();
    if (!uname) return;

    setLoading(true);
    setError(null);
    try {
      const user = await fetchGitHubUser(uname);
      const existingToken = getStoredGitHubToken();
      const userWithToken = existingToken ? { ...user, token: existingToken } : user;
      saveStoredGitHubUser(userWithToken);
      onUserChange(userWithToken);
      setUsernameInput('');
      await loadRepos(userWithToken);
    } catch (err: any) {
      setError(err.message || (isAr ? 'حساب GitHub غير موجود' : 'GitHub user not found'));
    } finally {
      setLoading(false);
    }
  };

  // Connect via Personal Access Token (Saved once for all future commits & audits)
  const handleConnectToken = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = tokenInput.trim();
    if (!token) return;

    setLoading(true);
    setError(null);
    try {
      const user = await fetchGitHubUser(token);
      const fullUser = { ...user, token };
      // Save permanently into storage so it's NEVER requested again
      saveStoredGitHubToken(token);
      saveStoredGitHubUser(fullUser);
      onUserChange(fullUser);
      setTokenInput('');
      await loadRepos(fullUser);
    } catch (err: any) {
      setError(err.message || (isAr ? 'رمز GitHub Token غير صالح أو منتهي الصلاحية' : 'Invalid or expired GitHub Personal Access Token'));
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    saveStoredGitHubToken(null);
    saveStoredGitHubUser(null);
    onUserChange(null);
    setRepos([]);
  };

  const filteredRepos = repos.filter(repo => {
    const matchesSearch =
      repo.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (repo.description && repo.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (repo.language && repo.language.toLowerCase().includes(searchQuery.toLowerCase()));

    if (filterType === 'public') return matchesSearch && !repo.private;
    if (filterType === 'private') return matchesSearch && repo.private;
    return matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-950/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 flex items-center justify-center shadow-xs">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <span>{isAr ? 'تسجيل الدخول ومستودعات GitHub' : 'GitHub Authentication & Repository Hub'}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-semibold">
                  LIVE API
                </span>
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {isAr
                  ? 'اختر أي مستودع للبدء الفوري بالفحص الأمني الشامل والترقيع الجراحي'
                  : 'Select any repository to immediately launch automated security audit & surgical remediation'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Profile Card or Login Tabs */}
        {currentUser ? (
          <div className="px-5 sm:px-6 py-4 bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-3.5">
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.login}
                className="w-10 h-10 rounded-xl border border-neutral-300 dark:border-neutral-700 shadow-2xs object-cover"
              />
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-neutral-900 dark:text-white text-sm">
                    {currentUser.name || currentUser.login}
                  </span>
                  <a
                    href={`https://github.com/${currentUser.login}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-xs text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    @{currentUser.login}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-1.5 py-0.2 rounded font-mono font-medium">
                    {isAr ? 'متصل' : 'Connected'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400 font-mono">
                  <span>{currentUser.publicRepos} {isAr ? 'عام' : 'public'}</span>
                  <span>·</span>
                  <span>{currentUser.totalPrivateRepos || 0} {isAr ? 'خاص' : 'private'}</span>
                  {currentUser.followers !== undefined && (
                    <>
                      <span>·</span>
                      <span>{currentUser.followers} {isAr ? 'متابع' : 'followers'}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => loadRepos(currentUser)}
                disabled={reposLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-750 border border-neutral-300 dark:border-neutral-700 rounded-lg transition-colors cursor-pointer shadow-2xs"
                title={isAr ? 'تحديث المستودعات' : 'Refresh repos'}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${reposLoading ? 'animate-spin' : ''}`} />
                <span>{isAr ? 'تحديث' : 'Refresh'}</span>
              </button>

              <button
                onClick={handleDisconnect}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg border border-red-200 dark:border-red-900 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{isAr ? 'تسجيل الخروج' : 'Sign Out'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-5 sm:p-6 bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 space-y-4 shrink-0">
            {/* Login Tab switcher */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-1 p-1 bg-neutral-200 dark:bg-neutral-900 rounded-lg text-xs">
                <button
                  type="button"
                  onClick={() => { setAuthMethod('token'); setError(null); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                    authMethod === 'token'
                      ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-2xs font-semibold'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  <Key className="w-3.5 h-3.5 text-amber-500" />
                  <span>{isAr ? 'تسجيل الدخول بالـ Token (مرة واحدة فقط)' : 'GitHub Token Sign-In (1-Time)'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setAuthMethod('username'); setError(null); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                    authMethod === 'username'
                      ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-2xs font-semibold'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>{isAr ? 'اسم المستخدم (عرض عام فقط)' : 'Username (Public Read-Only)'}</span>
                </button>
              </div>

              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{isAr ? 'حفظ آمن لمرة واحدة فقط' : 'Saved once for 1-click commits'}</span>
              </span>
            </div>

            {/* Method 1: Token Form (Primary - 1-time setup) */}
            {authMethod === 'token' ? (
              <form onSubmit={handleConnectToken} className="space-y-2.5">
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-900 dark:text-amber-200">
                  <p className="font-semibold mb-0.5">
                    {isAr ? '🔑 يتم حفظ التوكن مرة واحدة فقط هنا' : '🔑 Enter your GitHub Token once here'}
                  </p>
                  <p className="text-[11px] text-neutral-600 dark:text-neutral-300">
                    {isAr
                      ? 'بمجرد تسجيل الدخول، سيتذكره GitArmor AI بشكل دائم ولن يطلبه منك مجدداً أثناء فحص المستودعات أو رفع الـ Commits المباشرة.'
                      : 'Once saved, GitArmor AI securely remembers it for all future audits, direct commits, and PRs without ever asking again.'}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Key className="w-4 h-4 text-neutral-400 absolute inset-y-0 left-3 my-auto pointer-events-none" />
                    <input
                      type="password"
                      value={tokenInput}
                      onChange={e => setTokenInput(e.target.value)}
                      placeholder={isAr ? 'أدخل Personal Access Token (ghp_... أو github_pat_...)' : 'Enter Personal Access Token (ghp_... or github_pat_...)'}
                      className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg pl-9 pr-3 py-2 text-xs sm:text-sm text-neutral-900 dark:text-white font-mono placeholder-neutral-400 focus:outline-hidden focus:border-neutral-900 dark:focus:border-white shadow-2xs"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading || !tokenInput.trim()}
                    className="px-5 py-2 text-xs font-semibold text-white bg-neutral-950 hover:bg-neutral-850 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-white disabled:opacity-50 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                  >
                    {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{isAr ? 'حفظ وتسجيل الدخول' : 'Save & Connect'}</span>
                  </button>
                </div>
                <div className="flex items-center justify-between text-[11px] text-neutral-500">
                  <span>{isAr ? 'مطلوب صلاحية repo للـ Commit المباشر وفتح الـ PRs' : 'Requires "repo" scope for 1-click commits & PR creation.'}</span>
                  <a
                    href="https://github.com/settings/tokens/new?scopes=repo,read:user"
                    target="_blank"
                    rel="noreferrer"
                    className="text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 font-medium"
                  >
                    <span>{isAr ? 'توليد Token جديد من GitHub' : 'Generate Token on GitHub'}</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </form>
            ) : (
              /* Method 2: Username Form (Secondary) */
              <form onSubmit={handleConnectUsername} className="space-y-2">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <User className="w-4 h-4 text-neutral-400 absolute inset-y-0 left-3 my-auto pointer-events-none" />
                    <input
                      type="text"
                      value={usernameInput}
                      onChange={e => setUsernameInput(e.target.value)}
                      placeholder={isAr ? 'أدخل اسم المستخدم على GitHub (مثال: Bavly-Hamdy)' : 'Enter GitHub username (e.g. Bavly-Hamdy)'}
                      className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg pl-9 pr-3 py-2 text-xs sm:text-sm text-neutral-900 dark:text-white font-mono placeholder-neutral-400 focus:outline-hidden focus:border-neutral-900 dark:focus:border-white shadow-2xs"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading || !usernameInput.trim()}
                    className="px-5 py-2 text-xs font-semibold text-white bg-neutral-950 hover:bg-neutral-850 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-white disabled:opacity-50 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                  >
                    {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{isAr ? 'استعراض المستودعات' : 'Connect & View Repos'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-neutral-500">
                  {isAr ? 'يتيح فقط استعراض المستودعات العامة. لعمل Commits تلقائية يُفضل استخدام الـ Token.' : 'Public repos preview only. For automated commits, please sign in with Token.'}
                </p>
              </form>
            )}

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg text-xs text-red-700 dark:text-red-300 font-medium">
                {error}
              </div>
            )}
          </div>
        )}

        {/* Content Body: Repository Explorer */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-neutral-400 absolute inset-y-0 right-3 my-auto pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={isAr ? 'بحث في المستودعات بالاسم أو لغة البرمجة...' : 'Filter repositories by name, language, or description...'}
                className="w-full bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-lg py-2 px-3 pr-9 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-hidden focus:border-neutral-900 dark:focus:border-white font-mono shadow-2xs"
              />
            </div>

            <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg border border-neutral-200 dark:border-neutral-700 text-xs w-full sm:w-auto shrink-0">
              {(['all', 'public', 'private'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-1 rounded-md font-medium transition-colors capitalize cursor-pointer ${
                    filterType === type
                      ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-2xs font-semibold'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  {type === 'all' ? (isAr ? 'الكل' : 'All') : type === 'public' ? (isAr ? 'عامة' : 'Public') : (isAr ? 'خاصة' : 'Private')}
                </button>
              ))}
            </div>
          </div>

          {/* Repositories Counter */}
          <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
            <span>
              {isAr
                ? `عرض ${filteredRepos.length} مستودع متاح للتدقيق الأمني`
                : `Showing ${filteredRepos.length} repositories ready for security audit`}
            </span>
            <span className="text-[11px] font-mono text-neutral-400">
              {isAr ? 'فحص كامل لتدفق البيانات والأسرار' : 'Full SAST & Dataflow Coverage'}
            </span>
          </div>

          {/* Repositories List */}
          <div className="space-y-3">
            {reposLoading ? (
              <div className="py-20 text-center space-y-3">
                <Loader2 className="w-7 h-7 text-neutral-700 dark:text-neutral-300 animate-spin mx-auto" />
                <p className="text-xs text-neutral-500 font-mono">
                  {isAr ? 'جارٍ الاتصال بـ GitHub API وقراءة المستودعات الحقيقية...' : 'Connecting to GitHub API & retrieving repositories...'}
                </p>
              </div>
            ) : filteredRepos.length === 0 ? (
              <div className="py-16 text-center bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-3">
                <Github className="w-10 h-10 text-neutral-400 mx-auto" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                    {isAr ? 'لا توجد مستودعات معروضة' : 'No repositories found'}
                  </h4>
                  <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                    {currentUser
                      ? (isAr ? 'لم يتم العثور على مستودعات مطابقة للبحث.' : 'No repositories match your active search filter.')
                      : (isAr ? 'يرجى إدخال اسم مستخدم GitHub أو Personal Access Token في الأعلى لعرض مستودعاتك الحقيقية.' : 'Please enter your GitHub Username or Personal Access Token above to load your live repositories.')}
                  </p>
                </div>
              </div>
            ) : (
              filteredRepos.map(repo => {
                const langColor = repo.language ? (LANGUAGE_COLORS[repo.language] || 'bg-neutral-400') : null;

                return (
                  <div
                    key={repo.id}
                    className="p-4 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 rounded-xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs hover:shadow-xs group"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 min-w-0 flex-wrap">
                        {repo.private ? (
                          <span className="flex items-center gap-1 text-[10px] font-mono text-amber-800 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-md font-semibold shrink-0">
                            <Lock className="w-2.5 h-2.5" />
                            <span>{isAr ? 'خاص' : 'Private'}</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[10px] font-mono text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 px-2 py-0.5 rounded-md font-semibold shrink-0">
                            <Globe2 className="w-2.5 h-2.5" />
                            <span>{isAr ? 'عام' : 'Public'}</span>
                          </span>
                        )}

                        <h4 className="text-sm font-bold text-neutral-900 dark:text-white font-mono break-all sm:truncate group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                          {repo.fullName}
                        </h4>

                        <a
                          href={repo.htmlUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white p-0.5 shrink-0"
                          title="View on GitHub"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>

                      {repo.description && (
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-1 leading-relaxed">
                          {repo.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-3.5 text-[11px] text-neutral-500 dark:text-neutral-400 font-mono pt-0.5">
                        {repo.language && (
                          <span className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300 font-medium">
                            <span className={`w-2 h-2 rounded-full ${langColor}`} />
                            <span>{repo.language}</span>
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-neutral-400" />
                          <span>{repo.stars}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <GitFork className="w-3 h-3 text-neutral-400" />
                          <span>{repo.forks}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <GitBranch className="w-3 h-3 text-neutral-400" />
                          <span>{repo.defaultBranch}</span>
                        </span>
                      </div>
                    </div>

                    {/* Launch Audit Button */}
                    <button
                      onClick={() => {
                        onSelectRepo(repo.fullName, repo.defaultBranch || 'main');
                        onClose();
                      }}
                      className="w-full sm:w-auto min-h-[40px] px-4 py-2 text-xs font-bold text-white bg-neutral-950 hover:bg-neutral-850 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-white rounded-lg transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-2xs hover:shadow-md"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{isAr ? 'بدء الفحص الآن' : 'Launch Audit'}</span>
                      <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="px-6 py-3.5 bg-neutral-50 dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 shrink-0">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>{isAr ? 'فحص مشفر وآمن دون أي تعديل على فرع main' : 'Zero commits to main branch · Ephemeral isolated analysis'}</span>
          </span>
          <button
            onClick={onClose}
            className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white cursor-pointer px-2 py-1"
          >
            {isAr ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
