# GitArmor AI — Product Specification Kit (SPECKIT)

**Product Name:** GitArmor AI  
**Specification Version:** 3.0.0 (Full Technical & Product Scope)  
**Document Classification:** Comprehensive Product Requirements Document (PRD) & Technical Feature Catalog  
**Platform Target:** Modern Web (Desktop & Tablet), Cross-Browser (Chrome, Safari, Firefox, Edge)  

---

## 1. Product Vision, Problem Space & Core Mission

### 1.1. The Critical Problem
In modern software engineering organizations, security testing tools generate an overwhelming volume of static alerts. Developers are bombarded with hundreds of "vulnerability flags" that lack context, provide no code fixes, and have an unacceptably high rate of false positives. As a result, critical security risks remain unpatched in code repositories for months.

### 1.2. The GitArmor AI Solution
GitArmor AI transforms application security from a passive scanner into an **active autonomous remediation partner**:
- **Semantic Code Reasoning:** Leverages Google Gemini 2.5 Flash to understand code semantics across interrelated files, distinguishing real security flaws from false alarms.
- **The Artifact Trinity:** Instantly generates three actionable artifacts for every scan:
  1. `report.md` / `report.json`: Executive and technical vulnerability breakdown.
  2. `implementation-plan.md`: Prioritized P0/P1/P2 remediation roadmap.
  3. `agent-prompt.txt`: Ready-to-use prompt for autonomous AI coding agents (Claude, Gemini, Cursor).
- **Automated Pull Request Landing:** Synthesizes surgical, syntax-valid unified diff patches and submits automated Pull Requests (`gitarmor/fix-*`) to GitHub without touching the protected `main` branch.
- **Enterprise SaaS Ergonomics:** Multi-tenant workspace management, team seat invitations, metered billing quotas, and immutable audit logs.

---

## 2. User Personas & Permissions Matrix

### 2.1. User Personas

| Persona | Primary Goals | Key Platform Interactions | Pain Points Solved |
| :--- | :--- | :--- | :--- |
| **DevSecOps Lead / CISO** | Complete repository visibility, compliance governance, automated security posture tracking. | Monitors organization security scores, reviews audit logs, configures Webhook alerts, sets retention policies. | Eliminates manual compliance reporting and provides instant visibility into repository security posture. |
| **Senior Software Engineer** | Rapid vulnerability resolution, avoiding broken builds, preserving sprint velocity. | Launches branch audits, inspects code diffs, uses AI Co-Pilot to understand attacks, merges auto-remediation PRs. | Eliminates manual vulnerability research and writes surgical patch diffs automatically. |
| **Engineering Manager** | Risk mitigation, team capacity planning, license & quota cost management. | Manages workspace seats, upgrades billing tiers, tracks mean time to remediate (MTTR) trends. | Prevents costly security breaches and controls AI inference spend with hard monthly quotas. |
| **Security Compliance Auditor** | Verification of OWASP Top 10, CWE, and SOC2 security baselines. | Downloads Markdown/JSON audit artifacts, reviews cryptographic proof, inspects chronological audit trails. | Provides timestamped evidence of vulnerability discovery, triage, and resolution. |

### 2.2. Role-Based Access Control (RBAC) Matrix

| Action / Capability | Organization Owner | Organization Admin | Developer / Member | Viewer / Guest |
| :--- | :---: | :---: | :---: | :---: |
| Launch New Repository Scan | ✅ | ✅ | ✅ | ❌ |
| View Scan Results & Artifacts | ✅ | ✅ | ✅ | ✅ |
| Trigger Auto-Remediation PR | ✅ | ✅ | ✅ | ❌ |
| Use Interactive Co-Pilot AI | ✅ | ✅ | ✅ | ✅ |
| Connect / Disconnect Repositories | ✅ | ✅ | ❌ | ❌ |
| Invite / Remove Team Members | ✅ | ✅ | ❌ | ❌ |
| Manage Billing & Upgrade Plans | ✅ | ❌ | ❌ | ❌ |
| Configure Webhooks & Integrations | ✅ | ✅ | ❌ | ❌ |
| View Audit Logs | ✅ | ✅ | ❌ | ❌ |
| View Platform Admin Telemetry | ✅ | ❌ | ❌ | ❌ |

