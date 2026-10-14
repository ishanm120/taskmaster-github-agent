# Implementation Plan

## Inputs
- Jira issue: KAN-119, `Claude-Display existing due date on task cards`.
- Approved scope and acceptance criteria: [requirements.md](requirements.md), Approval `APPROVED`.
- Approved design: [architecture.md](architecture.md); [design-review.md](design-review.md) reports no unresolved HIGH findings.
- Repository evidence: `TaskCard` currently formats and conditionally renders `task.due_date`; `TaskForm` accepts the existing date field; `TaskList` passes task objects through unchanged. The existing Playwright suite is `e2e/tests/task_flow.spec.js`, and the root `test:e2e` script invokes it. Playwright targets `http://localhost:3000` without configuring automatic server startup.

## Tasks

### T1 — Render due date and missing-date state on task cards
- **Objective:** Show an existing due date in the task metadata using the approved readable short-month format, and show exact fallback text `No Due Date` when absent.
- **Files/areas:** `frontend/src/components/TaskCard.jsx`; reuse existing `.task-meta` and `.task-date` styling in `frontend/src/index.css` without changing styles unless implementation evidence requires it.
- **Steps:**
  1. Update the TaskCard date formatting path so ISO date-only values are treated as calendar dates and formatted without timezone day shifts.
  2. Render the formatted date when `task.due_date` exists and render `No Due Date` otherwise, in the existing metadata row and style.
  3. Keep task data, API behavior, and task mutation handlers unchanged.
- **Dependencies:** None.
- **Traceability:** FR-001, FR-002, FR-003, FR-004, FR-005; AC-001, AC-002, AC-003, AC-004, AC-005.
- **Completion condition:** A task card shows its existing date in the approved readable format or the exact `No Due Date` fallback, using existing metadata presentation; no API, schema, dependency, or unrelated workflow change is introduced.
- **Status:** DONE.

### T2 — Cover both due-date states in Playwright
- **Objective:** Add automated UI coverage for a present due date and the no-due-date fallback.
- **Files/areas:** `e2e/tests/task_flow.spec.js`; existing form selector `#task-duedate-input`, task-card selector `.task-card`, and date input submitted as `due_date`.
- **Steps:**
  1. Extend the existing task-flow suite to create a task with a date such as `2026-09-25` and assert the matching card displays `25 Sep 2026`.
  2. Create a task without a date and assert its card displays `No Due Date`.
  3. Keep existing create, filtering, completion, and deletion workflow coverage in the suite.
- **Dependencies:** T1.
- **Traceability:** FR-006, FR-005; AC-006, AC-005. The two assertions directly cover AC-001 through AC-003.
- **Completion condition:** The focused Playwright assertions verify the formatted present date and exact missing-date fallback, and the existing task-flow tests remain in the suite.
- **Status:** DONE.

## Dependency Order
1. T1 — TaskCard date and fallback rendering.
2. T2 — Playwright coverage, after T1.

## Testing Approach
- Start the application so it is available at `http://localhost:3000` (the existing E2E config does not start it), then run `npm run test:e2e` from the repository root.
- The added UI assertions should exercise both date-present and date-absent tasks through the existing task form. The full existing E2E suite should also be run to cover task creation, filtering, completion, and deletion behavior.
- No tests have been run during planning.

## Risks and Blockers
- The Playwright suite requires the app to be available at `localhost:3000`; its config has no `webServer` setup. Start services using the repository's documented/root development command before running E2E tests.
- No unresolved design-review HIGH findings or additional dependencies identified.

## Development Branch
KAN-119

## Approval
APPROVED