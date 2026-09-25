---
name: code-review
description: Perform a structured review of completed implementation against approved requirements, architecture, security, error handling, tests, code clarity, DRY principles, and dependency safety.
---

# Code Review

Review the implementation as a peer reviewer.

Base findings on:

- approved `requirements.md`;
- `architecture.md`;
- `design-review.md`;
- approved `impl-plan.md`;
- actual implementation;
- actual tests.

Do not introduce new business requirements during review.

## Review Areas

### Correctness

Check:

- Does the implementation satisfy each approved functional requirement?
- Does behavior match the approved architecture?
- Are important conditions and branches handled correctly?
- Does implementation scope match the approved plan?

### Security

Check:

- Are secrets excluded from generated output?
- Is relevant external or user-controlled input handled safely?
- Are credentials or sensitive values hard-coded or exposed?
- Does implementation respect the approved security requirements?

Do not invent unrelated security requirements.

### Error Handling

Check requirement-relevant failures such as:

- missing files;
- invalid configuration;
- empty or missing mappings;
- required `NOT_FOUND` behavior;
- relevant processing failures.

Confirm errors are handled consistently with approved requirements.

### Test Coverage

Check whether tests cover:

- required happy path;
- important requirement-defined edge cases;
- `NOT_FOUND` or missing-field behavior where required;
- relevant security behavior;
- regression-sensitive behavior.

Do not demand tests for unrelated speculative scenarios.

### Code Clarity

Check:

- meaningful names;
- understandable control flow;
- reasonable function size;
- unnecessary complexity;
- consistency with repository conventions.

Prefer readable code over unnecessary abstraction.

### DRY Principle

Identify meaningful duplicated logic.

Do not recommend abstraction when duplication is trivial or when abstraction
would make the POC harder to understand.

### Dependency Safety

Check:

- whether unnecessary dependencies were introduced;
- whether existing capabilities could have been reused;
- available repository dependency/security checks where applicable.

Do not claim a dependency is vulnerable without evidence from an available
check or reliable repository information.

## Severity

Use:

### HIGH

The implementation does not satisfy an approved requirement, introduces a
material security issue, or cannot be safely verified.

### MEDIUM

The implementation works but contains a meaningful quality, maintainability,
error-handling, or test-coverage concern.

### LOW

A minor improvement that does not materially affect required behavior.

Do not create findings simply to ensure every severity exists.

## Requirement Coverage

Review every approved FR and NFR.

Record whether each is:

- `COVERED`
- `NOT_COVERED`

If `NOT_COVERED`, explain the corresponding finding.

## Output

Create `code-review.md` using:

# Code Review

## Scope

List the artifacts and implementation reviewed.

## Requirement Coverage

Map each FR/NFR to `COVERED` or `NOT_COVERED`.

## Findings

For each finding:

### <SEVERITY> — <Title>

**Area:** Correctness / Security / Error Handling / Test Coverage /
Code Clarity / DRY / Dependency Safety

**Location:** file or relevant area

**Issue:** concise description

**Impact:** why it matters

**Recommendation:** concise correction

If no findings exist:

`No material findings identified.`

## Review Summary

Summarize:

- HIGH findings;
- MEDIUM findings;
- LOW findings;
- whether the implementation is ready for Verification.