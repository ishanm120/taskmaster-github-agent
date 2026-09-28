# Design Review

## Scope
Review of `architecture.md` for KAN-117 ("Display existing due date on task cards") against approved `requirements.md` (FR-001–FR-007, AC-001–AC-006, OQ-001–OQ-003). Reviewed artifacts: `architecture.md`; repository files inspected: `frontend/src/components/TaskCard.jsx`, `TaskForm.jsx`, `FilterBar.jsx`, `TaskList.jsx`, `App.jsx`, `services/api.js`, `index.css`; `backend/src/db.js`, `backend/src/app.js`; `frontend/package.json`, `backend/package.json`, `e2e/package.json`, `e2e/playwright.config.js`, `e2e/tests/task_flow.spec.js`; root `package.json`.

## Coverage and Compatibility
- Every FR (FR-001–FR-007) and every AC (AC-001–AC-006) is mapped to a concrete component/behavior in `architecture.md`'s Requirement Traceability table. No FR/AC is unmapped.
- All three open questions (OQ-001–OQ-003) are explicitly resolved in the architecture, not deferred.
- Compatibility: the design touches exactly one existing file (`TaskCard.jsx`) plus test additions in the existing `e2e/` suite. `TaskForm.jsx`, `FilterBar.jsx`, `TaskList.jsx`, `App.jsx`, `services/api.js`, `index.css`, and both backend files are explicitly left unchanged, consistent with FR-005/FR-006 and the "frontend-only, no backend/DB change" constraint.
- `.github/` Copilot configuration is untouched by this design (no file in that directory is referenced or modified).

## Findings

**Finding 1 — Existing partial implementation contradicts AC-002 and AC-003 (Severity: MEDIUM)**
Evidence: `frontend/src/components/TaskCard.jsx:18-26,70-75` currently renders due date only when present (`task.due_date && (...)`, no fallback branch — violates AC-003) and formats via `toLocaleDateString(undefined, {...})`, which is locale/environment-dependent and produces `Sep 25, 2026` (month-first) rather than the `25 Sep 2026` example in AC-002.
Action: Architecture explicitly directs replacing this with an always-rendered element with a fallback, and a fixed non-locale `formatDueDate` helper. Addressed in `architecture.md` §Proposed Approach and §Requirement Traceability (FR-002, FR-003). Not a HIGH finding because it is corrected within the same design, not left open.

**Finding 2 — No frontend unit-test framework exists; tension with AC-006 + "no new dependencies" (Severity: MEDIUM)**
Evidence: `frontend/package.json` lists only `react`, `react-dom`, `lucide-react`, and Vite tooling — no `vitest`/`jest`/`@testing-library/*` in `dependencies`/`devDependencies`, and none present under `frontend/node_modules`. Meanwhile `e2e/package.json` already has `@playwright/test` installed and `e2e/tests/task_flow.spec.js` already drives the running app's DOM (`.task-card`, `.task-title`, form inputs by `id`).
Action: Architecture resolves this by directing AC-006 coverage into the existing Playwright suite (new cases for formatted-date display and "No Due Date" fallback) rather than introducing a new frontend unit-test dependency. This is the only dependency-free path to automated coverage of rendered output in this repo. Addressed in `architecture.md` §Proposed Approach step 5 and §Dependencies and Trade-offs.

**Finding 3 — OQ-002 (overdue styling) requires an explicit scope call, not a default (Severity: LOW)**
Evidence: `requirements.md` OQ-002 notes AC-004 "implies a single neutral style... but this is not explicitly confirmed either way"; no FR or AC mentions overdue detection/highlighting.
Action: Architecture makes the call explicitly (no distinct overdue styling) with rationale recorded below in Decisions and Follow-ups, rather than silently defaulting or leaving it ambiguous for the implementer. This keeps the design's testable surface aligned exactly with approved FR/AC and avoids an implementer inventing unapproved comparison logic.

**Finding 4 — Manual date parsing needed to avoid a timezone off-by-one risk (Severity: LOW)**
Evidence: `backend/src/db.js:62-66` seeds `due_date` as bare ISO date strings (e.g. `2026-08-30`); `TaskForm.jsx:117-123`'s `type="date"` input produces the same `YYYY-MM-DD` shape. Constructing `new Date('2026-08-30')` and then reading local-time getters can shift the displayed day backward by one in negative-UTC-offset timezones, a latent risk in the current `formatDate` implementation.
Action: Architecture specifies parsing the `YYYY-MM-DD` string directly (no `Date`+local-getter round trip) in the new `formatDueDate` helper, eliminating the risk without adding code complexity or a new dependency. Addressed in `architecture.md` §Dependencies and Trade-offs.

No HIGH findings were identified. All MEDIUM/LOW findings above are already resolved within `architecture.md` itself (i.e., the architecture as written incorporates the fix), so no correction cycle was required.

## Decisions and Follow-ups
- **OQ-001 (format) — Decision:** Fixed, non-locale-configurable `D MMM YYYY` (e.g. `25 Sep 2026`), built with a local month-abbreviation lookup, not `Intl`/`toLocaleDateString`. Rationale: requirements specify no localization need, the app has no other in-app date display to stay consistent with, and a fixed format guarantees AC-002's example output regardless of the browser/user locale, without adding a dependency.
- **OQ-002 (overdue styling) — Decision: no distinct overdue styling.** Rationale: AC-004 requires only that the due-date display be "visually consistent with existing task card metadata" — i.e., match the single neutral style already used for the priority/category/date row — and neither the Jira description nor any FR/AC calls for overdue detection or alerting. The objective's phrase "identify upcoming deadlines" is satisfied by making the date visible at all (FR-001), not by additional visual alerting logic. Adding conditional "overdue" styling would require introducing current-date comparison logic, a new CSS state, and additional test cases that are outside the six approved ACs — a scope expansion this stage should not self-authorize. This is recorded as an explicit, deliberate scope boundary; a future story could add overdue emphasis if a human stakeholder requests it (not filed automatically, per "no invented requirements").
- **OQ-003 (placement) — Decision:** due date remains the last element inside `.task-meta`, after the priority badge and category badge, matching the ordering already present in `TaskCard.jsx`'s existing (partial) implementation and the existing `.task-date` CSS convention (muted small text distinct from colored badges). No reordering is introduced.
- **Follow-up (non-blocking, out of scope):** the repository's frontend has no unit-test framework; if finer-grained component-level testing is desired in the future, adding one (e.g. Vitest + Testing Library) would need explicit human approval as a dependency change — not undertaken here since Playwright e2e coverage is sufficient to satisfy AC-006 without violating "no new dependencies."

## Status
No unresolved HIGH findings. Design is ready for Planning.
