# GitArmor AI — Implementation Plan (Full SaaS Platform)

**Version:** 2.0 — Full SaaS Scope
**Prepared for:** GitArmor AI — AI-Powered Automated Code Security Auditing & Auto-Remediation Platform
**Stack:** Firebase (Auth, Firestore, Cloud Functions, Cloud Storage) · GitHub REST/GraphQL APIs · Gemini API · Stripe · pnpm monorepo

---

## 1. Executive Summary

GitArmor AI is a complete multi-tenant SaaS product — not just a scan engine. A user signs up, connects GitHub, subscribes to a plan, and gets a full dashboard experience: repo management, scan history, vulnerability reports, an AI-generated Implementation Plan and Agent Prompt per scan, optional PR-based auto-remediation, before/after analytics, billing/usage management, and account/org settings. This plan covers the full product surface: **frontend, backend, database, billing, and operations** — everything required to run this as a real, paying-customer SaaS business, not a demo.

Guiding principles remain:
1. **Hybrid detection** (deterministic scanners + Gemini reasoning).
2. **Never push to `main` directly** — remediation lands as a reviewable PR.
3. **Least-privilege & tenant isolation by default.**
4. **Usage-based cost control** — every Gemini call and scan is metered against the org's plan.

---

## 2. Product Scope (SaaS Boundaries)

| In scope | Out of scope (V1) |
|---|---|
| Multi-tenant accounts (individual + organization) | On-prem/self-hosted deployment |
| Subscription billing (free/pro/team tiers) | Usage-based enterprise custom contracts (V2+) |
| Full web dashboard (not just report download) | Native mobile apps |
| Team seats, roles, shared repo access | SSO/SAML (V2, Team+ tier) |
| Public marketing/landing site + docs | Public API for third-party integrations (V2) |

---

## 3. System Architecture

```
┌───────────────────────────────────────────────────────────────────┐
│                        Marketing Site (public)                     │
│                    Next.js — static/ISR pages                      │
└───────────────────────────────────────────────────────────────────┘
                                   │
┌───────────────────────────────────────────────────────────────────┐
│                     App Frontend (authenticated)                    │
│         Next.js (React) + Tailwind — SPA-style dashboard            │
└───────────────────────────────────────────────────────────────────┘
                                   │  Firebase Auth (session/JWT)
┌───────────────────────────────────────────────────────────────────┐
│                        API Gateway (Cloud Functions)                 │
│   /auth   /repos   /scans   /reports   /billing   /org   /admin     │
└───────────────────────────────────────────────────────────────────┘
        │            │              │              │             │
        ▼            ▼              ▼              ▼             ▼
 ┌───────────┐ ┌───────────┐ ┌───────────────┐ ┌───────────┐ ┌──────────┐
 │ GitHub API │ │ Scan Engine │ │  Gemini API    │ │  Stripe    │ │ Firestore │
 │  Service   │ │ Orchestrator│ │  (analysis)    │ │  Billing   │ │ Database  │
 └───────────┘ └───────────┘ └───────────────┘ └───────────┘ └──────────┘
                      │
              ┌───────────────┐
              │ Deterministic   │
              │ Scanner Workers │
              │ (Cloud Run jobs)│
              │ gitleaks/semgrep│
              └───────────────┘
```

**Service breakdown (backend, all Cloud Functions unless noted):**

| Service | Responsibility |
|---|---|
| `auth-service` | GitHub OAuth flow, session/JWT issuance, org membership |
| `repo-service` | List/connect/disconnect repos, permission checks |
| `scan-orchestrator` | Job queueing, chunking, calls scanner workers + Gemini, writes findings |
| `scanner-worker` (Cloud Run) | Ephemeral, sandboxed — runs gitleaks/semgrep/OSV checks |
| `remediation-service` | Branch creation, patch application, PR creation |
| `report-service` | Generates report.md/json, implementation-plan.md, agent-prompt.txt |
| `billing-service` | Stripe webhook handling, plan enforcement, usage metering |
| `org-service` | Organizations, seats, invites, roles |
| `notification-service` | Email (scan complete, PR opened, billing events) |
| `admin-service` | Internal ops endpoints (support, plan overrides, abuse review) |

---

## 4. Database Schema (Firestore — collection design)