---

## 3. Comprehensive Feature Specifications

### 3.1. Authentication & Onboarding Subsystem
- **GitHub OAuth 2.0 Integration:** 
  - Standard OAuth authorization redirect via `GET /api/auth/github`.
  - Secure callback token exchange via `GET /api/auth/github/callback`.
  - Scope requests: `repo`, `user`, `workflow` for private and public repository inspection.
- **Direct GitHub Profile Resolution:**
  - Fast onboarding for developers who want to inspect their public work instantly without entering credentials.
  - Fetches live avatar, public repo count, bio, and follower metrics via `GET /api/github/user-profile`.
- **Custom Credentials Registration:**
  - Fallback registration with Name and Email for enterprise users operating without GitHub accounts.
- **Session Durability & Clean Sign-Out:**
  - Active user credentials and tokens persist in `localStorage` (`gitarmor_user`, `gitarmor_github_token`, `gitarmor_active_org`).
  - Single-click **Sign Out** clears all `gitarmor_*` keys, terminates session state, and redirects immediately to `/onboarding`.

### 3.2. Multi-Tenant Workspaces & Organization Management
- **Hierarchical Tenancy:**
  - Users can create and belong to multiple organizations (e.g., Personal Workspace, Enterprise Team).
  - Default workspace auto-initialized for instant use (`org-default`).
- **Team Seat & Member Management:**
  - Invite members via email with explicit role assignments (`owner`, `admin`, `developer`, `viewer`).
  - Real-time seat tracking against plan limits.
- **Repository Portfolio:**
  - Connect unlimited public and private GitHub repositories.
  - Tracks default branch, connection date, and latest scan rating.
- **Persistence Guarantee:**
  - Auto-syncs all organization records, member rosters, and repository links to `data/gitarmor_db.json` and Cloud Firestore.

### 3.3. Autonomous Security Scan Engine
- **Tree Ingestion Pipeline:**
  - Ingests repository structure using the GitHub Git Trees API (`recursive=1`).
  - Automatic 401 fallback: If an expired Personal Access Token is detected, automatically switches to anonymous fetching for public repositories.
  - White-list code filtering: Analyzes `.ts`, `.tsx`, `.js`, `.jsx`, `.py`, `.go`, `.java`, `.rb`, `.php`, `.cs`, `.json`, `.yaml`, `.env`.
  - Directory exclusions: Automatically skips `node_modules`, `dist`, `build`, `.git`, `vendor`, `coverage`.
- **Multi-Tier AI Fallback Engine:**
  - Primary model: `gemini-2.5-flash` (ultra-fast inference, 1M+ token context).
  - Secondary fallback: `gemini-2.0-flash`.
  - Tertiary fallback: `gemini-1.5-flash`.
- **Security Scoring Algorithm:**
  - Dynamic score from `0` to `100` calculated by formula:
    $$\text{Score} = \max(0, 100 - (N_{\text{crit}} \times 25 + N_{\text{high}} \times 15 + N_{\text{med}} \times 5 + N_{\text{low}} \times 1))$$
- **Vulnerability Classification:**
  - Standardized taxonomy mapping to MITRE CWE (CWE-89, CWE-79, CWE-798, CWE-22, CWE-502) and OWASP Top 10.
  - Severity tiers: `Critical`, `High`, `Medium`, `Low`, `Info`.

### 3.4. The Artifact Trinity
Every completed scan produces three production-grade deliverables:
1. **Audit Report (`report.md` / `report.json`):**
   - Executive summary table of findings categorized by severity.
   - Detailed finding cards with file path, line numbers, CWE rule, description, and redacted code evidence.
2. **Implementation Plan (`implementation-plan.md`):**
   - Actionable remediation roadmap structured into prioritized work packages:
     - `Work Package 0 (P0)`: Immediate critical vulnerability hotfixes.
     - `Work Package 1 (P1)`: High-severity architectural defenses.
     - `Work Package 2 (P2/P3)`: Medium and low hygiene improvements.
   - Verification checklist with unit testing strategies.
