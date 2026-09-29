import { Vulnerability, SecurityScoreBreakdown, ArtifactTrinity, SeverityLevel } from '../types';

/**
 * Calculates security score and grade based on the mathematical formula:
 * Penalty = (N_critical * 25) + (N_high * 15) + (N_medium * 5) + (N_low * 2)
 * SecurityScore = max(0, 100 - Penalty)
 */
export function calculateSecurityScore(findings: Vulnerability[]): SecurityScoreBreakdown {
  const openFindings = findings.filter(f => f.status !== 'resolved' && f.status !== 'ignored');
  
  const criticalCount = openFindings.filter(f => f.severity === 'critical').length;
  const highCount = openFindings.filter(f => f.severity === 'high').length;
  const mediumCount = openFindings.filter(f => f.severity === 'medium').length;
  const lowCount = openFindings.filter(f => f.severity === 'low').length;

  const penalty = (criticalCount * 25) + (highCount * 15) + (mediumCount * 5) + (lowCount * 2);
  const score = Math.max(0, 100 - penalty);

  let grade: 'A' | 'B' | 'C' | 'D' | 'F' = 'A';
  if (score >= 90) grade = 'A';
  else if (score >= 75) grade = 'B';
  else if (score >= 50) grade = 'C';
  else if (score >= 30) grade = 'D';
  else grade = 'F';

  return {
    score,
    grade,
    criticalCount,
    highCount,
    mediumCount,
    lowCount,
    totalFindings: openFindings.length,
    penalty
  };
}

/**
 * Advanced Secret Redaction Engine
 * Masks passwords, keys, bearer tokens, AWS credentials, and GitHub PATs
 */
export function redactSecretEvidence(rawCode: string): string {
  if (!rawCode) return '';
  return rawCode
    .replace(/(api[_-]?key\s*[:=]\s*['"])([^'"]+)(['"])/gi, '$1[REDACTED_API_KEY]$3')
    .replace(/(secret\s*[:=]\s*['"])([^'"]+)(['"])/gi, '$1[REDACTED_SECRET]$3')
    .replace(/(password\s*[:=]\s*['"])([^'"]+)(['"])/gi, '$1[REDACTED_PASSWORD]$3')
    .replace(/(bearer\s+)([A-Za-z0-9_\-\.]{20,})/gi, '$1[REDACTED_BEARER_TOKEN]')
    .replace(/(github_pat_[A-Za-z0-9_]{20,})/gi, '[REDACTED_GITHUB_PAT]')
    .replace(/(ghp_[A-Za-z0-9]{36})/gi, '[REDACTED_GITHUB_TOKEN]')
    .replace(/(AKIA[0-9A-Z]{16})/gi, '[REDACTED_AWS_KEY_ID]')
    .replace(/(AIzaSy[A-Za-z0-9_\-]{33})/gi, '[REDACTED_GOOGLE_API_KEY]')
    .replace(/(postgres:\/\/[^:]+:)([^@]+)(@)/gi, '$1[REDACTED_DB_PWD]$3')
    .replace(/(mongodb(\+srv)?:\/\/[^:]+:)([^@]+)(@)/gi, '$1[REDACTED_DB_PWD]$3')
    .replace(/(sk_(?:live|test|demo)_[0-9a-zA-Z_]{20,})/gi, '[REDACTED_STRIPE_SECRET_KEY]');
}

/**
 * Compiles the Artifact Trinity (report.md, report.json, implementation-plan.md, agent-prompt.txt)
 */
