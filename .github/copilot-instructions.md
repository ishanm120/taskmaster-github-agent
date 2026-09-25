# Agentic SDLC Repository Instructions

This repository uses GitHub Copilot to support an Agentic SDLC:

Requirements → Architecture → Design Review → Planning → Implementation → Code Review → Verification → Pull Request.

## General Rules

- Follow the defined SDLC sequence.
- Work only on the current requested stage.
- Keep outputs concise, clear, and suitable for human review.
- Do not perform unrelated code changes or refactoring.
- Follow existing repository structure, conventions, and coding patterns.
- Prefer simple solutions suitable for this project over unnecessary complexity.

## Grounding

- Base factual statements and requirements on available repository content,
  supplied source material, or explicit human input.
- Do not invent missing business requirements, APIs, files, dependencies,
  system behavior, test results, approvals, or repository state.
- If missing information materially affects the requested work, ask the user.
- Do not use assumptions as confirmed requirements.
- Technical recommendations may be proposed during Architecture, but clearly
  identify them as recommendations rather than existing facts.

## Requirement Sources

Requirements may be provided through:

- Jira;
- Confluence;
- supplied documents;
- directly pasted requirement or user story text.

When Jira or Confluence is used, work only from content that can actually be
retrieved.

If an external source cannot be accessed, ask the user to provide the
requirement content directly.

Never reconstruct or guess inaccessible Jira or Confluence content.

## Human Approval

Human approval is required at these gates:

1. requirements before Architecture;
2. architecture, design review, and implementation plan before Implementation;
3. successful verification before Pull Request creation.

Do not bypass an approval gate.

Do not treat general positive feedback as approval when explicit approval is
required.

## Security and Data Safety

- Never expose, copy, or commit credentials, tokens, API keys, passwords, or
  other secrets.
- Never use production customer data for development or testing.
- Tests must use synthetic, mocked, local, or dedicated non-production data.
- Do not execute tests against production systems.
- If the target environment cannot be confirmed as non-production, do not run
  the test against that environment.

## Test Integrity

- Never claim a test, build, lint check, verification, or command passed unless
  it was actually executed successfully.
- Distinguish clearly between executed results and recommended checks.
- A failed or unexecuted test must not be reported as PASS.

## Change Safety

- Modify only files necessary for the approved work.
- Avoid unrelated refactoring.
- Avoid unnecessary dependency changes.
- Do not force-push, rewrite shared Git history, bypass branch protection, or
  automatically merge a Pull Request.

## Agent and Skill Responsibilities

- Agents define the role responsible for an SDLC activity.
- Skills provide reusable task-specific methodology.
- Do not duplicate detailed skill methodology inside agent instructions.
- Generated SDLC artifacts are the source of truth for downstream stages.

## Review and Correction

- Review findings should be specific and actionable.
- The implementation role fixes code issues; the review role verifies them.
- Avoid uncontrolled agent-to-agent correction loops.
- If an issue cannot be resolved in one reasonable correction cycle during the
  POC, stop and request human guidance.

## Pull Requests

A Pull Request may be prepared only after successful verification and human
approval.

The PR description must include:

- Summary;
- Changes Made;
- Test Evidence;
- Known Limitations;
- Reviewer Checklist.

Do not automatically merge the Pull Request.