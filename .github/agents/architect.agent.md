---
name: architect
description: Produce architecture and design review for approved requirements.
tools: ['read', 'search', 'edit']
handoffs:
  - label: Continue to Planning
    agent: developer
    prompt: >
      Enter Planning mode only.
      Validate the approved requirements, architecture,
      and design review.
      Create impl-plan.md with Approval PENDING.
      Request human approval and stop.
    send: true
---
# Architect Agent
Read and follow `.github/agents/architect/instruction.md` as the authoritative Architecture-stage instructions, along with `.github/copilot-instructions.md` and the referenced skill.
