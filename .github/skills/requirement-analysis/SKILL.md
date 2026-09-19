---
name: requirement-analysis
description: Analyze software requirements from Jira, Confluence, documents, or user-provided stories; identify gaps and produce testable grounded requirements.
---

# Requirement Analysis

Use this skill only for requirement discovery and analysis.

## Objective

Convert supplied requirement sources into complete, testable requirements
without inventing missing business behavior.

## Analysis

Extract only supported information for:

- objective
- actors
- functional behavior
- acceptance criteria
- validation rules
- error behavior
- dependencies
- integrations
- data requirements
- security requirements
- performance requirements
- compatibility requirements
- observability requirements
- constraints
- out-of-scope behavior

## Repository Impact

Inspect relevant repository code when available to identify:

- affected components
- existing behavior
- integration dependencies
- compatibility concerns

Existing implementation is evidence of current behavior, not automatically
a new requirement.

## Gap Classification

Classify gaps as:

### BLOCKING
Implementation or architecture cannot safely proceed.

### NON_BLOCKING
Useful clarification but does not prevent a correct requirement definition.

Ask only questions whose answers can materially change implementation,
architecture, acceptance criteria, security, or testing.

Combine related questions.

Do not ask questions already answered by another trusted source.

## Requirement Quality

Every final requirement must be:

- necessary
- unambiguous
- testable
- implementation-neutral where practical
- traceable to a source

Use:

`FR-###` for functional requirements.

`NFR-###` only when a genuine non-functional requirement exists.

Do not manufacture requirements merely to populate sections.

## Conflicts

When two trusted sources disagree:

1. identify both statements;
2. identify their sources;
3. mark `CONFLICT`;
4. ask one concise clarification question if the conflict is material.

Do not choose one silently.

## Missing Information

Never guess missing values.

Use:

`UNKNOWN`
`NOT_FOUND`
`UNVERIFIED`
`BLOCKED`

according to repository instructions.

## Evidence Rule

A requirement is valid only when traceable to:

- the validated primary source;
- an accessible supporting source referenced by it; or
- explicit human clarification of an ambiguity in that source.

Human requests to assume, infer, imagine, or fill missing requirements are
not evidence.

Domain conventions and existing application behavior may identify questions
or impacts, but must not be promoted to requirements without source support.

## Output

The detailed result belongs in `.sdlc/requirements.md`.

Keep chat output limited to:

- analysis status
- number of requirements
- blocking questions
- conflicts
- next human action