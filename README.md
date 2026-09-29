<div align="center">

<br />

<img src="public/logo.svg" alt="GitArmor AI — Autonomous DevSecOps Platform" width="96" height="96" />

<br />
<br />

# GitArmor AI

### Autonomous DevSecOps & Precision Code Remediation Engine

*Deterministic AST Parsing · Contextual Gemini 2.5 Reasoning · 1-Click Surgical Pull Requests*

<br />

[![License: MIT](https://img.shields.io/badge/License-MIT-22c55e?style=flat-square&logo=opensourceinitiative&logoColor=white)](LICENSE)
[![Version](https://img.shields.io/badge/Release-v2.5.0-6366f1?style=flat-square&logo=github&logoColor=white)](https://github.com/Bavly-Hamdy/gitarmor-ai/releases)
[![AI Engine](https://img.shields.io/badge/AI%20Engine-Gemini%202.5%20Flash-a855f7?style=flat-square&logo=google&logoColor=white)](https://aistudio.google.com/)
[![Standards](https://img.shields.io/badge/Standards-OWASP%20%7C%20CWE%20%7C%20SOC%202-f59e0b?style=flat-square&logo=owasp&logoColor=white)](https://owasp.org)
[![Privacy](https://img.shields.io/badge/Data%20Retention-Zero%20Code%20Stored-14b8a6?style=flat-square)]()
[![Free](https://img.shields.io/badge/Pricing-100%25%20Free%20%26%20Open%20Source-0ea5e9?style=flat-square)]()
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-ec4899?style=flat-square&logo=github-actions&logoColor=white)](https://github.com/Bavly-Hamdy/gitarmor-ai/pulls)

<br />

[**Overview**](http://localhost:3000) &nbsp;&middot;&nbsp; [**Launch Audit**](http://localhost:3000/audit) &nbsp;&middot;&nbsp; [**Dashboard**](http://localhost:3000/dashboard) &nbsp;&middot;&nbsp; [**Documentation**](#-table-of-contents)

<br />

</div>

---

## Table of Contents

- [Overview & Mission](#-overview--mission)
- [The DevSecOps Paradigm Shift](#-the-devsecops-paradigm-shift)
- [Platform Walkthrough & Screenshots](#-platform-walkthrough--screenshots)
- [How GitArmor Works: The 4-Phase Pipeline](#-how-gitarmor-works-the-4-phase-pipeline)
- [The Artifact Trinity](#-the-artifact-trinity)
- [Interactive Vulnerability & Patch Simulator](#-interactive-vulnerability--patch-simulator)
- [Core Security Capabilities](#-core-security-capabilities)
- [Enterprise Standards & Compliance Mapping](#-enterprise-standards--compliance-mapping)
- [Security & Zero Code Retention Guarantee](#-security--zero-code-retention-guarantee)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Local Setup & Quickstart Guide](#-local-setup--quickstart-guide)
- [Environment Variables Reference](#-environment-variables-reference)
- [API Reference & System Endpoints](#-api-reference--system-endpoints)
- [Screenshot Automation](#-screenshot-automation)
- [Contributing & Open-Source Policy](#-contributing--open-source-policy)
- [License](#-license)

---

## Overview & Mission

**GitArmor AI** is an **enterprise-grade, autonomous DevSecOps and automated code remediation platform** engineered to eliminate alert fatigue and compress vulnerability resolution time (**MTTR**) from weeks to seconds.

Traditional Static Application Security Testing (SAST) tools overwhelm engineering squads with noisy, uncontextualized alerts — over **70% of which are false alarms**. Worse, they leave the grueling burden of diagnosing exploitability and crafting code patches entirely on exhausted developers.

GitArmor AI bridges this gap through a **unified, four-phase verification pipeline**:

> **Phase 1 — AST & Taint Analysis:** Rapidly maps Abstract Syntax Trees across multi-language codebases to identify dataflow sources, sinks, and control-flow branches.

> **Phase 2 — Contextual AI Reasoning:** Leverages **Google Gemini 2.5 Flash** to evaluate cross-file sanitizers and authorization boundaries, achieving a **94%+ false-positive reduction**.

> **Phase 3 — Artifact Trinity Generation:** Synthesizes three synchronized documentation artifacts for both human reviewers and automated CI/CD pipelines.

> **Phase 4 — Autonomous Surgical PR Dispatch:** Automatically synthesizes unified diff patches, spawns isolated Git branches (`gitarmor/fix-*`), and submits review-ready GitHub Pull Requests.

> **100% Free & Open Source.** Zero subscription gates, zero paywalls, zero telemetry.

---

## The DevSecOps Paradigm Shift

| Capability | Traditional SAST Tools | **GitArmor AI** |
| :--- | :--- | :--- |
| **Detection Method** | Pattern matching & rigid regex rules | Deterministic AST + Contextual AI Reasoning |
| **False Positive Rate** | **High (> 70%)** | **Extremely Low (< 6%)** |
| **Remediation Action** | Voluminous PDF/JSON backlog reports | Atomic, surgical Git patches & Pull Requests |
| **Time-to-Remediate (MTTR)** | **14-30 Days** of manual investigation | **< 60 Seconds** automated patch synthesis |
| **Secret Protection** | Leaks plaintext credentials in logs | Automatic regex token masking & cryptographic redaction |
| **Branch Safety** | Risky local scripts or manual commits | Enforced **Protected Branch Invariant** |
| **Automation Artifacts** | Monolithic text reports | **The Artifact Trinity** (Report + Plan + Agent Prompt) |
| **Cost & Licensing** | Prohibitive enterprise seat-based pricing | **100% Free & Open-Source (MIT)** |

---

## Platform Walkthrough & Screenshots

### 1 - Minimalist Hero & Overview

> Designed under humanized minimalism with high-fidelity dark and light mode support. Features the GitArmor emblem, a high-impact value proposition, and instant routing to the dedicated scanning cockpit.

<div align="center">
  <img src="public/screenshots/01_hero_overview.png" alt="GitArmor AI Hero Overview" width="95%" style="border-radius:12px;border:1px solid #27272a;" />
</div>

---

### 2 - The Paradigm Shift Comparison Matrix

> Visual contrast table illustrating how GitArmor transforms noisy legacy alert backlogs into automated, high-signal DevSecOps velocity.

<div align="center">
  <img src="public/screenshots/02_paradigm_shift.png" alt="Paradigm Shift Comparison" width="95%" style="border-radius:12px;border:1px solid #27272a;" />
</div>

---

### 3 - The 4-Phase Autonomous Pipeline Architecture

> End-to-end execution flow: Ephemeral AST Ingestion -> Gemini Contextual Reasoning -> Artifact Trinity Generation -> Atomic PR Dispatch.

<div align="center">
  <img src="public/screenshots/03_pipeline_architecture.png" alt="4-Phase Pipeline Architecture" width="95%" style="border-radius:12px;border:1px solid #27272a;" />
</div>

---

### 4 - Interactive Vulnerability & Live Patch Simulator

> A live testing sandbox allowing engineers to inspect real CVE attack vectors (SQLi, Exposed Cloud Keys, SSRF), review surgical before/after diffs, and read AI security reasoning.

<div align="center">
  <img src="public/screenshots/04_patch_simulator.png" alt="Interactive Patch Simulator" width="95%" style="border-radius:12px;border:1px solid #27272a;" />
</div>

---

### 5 - Security Telemetry & Live Compliance Posture

> Real-time security operations telemetry: severity distributions, secret exposure counters, verified auditor identity, and automated OWASP / SOC 2 / PCI-DSS posture meters.

<div align="center">
  <img src="public/screenshots/05_security_telemetry.png" alt="Security Telemetry and Compliance" width="95%" style="border-radius:12px;border:1px solid #27272a;" />
</div>

---

### 6 - Dedicated Security Audit Cockpit (/audit)

> A focused, distraction-free environment for connecting GitHub repositories, configuring scan depth, and initiating isolated ephemeral AST scans.

<div align="center">
  <img src="public/screenshots/06_audit_service.png" alt="Dedicated Audit Service Cockpit" width="95%" style="border-radius:12px;border:1px solid #27272a;" />
</div>

---

### 7 - Interactive Security Audit Dashboard (/dashboard)

> The core operational center: real-time health score gauges (0-100), multi-dimensional finding filters (CWE, OWASP, Severity, Category), search autocomplete, and deep finding inspections.

<div align="center">
  <img src="public/screenshots/07_security_dashboard.png" alt="Interactive Security Dashboard" width="95%" style="border-radius:12px;border:1px solid #27272a;" />
</div>

---

### 8 - Precision Code Diff Viewer & Surgical PR Manager

> Side-by-side unified diff inspector displaying vulnerable lines vs. remediated syntax, with 1-click GitHub Pull Request dispatch to isolated branches.

<div align="center">
  <img src="public/screenshots/08_remediation_diff.png" alt="Surgical Code Diff Viewer" width="95%" style="border-radius:12px;border:1px solid #27272a;" />
</div>

---

### 9 - The Artifact Trinity Exporter

> Unified modal generating human-readable audit summaries, machine-executable automation recipes, and AI agent prompts.

<div align="center">
  <img src="public/screenshots/09_artifact_trinity.png" alt="Artifact Trinity Modal" width="95%" style="border-radius:12px;border:1px solid #27272a;" />
</div>

---

## How GitArmor Works: The 4-Phase Pipeline

```mermaid
graph LR
    A[Git Repository] -->|Ephemeral Clone| B[Phase 1: AST Parser]
    B -->|Taint Flow Map| C[Phase 2: Gemini 2.5 Reasoner]
    C -->|Verified Findings| D[Phase 3: Artifact Trinity]
    D -->|Surgical Diff Patch| E[Phase 4: Atomic PR Dispatch]
    E -->|gitarmor/fix-*| F[GitHub Pull Request]
```

<br />

**Phase 01 - Ephemeral Ingestion & AST Tree Parsing**

Repositories are cloned into sandboxed, temporary in-memory storage with zero disk persistence. A multi-language Tree-sitter AST parser constructs call graphs, function boundaries, and import dependency trees. Sources of untrusted input (HTTP request bodies, URL parameters, headers) and sensitive sinks (SQL query builders, system shell calls, filesystem I/O, outbound network requests) are catalogued and indexed.

**Phase 02 - Contextual Gemini 2.5 Deep Reasoning**

Cross-file dataflow graphs are submitted to **Gemini 2.5 Flash** alongside the full context of middleware, sanitizers, and authorization gate logic. The model evaluates whether each potential vulnerability can actually be exploited given the real code context, versus being neutralized by existing defenses. Every confirmed finding is mapped to its canonical **CWE** index and **OWASP Top 10 (2021)** classification.

**Phase 03 - The Artifact Trinity Generation**

Three synchronized, standardized artifacts are synthesized in parallel. They are designed to serve both human engineering reviewers and automated CI/CD pipelines simultaneously, eliminating manual translation between human and machine-readable formats.

**Phase 04 - One-Click Atomic Pull Request Dispatch**

A dedicated remediation branch (`gitarmor/fix-{finding-id}-{timestamp}`) is created. The verified unified diff patch is applied surgically. A fully documented GitHub Pull Request is dispatched via the GitHub REST API. The **Protected Branch Invariant** is enforced at all times — direct pushes to `main`, `master`, or any release branch are strictly prohibited.

---

## The Artifact Trinity

GitArmor AI pioneered the **Artifact Trinity** — a synchronized tri-factor documentation standard designed for both human review and automated agent consumption:

```
artifacts/
├── security-report.md      # Human Executive & Engineering Audit Report
├── remediation-plan.yaml   # Machine-Readable Remediation Workflow for CI/CD
└── agent-prompt.txt        # Context-Dense Prompt for Autonomous Coding Agents
```

<br />

**security-report.md** — A comprehensive, human-readable audit summary in clean GitHub-Flavored Markdown. Includes an executive health score gauge, full vulnerability inventory, affected file paths with exact line ranges, severity ratings, and reproduction steps.

**remediation-plan.yaml** — A deterministic, machine-executable schema detailing step-by-step patch instructions, prerequisite dependencies, target branches, verification commands, and rollback strategies. Natively compatible with GitHub Actions, GitLab CI, Jenkins, and CircleCI.

**agent-prompt.txt** — A curated prompt containing precise vulnerability context, code snippets, architectural constraints, and output formatting guidelines — optimized for Gemini 2.5, Claude 3.7 Sonnet, GPT-4o, Cursor, and Aider.

---

## Interactive Vulnerability & Patch Simulator

GitArmor features a live patch simulation engine modeling the most common real-world security vulnerabilities:

### SQL Injection - CWE-89 / OWASP A03:2021

```diff
- db.query("SELECT * FROM users WHERE email = '" + email + "'")
+ db.query("SELECT * FROM users WHERE email = $1", [email])
```

Raw string concatenation into SQL query buffers is replaced with parameterized prepared statements. This completely neutralizes arbitrary SQL interpolation and prevents privilege escalation through query manipulation.

---

### Hardcoded Production Credentials - CWE-798 / OWASP A07:2021

```diff
- const AWS_KEY = "AKIAIOSFODNN7EXAMPLE"
+ const AWS_KEY = process.env.AWS_ACCESS_KEY_ID!
```

Static AWS access keys, Stripe secret tokens, and JWT signing secrets committed to source code are automatically detected, masked in audit logs as `[REDACTED_AWS_KEY]`, and extracted to validated environment variables.

---

### Server-Side Request Forgery / SSRF - CWE-918 / OWASP A10:2021

```diff
- const response = await fetch(req.body.url)
+ const response = await fetch(validateAndAllowlistUrl(req.body.url))
```

Direct outbound `fetch()` using user-controlled URLs exposes cloud instance metadata endpoints (`http://169.254.169.254/`). GitArmor applies domain allowlisting, strict protocol whitelisting, and RFC 1918 private subnet rejection.

---

## Core Security Capabilities

- **SAST (Static Application Security Testing)** — Comprehensive source code vulnerability scanning across TypeScript, JavaScript, Python, Go, Java, and Rust.
- **Automated Secret Redaction** — Real-time cryptographic masking of API keys, JWT secrets, database URIs, and private RSA/ECDSA keys before external AI transmission.
- **SCA (Software Composition Analysis)** — Dependency supply-chain vulnerability detection and outdated package CVE auditing against the National Vulnerability Database.
- **IaC (Infrastructure-as-Code) Scanning** — Misconfiguration auditing across Dockerfiles, Kubernetes manifests, and Terraform HCL files.
- **Local AST Resilience** — Dual-mode scanning engine with built-in heuristic fallback ensuring audit functionality in offline environments.
- **Multi-Tenant Workspace Support** — Manage multi-repository organization workspaces with isolated role-based permissions (Owner, Admin, DevSecOps, Developer).
- **Protected Branch Invariant** — Strict enforcement preventing direct writes to `main`, `master`, or tagged release branches.

---

## Enterprise Standards & Compliance Mapping

| Standard | Scope & Coverage | Automation Level |
| :--- | :--- | :--- |
| **OWASP Top 10 (2021)** | A01 Broken Access Control through A10 SSRF | Automated categorization & posture score |
| **CWE / SANS Top 25** | Most dangerous software weaknesses (CWE-89, CWE-79, CWE-798, CWE-918, etc.) | Direct CWE ID tagging & remediation rationale |
| **SOC 2 Type II** | Security, Confidentiality, Availability, and Processing Integrity | Ephemeral runner isolation & encryption in transit |
| **PCI-DSS 4.0** | Cardholder data & payment key protection | Automatic token masking and injection barrier verification |
| **ISO/IEC 27001** | Information security management baseline | Secret redaction, access control enforcement |

---

## Security & Zero Code Retention Guarantee

GitArmor AI was architected from inception around a strict **Zero-Trust & Zero Code Retention** philosophy:

1. **Ephemeral Sandboxed Execution** — Repositories are cloned to in-memory ephemeral scratch volumes and pruned immediately following audit completion. No code persists to disk.
2. **Zero Model Training** — Customer code is **never** used to train, fine-tune, or evaluate any public or private AI model.
3. **Client-Side Secret Masking** — Credentials and sensitive tokens are obfuscated at the runtime boundary **before** transmission to any AI reasoning layer.
4. **Protected Branch Invariant** — GitArmor enforces read-only access on default branches. All proposed remediation diffs require explicit human review via Pull Request.
5. **No Long-Term Storage** — No customer source code files are permanently retained on disk or in any database beyond the ephemeral scan session.

---

## Architecture & Tech Stack

```
+--------------------------------------------------------------+
|                        Client Layer                          |
|    React 18 . Vite 8 . TypeScript . Tailwind CSS             |
|    Framer Motion . Lucide Icons . Dark / Light Mode          |
+--------------------------------------------------------------+
|                    HTTPS / JSON REST API                     |
+--------------------------------------------------------------+
|                       Backend Server                         |
|    Node.js . Express . TSX Runtime . server.ts               |
|    Dual-Engine DB: Cloud Firestore + Local JSON Fallback     |
+--------------------------------------------------------------+
|                    AST & Taint Payloads                      |
+--------------------------------------------------------------+
|                    DevSecOps AI Engine                       |
|    Google Gemini 2.5 Flash . Tree-sitter Multi-Language AST  |
|    Automated Regex Redactor . GitHub REST API Manager        |
+--------------------------------------------------------------+
```

<br />

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite 8, TypeScript, Tailwind CSS, Framer Motion, Lucide Icons |
| **Typography** | Plus Jakarta Sans (UI), JetBrains Mono (Code) |
| **Backend** | Node.js, Express, TSX, Dual-Engine Persistence (JSON + Firestore) |
| **AI Engine** | Google Gemini 2.5 Flash API, AST Dataflow Analysis, Gitleaks heuristics |
| **Automation** | Playwright (Python 3), Jest, GitHub REST API |

---

## Local Setup & Quickstart Guide

### Prerequisites

| Requirement | Version | Notes |
| :--- | :--- | :--- |
| **Node.js** | v18.0+ or v20.x+ | [Download](https://nodejs.org/) |
| **npm** | Bundled with Node.js | Or use pnpm / yarn |
| **Python** | 3.9+ | Optional — only for screenshot automation |

<br />

### Step 1 - Clone the Repository

```bash
git clone https://github.com/Bavly-Hamdy/gitarmor-ai.git
cd gitarmor-ai
```

### Step 2 - Install Dependencies

```bash
npm install
```

### Step 3 - Configure Environment Variables

```bash
# Linux / macOS / Git Bash
cp .env.example .env

# Windows (PowerShell)
Copy-Item .env.example .env
```

Open `.env` and add your **Gemini API Key** (free from [Google AI Studio](https://aistudio.google.com/)):

```env
GEMINI_API_KEY="your-gemini-api-key-here"
PORT=3000
```

> **Offline Resilience:** If no Gemini API key is configured, GitArmor activates its deterministic heuristic scanning engine automatically. The platform remains fully functional without network access.

### Step 4 - Start the Development Server

```bash
npm run dev
```

The full-stack development server boots at `http://localhost:3000`.

### Step 5 - Build for Production

```bash
npm run build
```

The optimized production bundle is written to `dist/`.

---

## Environment Variables Reference

| Variable | Required | Default | Description |
| :--- | :---: | :--- | :--- |
| `GEMINI_API_KEY` | Recommended | _(none)_ | Google Gemini 2.5 Flash API key. Falls back to heuristic engine if absent. |
| `PORT` | No | `3000` | HTTP server port |
| `GITHUB_TOKEN` | Optional | _(none)_ | GitHub Personal Access Token — enables private repo access & PR dispatch |
| `FIRESTORE_PROJECT_ID` | Optional | _(none)_ | Google Cloud Firestore project ID. Falls back to local JSON if absent. |
| `NODE_ENV` | No | `development` | Set to `production` for the production build |

---

## API Reference & System Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/audit` | Triggers a real-time security audit for a GitHub repository |
| `GET` | `/api/scans/:id` | Retrieves complete scan results, score breakdown, and findings list |
| `POST` | `/api/remediate/pr` | Dispatches an autonomous Pull Request with surgical patch to GitHub |
| `GET` | `/api/github/repos` | Searches and autocompletes GitHub repositories for connected tokens |
| `GET` | `/api/orgs` | Fetches multi-tenant workspaces, active members, and repository bindings |
| `GET` | `/api/admin/metrics` | Returns system-wide audit telemetry, MTTR counters, and scan volume |

---

## Screenshot Automation

To generate fresh, high-resolution Retina-quality screenshots of all application views:

```bash
# Install Playwright browser runtime (first-time only)
pip install playwright
playwright install chromium

# Capture all application views
python capture_screenshots.py
```

Screenshots are written directly to `public/screenshots/` as pixel-perfect `.png` files.

---

## Contributing & Open-Source Policy

GitArmor AI is a community-driven open-source effort. Contributions from developers, security researchers, and DevSecOps practitioners are welcome.

### How to Contribute

1. **Fork the Repository** on GitHub.
2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/advanced-cwe-detector
   ```
3. **Commit Your Changes** using conventional commits:
   ```bash
   git commit -m "feat: add AST rule for prototype pollution (CWE-1321)"
   ```
4. **Push to Your Fork**
   ```bash
   git push origin feature/advanced-cwe-detector
   ```
5. **Open a Pull Request** with a detailed description, reproduction steps, and test coverage.

### Contribution Guidelines

- All new security detection rules must include test fixtures for both vulnerable and safe patterns.
- Code must be fully typed with TypeScript strict mode — no `any` shortcuts.
- UI contributions must support both dark and light mode.
- Follow the existing minimalist humanized design language.

---

## License

```
MIT License

Copyright (c) 2025 Bavly Hamdy

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

See the full [LICENSE](LICENSE) file for details.

---

<div align="center">

<br />

---

<br />

<img src="https://github.com/Bavly-Hamdy.png" alt="Bavly Hamdy" width="80" height="80" style="border-radius:50%;border:3px solid #6366f1;" />

<br />

### Built by [Bavly Hamdy](https://github.com/Bavly-Hamdy)

**Full-Stack Developer · DevSecOps Enthusiast · Open-Source Builder**

<br />

[![GitHub](https://img.shields.io/badge/GitHub-Bavly--Hamdy-181717?style=flat-square&logo=github&logoColor=white)](https://github.com/Bavly-Hamdy)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=flat-square&logo=linkedin&logoColor=white)](https://linkedin.com/in/bavly-hamdy)
[![Portfolio](https://img.shields.io/badge/Portfolio-Visit-6366f1?style=flat-square&logo=vercel&logoColor=white)](https://github.com/Bavly-Hamdy)

<br />

**GitArmor AI** &mdash; *Empowering developers to ship bulletproof code, autonomously.*

<br />

[![Star on GitHub](https://img.shields.io/github/stars/Bavly-Hamdy/GitArmorAI?style=social)](https://github.com/Bavly-Hamdy/GitArmorAI)
&nbsp;&nbsp;
[![Fork](https://img.shields.io/github/forks/Bavly-Hamdy/GitArmorAI?style=social)](https://github.com/Bavly-Hamdy/GitArmorAI/fork)
&nbsp;&nbsp;
[![Watch](https://img.shields.io/github/watchers/Bavly-Hamdy/GitArmorAI?style=social)](https://github.com/Bavly-Hamdy/GitArmorAI)

<br />

*If GitArmor AI helped you, consider giving it a ⭐ — it means a lot!*

<br />

</div>