# Architecture

## Inputs and Constraints
- Source: `requirements.md` (Jira KAN-117), `## Approval: APPROVED`.
- FR-001–FR-007, AC-001–AC-006 (see Requirement Traceability).
- Constraints from requirements: frontend-only; reuse the existing `due_date` field; no backend/DB changes; no new dependencies; no unrelated behavior changes; must add/update automated test coverage (AC-006).
- Repository facts confirmed by inspection (not assumed):
  - `backend/src/db.js` — `tasks.due_date` is a `TEXT` column, always populated (seed data and app writes) as an ISO date-only string, e.g. `2026-08-30`.
  - `backend/src/app.js` — `POST`/`PATCH /api/tasks` already accept/persist `due_date` unchanged; `GET /api/tasks?sortBy=due_date` already sorts by it. No backend change is needed or in scope.
  - `frontend/src/components/TaskForm.jsx` — already has a `type="date"` input wired to `due_date`; HTML date inputs always emit `YYYY-MM-DD`. No change needed.
  - `frontend/src/components/FilterBar.jsx` — already offers "Due Date" as a sort option; unaffected by a display-only change. No change needed.
  - `frontend/src/components/TaskCard.jsx` — **already has a partial implementation**: a `formatDate` helper and a `task-date` span with a `Calendar` icon, but it is gated by `{task.due_date && (...)}`, so tasks without a due date render nothing (violates AC-003), and it formats with `toLocaleDateString(undefined, {...})`, which is locale/environment-dependent and yields e.g. `Sep 25, 2026` (month-first), not `25 Sep 2026` as specified by AC-002. Both gaps must be fixed; this is the only file that needs a code change.
  - `frontend/src/index.css` — `.task-meta`, `.badge*`, and `.task-date` classes already define the metadata row's layout/typography (flex row, small muted text, icon+text pattern). No new CSS is required; the fallback text reuses `.task-date`.
  - No frontend unit-test framework (vitest/jest/testing-library) is installed under `frontend/` (checked `frontend/package.json` and `frontend/node_modules`). A Playwright e2e suite already exists and is installed at `e2e/` (`e2e/tests/task_flow.spec.js`, `@playwright/test` devDependency) and drives the running app via DOM selectors (`.task-card`, `.task-title`, etc.). This is the only existing automated test capability that can exercise the rendered `TaskCard` output without introducing a new dependency, so it is the vehicle for AC-006.

## Proposed Approach
Modify only `frontend/src/components/TaskCard.jsx`:
1. Replace the locale-dependent `formatDate` helper with a fixed-format helper (`formatDueDate`) that parses the known `YYYY-MM-DD` string directly (no `Date` object timezone conversion) and renders `D MMM YYYY` (e.g. `25 Sep 2026`) using a local month-abbreviation lookup array — no new dependency, no `Intl`/locale API.
2. Change the due-date block from conditional rendering (`task.due_date && (...)`) to always render the existing `.task-date` element, showing the formatted date when `task.due_date` is present/parseable, and the literal fallback text `No Due Date` otherwise (covers null, undefined, empty string, and any unparsable value).
3. Keep the element's position, icon, and CSS class exactly where they already are today: last item in `.task-meta`, after the priority badge and the category badge — this is the placement already established by the current (partial) implementation and requires no reordering.
4. No change to `TaskForm.jsx`, `FilterBar.jsx`, any backend file, or CSS.
5. Add automated coverage via the existing Playwright suite in `e2e/tests/` (new test cases, e.g. added to `task_flow.spec.js` or a new sibling spec file) exercising: (a) a task created with a due date shows the fixed-format date on its card, (b) a task created without a due date shows "No Due Date", (c) existing create/complete/filter/delete flows still pass unchanged.

This is the smallest change that satisfies every FR/AC: one component edit plus one test-file addition, zero new files, zero new dependencies, zero backend/DB touch.

## Components and Responsibilities
| Component | Responsibility | Change |
|---|---|---|
| `TaskCard.jsx` | Renders one task's title, description, and metadata row (priority, category, due date). Owns the due-date formatting/fallback logic and its DOM placement. | Modified: fallback logic + fixed-format helper. |
| `TaskList.jsx` | Maps `tasks` array to `TaskCard` instances; passes `task` prop through unchanged. | Unchanged. |
| `App.jsx` / `services/api.js` | Fetch tasks (including `due_date`) from the backend and hold state. | Unchanged — `due_date` already flows through untouched. |
| `TaskForm.jsx` | Captures `due_date` on create (already implemented). | Unchanged. |
| `FilterBar.jsx` | Offers due-date sort (already implemented, backend-driven). | Unchanged. |
| Backend (`app.js`, `db.js`) | Persist/serve `due_date` (already implemented). | Unchanged — out of scope per FR-005. |
| `e2e/tests/*.spec.js` | Automated regression coverage for the app's UI behavior, run against a live dev server via Playwright. | Extended: new assertions for date display + fallback. |

## Data Flow
1. `App.jsx` calls `api.getTasks(filters)` → backend returns each task's existing `due_date` (string or `null`) unchanged.
2. `TaskList.jsx` passes each `task` object to `TaskCard`.
3. `TaskCard` computes a display string: `task.due_date` present and parseable as `YYYY-MM-DD` → `formatDueDate(task.due_date)` → `"25 Sep 2026"`-style string; otherwise → `"No Due Date"`.
4. `TaskCard` renders that string inside the existing `.task-date` element, in its existing position within `.task-meta`, alongside the unaffected priority and category badges.
5. No data flows back from this display; it is read-only presentation of an already-fetched field. Create/edit/complete/filter/delete requests to the backend are untouched (FR-006).

