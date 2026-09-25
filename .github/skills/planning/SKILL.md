---
name: planning
description: Convert approved requirements, architecture, and design-review findings into a small dependency-ordered implementation plan. Use before application code is changed.
---

# Implementation Planning

Create a practical implementation plan that can be executed by the Developer
Agent.

## Inputs

Use:

- approved `requirements.md`;
- `architecture.md`;
- `design-review.md`;
- relevant existing repository files.

Do not introduce new business requirements during planning.

## Repository Analysis

Inspect only repository areas relevant to the implementation.

Identify:

- existing files that can be reused or modified;
- new files that are actually required;
- relevant tests;
- configuration changes;
- dependencies between implementation tasks.

Avoid broad repository analysis.

## Task Design

Create a small number of meaningful implementation tasks.

Each task should:

- have a clear objective;
- identify expected files or repository areas;
- describe the required change;
- identify dependencies;
- identify relevant requirement IDs;
- include a simple completion condition.

Do not create separate tasks for trivial individual edits.

Do not create an unnecessarily detailed implementation checklist.

## Task Ordering

Order tasks by dependency.

A task with no unfinished dependency is `READY`.

A task that depends on another unfinished task is `BLOCKED`.

Prefer an order such as:

1. core configuration/model;
2. core processing behavior;
3. integration/orchestration;
4. tests;
5. final supporting configuration.

Use the actual architecture rather than forcing this example ordering.

## Design Review Findings

Include relevant findings from `design-review.md` in the appropriate
implementation task.

Do not create duplicate tasks merely to restate review findings.

## Testing

The plan must include appropriate testing of implemented behavior.

Tests should cover:

- required happy paths;
- important requirement-defined error or edge behavior;
- relevant security behavior;
- regression-sensitive behavior where appropriate.

Do not invent test requirements unrelated to the approved requirements.

## Output

Create `impl-plan.md` using:

# Implementation Plan

## Inputs

List the SDLC artifacts used to create the plan.

## Tasks

### TASK-01 — <Title>

**Requirements:** FR-xxx / NFR-xxx

**Status:** READY

**Depends On:** None

**Files/Areas:**
- ...

**Work:**
- ...

**Completion:**
- ...

### TASK-02 — <Title>

...

## Dependency Order

Summarize the intended task execution order.

## Testing Approach

Summarize the planned tests.

## Risks / Considerations

List only implementation-relevant considerations.

If none:

`None identified.`

## Approval

`PENDING`