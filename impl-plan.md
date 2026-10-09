# Implementation Plan

## Inputs
- `requirements.md` (KAN-118 — "Claude-Display existing due date on task cards"), `## Approval: APPROVED`.
- `architecture.md` and `design-review.md` for KAN-118. Design review `## Status`: "No unresolved HIGH findings" (one MEDIUM, three LOW findings, all documented as acceptable trade-offs/follow-ups, not blockers).
- Repository evidence confirmed directly for this plan:
  - `frontend/src/components/TaskCard.jsx:18-26` — `formatDate` currently uses `toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })`.
  - `frontend/src/components/TaskCard.jsx:70-75` — due-date metadata item is conditionally rendered: `{task.due_date && <span className="task-date"><Calendar size={12} />{formatDate(task.due_date)}</span>}`.
  - `frontend/src/components/TaskForm.jsx:115-124` — due-date input exists with `id="task-duedate-input"`, type `date`, submits `due_date: dueDate || null`.
  - `e2e/tests/task_flow.spec.js` — existing Playwright spec with 4 tests (create, display/filter, toggle complete, delete) using class/id selectors (`#add-task-btn`, `#task-title-input`, `.task-title`, `.task-card`, `.custom-checkbox`, `.delete-btn`, etc.).
  - `e2e/package.json` — `@playwright/test ^1.44.0` already installed as the only test dependency; no new dependency needed.
  - `frontend/package.json` — no unit-test framework present; confirms AC-006 must be covered via the existing E2E suite, not a new unit-test tool.
  - Git branch check (read-only, performed during planning): no `feature/KAN-118` branch exists locally or on `origin` today. Current branch is `claude-demo` (not the default branch). Default branch is `main` (`origin/HEAD -> origin/main`). Existing feature branches present (`KAN-116`, `feature/KAN-117`, `feature/automated-doc-sync`, `feature/display-task-priority-badge`) are unrelated prior work and must not be reused or disturbed.

## Tasks

### T1 — Fix due-date rendering and format in TaskCard.jsx
- **Objective:** Make the due-date metadata item always render, showing a deterministically formatted date when `task.due_date` is present and the literal `"No Due Date"` when absent, per AC-001/AC-002/AC-003/AC-004.
- **Files/areas:** `frontend/src/components/TaskCard.jsx` only.
- **Steps:**
  1. In `formatDate`, replace `d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })` with `d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })`.
  2. Keep the existing `try/catch` around `new Date(dateStr)` so a malformed `due_date` still falls back to returning the raw string instead of throwing.
  3. Change the due-date JSX block from conditional (`{task.due_date && <span className="task-date">...</span>}`) to unconditional: always render `<span className="task-date"><Calendar size={12} />{text}</span>`, where `text` is `formatDate(task.due_date)` when `task.due_date` is truthy, and the literal string `"No Due Date"` otherwise.
  4. Do not touch the `Calendar` icon import/usage, the `.task-date` CSS class, the priority/category badge logic, the checkbox, delete button, or any other markup in this file.
- **Dependencies:** None (first task).
- **FR/NFR IDs:** FR1/AC-001, FR2/AC-002, FR3/AC-003, FR4/AC-004; NFR frontend-only, NFR no new dependencies, NFR reuse existing `due_date` field, NFR no unrelated behavior changes.
- **Completion condition:** `TaskCard.jsx` renders `.task-date` for every task; a task with a due date shows a string matching `D MMM YYYY` (e.g. "25 Sep 2026"); a task without one shows exactly `"No Due Date"`; no other markup/behavior in the file changed (diff limited to the `formatDate` body and the due-date JSX block).
- **Status:** DONE — implemented on `feature/KAN-118`; diff limited exactly to the `formatDate` body and the due-date JSX block as planned. **Update (human-authorized follow-up fix):** `formatDate` was further revised to deterministically produce a 3-letter month abbreviation. The original `d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })` single-call form rendered `"25 Sept 2026"` (4-letter "Sept") in this runtime's ICU, not the 3-letter "Sep" from AC-002's literal example. Per explicit human decision, the implementation now computes day/month/year via three separate `toLocaleDateString('en-GB', ...)` calls and slices the month token to its first 3 characters (`.slice(0, 3)`), then assembles `` `${day} ${month} ${year}` ``. Verified via Node: `new Date('2026-09-25')` → `"25 Sep 2026"`. The `try/catch` defensive parsing around `new Date(dateStr)` is preserved unchanged. No other markup, the `Calendar` icon, or the `.task-date` CSS class were touched.

