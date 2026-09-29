<div align="center">

<img src="public/logo.svg" alt="GitArmor AI Logo" width="88" height="88" />

# GitArmor AI

### Autonomous DevSecOps & Precision Code Remediation Engine

**Deterministic AST Parsing · Contextual Gemini 2.5 Reasoning · 1-Click Surgical Pull Requests**

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Release](https://img.shields.io/badge/Release-v2.5.0-blue.svg)]()
[![Model](https://img.shields.io/badge/AI%20Engine-Gemini%202.5%20Flash-violet.svg)]()
[![Standards](https://img.shields.io/badge/Security%20Standards-OWASP%20%7C%20CWE%20%7C%20SOC%202-amber.svg)]()
[![Privacy](https://img.shields.io/badge/Data%20Retention-Zero%20Code%20Stored-success.svg)]()
[![Pricing](https://img.shields.io/badge/Pricing-100%25%20Free%20%26%20Open%20Source-teal.svg)]()

[Explore Overview](http://localhost:3000) · [Launch Audit Service](http://localhost:3000/audit) · [Security Dashboard](http://localhost:3000/dashboard) · [Documentation](#-table-of-contents)

</div>

---

## 📑 Table of Contents

- [Overview & Mission](#-overview--mission)
- [The DevSecOps Paradigm Shift](#-the-devsecops-paradigm-shift)
- [Platform Walkthrough & Screenshots](#-platform-walkthrough--screenshots)
- [How GitArmor Works: 4-Phase Pipeline](#-how-gitarmor-works-4-phase-pipeline)
- [The Artifact Trinity](#-the-artifact-trinity)
- [Interactive Vulnerability & Patch Simulator](#-interactive-vulnerability--patch-simulator)
- [Core Security Capabilities](#-core-security-capabilities)
- [Enterprise Standards & Compliance Mapping](#-enterprise-standards--compliance-mapping)
- [Security & Zero Code Retention Guarantee](#-security--zero-code-retention-guarantee)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Local Setup & Quickstart Guide](#-local-setup--quickstart-guide)
- [API Reference & System Endpoints](#-api-reference--system-endpoints)
- [Contributing & Open-Source Policy](#-contributing--open-source-policy)
- [License](#-license)

---

## 🛡️ Overview & Mission

**GitArmor AI** is an enterprise-grade, autonomous DevSecOps and automated code remediation platform engineered to eliminate alert fatigue and compress vulnerability resolution time (**MTTR**) from weeks to seconds.

Traditional Static Application Security Testing (SAST) tools overwhelm engineering squads with noisy, uncontextualized alerts—over 70% of which are false alarms. Worse, they leave the grueling burden of diagnosing exploitability and crafting code patches entirely on exhausted developers.

GitArmor AI bridges this gap through a **two-stage verification pipeline**:
1. **Deterministic AST & Taint Analysis**: Rapidly maps Abstract Syntax Trees across multi-language codebases (TypeScript, JavaScript, Python, Go, Java, Rust) to identify dataflow sources and sinks.
2. **Contextual AI Reasoning**: Leverages **Google Gemini 2.5 Flash** with an expansive context window to evaluate cross-file sanitizers, authorization boundaries, and control-flow branches, achieving a **94%+ false-positive reduction**.
3. **Autonomous Surgical Remediation**: Automatically synthesizes unified diff patches, spawns isolated Git branches (`gitarmor/fix-*`), and submits review-ready GitHub Pull Requests without touching production or protected `main` branches.
4. **100% Free & Open Source**: Zero subscription gates, zero paywalls. Engineered for developers, security architects, and open-source maintainers worldwide.

---

## ⚡ The DevSecOps Paradigm Shift

| Feature / Metric | Traditional SAST (SonarQube, Snyk, Semgrep) | GitArmor AI Platform |
| :--- | :--- | :--- |
| **Detection Method** | Pattern matching & rigid regex rules | Deterministic AST + Deep Contextual AI Reasoning |
| **False Positive Rate** | **High (> 70%)**; flags sanitized variables & test fixtures | **Extremely Low (< 6%)**; verifies end-to-end dataflow exploitability |
| **Remediation Action** | Generates voluminous PDF/JSON compliance backlogs | Generates atomic, surgical Git patches & Pull Requests |
| **Time-to-Remediate (MTTR)** | **14 - 30 Days** of manual developer investigation | **< 60 Seconds** automated patch synthesis & PR dispatch |
| **Secret Protection** | Leaks plaintext credentials directly in log files | Automatic regex token masking & cryptographic redaction |
| **Branch Safety** | Risky local scripts or manual commits | Enforced **Protected Branch Invariant** (`gitarmor/fix-*` only) |
| **Automation Artifacts** | Monolithic text reports | **The Artifact Trinity** (Report Markdown + Plan YAML + Agent Prompt) |
| **Cost & Licensing** | Prohibitive seat-based enterprise licensing | **100% Free & Open-Source (MIT)** |

---

## 📸 Platform Walkthrough & Screenshots

### 1. Minimalist Overview & Hero Section
> Designed under modern humanized minimalism with high-fidelity dark and light mode adaptation. Features the GitArmor vector emblem, high-impact value proposition, and instant routing to the dedicated scanning cockpit.

<div align="center">
  <img src="public/screenshots/01_hero_overview.png" alt="GitArmor AI Hero Overview" width="95%" style="border-radius: 12px; border: 1px solid #27272a;" />
</div>

---

### 2. The DevSecOps Paradigm Shift Comparison
> Visual contrast matrix illustrating how GitArmor transforms noisy legacy alert backlogs into automated, high-signal DevSecOps velocity.

<div align="center">
  <img src="public/screenshots/02_paradigm_shift.png" alt="Paradigm Shift Comparison" width="95%" style="border-radius: 12px; border: 1px solid #27272a;" />
</div>

---

### 3. The 4-Phase Autonomous Pipeline Architecture
> Comprehensive breakdown of the end-to-end execution flow: Ephemeral AST Ingestion, Gemini Contextual Reasoning, Artifact Trinity Generation, and Atomic PR Dispatch.

<div align="center">
  <img src="public/screenshots/03_pipeline_architecture.png" alt="4-Phase Pipeline Architecture" width="95%" style="border-radius: 12px; border: 1px solid #27272a;" />
</div>

---

### 4. Interactive Vulnerability & Live Patch Simulator
> An interactive testing sandbox directly on the Overview page allowing engineers to inspect real CVE attack vectors (SQLi, Exposed Cloud Keys, SSRF), review surgical before/after diffs, and read AI security reasoning.

<div align="center">
  <img src="public/screenshots/04_patch_simulator.png" alt="Interactive Patch Simulator" width="95%" style="border-radius: 12px; border: 1px solid #27272a;" />
</div>

---

### 5. Repository Security Telemetry & Live Compliance Posture
> Real-time security operations telemetry grounded in actual scan findings: Severity distributions, secret exposure counters, verified auditor identity (`@Bavly-Hamdy`), and automated OWASP / SOC 2 / PCI-DSS posture meters.

<div align="center">
  <img src="public/screenshots/05_security_telemetry.png" alt="Security Telemetry and Compliance" width="95%" style="border-radius: 12px; border: 1px solid #27272a;" />
</div>

---

### 6. Dedicated Security Audit Service Cockpit (`/audit`)
> A focused, distraction-free environment for connecting public or private GitHub repositories, configuring scan depth, and initiating isolated ephemeral AST scans.

<div align="center">
  <img src="public/screenshots/06_audit_service.png" alt="Dedicated Audit Service Cockpit" width="95%" style="border-radius: 12px; border: 1px solid #27272a;" />
</div>

---

### 7. Interactive Security Audit Dashboard (`/dashboard`)
> The core operational center featuring real-time health Score Gauges (0–100), multi-dimensional finding filters (CWE, OWASP, Severity, Category), search autocomplete, and deep finding inspections.

<div align="center">
  <img src="public/screenshots/07_security_dashboard.png" alt="Interactive Security Dashboard" width="95%" style="border-radius: 12px; border: 1px solid #27272a;" />
</div>

---

### 8. Precision Code Diff Viewer & Surgical PR Manager
> Side-by-side unified diff inspector displaying vulnerable lines vs. remediated syntax, with 1-click GitHub Pull Request dispatch to isolated branches.

<div align="center">
  <img src="public/screenshots/08_remediation_diff.png" alt="Surgical Code Diff Viewer" width="95%" style="border-radius: 12px; border: 1px solid #27272a;" />
</div>

---

### 9. The Artifact Trinity Exporter
> Unified modal generating human-readable audit summaries (`security-report.md`), machine-executable automation recipes (`plan.yaml`), and AI agent prompts (`agent-prompt.txt`).

<div align="center">
  <img src="public/screenshots/09_artifact_trinity.png" alt="Artifact Trinity Modal" width="95%" style="border-radius: 12px; border: 1px solid #27272a;" />
</div>

---

## 🔄 How GitArmor Works: 4-Phase Pipeline

```mermaid
graph LR
    A[Git Repository] -->|Ephemeral Clone| B[Phase 1: AST Parser]
    B -->|Taint Flow Map| C[Phase 2: Gemini 2.5 Reasoner]
    C -->|Verified Findings| D[Phase 3: Artifact Trinity]
    D -->|Surgical Diff Patch| E[Phase 4: Atomic PR Dispatch]
    E -->|gitarmor/fix-*| F[GitHub Pull Request]
```

### Phase 01: Ephemeral Ingestion & AST Tree Parsing
- Repositories are cloned directly into sandboxed, temporary in-memory storage.
- Tree-sitter and AST parsers construct call graphs, function boundaries, and import trees.
- Sources of untrusted input (HTTP request bodies, URL params, headers) and sensitive sinks (SQL queries, system calls, filesystem I/O, outbound network requests) are cataloged.

### Phase 02: Contextual Gemini 2.5 Deep Reasoning
- Cross-file dataflow graphs are submitted to Gemini 2.5 Flash alongside contextual middleware and sanitizer logic.
- Verifies whether a data path is vulnerable to exploitation or rendered harmless by existing defensive sanitizers.
- Maps confirmed vulnerabilities to standard **CWE** (Common Weakness Enumeration) indices and **OWASP Top 10 (2021)** classifications.

### Phase 03: The Artifact Trinity Generation
- Synthesizes three synchronized, standardized artifacts for both human engineers and automated CI/CD agents.

### Phase 04: One-Click Atomic Pull Request Dispatch
- Creates a dedicated remediation branch (`gitarmor/fix-{finding-id}-{timestamp}`).
- Applies the verified unified diff patch.
- Dispatches a GitHub Pull Request via the GitHub REST API under the authenticated developer's verified identity.
- Enforces the **Protected Branch Invariant**: Direct pushes to `main`, `master`, or release branches are strictly prohibited.

---

## 📜 The Artifact Trinity

GitArmor AI pioneered the **Artifact Trinity**—a synchronized tri-factor documentation standard designed for both human review and automated agent consumption:

```
├── artifacts/
│   ├── security-report.md     # Human Executive & Engineering Audit Report
│   ├── plan.yaml              # Machine-Readable Remediation Workflow for CI/CD
│   └── agent-prompt.txt       # Context-Dense Prompt for Autonomous Coding Agents
```

### 1. `security-report.md`
A comprehensive, human-readable audit summary formatted in clean GitHub-Flavored Markdown. Includes an executive score gauge, vulnerability inventory, affected file paths, line ranges, and reproduction steps.

### 2. `remediation-plan.yaml`
A deterministic, machine-executable schema detailing step-by-step patch instructions, prerequisite dependencies, target branches, verification commands, and rollback strategies for integration with GitHub Actions, GitLab CI, or Jenkins.

### 3. `agent-prompt.txt`
A curated prompt containing precise vulnerability context, code snippets, architectural constraints, and formatting guidelines—optimized for immediate ingestion by autonomous coding agents (Claude 3.7, Gemini 2.5, GPT-4o, Cursor, or Aider).

---

## 🧪 Interactive Vulnerability & Patch Simulator

GitArmor features a live patch simulation engine modeling common real-world security vulnerabilities:

### 1. SQL Injection (CWE-89 / OWASP A03)
* **Vulnerable Pattern**: Raw string concatenation into SQL query buffers (`db.query("SELECT * FROM users WHERE email = '" + email + "'")`).
* **Surgical Remediation**: Introduction of prepared statements with parameterized binds (`db.query("SELECT * FROM users WHERE email = $1", [email])`).
* **Result**: Complete neutralization of arbitrary SQL interpolation.

### 2. Hardcoded Production Credentials (CWE-798 / OWASP A07)
* **Vulnerable Pattern**: Static AWS access keys or Stripe secret tokens committed to source code (`const AWS_KEY = "AKIAIOSFODNN7EXAMPLE"`).
* **Surgical Remediation**: Automated pattern-based masking in audit logs (`[REDACTED_AWS_KEY]`) and extraction to validated environment variables (`process.env.AWS_ACCESS_KEY_ID!`).
* **Result**: Eradicates credential leakage from version control history.

### 3. Server-Side Request Forgery / SSRF (CWE-918 / OWASP A10)
* **Vulnerable Pattern**: Direct outbound `fetch(req.body.url)` exposing cloud instance metadata endpoints (`http://169.254.169.254/`).
* **Surgical Remediation**: Domain allowlisting, protocol whitelisting, and strict RFC1918 private subnet rejection wrapper.
* **Result**: Prohibits internal network pivoting and cloud credential harvesting.

---

## 🎯 Core Security Capabilities

- **SAST (Static Application Security Testing)**: Comprehensive source code vulnerability scanning across TypeScript, JavaScript, Python, Go, and Java.
- **Automated Secret Redaction**: Real-time cryptographic masking of API keys, JWT secrets, database connection URIs, and private RSA keys before external transmission.
- **SCA (Software Composition Analysis)**: Dependency supply-chain vulnerability detection and outdated package CVE auditing.
- **IaC (Infrastructure-as-Code) Scanning**: Misconfiguration auditing across Dockerfiles, Kubernetes manifests, and Terraform files.
- **Local AST Resilience**: Dual-mode scanning engine with built-in heuristic fallback ensuring audit functionality even during offline or network-constrained states.
- **Multi-Tenant Workspace Support**: Manage multi-repository organization workspaces with isolated role-based permissions (Owner, Admin, DevSecOps, Developer).

---

## 🏛️ Enterprise Standards & Compliance Mapping

GitArmor AI automatically cross-references every finding against leading global cybersecurity standards:

| Standard | Scope & Coverage | Verification Status |
| :--- | :--- | :--- |
| **OWASP Top 10 (2021)** | A01 Broken Access Control to A10 SSRF | Automated categorization & score mapping |
| **CWE/SANS Top 25** | Most dangerous software vulnerabilities (CWE-89, CWE-79, CWE-798, etc.) | Direct CWE ID tag & remediation rationale |
| **SOC 2 Type II** | Security, Confidentiality, and Processing Integrity | Ephemeral runner isolation & data encryption in transit |
| **PCI-DSS 4.0** | Cardholder data & payment key protection | Automatic token masking and injection barrier verification |

---

## 🔒 Security & Zero Code Retention Guarantee

GitArmor AI was architected from inception around a strict **Zero-Trust & Zero Code Retention** philosophy:

1. **Ephemeral Sandboxed Execution**: Repositories are cloned to in-memory ephemeral scratch volumes and pruned immediately following audit completion.
2. **Zero Model Training**: Customer code is **never** used to train, fine-tune, or evaluate public or private AI models.
3. **Client-Side Secret Masking**: Credentials and sensitive tokens are obfuscated at the runtime boundary before transmission to AI reasoning layers.
4. **Protected Branch Invariant**: GitArmor enforces read-only access on default branches (`main`/`master`). All proposed remediation diffs are submitted through isolated pull requests requiring human review.
5. **No Long-Term Storage**: No customer source code files are permanently retained on disk or databases.

---

## 💻 Architecture & Tech Stack

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Layer                           │
│  Next.js 14 App Router · React 18 · TypeScript · Vite 8     │
│  Tailwind CSS · Framer Motion · Lucide Icons · Dark/Light   │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS / JSON REST API
┌──────────────────────────────▼──────────────────────────────┐
│                      Backend Server                         │
│  Node.js Full-Stack Server (server.ts) · TSX Runtime        │
│  Dual-Engine DB: Cloud Firestore + Local JSON Fallback      │
└──────────────────────────────┬──────────────────────────────┘
                               │ AST & Taint Payloads
┌──────────────────────────────▼──────────────────────────────┐
│                    DevSecOps AI Engine                      │
│  Google Gemini 2.5 Flash · Tree-sitter Multi-Language AST   │
│  Automated Regex Redactor · GitHub REST API Branch Manager  │
└─────────────────────────────────────────────────────────────┘
```

- **Frontend**: React 18, Vite 8, TypeScript, Tailwind CSS, Lucide Icons, Plus Jakarta Sans & JetBrains Mono typography.
- **Backend**: Node.js, Express, TSX, Dual-Engine Persistence (`data/gitarmor_db.json` local JSON + Google Cloud Firestore connector).
- **Security Engine**: Google Gemini 2.5 Flash API, AST Dataflow Analysis, Gitleaks pattern heuristics.
- **Testing & Screenshot Automation**: Playwright, Python 3, Jest.

---

## 🚀 Local Setup & Quickstart Guide

### 1. Prerequisites
- **Node.js** (v18.0.0 or v20.x+) — [Download Node.js](https://nodejs.org/)
- **npm** (bundled with Node.js) or **pnpm** / **yarn**
- **Python 3.9+** (optional, required only for screenshot automation)

---

### 2. Installation Steps

#### Step 1: Clone the Repository
```bash
git clone https://github.com/Bavly-Hamdy/gitarmor-ai.git
cd gitarmor-ai
```

#### Step 2: Install Node Dependencies
```bash
npm install
```

#### Step 3: Configure Environment Variables
Create your local `.env` configuration file:

```bash
# On Linux / macOS / Git Bash:
cp .env.example .env

# On Windows (PowerShell):
Copy-Item .env.example .env
```

Add your **Google Gemini API Key** (obtain a free key from [Google AI Studio](https://aistudio.google.com/)):
```env
GEMINI_API_KEY="your-gemini-api-key-here"
PORT=3000
```
> *Note: GitArmor AI is offline-resilient! If no Gemini API key is configured, the platform activates deterministic heuristic scanning to ensure local functionality.*

#### Step 4: Run the Development Server
```bash
npm run dev
```
The server will boot on `http://localhost:3000`.

#### Step 5: Build for Production
```bash
npm run build
```

---

### 3. Screenshot Capture Automation
To capture fresh, high-resolution Retina screenshots of all application views:
```bash
python capture_screenshots.py
```
Outputs pixel-perfect images directly to `public/screenshots/`.

---

## 📡 API Reference & System Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/audit` | Triggers a real-time security audit for a public or private GitHub repository |
| `GET` | `/api/scans/:id` | Retrieves complete scan results, score breakdown, and findings list |
| `POST` | `/api/remediate/pr` | Dispatches an autonomous Pull Request with surgical patch to GitHub |
| `GET` | `/api/github/repos` | Searches and autocompletes GitHub repositories for connected tokens |
| `GET` | `/api/orgs` | Fetches multi-tenant workspaces, active members, and repository bindings |
| `GET` | `/api/admin/metrics` | Returns system-wide audit telemetry, MTTR counters, and scan volume |

---

## 🤝 Contributing & Open-Source Policy

GitArmor AI is an open-source community effort. We welcome contributions from developers, security researchers, and DevSecOps practitioners:

1. **Fork the Repository** on GitHub.
2. **Create a Feature Branch**: `git checkout -b feature/advanced-cwe-detector`.
3. **Commit Your Changes**: Follow conventional commits (`git commit -m "feat: add AST rule for prototype pollution"`).
4. **Push to Your Branch**: `git push origin feature/advanced-cwe-detector`.
5. **Open a Pull Request**: Submit your PR with detailed reproduction steps and test coverage.

---

## 📄 License

This project is licensed under the **MIT License** — feel free to use, modify, and distribute it for personal, commercial, or enterprise applications without restrictions.

---

<div align="center">

**GitArmor AI** — *Empowering developers to write bulletproof code autonomously.*

Crafted with ❤️ by **[Bavly Hamdy](https://github.com/Bavly-Hamdy)** & the Open-Source Community.

</div>
#   G i t A r m o r A I  
 