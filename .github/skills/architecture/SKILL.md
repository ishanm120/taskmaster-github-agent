---
name: architecture
description: Design a simple high-level software architecture from approved requirements and existing repository context. Use for component design, responsibilities, technology choices, data flow, integration points, and architecture documentation.
---

# Architecture Design

Design the simplest architecture that satisfies the approved requirements and
fits the existing repository.

## Inputs

Use:

- approved `requirements.md`;
- relevant existing repository structure;
- existing technologies and patterns where practical.

Requirements define what must be achieved.

Repository inspection helps determine how the new behavior can fit the
existing application.

## Repository Analysis

Inspect only files needed to understand:

- application structure;
- existing technologies;
- relevant modules;
- configuration;
- existing integrations;
- testing approach;
- build or automation setup relevant to the change.

Avoid broad or unrelated repository analysis.

## Architecture Principles

Prefer:

- simple designs;
- existing repository technologies;
- reuse of existing components;
- clear separation of responsibilities;
- minimal new dependencies;
- testable components;
- explicit error handling.

Avoid:

- unnecessary services;
- unnecessary frameworks;
- speculative future requirements;
- premature scalability design;
- unrelated refactoring.

## Technology Choices

Technology choices may be proposed during Architecture.

For each significant new technology or dependency:

1. state the choice;
2. explain why it is needed;
3. explain why the existing repository cannot reasonably provide the same
   capability.

Do not present a proposed technology as an existing repository fact.

Prefer no new dependency when the requirement can be implemented reasonably
with existing capabilities.

## Components

For each component describe:

- name;
- responsibility;
- inputs;
- outputs;
- important dependencies.

Keep components at a useful high level.

Do not turn individual functions or classes into architecture components
unless they are architecturally significant.

## Data Flow

Describe the main runtime flow from trigger/input to final output.

The flow must show:

- trigger or entry point;
- relevant processing;
- component interactions;
- output;
- important failure or `NOT_FOUND` behavior required by the requirements.

## Security

Address security only where relevant to the approved requirements or the
proposed architecture.

For this project, ensure architectural decisions do not expose repository
secrets or credentials.

Do not invent unrelated security requirements.

## Requirement Coverage

Every approved functional and non-functional requirement must be addressed by
at least one architecture component or design decision.

If an approved requirement cannot be supported by the proposed architecture,
report it instead of ignoring it.

## Diagram

Include one high-level Mermaid component/data-flow diagram.

Keep the diagram small enough to explain during a review or presentation.

## Output

Create `architecture.md` using:

# Architecture

## Overview

Short description of the proposed solution.

## Existing Repository Context

Relevant existing structure and technologies.

## Components

Component responsibilities and interactions.

## Data Flow

Numbered description of the main flow.

## Architecture Diagram

One Mermaid diagram.

## Technology Decisions

Important technology choices and rationale.

## Error Handling

Architecture-level handling required by the approved requirements.

## Security Considerations

Relevant security decisions.

## Requirement Coverage

Map requirements to architecture components or decisions.

## Assumptions and Limitations

Only architecture-level assumptions or known limitations.

Do not introduce new business requirements here.