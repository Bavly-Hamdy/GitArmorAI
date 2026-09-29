import React from 'react';
import { BillingPlan } from '../types';
import { BILLING_PLANS } from '../data/mockData';
import { Check, Shield, CreditCard, ArrowRight, Gauge } from 'lucide-react';

interface BillingPricingProps {
  currentPlanId?: 'free' | 'pro' | 'team';
  onSelectPlan?: (planId: 'free' | 'pro' | 'team') => void;
  lang?: 'ar' | 'en';
}

export function BillingPricing({ currentPlanId = 'pro', onSelectPlan, lang = 'en' }: BillingPricingProps) {
  const isAr = lang === 'ar';
  const [selectedPlan, setSelectedPlan] = React.useState<'free' | 'pro' | 'team'>(currentPlanId);
  const [checkoutModal, setCheckoutModal] = React.useState<BillingPlan | null>(null);
  const [upgraded, setUpgraded] = React.useState(false);

  const activePlan = BILLING_PLANS.find(p => p.id === selectedPlan) || BILLING_PLANS[1];

  const handleCheckout = (plan: BillingPlan) => {
    setCheckoutModal(plan);
  };

  const confirmStripePayment = () => {
    if (!checkoutModal) return;
    setSelectedPlan(checkoutModal.id);
    onSelectPlan?.(checkoutModal.id);
    setUpgraded(true);
    setTimeout(() => {
      setUpgraded(false);
      setCheckoutModal(null);
    }, 1500);
  };

  return (
    <div className="space-y-8">
      {/* Current Quota Consumption Card */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-700 dark:text-neutral-300">
              <Gauge className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <span>{isAr ? 'نظام الحصص المسبق والتحكم بالتكاليف' : 'Pre-Flight Quota Gate & Metering'}</span>
                <span className="text-[10px] bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 px-2 py-0.5 rounded font-mono uppercase">
                  {activePlan.id} TIER
                </span>
              </h4>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
                {isAr
                  ? 'يتم التحقق آلياً من استهلاك المؤسسة لعمليات الفحص وتوكنز الذكاء الاصطناعي قبل بدء أي فحص جديد لمنع أي تكاليف غير متوقعة.'
                  : 'Hard quota verification prevents runaway costs or surprise overages prior to queueing.'}
              </p>
            </div>
          </div>

          <div>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              {isAr ? 'الباقة الحالية:' : 'Active Tier:'}{' '}
              <strong className="text-neutral-900 dark:text-white font-semibold">
                {isAr ? activePlan.nameAr : activePlan.name}
              </strong>
            </span>
          </div>
        </div>

        {/* Meters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-neutral-50 dark:bg-neutral-950 rounded-lg border border-neutral-200 dark:border-neutral-800">
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="text-neutral-700 dark:text-neutral-300 font-medium">
                {isAr ? 'عمليات الفحص المستهلكة هذا الشهر:' : 'Monthly Scans Incurred:'}
              </span>
              <span className="font-mono text-neutral-900 dark:text-white tabular-nums font-bold">
                {activePlan.scansUsed} / {activePlan.scansLimit}
              </span>
            </div>
            <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-neutral-900 dark:bg-white h-full rounded-full transition-all duration-500"
                style={{ width: `${(activePlan.scansUsed / activePlan.scansLimit) * 100}%` }}
              />
            </div>
          </div>

          <div className="p-4 bg-neutral-50 dark:bg-neutral-950 rounded-lg border border-neutral-200 dark:border-neutral-800">
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="text-neutral-700 dark:text-neutral-300 font-medium">
                {isAr ? 'استهلاك توكنز Gemini 3.8 Flash:' : 'Gemini Flash Tokens:'}
              </span>
              <span className="font-mono text-neutral-900 dark:text-white tabular-nums font-bold">
                {(activePlan.aiTokensUsed / 1000).toFixed(0)}k / {(activePlan.aiTokensLimit / 1000).toFixed(0)}k
              </span>
            </div>
            <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-neutral-900 dark:bg-white h-full rounded-full transition-all duration-500"
                style={{ width: `${(activePlan.aiTokensUsed / activePlan.aiTokensLimit) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {BILLING_PLANS.map(plan => {
          const isSelected = selectedPlan === plan.id;
          return (
            <div
              key={plan.id}
              className={`rounded-xl border p-6 flex flex-col justify-between transition-colors shadow-2xs relative ${
                isSelected
                  ? 'bg-white dark:bg-neutral-900 border-neutral-950 dark:border-white ring-1 ring-neutral-950 dark:ring-white'
                  : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                    {isAr ? plan.nameAr : plan.name}
                  </h3>
                  {isSelected && (
                    <span className="text-[11px] text-neutral-800 dark:text-neutral-200 font-semibold bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded border border-neutral-200 dark:border-neutral-700">
                      {isAr ? 'باقتك الحالية' : 'Current Plan'}
                    </span>
                  )}
                </div>

                <div className="mb-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-neutral-900 dark:text-white font-mono tabular-nums">
                      ${plan.priceUSD}
                    </span>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                      {isAr ? '/شهرياً' : '/month'}
                    </span>
                  </div>
                  <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block mt-1">
                    {isAr ? `تتضمن ${plan.scansLimit} فحص أمني شهرياً` : `Includes ${plan.scansLimit} scans/mo`}
                  </span>
                </div>

                {/* Feature Checklist */}
                <div className="space-y-2.5 pt-4 border-t border-neutral-100 dark:border-neutral-800 text-xs">
                  {(isAr ? plan.featuresAr : plan.features).map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-neutral-700 dark:text-neutral-300">
                      <Check className="w-3.5 h-3.5 text-neutral-900 dark:text-neutral-100 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => handleCheckout(plan)}
                  className={`w-full py-2.5 px-4 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs ${
                    isSelected
                      ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-300 dark:border-neutral-700'
                      : plan.id === 'pro'
                      ? 'bg-neutral-950 hover:bg-neutral-850 text-white dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-white'
                      : 'bg-white hover:bg-neutral-50 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-900 dark:text-neutral-100 border border-neutral-300 dark:border-neutral-700'
                  }`}
                >
                  {isSelected ? (
                    <span>{isAr ? 'إدارة الاشتراك الحالي' : 'Manage Subscription'}</span>
                  ) : (
                    <>
                      <span>{isAr ? `الترقية إلى ${plan.nameAr}` : `Upgrade to ${plan.name}`}</span>
                      <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stripe Checkout Simulation Modal */}
      {checkoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-950/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl w-full max-w-md p-5 sm:p-6 shadow-2xl space-y-4 sm:space-y-5 max-h-[94vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-2 text-neutral-900 dark:text-white font-bold text-sm">
                <CreditCard className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
                <span>{isAr ? 'بوابة Stripe الآمنة للاشتراكات' : 'Stripe Secure Checkout'}</span>
              </div>
              <button
                onClick={() => setCheckoutModal(null)}
                className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-neutral-50 dark:bg-neutral-950 rounded-lg border border-neutral-200 dark:border-neutral-800 text-xs flex justify-between items-center">
                <span className="text-neutral-600 dark:text-neutral-400">{isAr ? 'الترقية المختارة:' : 'Selected Plan:'}</span>
                <span className="font-bold text-neutral-900 dark:text-white">{isAr ? checkoutModal.nameAr : checkoutModal.name}</span>
              </div>

              <div className="p-3 bg-neutral-50 dark:bg-neutral-950 rounded-lg border border-neutral-200 dark:border-neutral-800 text-xs flex justify-between items-center">
                <span className="text-neutral-600 dark:text-neutral-400">{isAr ? 'المبلغ المستحق:' : 'Total Due:'}</span>
                <span className="font-bold text-neutral-900 dark:text-white font-mono text-base">${checkoutModal.priceUSD} / mo</span>
              </div>

              <div className="p-3 bg-neutral-50 dark:bg-neutral-950 rounded-lg border border-neutral-200 dark:border-neutral-800 text-[11px] text-neutral-600 dark:text-neutral-400 space-y-1">
                <div className="flex items-center gap-1.5 text-neutral-800 dark:text-neutral-200">
                  <Shield className="w-3.5 h-3.5 text-neutral-700 dark:text-neutral-300" />
                  <span>{isAr ? 'إلغاء وتعديل الاشتراك في أي وقت بنقرة واحدة' : 'Cancel or change anytime with 1 click'}</span>
                </div>
                <span>{isAr ? 'تفعيل فوري لطلبات السحب العلاجية والحصص الموسعة' : 'Instant activation of auto-remediation PRs'}</span>
              </div>
            </div>

            <button
              onClick={confirmStripePayment}
              disabled={upgraded}
              className="w-full py-2.5 text-xs font-medium text-white bg-neutral-950 hover:bg-neutral-850 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-white rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              {upgraded ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>{isAr ? 'تم تأكيد الترقية بنجاح!' : 'Upgrade Confirmed!'}</span>
                </>
              ) : (
                <span>{isAr ? 'تأكيد الاشتراك عبر Stripe' : 'Confirm via Stripe Checkout'}</span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