### T2 — Extend e2e/tests/task_flow.spec.js with due-date coverage
- **Objective:** Add automated regression coverage for the formatted-date and no-due-date fallback cases (AC-006), and confirm no regression to existing flows (AC-005).
- **Files/areas:** `e2e/tests/task_flow.spec.js` only (extend existing `describe` block; no new spec file needed given the small, related scope, consistent with the existing single-file convention).
- **Steps:**
  1. Add a new test, e.g. `'5. Task card shows formatted due date when set'`: create a task via the existing create flow, additionally fill `#task-duedate-input` with a known date (e.g. `2026-09-25`), submit, then assert the resulting task card's `.task-date` element contains text matching the `D MMM YYYY` shape for that date (exact expected string `"25 Sep 2026"` for the chosen input, or a regex `/^\d{1,2} [A-Za-z]{3} \d{4}$/` if an exact string proves environment-sensitive — prefer the exact string first since the format is pinned to `'en-GB'` and is not locale-dependent).
  2. Add a new test, e.g. `'6. Task card shows "No Due Date" fallback when unset'`: create a task via the existing create flow without filling `#task-duedate-input`, then assert the resulting task card's `.task-date` element has the exact text `"No Due Date"`.
  3. Do not modify the four existing tests (create, display/filter, toggle complete, delete); re-run them as-is to confirm no regression.
  4. Follow existing conventions: locate the task card via `page.locator('.task-card', { hasText: taskTitle })`, use unique timestamped titles, use `#add-task-btn` / `#task-title-input` / `#save-task-submit` exactly as the existing tests do.
- **Dependencies:** T1 (the fallback text and format must exist in the rendered app before the assertions can pass).
- **FR/NFR IDs:** FR6/AC-006, FR5/AC-005 (regression confirmation).
- **Completion condition:** `e2e/tests/task_flow.spec.js` contains two new passing tests covering the formatted-date and no-due-date cases, and all pre-existing tests in the file still pass.
- **Status:** DONE (test results: PARTIAL — see T3) — two new tests added exactly as planned (tests 5 and 6); the four pre-existing tests were not modified. Pass/fail is now confirmed via a real run (see T3): test 6 (no-due-date fallback) PASSES. Test 5 (formatted due-date) FAILS — not due to a defect in `TaskCard.jsx`'s behavior, but because the exact-string expectation `'25 Sep 2026'` written into T2 does not match this runtime's actual `en-GB` ICU output (`'25 Sept 2026'`, full "Sept"). This is the MEDIUM finding from `design-review.md` materializing as a real failure rather than a passing assumption. Fixing test 5's assertion string was out of scope for this authorized change (only the `beforeEach` line was authorized) and is left for the next explicitly-authorized pass.

  **Scope note for reviewer:** A separate, pre-existing, unrelated defect was found and fixed under explicit human authorization: the shared `beforeEach` in `e2e/tests/task_flow.spec.js` asserted `h1.brand-title` text `'TaskMaster Pro'`, but `frontend/src/components/Header.jsx` (unchanged by this plan, confirmed via `git show main:frontend/src/components/Header.jsx`) renders `'TaskMaster Pro-Github'` on `main` already — a stale test assertion unrelated to the KAN-118 due-date feature. The human explicitly authorized changing only that one line in the `beforeEach` to `'TaskMaster Pro-Github'` so the suite could run at all. This is called out here as a **known pre-existing issue / scope addition**, not folded into KAN-118's due-date test coverage claim. `frontend/src/components/Header.jsx` was NOT modified.