```
users/{userId}
  - email, displayName, githubId, createdAt
  - defaultOrgId

organizations/{orgId}
  - name, ownerId, plan, stripeCustomerId, createdAt
  - settings: { autoRemediationEnabled, retentionDays }

organizations/{orgId}/members/{userId}
  - role: "owner" | "admin" | "member"
  - joinedAt

organizations/{orgId}/repos/{repoId}
  - githubRepoFullName, connectedBy, connectedAt
  - defaultBranch, webhookEnabled

organizations/{orgId}/repos/{repoId}/scans/{scanId}
  - status: "queued"|"running"|"completed"|"failed"
  - commitSha, triggeredBy, startedAt, completedAt
  - riskScore, findingsBySeverity, findingsByCategory
  - reportUrl, planUrl, promptUrl (Cloud Storage signed refs)

organizations/{orgId}/repos/{repoId}/scans/{scanId}/findings/{findingId}
  - file, line, ruleId, severity, category, cwe/owaspMapping
  - description, evidence (redacted), remediationSummary
  - status: "open"|"fixed"|"ignored"|"false_positive"

organizations/{orgId}/repos/{repoId}/remediations/{remediationId}
  - scanId, branchName, prUrl, prStatus, workPackagesIncluded[]
  - createdAt, mergedAt (nullable)

organizations/{orgId}/tokens/{provider}   (KMS-encrypted blob, access-restricted)
  - encryptedToken, scopes, expiresAt

billing/{orgId}
  - stripeSubscriptionId, planId, status, currentPeriodEnd
  - usage: { scansThisPeriod, geminiTokensThisPeriod }

auditLog/{orgId}/entries/{entryId}
  - actor, action, target, timestamp
```

**Design notes:**
- Every data-bearing collection is nested under `organizations/{orgId}` — this is the tenant-isolation boundary enforced by Firestore Security Rules (no cross-org reads, even accidentally).
- Findings store *redacted* evidence by default (full evidence requires an explicit "reveal" action, logged to `auditLog`).
- `billing.usage` is the metering source of truth used to enforce plan limits before a scan is queued.

---

## 5. Frontend Architecture

**Marketing site** (public, unauthenticated, SEO-focused): Home, Pricing, Docs, Blog, Security/Trust page (important for a security product — build credibility).

**App (authenticated), route map:**

| Route | Purpose |
|---|---|
| `/onboarding` | Connect GitHub → select org → pick plan (or start free trial) |
| `/dashboard` | Org-level overview: connected repos, recent scans, risk score trend |
| `/repos` | Repo list, connect new repo |
| `/repos/:id` | Repo detail: scan history, "Run Scan" action |
| `/repos/:id/scans/:scanId` | Full report viewer — findings grouped by severity/category, Implementation Plan tab, Agent Prompt tab (copy/download) |
| `/repos/:id/remediations/:id` | PR status tracker |
| `/analytics` | Org-wide risk trend, cross-repo comparison |
| `/settings/org` | Org profile, member management, roles |
| `/settings/billing` | Plan, usage this period, invoices, upgrade/downgrade |
| `/settings/integrations` | GitHub connection management, webhook status |
| `/admin/*` | Internal-only: support tools, plan overrides, flagged-repo review |

**Frontend stack:** Next.js (App Router), Tailwind, component library kept in `packages/ui` in the monorepo so marketing site and app share design tokens.

---

## 6. Subscription & Billing

**Provider:** Stripe (Checkout + Billing Portal + Webhooks).

**Suggested tiers:**

| Tier | Price point | Includes |
|---|---|---|
| Free | $0 | 1 repo, 3 scans/month, report + plan + prompt (no auto-remediation) |
| Pro | Paid, per user | Unlimited repos (fair-use cap), more scans/month, auto-remediation (PR flow) enabled |
| Team | Paid, per seat | Everything in Pro + team seats/roles, shared org analytics, priority scan queue |

**Flow:**
1. Stripe Checkout on plan selection → `checkout.session.completed` webhook → `billing-service` updates `billing/{orgId}`.
2. Every scan request checks `billing.usage` against plan limits **before** enqueueing (hard stop, not after-the-fact overage — avoids surprise bills for users and runaway Gemini cost for you).
3. Stripe Billing Portal embedded in `/settings/billing` for self-service upgrade/downgrade/cancel.
4. Usage resets on `invoice.paid` webhook (new billing period).