3. **Agentic Remediation Prompt (`agent-prompt.txt`):**
   - Self-contained, context-rich prompt tailored for autonomous coding agents (Claude, Gemini, Cursor, Copilot) to generate exact, non-breaking unified diff patches.

### 3.5. Autonomous Auto-Remediation & PR Automation
- **Surgical Unified Diff Synthesis:** Formulates minimal, context-preserving unified diffs resolving each vulnerability.
- **Main Branch Protection:** Strictly forbids direct commits to `main` or `master`.
- **Branch & Pull Request Creation:**
  - Forks a new branch: `refs/heads/gitarmor/fix-<scanId>`.
  - Commits the unified diff patch with clear author attribution.
  - Opens a Pull Request on GitHub containing an executive vulnerability summary, CWE references, and verification testing steps.

### 3.6. Contextual AI Security Co-Pilot
- **Embedded Interactive Sidebar:** Accessible directly within the scan dashboard and finding details.
- **Grounded Context:** Automatically ingests the selected file name, line numbers, CWE classification, and redacted code snippet.
- **Engineering Advisory:** Explains exploit mechanics, demonstrates attack payloads, and generates custom remediation code.

### 3.7. Metered Billing, Quotas & Plans
- **Tier Structure:**
  - **Free Tier ($0/mo):** 5 scans/month · 100,000 Gemini tokens · 1 team member.
  - **Pro Tier ($49/mo):** 50 scans/month · 2,000,000 Gemini tokens · Automated PRs · 5 team seats.
  - **Team Tier ($199/mo):** 250 scans/month · 10,000,000 Gemini tokens · Webhook automation · Unlimited seats.
- **Pre-Flight Quota Gate:** Rejects scan requests with HTTP 402 if the monthly scan limit is reached.
- **Persistent Plan Management:** Endpoint `POST /api/orgs/:orgId/billing/checkout` immediately updates plan tier and persists quota expansions to disk.

### 3.8. Security Analytics & Trends
- **Zero Fabricated Data:** All charts and metrics derive 100% from active scan records.
- **Visualizations (Recharts):**
  - Vulnerability distribution by CWE category and severity.
  - Historical security score progression over time.
  - Mean Time to Remediate (MTTR) performance tracking.
- **Clean Empty States:** Displays an aesthetic empty state when no scans have been performed yet.

### 3.9. Enterprise Audit Logging
- **Immutable Event Stream:** Captures critical platform events:
  - `scan.started` / `scan.completed`
  - `billing.plan_upgraded`
  - `remediation.pr_created`
  - `member.invited` / `member.removed`
- **Metadata Logged:** Event ID, Organization ID, Actor UID, Actor Email, Action, Target, Details object, and Epoch Timestamp.
- **Disk Persistence:** Recorded in `data/gitarmor_db.json` and queryable via `GET /api/orgs/:orgId/audit`.

### 3.10. Webhooks & CI/CD Integrations
- **Diagnostic Webhook Tester:** `POST /api/webhook/test` dispatches a test HTTP POST payload to user-configured Slack, Discord, or custom webhook URLs and reports HTTP status.
- **GitHub Webhook Listener:** `POST /api/webhook/scan` accepts GitHub `push` and `pull_request` event payloads and automatically queues security audits.

### 3.11. Admin Operations Center
- **System KPIs:** Live aggregation of total scans, total organizations, active remediations, and uptime.
- **AI Spend Metering:** Real-time calculation of estimated Gemini USD spend based on cumulative token usage.
- **Global Audit Stream:** Live stream of recent system-wide administrative and security actions.

---

## 4. User Interface Architecture & Screen Specifications

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                 APP NAVIGATION BAR                              │
│  [Logo: GitArmor AI]  Dashboard  Scans  Repositories  Analytics  Admin  [Org]   │
└─────────────────────────────────────────────────────────────────────────────────┘
                                         │
    ┌────────────────────────────────────┼────────────────────────────────────┐
    ▼                                    ▼                                    ▼