### T3 — Run the E2E suite and record results
- **Objective:** Execute the extended Playwright suite against the running app and capture real pass/fail evidence; verify the MEDIUM finding (locale-pinned date format) with an actual rendered-string check.
- **Files/areas:** None (verification only; no file changes). Uses `e2e/package.json` script (`npm test` → `playwright test`) and whatever app-start command the repository already defines (to be confirmed from `package.json`/README at implementation time — do not invent a command).
- **Steps:**
  1. Start the application (frontend + backend) using the project's existing documented/scripted start command.
  2. Run the Playwright suite from `e2e/` (`npm test`, i.e. `playwright test`), executing all 6 tests (4 existing + 2 new).
  3. Record exact command(s) run and pass/fail output in `verification.md` during the Implementation/Review stage (not part of this plan's output).
  4. Explicitly confirm the rendered date text for the known-date test matches the expected `"25 Sep 2026"`-shaped string, closing out the MEDIUM finding from `design-review.md` with a runtime check rather than an assumption.
- **Dependencies:** T1, T2.
- **FR/NFR IDs:** AC-005, AC-006; closes the MEDIUM finding in `design-review.md`.
- **Completion condition:** All 6 Playwright tests pass against the real running app; the exact command and output are recorded (in `verification.md` at the next stage) with real `PASS`/`FAIL` status, never an assumed result.
- **Status:** DONE (test results: PARTIAL PASS — 5/6) — Re-run after human-authorized unblocking fix (see T2 scope note). App started with `npm start` (backend on :5001, frontend on :3000, confirmed via `curl` 200 on :3000). Ran `npm test` (`playwright test`) from `e2e/`.
  - Result: **5 passed, 1 failed** out of 6 tests (10.5s total).
  - Passed: tests 1, 2, 3, 4 (pre-existing, unmodified, confirming AC-005 no regression) and test 6 (`'No Due Date'` fallback — confirms the fallback-text requirement, AC-003/AC-004).
  - Failed: test 5 (`'25 Sep 2026'` formatted-date assertion) — actual rendered text was `'25 Sept 2026'`. Independently reproduced at the Node level: `node -e "console.log(new Date('2026-09-25').toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }))"` → `25 Sept 2026` (Node v24.15.0).
  - **MEDIUM finding from design-review.md: NOT closed — confirmed as a real, reproducible failure**, not just a theoretical risk. The `'en-GB'` short-month ICU token in this runtime produces the full word "Sept" rather than the 3-letter "Sep" assumed in `TaskCard.jsx`'s implementation (T1) and in the T2 test assertion. `AC-002` (deterministic formatted date) is therefore only partially verified: the date renders deterministically, but not in the exact shape originally assumed by design-review.md/T1/T2.
  - No further code or test changes were made to resolve this, as doing so was outside the explicitly authorized scope (only the `beforeEach` line fix was authorized for this pass).
  - **Re-run after human-authorized `formatDate` fix (this pass):** The human explicitly decided to change `TaskCard.jsx`'s `formatDate` implementation (see T1 update) rather than relax the test-5 assertion. Test-5's assertion string `'25 Sep 2026'` was left unmodified, per instruction. App started with `npm start` (backend confirmed listening on `:5001` via startup log; frontend confirmed via `curl` 200 on `:3000`). Ran `npm test` (`playwright test`) from `e2e/`.
  - Result: **6 passed, 0 failed** out of 6 tests (5.2s total).
  - All tests passed: 1 (create task), 2 (display/filter), 3 (toggle complete), 4 (delete), 5 (`'25 Sep 2026'` formatted-date assertion — now passes with the revised `formatDate`), 6 (`'No Due Date'` fallback).
  - **MEDIUM finding from `design-review.md`: now CLOSED with real runtime evidence.** The locale-pinned date format risk is resolved: `formatDate` deterministically renders the 3-letter month abbreviation "Sep" (not the ICU-dependent "Sept"), confirmed by test 5 passing against the live running app, not just a Node-level check. `AC-002` is now fully verified end-to-end.
  - App dev servers (backend `node src/server.js`, frontend `vite`) were stopped after the run (`pkill`); confirmed no process remained listening on `:3000`/`:5001`.
  - **Correction cycle (reviewer HIGH finding H1, `code-review.md`): RESOLVED.** The reviewer independently reproduced a timezone bug: the prior `formatDate` parsed the date-only `due_date` string via `new Date(dateStr)` (interpreted as UTC midnight) and then rendered day/month/year via local-timezone `toLocaleDateString` calls. In any timezone behind UTC (e.g. `America/New_York`), this showed a due date one calendar day earlier than stored — reviewer evidence: `TZ="America/New_York" npx playwright test tests/task_flow.spec.js -g "due date"` → test 5 expected `"25 Sep 2026"`, received `"24 Sep 2026"`.
    - Fix: `formatDate` no longer constructs a `Date` object at all. It now parses the `YYYY-MM-DD` string's year/month/day components directly via regex (`/^(\d{4})-(\d{2})-(\d{2})/`) and looks up the month name from a fixed 3-letter `MONTHS` table, so there is no UTC-midnight/local-timezone conversion step anywhere in the path. This also keeps the existing `try/catch` fallback (returns the raw string on an unrecognized/invalid format) and continues to guarantee the 3-letter month shape ("Sep", never "Sept"), closing review Finding L2 (why local-timezone date math must be avoided) via an inline code comment.
    - Scope: change confined to the `formatDate` function body in `frontend/src/components/TaskCard.jsx` (plus one explanatory comment block immediately above it). No other file touched; the due-date JSX block, `Calendar` icon usage, and all other markup/behavior were left exactly as previously implemented.
    - Verification performed on `feature/KAN-118`:
      - Standalone logic check (`node`) for `"2026-09-25"` under `TZ=UTC`, `TZ=America/New_York`, and `TZ=Asia/Kolkata` — all three printed `25 Sep 2026`.
      - `cd e2e && npx playwright test` (default timezone): **6 passed, 0 failed** (4.8s).
      - `cd e2e && TZ=America/New_York npx playwright test` (reviewer's failing timezone): **6 passed, 0 failed** (4.3s), including test 5 (`'25 Sep 2026'`) which previously failed under this timezone per the reviewer's report.
    - Test files, `TaskForm.jsx`, `backend/src/db.js`, and `Header.jsx` were not modified for this correction.

## Dependency Order
1. T1 — Fix `TaskCard.jsx` rendering/format (no dependencies).
2. T2 — Extend `task_flow.spec.js` with new assertions (depends on T1 so assertions have real behavior to match).
3. T3 — Run full E2E suite and record evidence (depends on T1 and T2).

## Testing Approach
- No new test framework or dependency is introduced; AC-006 is satisfied through the existing Playwright E2E suite (`@playwright/test`, already in `e2e/package.json`), per architecture.md and design-review.md (documented trade-off, not a defect, since `frontend/package.json` has no unit-test runner).
- Test additions are appended to the existing `e2e/tests/task_flow.spec.js` file, reusing its `beforeEach` app-load check, selector conventions, and timestamped-title pattern to avoid test-data collisions.
- Two new scenarios: (a) formatted date displayed for a task with a known due date, (b) `"No Due Date"` fallback displayed for a task created without one.
- The four pre-existing tests (create, display/filter, toggle complete, delete) are re-run unmodified to confirm AC-005 (no regression).
- Actual execution (command + output) happens in the Implementation stage; this plan only specifies what will be run — it does not claim any test has passed yet.

## Risks and Blockers
- **MEDIUM (carried from design-review.md):** The `'en-GB'` locale-pinned `toLocaleDateString` format is standard ICU behavior and very likely produces `"25 Sep 2026"`, but is unverified until run. Mitigated by T3's explicit runtime check against the new Playwright assertion before considering AC-002 satisfied.
- **LOW:** Seed data in `backend/src/db.js` has no task without a due date; the new fallback test must create its own task without a due date rather than relying on seed data (already accounted for in T2, step 2).
- **LOW:** E2E-only coverage does not isolate `formatDate` as a pure unit function; accepted per architecture.md/design-review.md as the smallest repository-compatible option given the "no new dependencies" NFR.
- **Blocker check performed now:** No `feature/KAN-118` branch exists yet (confirmed via `git branch -a`), so branch creation in the Implementation stage will be a fresh branch, not a reuse/conflict scenario. No uncommitted changes exist that would be at risk from a branch switch, other than the three untracked SDLC artifact files (`architecture.md`, `design-review.md`, `requirements.md`) already present in the working tree — these are plan/process artifacts, not application code, and are not expected to block a branch switch, but the Implementation stage must re-check `git status` immediately before switching, per the branch-first procedure.

## Development Branch
`feature/KAN-118` — created fresh from `main` at commit `eb76666043905ad481081591ef93cd1385feb724` ("Merge pull request #4 from ishanm120/claude-demo"), confirmed to match `origin/main` at creation time. Re-verified at Implementation time via `git status`/`git branch -a` that `feature/KAN-118` did not exist locally or on `origin` before creation, current branch was `claude-demo`, and no uncommitted tracked changes existed (only the four untracked SDLC artifact files, preserved across the branch switch).

## Approval
APPROVED
