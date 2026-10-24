# Implementation Plan

## Inputs
- `requirements.md` — Jira KAN-117, `## Approval: APPROVED`. FR-001–FR-007, AC-001–AC-006, OQ-001–OQ-003 (all resolved in architecture).
- `architecture.md` — Proposed Approach, Requirement Traceability, Diagram. No unresolved issues.
- `design-review.md` — No unresolved HIGH findings (4 findings, all MEDIUM/LOW, already resolved within `architecture.md`). Status: "ready for Planning."
- Repository evidence inspected directly for this plan:
  - `frontend/src/components/TaskCard.jsx` (current partial implementation: `formatDate` uses `toLocaleDateString`; due-date span is conditionally rendered with `task.due_date && (...)`, no fallback).
  - `frontend/src/components/TaskForm.jsx` (`id="task-duedate-input"`, `type="date"`, emits `YYYY-MM-DD`; unaffected).
  - `e2e/tests/task_flow.spec.js` (existing 4 Playwright tests: create, filter/search, complete/toggle, delete — selectors `.task-card`, `.task-title`, `#add-task-btn`, `#task-title-input`, `#task-duedate-input` available via TaskForm, `#save-task-submit`, `.delete-btn`, `.custom-checkbox`, `#filter-completed-btn`, `#filter-all-btn`).
  - `e2e/playwright.config.js` (`baseURL: http://localhost:3000`, no `webServer` auto-start block — the app must already be running before `playwright test` executes).
  - `e2e/package.json` (`"test": "playwright test"`, only devDependency `@playwright/test`, no new dependency needed).
  - Root `package.json` (`"test:e2e": "npm --prefix e2e test"`, `"dev"`/`"start"` boot backend + frontend concurrently on the ports the e2e suite expects).

## Tasks

