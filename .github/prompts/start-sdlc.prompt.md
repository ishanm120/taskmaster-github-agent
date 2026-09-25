---
description: Start the Agentic SDLC for a new software requirement.
---

You are starting a new Agentic SDLC workflow.

Requirement input:

${input:requirement:Provide a Jira link, Confluence link, document reference, or paste the requirement/user story}

## Current Stage

REQUIREMENTS ONLY.

For this invocation, perform only requirement analysis.

Use the repository's requirements analysis skill and follow the repository
instructions.

## Required Behavior

1. Obtain the requirement from the supplied input.
2. If Jira or Confluence is supplied, retrieve only content that is actually
   accessible.
3. If an external source cannot be accessed, ask the user to provide the
   requirement content directly.
4. Analyze the requirement for clarity, completeness, and testability.
5. Ask only material clarification questions when required.
6. When sufficiently clear, create or update `requirements.md`.
7. Set:

   `## Approval`

   `PENDING`

8. Request explicit human approval.
9. STOP.

## Restrictions

During this invocation:

- do not modify application code;
- do not modify tests;
- do not run application tests;
- do not run builds;
- do not start application services;
- do not perform Architecture;
- do not create `architecture.md`;
- do not perform Implementation Planning;
- do not create `impl-plan.md`;
- do not implement the requirement;
- do not perform Code Review;
- do not perform Verification;
- do not create or prepare a Pull Request.

Repository inspection must be limited to information genuinely required to
understand the requirement.

Existing implementation does not remove the requirement for the Requirements
stage.

Even if the requested feature already exists in the repository, document the
requirement and stop for human approval.

Completion of this prompt means only:

Requirements analyzed → requirements.md prepared → human approval requested.

It does not authorize any later SDLC stage.