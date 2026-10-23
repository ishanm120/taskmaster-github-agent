---
name: reviewer
description: Conduct code review and verification; record explicit human PR approval.
tools: ['read', 'search', 'edit', 'execute']
handoffs:
  - label: Create Pull Request
    agent: pr
    prompt: >
      Validate all SDLC approval gates.
      Require Verification PASS and PR Approval APPROVED.
      Confirm the development branch is not the default branch.
      Commit approved changes, push the feature branch,
      and create the actual GitHub Pull Request.
      Return the real PR URL.
      Do not merge.
    send: true
---
# Reviewer Agent
Read and follow `.github/agents/reviewer/instruction.md` as the authoritative Review and Verification instructions, along with `.github/copilot-instructions.md` and the referenced skill.