### TASK-1: Rewrite due-date formatting and add fallback rendering in `TaskCard.jsx`
- **Objective**: Replace the locale-dependent `formatDate` helper with a fixed-format `formatDueDate` helper and change the due-date block from conditional (skip-when-absent) to always-rendered with a "No Due Date" fallback, per `architecture.md` §Proposed Approach steps 1–3.
- **Files/Areas**: `frontend/src/components/TaskCard.jsx` only.
- **Steps**:
  1. Remove the existing `formatDate` function (lines ~18–26, using `new Date(dateStr).toLocaleDateString(...)`).
  2. Add a `formatDueDate(dateStr)` helper that:
     - Returns `null` if `dateStr` is falsy.
     - Parses `dateStr` by splitting on `-` (expects `YYYY-MM-DD`), validates it yields three numeric parts with a plausible month (1–12) and day (1–31); returns `null` if malformed/unparseable (defensive guard per architecture §Error Handling).
     - Builds and returns the string `${day} ${MONTHS[month-1]} ${year}` using a local fixed month-abbreviation array `['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']` — no `Date` object construction, no `Intl`/`toLocaleDateString` (avoids timezone off-by-one per Finding 4, satisfies AC-002's fixed example format, resolves OQ-001).
  3. Replace the conditional block:
     ```jsx
     {task.due_date && (
       <span className="task-date">
         <Calendar size={12} />
         {formatDate(task.due_date)}
       </span>
     )}
     ```
     with an always-rendered block that keeps the same `.task-date` class, `Calendar` icon, and position (last item in `.task-meta`, after priority and category badges — no reordering, per OQ-003 resolution):
     ```jsx
     <span className="task-date">
       <Calendar size={12} />
       {formatDueDate(task.due_date) || 'No Due Date'}
     </span>
     ```
  4. Do not touch `getPriorityBadge`, the category badge block, imports (`Calendar` already imported), or any other file.
- **Dependencies**: None (first task).
- **FR/NFR IDs**: FR-001, FR-002, FR-003, FR-004, FR-005.
- **Completion Condition**: `TaskCard.jsx` renders the fixed `D MMM YYYY` format for a present, valid `due_date`; renders literal `No Due Date` for null/undefined/empty/malformed `due_date`; due-date element remains last in `.task-meta` with unchanged class/icon; no other file is modified; no new import/dependency added.
- **Status**: READY

### TASK-2: Add Playwright e2e coverage for due-date display and fallback
- **Objective**: Extend `e2e/tests/task_flow.spec.js` with new test cases covering AC-001, AC-002, AC-003, AC-004, and AC-006, and confirm AC-005 (existing CRUD/filter/complete/delete) still passes unchanged.
- **Files/Areas**: `e2e/tests/task_flow.spec.js` only (append new `test(...)` cases inside the existing `test.describe` block; no new spec file, no new dependency, per architecture's dependency-free-testing decision and Finding 2).
- **Steps**:
  1. Add a test "Create a task with a due date shows formatted date on card": create a task via the existing form flow (`#add-task-btn`, `#task-title-input`, `#save-task-submit`), additionally filling the due-date input (`#task-duedate-input`) with a known `YYYY-MM-DD` value (e.g. `2026-09-25`), then assert the resulting `.task-card` for that title contains a `.task-date` element with the exact text `25 Sep 2026` (verifies AC-001, AC-002).
  2. Add a test "Create a task without a due date shows No Due Date fallback": create a task via the same form flow leaving `#task-duedate-input` empty, then assert the `.task-card`'s `.task-date` element has exact text `No Due Date` (verifies AC-003).
  3. Optionally assert `.task-date` is positioned after the priority/category badges within `.task-meta` (e.g. via DOM order check) if this can be done without new tooling; if not feasible with current Playwright usage patterns in the file, rely on visual/structural consistency already covered by unchanged CSS classes (AC-004) — do not add new CSS-assertion infra not already used in the spec file.
  4. Do not modify existing tests 1–4 (create, filter/search, complete/toggle, delete) — running them unchanged after the `TaskCard.jsx` change is how AC-005 (no regression) is verified.
- **Dependencies**: TASK-1 (tests assert on the new rendering behavior; must be written against the implemented markup).
- **FR/NFR IDs**: FR-001, FR-002, FR-003, FR-004, FR-006, FR-007 (AC-001–AC-006).
- **Completion Condition**: `e2e/tests/task_flow.spec.js` contains new test case(s) asserting the formatted-date path and the "No Due Date" fallback path; the four pre-existing tests remain textually unchanged; no new npm package is added to `e2e/package.json`.
- **Status**: READY

### TASK-3: Run verification and record results
- **Objective**: Execute the e2e suite against the running app and capture real pass/fail evidence for `verification.md` in the Review stage (not produced by this plan itself, but the commands and expectations are fixed here so Implementation runs them for real).
- **Files/Areas**: None modified; this task only runs commands and records output.
- **Steps**:
  1. Start the app (backend + frontend) using the existing root script, e.g. `npm run dev` or `npm start` (both boot `backend` on its port and `frontend` on `http://localhost:3000`, which `e2e/playwright.config.js`'s `baseURL` expects — no `webServer` auto-start is configured, so the app must be running before Playwright executes).
  2. Run the e2e suite: `npm run test:e2e` (root script → `npm --prefix e2e test` → `playwright test`), or equivalently `npx playwright test` from `e2e/` directly.
  3. Confirm all test cases pass, including the two new due-date cases (TASK-2) and the four pre-existing cases (regression check for FR-006/AC-005).
  4. Record exact command(s) run and actual output/exit status; use `PASS`/`FAIL`/`NOT_RUN` accurately — do not report an unexecuted test as passed.
- **Dependencies**: TASK-1, TASK-2.
- **FR/NFR IDs**: FR-006, FR-007 (AC-005, AC-006), and indirectly validates FR-001–FR-004 (AC-001–AC-004) via the new assertions.
- **Completion Condition**: The e2e suite has been executed at least once against the modified code with real output captured; result status (PASS/FAIL) is accurately recorded for follow-up in `verification.md`.
- **Status**: READY

## Dependency Order
1. TASK-1 (`TaskCard.jsx` change) — no dependencies, must land first since TASK-2's assertions target its output.
2. TASK-2 (e2e test additions) — depends on TASK-1.
3. TASK-3 (run verification) — depends on TASK-1 and TASK-2.

## Testing Approach
- No frontend unit-test framework exists in this repository (`frontend/package.json` has no `vitest`/`jest`/`@testing-library/*`), and none will be added, per the "no new dependencies" constraint and design-review Finding 2 / architecture's Dependencies and Trade-offs. All automated coverage for this feature is via the existing Playwright e2e suite in `e2e/`.
- New e2e cases (TASK-2) target: (a) formatted-date rendering for a present, valid `due_date` (AC-001, AC-002), (b) "No Due Date" fallback for an absent `due_date` (AC-003), (c) implicit visual-consistency check via reuse of the unchanged `.task-date` class (AC-004).
- Regression check: the four pre-existing Playwright tests (create, filter/search, complete/toggle, delete) must continue to pass unmodified after the `TaskCard.jsx` change, evidencing AC-005/FR-006.
- Verification command (to run in Implementation, TASK-3): `npm run test:e2e` from repo root (or `npm --prefix e2e test` / `npx playwright test` from `e2e/`), with the app already running via `npm run dev` or `npm start`. Backend unit tests (`npm run test:backend`) are unaffected by this change (no backend files touched) and are not required to be re-run, but may be run if convenient — no backend code is modified by this plan.
- No manual-only verification is planned; all coverage is automated per FR-007/AC-006.

## Risks and Blockers
- **Risk**: `e2e/playwright.config.js` has no `webServer` auto-start block, so the app (backend + frontend) must be manually started before running the e2e suite; if forgotten, all Playwright tests (not just the new ones) will fail with connection errors unrelated to this change. Mitigation: TASK-3 step 1 explicitly starts the app first.
- **Risk**: The optional DOM-order assertion in TASK-2 step 3 for AC-004 placement may not be straightforward with the existing Playwright patterns in the spec file (no prior example of sibling-order assertions); if infeasible without new tooling, the task falls back to relying on the unchanged CSS class as sufficient evidence, per architecture's explicit resolution of OQ-003. This is not a blocker — visual consistency is otherwise satisfied by reusing the existing `.task-date` styling untouched.
- **Blocker check**: none identified. All three approved input artifacts (`requirements.md`, `architecture.md`, `design-review.md`) are present, approved, and contain no unresolved HIGH findings or open questions.
- No backend, database, or dependency changes are needed or planned; no risk in those areas for this story.

## Development Branch
NOT_ASSIGNED — Developer will create/switch to `feature/KAN-117` (exact Jira key, per CLAUDE.md branch-naming rule) after this plan is explicitly approved, and before any code or test file is modified. Branch creation is not authorized while `## Approval` below is `PENDING`.

## Approval
APPROVED