## Requirement Traceability
| Requirement | Component / Behavior |
|---|---|
| FR-001 (show due date when present) | `TaskCard.jsx` — `.task-date` renders `formatDueDate(task.due_date)` when `task.due_date` is truthy and parseable. |
| FR-002 (readable, fixed format e.g. 25 Sep 2026) | `TaskCard.jsx` — new `formatDueDate` helper builds `D MMM YYYY` from the ISO string via a fixed month-abbreviation array; not locale-dependent (resolves OQ-001). |
| FR-003 ("No Due Date" fallback) | `TaskCard.jsx` — `.task-date` renders literal text `No Due Date` when `task.due_date` is falsy or fails to parse. |
| FR-004 (visually consistent with existing metadata) | `TaskCard.jsx` / `index.css` — reuses the existing `.task-date` class, icon, spacing, and position unchanged; no new CSS (resolves OQ-003: last item in `.task-meta`, after priority/category, matching current convention). |
| FR-005 (reuse existing field, no backend/DB/API change) | No changes to `backend/src/db.js`, `backend/src/app.js`, or any API contract; `TaskForm.jsx`/`FilterBar.jsx` already wire the existing field. |
| FR-006 (existing CRUD/filter/complete/delete unaffected) | Change is isolated to a read-only render branch in `TaskCard.jsx`; no handler, prop, state, or API call is modified. Verified by existing + extended Playwright specs. |
| FR-007 (automated test coverage for display + fallback) | New/extended Playwright cases in `e2e/tests/` (only existing, dependency-free automated UI test tool in this repo) cover both the formatted-date path and the fallback path. |
| AC-001–AC-006 | Each maps 1:1 to the FR above with the same numbering. |
| OQ-001 (format) | Resolved: fixed `D MMM YYYY` (e.g. `25 Sep 2026`), computed manually, not locale-configurable, not derived from any other in-app date display (there is none). |
| OQ-002 (overdue styling) | Resolved: no distinct overdue styling — see design-review.md Decisions and Follow-ups for rationale. |
| OQ-003 (placement) | Resolved: due date stays the last element in `.task-meta`, after priority and category, matching the current codebase convention. |

## Error Handling and Relevant Security
- **Missing due date**: `null`/`undefined`/`''` → render `"No Due Date"`. No exception path needed for this, the common case.
- **Malformed due date** (defensive only — the app's own write paths always produce `YYYY-MM-DD`): if `task.due_date` doesn't match the expected `YYYY-MM-DD` shape or produces an invalid date, `formatDueDate` returns `null`/falsy and `TaskCard` falls back to `"No Due Date"` rather than throwing or rendering `NaN`/`Invalid Date`. This is a small defensive guard, not new functional scope.
- **XSS / injection**: `task.due_date` and the derived display string are rendered as plain React text content (JSX expression, not `dangerouslySetInnerHTML`), so React's default escaping applies; no new injection surface is introduced. Title/description already follow the same pattern elsewhere in this component.
- **No secrets/PII**: due dates are task-level scheduling data already visible in the task detail view and API responses; surfacing them on the card discloses no new information and touches no credentials, tokens, or personal data.
- **No new network/API surface**: this is a pure client-side render change; existing request/response contracts (`GET/POST/PATCH/DELETE /api/tasks`) are untouched, so no new server-side error handling is required.

## Dependencies and Trade-offs
- **No new dependencies** (constraint honored): date formatting is done with a small hand-written helper (Date parsing of `YYYY-MM-DD` plus a fixed month-abbreviation array) instead of `Intl.DateTimeFormat`/locale-aware `toLocaleDateString`, trading a few lines of manual formatting code for a guaranteed, environment-independent output format — directly satisfying AC-002's exact example and avoiding the locale drift in the current partial implementation.
- **Test tooling trade-off**: the repository has no frontend unit-test framework, and adding one (e.g. Vitest + Testing Library) would satisfy AC-006 more granularly but would violate "no new dependencies." Using the existing Playwright e2e suite instead means coverage is at the browser/DOM level rather than isolated component-unit level — acceptable given the constraint, and consistent with how this repo already tests frontend behavior (see `e2e/tests/task_flow.spec.js`).
- **Manual date parsing vs. `Date` object**: parsing `YYYY-MM-DD` by splitting the string (rather than `new Date(dateStr)` + local-timezone getters) avoids a known class of off-by-one-day bugs when the browser's timezone offset is negative relative to UTC on a date-only value. This is a minor correctness improvement bundled into the same touched lines, not a scope expansion.
- **No distinct overdue styling** (OQ-002): keeps the change strictly presentational and avoids introducing "current date" comparison logic, additional CSS states, and additional test cases that no FR/AC currently requires (see design-review.md for full rationale and the explicit scope boundary).

## Diagram
```mermaid
flowchart LR
    A[Backend GET /api/tasks<br/>due_date: string|null] --> B[App.jsx / api.js<br/>fetch + state]
    B --> C[TaskList.jsx<br/>maps tasks]
    C --> D[TaskCard.jsx]
    D -->|due_date present & parseable| E[formatDueDate helper<br/>fixed 'D MMM YYYY']
    D -->|due_date missing/invalid| F["No Due Date" fallback]
    E --> G[.task-date element<br/>after priority + category badges]
    F --> G
    H[e2e/tests/*.spec.js<br/>Playwright] -.->|asserts rendered text| G
```
