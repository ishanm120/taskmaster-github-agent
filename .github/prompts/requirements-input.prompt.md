---
name: requirements-input
description: Reusable input for the manually selected Requirements custom agent.
agent: requirements
---
Analyze the following software requirement:

${input:requirement:Provide a Jira link, Confluence link, document reference, or paste the requirement/user story}

Source type: ${input:source:Jira, Confluence, document, or direct input}

Follow the Requirements Agent and requirements skill. Prepare requirements.md with Approval PENDING and stop for explicit human approval. Do not implement or verify.
