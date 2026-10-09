# Design Review

## Scope
Independent review of `architecture.md` for KAN-118 ("Display existing due date on task cards") against the approved `requirements.md`. Reviewed for: requirement coverage, integration with the existing codebase, error handling, relevant security, complexity, and compatibility with existing conventions (styling, testing, branch/scope constraints). Evidence drawn directly from `frontend/src/components/TaskCard.jsx`, `frontend/src/components/TaskForm.jsx`, `frontend/src/index.css`, `backend/src/db.js`, `frontend/package.json`, `e2e/package.json`, and `e2e/tests/task_flow.spec.js`.

## Coverage and Compatibility
- All six functional requirements (AC-001–AC-006) and all four non-functional constraints are mapped in `architecture.md`'s Requirement Traceability table to a concrete component/behavior. No FR/NFR is left unmapped.
- The design touches only `TaskCard.jsx` (production code) and the existing `e2e/tests/task_flow.spec.js` (tests), matching the "frontend-only" and "no unrelated behavior changes" NFRs. No backend, schema, or `TaskForm.jsx` changes are proposed.
- The design reuses the existing `.task-date` CSS class and markup shape rather than introducing new classes, directly satisfying AC-004 by construction.
- The design correctly identifies that `frontend/package.json` has no unit-test runner, and routes AC-006 coverage through the already-installed `@playwright/test` in `e2e/`, avoiding a new dependency.

## Findings

**MEDIUM — Locale-pinned date format is a plausible but unverified fix.** `architecture.md` proposes `toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })` to deterministically produce `"25 Sep 2026"`. This is standard `Intl`/ICU behavior for `en-GB` and is very likely correct, but the architecture does not call out verification as an explicit implementation step. Evidence: `frontend/src/components/TaskCard.jsx:18-26` (current `formatDate` uses `undefined` locale, confirmed non-deterministic/mismatched with AC-002's example). Action: carry forward to planning/implementation as an explicit check — confirm the rendered string for at least one sample date (e.g. in a quick manual check or within the new Playwright assertion itself, which already asserts the exact/regex-matched shape) before considering AC-002 satisfied.

**LOW — E2E-only automated coverage for AC-006, not unit-level.** Because no frontend unit-test framework exists and adding one would violate the "no new dependencies" NFR, the design satisfies AC-006 via Playwright E2E assertions on rendered DOM text rather than a focused unit test of the `formatDate` function in isolation. This is the smallest repository-compatible option given the constraints, already flagged as a trade-off in `architecture.md`, and does not reduce AC-001–AC-004 coverage since those are user-visible/DOM-level requirements anyway. No action required beyond what's already documented.

**LOW — Seed data has no "no due date" fixture.** `backend/src/db.js` seeds four tasks, all with a due date set, so the fallback path is not exercised by default seed data. The design correctly compensates by having the new/extended Playwright test create a task without filling `#task-duedate-input` to exercise the fallback. This is sufficient and in-scope (no backend/seed changes needed or permitted). No action required.

**LOW — Fallback text reuses the same visual tone as a real date.** `"No Due Date"` is rendered in the same muted `.task-date` styling as an actual date, rather than a distinct "empty state" treatment. Requirements (AC-003, AC-004) only require the text to appear and to be visually consistent with existing metadata styling — they do not request a distinct empty-state style — so this is a correct, minimal interpretation, not a defect. No action required.

## Decisions and Follow-ups
- Confirmed: `TaskCard.jsx` is the only production file requiring changes; `TaskForm.jsx` and `backend/src/db.js` are correctly left untouched.
- Confirmed: no new npm dependency is required in either `frontend/` or `e2e/`; the design uses native `Date`/`Intl` APIs and the already-installed `@playwright/test`.
- Follow-up for planning/implementation: explicitly verify the exact rendered date string (e.g. via the new Playwright assertion) rather than assuming `en-GB` formatting output without a runtime check — tracked as the MEDIUM finding above, not a blocker to proceeding to planning.
- No HIGH findings were raised; no correction cycle was required.

## Status
No unresolved HIGH findings.
