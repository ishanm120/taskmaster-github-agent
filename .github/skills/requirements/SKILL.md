---
name: requirements
description: Analyze supplied software requirements for completeness, clarity, testability, and important gaps. Use when converting Jira, Confluence, documents, or directly supplied user stories into requirements.md.
---

# Requirements Analysis

Analyze only the supplied requirement information.

The purpose is to produce the smallest complete and testable requirement set
needed for downstream architecture and implementation.

## Analysis

Identify only what is applicable:

- objective;
- actors or users;
- functional behavior;
- acceptance criteria;
- business rules;
- validation and error behavior;
- dependencies and integrations;
- data requirements;
- security requirements;
- performance or reliability requirements;
- constraints;
- important edge cases;
- explicit out-of-scope behavior.

Do not create requirements merely because a category appears in this list.

## Functional Requirements

Create concise functional requirements using:

- `FR-001`
- `FR-002`
- `FR-003`

Each functional requirement should describe one meaningful required behavior.

Avoid unnecessary splitting or duplicate requirements.

## Non-Functional Requirements

Create `NFR-###` requirements only when supported by the supplied requirement
or explicit user clarification.

Do not add generic security, performance, scalability, logging, monitoring,
availability, or compliance requirements simply because they are good
engineering practices.

## Clarifications

Ask for clarification only when missing or ambiguous information could
materially change required behavior or implementation scope.

Examples include:

- an important term defining scope is unclear;
- expected behavior is ambiguous;
- a required business rule is missing;
- acceptance criteria conflict;
- two supplied sources disagree.

Do not ask questions merely to make the specification more detailed.

Do not introduce new features or technologies through clarification questions.

Ask related questions together and ask no more than 5 at one time.

## Human Answers

Treat explicit human answers to clarification questions as requirement input.

Do not treat requests to guess, assume, or use a reasonable default as
confirmed business requirements.

If the human explicitly adds or changes a requirement, include the change and
make it clear in the resulting requirement set.

## Requirement Quality

Before finalizing, check that each requirement is:

- supported by supplied information or human clarification;
- clear enough for downstream work;
- testable;
- non-duplicative;
- implementation-neutral where practical.

Do not turn architecture or implementation choices into business
requirements.

## Output

When blocking clarification remains, ask the questions and stop.

When the requirements are sufficiently clear, create `requirements.md` using:

# Requirements

## Source

Describe the requirement source.

## Objective

Summarize the business/user objective.

## Functional Requirements

List `FR-###` requirements.

## Non-Functional Requirements

List applicable `NFR-###` requirements.

If none are explicitly applicable, state:

`No explicit non-functional requirements identified.`

## Dependencies and Constraints

List only supported dependencies and constraints.

If none are known, state:

`None identified from the supplied requirement.`

## Acceptance Criteria

List concise, testable acceptance criteria.

## Open Questions

List only remaining non-blocking questions.

If none remain, state:

`None.`

## Approval

`PENDING`