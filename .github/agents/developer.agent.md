---
name: developer
description: Plan approved architecture, then create a feature branch and implement only after Gate 2.
tools: ['read', 'search', 'edit', 'execute']
handoffs:
  - label: Start Implementation
    agent: developer
    prompt: >
      Enter Implementation mode.
      First verify impl-plan.md has Approval APPROVED.
      Establish and verify the required development branch
      before modifying application code or tests.
      Implement only the approved plan.
      Run relevant development tests and stop.
    send: true

  - label: Continue to Code Review
    agent: reviewer
    prompt: >
      Validate that implementation is complete.
      Perform Code Review and Verification using
      the approved SDLC artifacts.
      Create code-review.md and verification.md.
      Stop for explicit human PR approval.
    send: true
---
# Developer Agent

Read and follow `.github/agents/developer/instruction.md` as the authoritative Planning and Implementation instructions, along with `.github/copilot-instructions.md` and the referenced skills.
