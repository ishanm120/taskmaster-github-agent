# Code Review

## Scope
Independent review of the KAN-117 ("Display existing due date on task cards") implementation on branch `feature/KAN-117`, against approved `requirements.md` (FR-001–FR-007, AC-001–AC-006) and `architecture.md`. Diff reviewed: `git diff main -- frontend/src/components/TaskCard.jsx e2e/tests/task_flow.spec.js` (working tree vs. `main`; `feature/KAN-117` has not diverged from `main` in committed history — all story changes are currently uncommitted working-tree edits).

Files changed (confirmed via `git status --porcelain` and `git diff main --stat`):
- `frontend/src/components/TaskCard.jsx` — 29 lines changed (formatting helper rewrite + fallback rendering).
- `e2e/tests/task_flow.spec.js` — 31 lines added/changed (2 new tests + 1 pre-existing assertion fix).

No other tracked file is modified. No backend file, `package.json`, lockfile, or `.github/` file is touched (verified: `git diff main -- backend/ e2e/package.json frontend/package.json` all empty).

## Checklist
- [x] Correctness of date formatting logic, including edge cases
- [x] Correct fallback behavior (missing/malformed due date)
- [x] No unrelated files touched
- [x] No new dependencies added
- [x] No backend/DB changes
- [x] Test coverage for new behavior
- [x] Code clarity / DRY
- [x] Security (XSS/injection, secrets)
- [x] Unrelated test-file change (header text) independently verified

## Requirement Coverage
| Req | Status | Evidence |
|---|---|---|
| FR-001 (show due date when present) | COVERED | `TaskCard.jsx:75-78` always renders `.task-date`; `formatDueDate(task.due_date)` returns the formatted string when `task.due_date` is present and parseable. Verified at runtime by e2e test 5 (`task_flow.spec.js:84-97`), which passed. |
| FR-002 (readable, fixed format e.g. "25 Sep 2026") | COVERED | `formatDueDate` (`TaskCard.jsx:20-31`) builds `${day} ${MONTHS[month-1]} ${year}` from a fixed month-abbreviation array, no `Intl`/locale API. Verified: e2e test 5 asserts exact text `25 Sep 2026` for input `2026-09-25`, and passed. Manually re-verified with a standalone Node script exercising the exact helper logic against 14 inputs (see Findings). |
| FR-003 ("No Due Date" fallback) | COVERED | `TaskCard.jsx:77`: `formatDueDate(task.due_date) || 'No Due Date'`. Verified: e2e test 6 creates a task with no due date and asserts exact text `No Due Date`; passed. |
| FR-004 (visually consistent with existing metadata) | COVERED | Same `.task-date` class, `Calendar` icon (size 12), and DOM position (last child of `.task-meta`, after priority/category badges) as the pre-existing implementation — confirmed by diff: only the conditional wrapper and inner expression changed, the JSX element/class/icon are unchanged. |
| FR-005 (reuse existing field; no backend/DB/API change) | COVERED | `git diff main -- backend/` is empty. `task.due_date` is the pre-existing field (`backend/src/db.js:51`); no new field, prop, or API call introduced. |
| FR-006 (existing CRUD/filter/complete/delete unaffected) | COVERED | e2e tests 1–4 (create, filter/search, complete/toggle, delete) all passed unmodified against the changed `TaskCard.jsx` in this review's own run. |
| FR-007 (automated tests added for display + fallback) | COVERED | Two new Playwright tests added (`task_flow.spec.js:84-111`) exercising the formatted-date path and the fallback path; both executed and passed in this review's own run. |
| AC-001–AC-006 | COVERED | Each maps 1:1 to the FR above; see rows. |

## Findings

**Finding 1 — Calendar-day validity is not checked (Severity: LOW)**
`formatDueDate` only range-checks month (1–12) and day (1–31) numerically; it does not check day-of-month validity per calendar rules. Confirmed by direct execution: input `"2026-02-30"` (Feb 30 does not exist) returns `"30 Feb 2026"` instead of falling back. In practice this is unreachable through the app's own write paths — `TaskForm.jsx`'s `type="date"` input (`TaskForm.jsx:118-119`) cannot emit an invalid calendar date, and seed data (`backend/src/db.js`) is hand-authored with valid dates — so this does not violate any FR/AC or introduce a user-facing defect today. `architecture.md` (§Error Handling) explicitly scopes the guard as "defensive only" against malformed *shape*, not full calendar validity, so this is a documented and accepted scope boundary rather than a missed requirement. Non-blocking.

**Finding 2 — Full ISO-8601 datetime strings (e.g. with a `T...Z` suffix) are treated as unparseable and fall back to "No Due Date" rather than extracting the date portion (Severity: LOW)**
Confirmed by direct execution: `formatDueDate("2026-09-25T10:00:00Z")` returns `null` because `split('-')` yields 4+ parts, not 3, given the embedded `-` in some ISO offsets is absent here but the trailing `T10:00:00Z` breaks the day-part numeric parse (`Number("25T10:00:00Z")` is `NaN`). Verified this is not currently reachable: `backend/src/db.js:51` stores `due_date` as `TEXT` populated only via seed data and the app's own write paths (`app.js:91-98,119-123`), both of which only ever receive `YYYY-MM-DD` from the HTML `date` input (`TaskForm.jsx:119`) or hand-authored seed strings — never a full timestamp. No FR/AC requires handling a datetime-with-time format. Flagged for awareness only; not a defect against current scope.

**Finding 3 — Unrelated one-line assertion fix in the shared `beforeEach` hook (Severity: LOW, informational — independently verified as correct and in-scope for the test file)**
`e2e/tests/task_flow.spec.js:7` changes the header-text assertion from `'TaskMaster Pro'` to `'TaskMaster Pro-Github'`. Independently verified, not taken on trust:
- `frontend/src/components/Header.jsx:12` currently renders `<h1 className="brand-title">TaskMaster Pro-Github</h1>`.
- `git blame frontend/src/components/Header.jsx` attributes that exact line to commit `1c7bdfea1d6b80ad08a0927e0202a28dc62b5e44` ("fresh content without any agent"), authored by `ishanm120 <ishanmittal120@gmail.com>` — the repo owner, matching the current session's Git user — predating this story.
- `git diff main -- frontend/src/components/Header.jsx` is empty: no application file was touched to make this test pass; only the stale test fixture was corrected to match already-committed, human-authored production markup.
- Running the full suite with this fix in place, all 6 tests (including the 4 pre-existing ones whose `beforeEach` depends on this exact assertion) passed. This confirms the fix was necessary for any test to run at all, not just cosmetic.
This is judged in-scope as a narrowly-targeted, human-confirmed pre-existing test-fixture bug fix, not an unrelated behavior change or scope creep, consistent with CLAUDE.md's guidance to document (not silently ship) any correction to unrelated pre-existing issues. No application code was modified to achieve it.

No HIGH or MEDIUM findings identified.

## Review Status
No unresolved HIGH findings. All FR/AC items are COVERED with evidence from direct code inspection, targeted execution of the extracted formatting logic, and a full independent e2e run (see `verification.md`). Approved to proceed to verification sign-off, pending the Overall Verification Status recorded in `verification.md`.