---

## 7. Core Scan Pipeline

*(Unchanged from prior technical design — retained here for completeness.)*

1. **Ingestion**: shallow clone into ephemeral, network-restricted Cloud Run worker.
2. **Deterministic pass**: gitleaks (secrets), semgrep (OWASP Top 10 + language rulesets), OSV dependency check, custom log-leak detector (console/print statements exposing PII/user IDs/tokens).
3. **AI reasoning pass (Gemini)**: two-pass chunking — Pass A per-module contextual/business-logic analysis, Pass B synthesis/triage/prioritization over all findings. Bounded concurrency queue for cost/rate control.
4. **Report generation**: `report.md/json`, `implementation-plan.md`, `agent-prompt.txt` — all stored per-scan in Cloud Storage, referenced from Firestore.
5. **Optional remediation**: see §8.
6. **Analytics snapshot**: written to `scans/{scanId}` for trend charts.

---

## 8. Auto-Fix & Pull Request Workflow

Unchanged core rule: **GitArmor never pushes to `main`/protected branches directly.**

1. User opts in per work-package (not all-or-nothing) from the report viewer.
2. `remediation-service` creates branch `gitarmor/fix-<scanId>`.
3. Gemini generates scoped unified diffs per approved finding.
4. Patches applied in sandbox; optional "safe execution" (opt-in, capped) runs existing test suite.
5. Conventional commit created; PR opened with summary + before/after risk delta + link to full report.
6. User merges manually via GitHub. `remediations/{id}.prStatus` tracked via GitHub webhook.

---

## 9. Multi-Tenancy & Data Isolation

- **Tenant boundary** = `organizations/{orgId}` subtree. All Firestore Security Rules and Cloud Function authorization checks validate `orgId` membership on every read/write — no shared top-level collections for tenant data.
- **Scanner workers are single-tenant per job**: one Cloud Run job instance processes exactly one org's scan, then is destroyed. No shared filesystem/state between tenants.
- **Rate limiting and quota** enforced per `orgId`, not per user, to prevent one org's usage from affecting others' scan queue latency.
- **Data export & deletion**: self-service "Export my org's data" and "Delete organization" in `/settings/org`, satisfying basic data-portability expectations for a security-adjacent product.

---

## 10. Analytics (Org-Level)

Builds on the per-scan snapshot model:
- **Repo view**: risk score trend line per repo, findings-by-category breakdown.
- **Org view**: aggregate risk score across all repos, "most improved" / "highest risk" repo ranking, remediation velocity (avg. time from finding → merged fix).
- **Before/after PR view**: risk score delta directly attached to each remediation PR record.

---

