import { SecurityScoreBreakdown } from '../types';

interface ScoreGaugeProps {
  score: SecurityScoreBreakdown;
  lang?: 'ar' | 'en';
}

export function ScoreGauge({ score, lang = 'ar' }: ScoreGaugeProps) {
  const isAr = lang === 'ar';
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score.score / 100) * circumference;

  const getScoreColor = () => {
    if (score.score >= 90) return '#10b981'; // Emerald
    if (score.score >= 75) return '#06b6d4'; // Cyan
    if (score.score >= 50) return '#f59e0b'; // Amber
    return '#ef4444'; // Red
  };

  const getGradeText = () => {
    if (score.grade === 'A') return isAr ? 'ممتاز (Grade A)' : 'Grade A';
    if (score.grade === 'B') return isAr ? 'جيد جداً (Grade B)' : 'Grade B';
    if (score.grade === 'C') return isAr ? 'متوسط (Grade C)' : 'Grade C';
    if (score.grade === 'D') return isAr ? 'منخفض (Grade D)' : 'Grade D';
    return isAr ? 'حرج (Grade F)' : 'Grade F';
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6 p-4 sm:p-6 bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-xl shadow-2xs transition-colors">
      <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            className="stroke-neutral-100 dark:stroke-neutral-800"
            strokeWidth="7"
            fill="transparent"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke={getScoreColor()}
            strokeWidth="7"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-neutral-900 dark:text-white tracking-tight tabular-nums font-mono">
            {score.score}
          </span>
          <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">/ 100</span>
        </div>
      </div>

      <div className="flex-1 text-center sm:text-start">
        <div className="flex items-center justify-center sm:justify-start gap-2 mb-1.5">
          <span className="text-base font-semibold text-neutral-900 dark:text-white">
            {isAr ? 'درجة أمان المستودع:' : 'Security Posture Score:'}
          </span>
          <span className="text-sm font-bold font-mono text-neutral-900 dark:text-neutral-100">
            {getGradeText()}
          </span>
        </div>

        <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed mb-3 max-w-md">
          {isAr
            ? `يبدأ التقييم من 100 نقطة ويتم خصم النقاط آلياً: (${score.criticalCount} حرجة × 25) + (${score.highCount} عالية × 15) + (${score.mediumCount} متوسطة × 5) + (${score.lowCount} منخفضة × 2).`
            : `Baseline starts at 100. Deductions: (${score.criticalCount} crit × 25) + (${score.highCount} high × 15) + (${score.mediumCount} med × 5) + (${score.lowCount} low × 2).`}
        </p>

        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-neutral-600 dark:text-neutral-400">
          <span className="text-red-600 dark:text-red-400 font-medium tabular-nums">
            {score.criticalCount} {isAr ? 'حرجة' : 'Critical'}
          </span>
          <span className="text-neutral-300 dark:text-neutral-700">·</span>
          <span className="text-amber-600 dark:text-amber-400 font-medium tabular-nums">
            {score.highCount} {isAr ? 'عالية' : 'High'}
          </span>
          <span className="text-neutral-300 dark:text-neutral-700">·</span>
          <span className="text-neutral-700 dark:text-neutral-300 font-medium tabular-nums">
            {score.mediumCount} {isAr ? 'متوسطة' : 'Medium'}
          </span>
          <span className="text-neutral-300 dark:text-neutral-700">·</span>
          <span className="text-neutral-500 dark:text-neutral-400 font-medium tabular-nums">
            {score.lowCount} {isAr ? 'منخفضة' : 'Low'}
          </span>
          <span className="text-neutral-300 dark:text-neutral-700">·</span>
          <span className="text-neutral-500 dark:text-neutral-400 font-mono tabular-nums">
            {isAr ? `إجمالي الخصم: -${score.penalty}` : `Penalty: -${score.penalty} pts`}
          </span>
        </div>
      </div>
    </div>
  );
}
