# Agentic SDLC — Repository Instructions

## Purpose
Run the smallest evidence-grounded SDLC for one requirement at a time:
Requirements → Architecture → Design Review → Implementation Planning → Implementation → Code Review → Verification → Pull Request.

## Operating Rules
- Work only within the currently selected agent's stage. Never silently advance to the next agent.
- Agents own stage responsibilities; skills own reusable methodology; generated artifacts are the source of truth.
- Ground requirements in accessible Jira, Confluence, documents, direct user input and repository evidence. If external content is inaccessible, ask the user to paste it; never invent it.
- Do not invent APIs, dependencies, requirements, test results, approval or PR URLs.
- Use non-production data only. Never expose credentials or secrets.
- Preserve the issue ID and source in requirements.md when present.
- Freeze approved stages. Changes affecting approved scope require explicit human reapproval of affected artifacts.
- At most one reasonable correction cycle for a material finding, then seek human guidance.
- Never claim a test passed unless executed. Report PASS, FAIL or NOT_RUN with reasons.

## Human Gates
1. Requirements: requirements.md must explicitly show `## Approval` followed by `APPROVED` before Architecture.
2. Implementation: impl-plan.md must explicitly show `## Approval` followed by `APPROVED` before implementation.
3. PR: verification.md must show `## Overall Verification Status` / `PASS` and `## PR Approval` / `APPROVED` before PR Agent publishes.
Only the relevant stage may record an approval after the human explicitly grants it. Approval cannot be inferred.

## Git Policy
- Developer Agent owns branch creation/switching after Gate 2 and before any application/test edits.
- Jira issue ID, if present, is the exact branch name (e.g. EZYGRD-123); otherwise `feature/<short-requirement-slug>`.
- Never implement on the default branch. Check the actual default branch, not just `main`.
- Architecture and planning may be created as uncommitted artifacts before the branch; switching to the feature branch must preserve them. Stop if checkout conflicts with existing work. Never discard or stash silently.
- PR Agent owns staging approved files, committing, pushing and creating the actual PR.
- Do not force push, rewrite history, bypass branch protection, or auto-merge.
- Never silently change unrelated files. Never commit generated secrets, credentials or production data.

## PR
Use recorded verification evidence. Include Summary, Changes Made, Test Evidence, Known Limitations and Reviewer Checklist. Return only a real GitHub PR URL from successful creation or an existing matching PR.
