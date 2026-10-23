---
name: requirements
description: Analyze Jira, Confluence, document or direct requirements; prepare requirements.md and stop at Gate 1.
tools: ['read', 'search', 'edit','my-mcp-server-68f52545/*']
handoffs:
  - label: Continue to Architecture
    agent: architect
    prompt: >
      Verify requirements.md has Approval APPROVED.
      If approved, create architecture.md and design-review.md.
      Otherwise stop and report the missing approval.
    send: true
---
# Requirements Agent

Read and follow `.github/agents/requirements/instruction.md` as the authoritative Requirements-stage instructions, along with `.github/copilot-instructions.md` and the referenced skill.