┌─────────────────────────┐  ┌─────────────────────────┐  ┌─────────────────────────┐
│    `/dashboard`         │  │    `/scans/:id`          │  │    `/settings/billing`  │
│ • Bento Grid Layout     │  │ • SVG Score Gauge (0-100)│  │ • Free / Pro / Team     │
│ • Radial Score Meter    │  │ • Severity Pills (Tabs)  │  │ • Scan Quota Meter      │
│ • Scan Frequency Chart  │  │ • Finding Detail Cards   │  │ • Token Quota Meter     │
│ • Recent Audits Table   │  │ • Monaco Diff Viewer     │  │ • Instant Upgrade Btn   │
│ • Quick Scan Launcher   │  │ • Co-Pilot Drawer (Chat) │  │ • Customer Portal Link  │
└─────────────────────────┘  └─────────────────────────┘  └─────────────────────────┘
```

---

## 5. Non-Functional & Security Specifications

1. **Security Headers:** All responses include `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection: 1; mode=block`, `Referrer-Policy: strict-origin-when-cross-origin`.
2. **Rate Limiting:** Enforces a maximum of 100 requests per 15-minute window per IP across all `/api/` routes via `express-rate-limit`.
3. **Payload Sanitization:** All incoming JSON payloads are validated against strict Zod schemas before reaching business logic.
4. **Credential Isolation:** Private keys (`GEMINI_API_KEY`, `FIREBASE_SERVICE_ACCOUNT_KEY`) are kept exclusively on the server and are never exposed in client bundles.
5. **Data Durability:** Every mutation automatically flushes to `data/gitarmor_db.json`, guaranteeing data retention across system reboots.

---

## 6. Anti-AI Minimalist Design System & UX Principles

To deliver a world-class, professional DevSecOps platform and completely avoid tacky "AI-generated mockup" tropes, GitArmor AI adheres to strict **Anti-AI Minimalism** design standards inspired by Linear, Vercel, and Raycast:

### 6.1. Elimination of AI Design Tropes (Anti-AI Rules)
- **Zero Rainbow Gradients:** Banned multi-color neon text and gradient borders on standard cards.
- **Zero Blurry Glow Overuse:** Eliminated excessive blurry drop-shadow halos (`glow-cyan`, `glow-rose`). Replaced with tactile, crisp 1px borders (`border-zinc-800/80`).
- **No Cheesy "Sparkles" Clichés:** Removed generic magic wand/sparkles icons from developer controls. Replaced with engineering glyphs (`GitCommit`, `FileCode`, `Terminal`, `Activity`).
- **No Fluffy Buzzwords:** Banned cartoonish copy like "Cyber Health" or "Magic Fixes". Replaced with precise engineering terminology: "Repository Posture Rating", "Synthesize Patch", "Unified Diff", "AST Rule Matcher".

### 6.2. Swiss Precision & Monochrome Architecture
- **Obsidian & Zinc Base:** True matte dark mode surfaces (`#090B10`, `#0F131C`) with micro-borders (`rgba(255, 255, 255, 0.08)`).
- **Semantic Color Discipline:** Color is never used for decorative filler; it exists solely to communicate critical system state:
  - **Emerald (`#10B981`):** Clean repositories, fixed vulnerabilities, live PR status.
  - **Rose (`#F43F5E`):** Critical/High severity blocking vulnerabilities.
  - **Amber (`#F59E0B`):** Warnings, rate thresholds, medium risk hygiene defects.
  - **Monochrome White/Zinc:** Primary tactile buttons (`btn-minimal-primary`), navigation states, and high-contrast typography.
- **Dual-Font Typography Hierarchy:**
  - **Inter:** Refined sans-serif for UI chrome, headings, and descriptions with tight negative tracking (`-0.011em`).
  - **JetBrains Mono:** Monospace precision reserved for code evidence, commit SHAs, branch names, CWE codes, and metric counts.
- **High Information Density (Bento Grid):** Information-first layout where security metrics, recent audits, and quota gauges are structured for immediate scannability without wasted whitespace.