## 11. API Design (expanded)

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/auth/github/callback` | GET | OAuth callback, token exchange |
| `/api/orgs` | POST/GET | Create/list organizations |
| `/api/orgs/:id/members` | POST/GET | Invite/list members |
| `/api/orgs/:id/repos` | GET/POST | List/connect repos |
| `/api/orgs/:id/repos/:repoId/scans` | POST/GET | Trigger/list scans |
| `/api/scans/:id` | GET | Scan status/results |
| `/api/scans/:id/report` | GET | Signed URLs for report/plan/prompt |
| `/api/scans/:id/remediate` | POST | Trigger auto-fix → PR flow |
| `/api/orgs/:id/analytics` | GET | Historical risk-score series |
| `/api/orgs/:id/billing` | GET | Current plan, usage, invoices |
| `/api/orgs/:id/billing/checkout` | POST | Create Stripe Checkout session |
| `/api/orgs/:id/billing/portal` | POST | Create Stripe Billing Portal session |
| `/api/admin/*` | — | Internal-only, separate auth guard |

---

## 12. Security Architecture

- **Token storage**: GitHub OAuth tokens encrypted via Cloud KMS envelope encryption, decrypted only inside ephemeral workers, never logged.
- **OAuth scopes**: minimum necessary; write scopes (`pull_request`) requested only when the org enables auto-remediation.
- **Sandboxing**: no arbitrary execution of target-repo code by default (static analysis only); "safe execution" for tests is opt-in, sandboxed, resource/time-capped.
- **Tenant isolation**: enforced at Firestore rules + function-level authorization (see §9).
- **CI/CD**: GitHub Actions + Workload Identity Federation — no long-lived service account keys.
- **Secrets in findings**: redacted by default in UI; "reveal" logged to `auditLog`.

---

## 13. Admin / Internal Ops Dashboard

- Support tools: look up an org by email/repo, view scan status, re-trigger failed scans.
- Plan overrides: manual comping, trial extensions.
- Abuse review: flag orgs scanning repos they don't appear to own (heuristic + manual review queue).
- Cost monitoring: Gemini spend per org vs. plan revenue (guardrail against unprofitable heavy users on Free tier).

---

## 14. Onboarding & Growth

1. Sign up (GitHub OAuth) → auto-create personal org.
2. Connect first repo → immediate first scan on Free tier (time-to-value fast, before any paywall).
3. Report viewer ends with a clear upgrade prompt when hitting Free-tier limits (scans/month, auto-remediation locked).
4. Marketing site "Security" page documents the sandboxing/token-encryption model — this is a trust-sensitive product category, worth investing in explicit trust messaging.

---

## 15. Phased Rollout Plan

**Phase 0 — SaaS Foundation**
- Firebase Auth + GitHub OAuth, org data model, Firestore Security Rules, Stripe integration skeleton, base frontend shell (dashboard nav, settings, billing pages).

**Phase 1 — MVP Scan Engine (Free tier only)**
- Repo connect, scan pipeline (deterministic + Gemini), report/plan/prompt generation and viewer, usage metering (soft-capped, no billing enforcement yet).

**Phase 2 — Paid Plans**
- Stripe Checkout/Portal live, plan enforcement on scan quota, Pro tier unlocks auto-remediation.

**Phase 3 — Auto-Remediation**
- Branch/PR flow, per-work-package opt-in, PR status tracking.

**Phase 4 — Analytics & Team Features**
- Org-level analytics dashboard, team seats/roles.

**Phase 5 — Ops Maturity**
- Admin dashboard, abuse review, cost-monitoring guardrails, scheduled re-scans via GitHub webhooks.

---

## 16. Testing & QA Strategy

- Benchmark corpus (deliberately vulnerable repos) for scanner precision/recall regression testing.
- Golden-file tests for report/plan/prompt generation given fixed findings input.
- Firestore Security Rules unit tests (tenant-isolation is a correctness-critical, not just a nice-to-have, test surface).
- Stripe webhook integration tests (subscription lifecycle: created, updated, cancelled, payment failed).
- Patch-safety tests for auto-remediation diffs (scope assertions — no unrelated file changes).

---

## 17. Out of Scope for V1

- On-prem/self-hosted deployment.
- SSO/SAML.
- Public third-party API.
- Dynamic execution of target-repo code for runtime error detection (static log-pattern detection covers the highest-value subset for launch).
- Auto-merge of remediation PRs.

---

## 18. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Cross-tenant data leak | Firestore Security Rules tests, org-scoped collections, single-tenant scanner workers |
| Gemini/infra cost outpaces Free-tier revenue | Hard usage caps enforced pre-scan, cost-per-org monitoring in admin dashboard |
| Billing sync bugs (Stripe ↔ Firestore drift) | Stripe as source of truth, idempotent webhook handlers, periodic reconciliation job |
| False positives erode trust | Hybrid deterministic+AI pipeline, benchmark corpus testing, confidence scoring |
| Users distrust auto-fix touching their code | PR-only workflow, no auto-merge, full diff visibility, per-package opt-in |
| Legal/liability for missed vulnerabilities | Clear ToS: best-effort detection, not a compliance guarantee |

---

## 19. Milestones & Timeline

| Milestone | Deliverable |
|---|---|
| M1 | SaaS foundation: auth, org model, Security Rules, base frontend shell |
| M2 | Scan pipeline end-to-end (deterministic + Gemini), report/plan/prompt generation |
| M3 | Report/plan/prompt viewer UI, Free-tier launch (MVP) |
| M4 | Stripe billing live, plan enforcement |
| M5 | Branch/PR auto-remediation flow |
| M6 | Org analytics dashboard, team seats |
| M7 | Admin ops dashboard, scheduled re-scans, cost guardrails |