export function generateArtifactTrinity(
  repoName: string,
  branch: string,
  commitSha: string,
  score: SecurityScoreBreakdown,
  findings: Vulnerability[]
): ArtifactTrinity {
  const timestamp = new Date().toISOString();

  // 1. report.md
  const reportMarkdown = `# GitArmor AI Security Audit Report
**Target Repository:** \`${repoName}\`  
**Branch:** \`${branch}\` | **Commit:** \`${commitSha.substring(0, 8)}\`  
**Audit Timestamp:** ${timestamp}  
**Overall Security Score:** **${score.score}/100 (Grade ${score.grade})**  
**Penalty Incurred:** -${score.penalty} pts

---

## Executive Summary
GitArmor AI autonomous security pipeline has scanned the codebase combining deterministic SAST (gitleaks, semgrep AST parsing) and Google Gemini semantic contextual analysis.

### Findings Breakdown:
- **Critical Severity:** ${score.criticalCount}
- **High Severity:** ${score.highCount}
- **Medium Severity:** ${score.mediumCount}
- **Low Severity:** ${score.lowCount}
- **Total Open Issues:** ${score.totalFindings}

---

## Detailed Vulnerability Inventory

${findings.map((f, i) => `### ${i + 1}. [${f.severity.toUpperCase()}] ${f.title}
- **Location:** \`${f.file}:${f.line}\`
- **Classification:** ${f.cwe} · ${f.owasp}
- **Description:** ${f.description}
- **Remediation:** ${f.remediationSummary}

\`\`\`diff
${f.suggestedPatch}
\`\`\`
`).join('\n---\n')}

---
*Report generated automatically by GitArmor AI DevSecOps Engine. Zero direct commits made to production.*
`;

  // 2. report.json
  const reportJson = JSON.stringify({
    gitarmor_version: '2.5.0-flash',
    meta: {
      repository: repoName,
      branch,
      commitSha,
      timestamp,
      score: score.score,
      grade: score.grade,
      penalty: score.penalty
    },
    metrics: {
      critical: score.criticalCount,
      high: score.highCount,
      medium: score.mediumCount,
      low: score.lowCount,
      total: score.totalFindings
    },
    findings: findings.map(f => ({
      id: f.id,
      title: f.title,
      severity: f.severity,
      cwe: f.cwe,
      owasp: f.owasp,
      file: f.file,
      line: f.line,
      remediationSummary: f.remediationSummary,
      status: f.status
    }))
  }, null, 2);

  // 3. implementation-plan.md
  const implementationPlanMarkdown = `# GitArmor Remediation Implementation Plan
**Repository:** \`${repoName}\`  
**Sprint Priority Matrix:**

## Phase 1: Immediate Blockers (P0 - Critical Vulnerabilities)
${findings.filter(f => f.severity === 'critical').map(f => `- [ ] **${f.cwe}:** Fix \`${f.file}:${f.line}\` - ${f.title}
  *Surgical Action:* Checkout branch \`gitarmor/fix-${f.id}\`, apply unified patch, run unit tests.`).join('\n') || '- [x] No critical vulnerabilities detected.'}

## Phase 2: High Risk Remediations (P1 - High Severity)
${findings.filter(f => f.severity === 'high').map(f => `- [ ] **${f.cwe}:** Refactor \`${f.file}:${f.line}\` - ${f.title}
  *Surgical Action:* Sanitize inputs and configure automated schema validation.`).join('\n') || '- [x] No high-severity vulnerabilities detected.'}

## Phase 3: Defense-in-Depth & Hygiene (P2 - Medium & Low)
${findings.filter(f => f.severity === 'medium' || f.severity === 'low').map(f => `- [ ] \`${f.file}:${f.line}\`: ${f.title}`).join('\n') || '- [x] Clean architecture hygiene.'}

---
*Recommended workflow: Apply fixes via GitArmor PRs to branch \`gitarmor/fix-*\` and merge after CI verification.*
`;

  // 4. agent-prompt.txt
  const agentPromptText = `You are a Principal Cyber Security Architect and Senior Software Engineer.
Target Repository: ${repoName}
Base Branch: ${branch}

TASK:
You are provided with a verified security audit from GitArmor AI. You must apply the surgical diff patches to the codebase without changing any business logic or introducing breaking changes.

RULES:
1. Never push directly to main or master branch.
2. Only modify the specific files and lines indicated in the vulnerability findings below.
3. Validate all inputs using parameterized queries or strict schema parsers.
4. Ensure all secrets are moved to environment variables or secret vaults.

VULNERABILITIES TO REMEDIATE:
${findings.map(f => `FILE: ${f.file} (Line ${f.line})
SEVERITY: ${f.severity.toUpperCase()} | ${f.cwe}
ISSUE: ${f.title}
FIX DIFF:
${f.suggestedPatch}
`).join('\n----------------------------------------\n')}

Proceed with generating the git commit commands and verified code modifications.
`;

  return {
    reportMarkdown,
    reportJson,
    implementationPlanMarkdown,
    agentPromptText
  };
}
