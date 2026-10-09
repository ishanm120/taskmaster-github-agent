# Code Review

## Scope
Re-review of the full diff on `feature/KAN-118` vs `main` (`git diff main`) for KAN-118 ("Claude-Display existing due date on task cards"), following a correction cycle for the previously unresolved HIGH finding (H1: timezone-dependent off-by-one-day bug). Reviewed against the approved `requirements.md`, `architecture.md`, and `design-review.md`.

Files in the diff (confirmed via `git diff main --stat`):
- `frontend/src/components/TaskCard.jsx` (+30/-8 lines; production code — `formatDate` rewritten plus explanatory comment)
- `e2e/tests/task_flow.spec.js` (+31/-1 lines; test code — unchanged from the version previously reviewed)

No other tracked files are modified on this branch relative to `main` (confirmed via `git diff main --stat`). No `package.json`/lockfile changes in `frontend/` or `e2e/` (confirmed: `git diff main -- frontend/package.json frontend/package-lock.json e2e/package.json e2e/package-lock.json` produced no output). `TaskForm.jsx`, `backend/src/db.js`, `Header.jsx`, and `.github/` remain untouched.

## Checklist
- Correctness — `formatDate` re-examined line by line; see Findings (H1 now resolved).
- Security — unchanged from prior review: no new user input paths, no `dangerouslySetInnerHTML`, no `eval`, no new network calls, no injection surface. `due_date` still originates only from the unchanged `<input type="date">` in `TaskForm.jsx` and the unchanged SQLite `due_date TEXT` column.
- Error handling — re-examined; the `try/catch` is now a live code path (see L1 resolution below), with graceful fallback to the raw string for malformed input.
- Test coverage — same two Playwright tests as previously reviewed (AC-002/AC-003/AC-006); no test file changes in this correction cycle (`e2e/tests/task_flow.spec.js` diff vs. main is identical to the version reviewed last cycle).
- Code clarity — significantly improved: an 8-line comment now explains both why `Date`/local-timezone parsing is avoided and why a fixed `MONTHS` table is used instead of `Intl`/`toLocaleDateString`.
- DRY — no duplication; the three separate `toLocaleDateString` calls and the `.slice(0,3)` workaround from the prior version are gone entirely.
- Dependency safety — no new dependencies; confirmed no `package.json`/lockfile diff.
- Scope adherence — frontend-only; only the two expected files, same as the prior cycle. No new out-of-scope changes introduced in this correction.

## Requirement Coverage
- **AC-001** (each task card displays its existing due date when available) — **COVERED**. `TaskCard.jsx:88`: `task.due_date ? formatDate(task.due_date) : 'No Due Date'`, rendered unconditionally in `.task-date` (unchanged from prior cycle, previously verified).
- **AC-002** (due date displayed in a readable format, e.g. "25 Sep 2026") — **COVERED**. Re-examined `formatDate` (`TaskCard.jsx:29-42`): it extracts `(\d{4})-(\d{2})-(\d{2})` directly from the stored string via regex, looks up the month name in a fixed `MONTHS` array, and returns `` `${day} ${month} ${yearStr}` ``. No `Date` object is constructed anywhere in this function — confirmed by reading the full function body; there is no `new Date(...)` call left in `formatDate`. This is a pure string/arithmetic transform with no timezone input, so there is no UTC-vs-local conversion step to go wrong. Verified by extracting the exact function and running it under four timezones (`UTC`, `America/New_York`, `Asia/Kolkata`, `Pacific/Kiritimati`) with input `'2026-09-25'`: all four produced `"25 Sep 2026"` identically. See Finding H1 (now RESOLVED) for full reproduction.
- **AC-003** (tasks without a due date display "No Due Date") — **COVERED**. Unchanged from prior cycle; `TaskCard.jsx:88`. Exercised by Playwright test 6, independently re-run (see `verification.md`).
- **AC-004** (due date display visually consistent with existing task card metadata) — **COVERED**. Unchanged from prior cycle; reuses the pre-existing `.task-date` class/icon, no new styling. `frontend/src/index.css` confirmed unchanged (`git diff main -- frontend/src/index.css` produces no output).
- **AC-005** (existing task creation/editing/completion/filtering/deletion continue to work) — **COVERED**. The diff still does not touch checkbox toggle, delete, priority badge, or category badge logic. Confirmed empirically: all 4 pre-existing Playwright tests pass in this cycle's fresh run (see `verification.md`).
- **AC-006** (add/update relevant automated tests for due date display and fallback) — **COVERED**. Same two tests as before; both independently re-run and passing under multiple timezones in this cycle (see `verification.md`).

### Out-of-scope but previously authorized change (unchanged this cycle)
`e2e/tests/task_flow.spec.js:7` — the `beforeEach` header assertion fix (`'TaskMaster Pro'` → `'TaskMaster Pro-Github'`) is identical to the version reviewed and authorized in the prior cycle. No new changes to this line in this correction. Re-confirmed `frontend/src/components/Header.jsx:12` still renders `TaskMaster Pro-Github` on this branch.

## Findings

### HIGH
**H1 — RESOLVED. Timezone-dependent off-by-one-day bug in `formatDate` is fixed.**
Previous finding: `new Date(dateStr)` parsed a date-only `"YYYY-MM-DD"` string as UTC midnight, then `toLocaleDateString` rendered it using the local/browser timezone, shifting the displayed day back by one in any timezone behind UTC.

Current code (`TaskCard.jsx:29-42`) eliminates the `Date` object entirely:
```js
const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateStr);
...
const day = parseInt(dayStr, 10);
const month = MONTHS[parseInt(monthStr, 10) - 1];
...
return `${day} ${month} ${yearStr}`;
```
There is no construction of a `Date`, no `.toLocaleDateString()`, and no implicit UTC-to-local (or local-to-UTC) conversion anywhere in this function — confirmed by reading the full diff and the resulting file; the only remaining date-related API usage in the component is this regex-based string parse. Because the function never consults the host's timezone, there is no mechanism by which timezone could affect its output.

Independently re-verified (fresh evidence, not reused from the Developer's report):
```
$ node -e "<extracted formatDate function>; for (const tz of ['UTC','America/New_York','Asia/Kolkata','Pacific/Kiritimati']) { process.env.TZ = tz; console.log(tz, formatDate('2026-09-25')); }"
UTC 25 Sep 2026
America/New_York 25 Sep 2026
Asia/Kolkata 25 Sep 2026
Pacific/Kiritimati 25 Sep 2026
```
Also re-ran the real end-to-end Playwright suite against the real running app/browser (not a Node-only simulation) under `TZ=America/New_York` and `TZ=Pacific/Kiritimati` (the two most divergent zones, UTC-5 and UTC+14 relative to this review's local IST) — both pass; see `verification.md` Checks 2 and 3 for exact commands/output.

Status: **RESOLVED**. No remaining timezone dependency. No new HIGH finding introduced by the fix.

### MEDIUM
None. (The pre-existing locale-pinned-format MEDIUM tracked in `design-review.md` is superseded: the fixed `MONTHS` table deterministically guarantees the 3-letter month abbreviation independent of locale/ICU data, which is a strictly stronger guarantee than the locale-dependent `toLocaleDateString` approach it replaced.)

### LOW
**L1 — RESOLVED. The `try/catch` is no longer dead code.**
Previously: `new Date(dateStr).toLocaleDateString(...)` never threw even on invalid input, so the `catch` branch was unreachable in practice. Now, the function explicitly throws (`throw new Error(...)`) when the regex doesn't match or when the parsed month index falls outside `MONTHS` (e.g. `"13"` or `"00"`) or the day is `NaN`, making the `catch` a live, exercised path. Verified directly:
```
$ node -e "<formatDate>; console.log(formatDate('2026-13-05')); console.log(formatDate('not-a-date'));"
2026-13-05
not-a-date
```
Malformed input now degrades to the raw string rather than a cryptic `"Invalid Date"` triple — an improvement over the pre-existing behavior, not merely parity. No further action needed.

**L2 — RESOLVED. The three-call `toLocaleDateString`/`.slice(0,3)` workaround is gone, and the design choice is now documented.**
The entire `toLocaleDateString` approach (and its unexplained ICU-driven slicing) has been replaced with a fixed `MONTHS` lookup table, and the code now carries an 8-line comment (`TaskCard.jsx:18-26`) explaining both (a) why `Date`/local-timezone parsing is avoided, and (b) why a fixed table is used instead of `Intl` (to guarantee the 3-letter "Sep" shape required by AC-002 rather than relying on locale-dependent ICU output). This directly addresses the maintainability concern raised previously. No further action needed.

**L3 — Carried forward from `design-review.md`, re-checked, unchanged.** E2E-only coverage for AC-006 (no unit-test framework in the repo) and no "no due date" fixture in seed data remain true of the current code. Already documented as acceptable, non-blocking trade-offs in the approved `design-review.md`; this cycle found no new evidence changing that assessment, and no new instance of either trade-off was introduced by the correction.

## Review Status
**UNBLOCKED — 0 unresolved HIGH findings.** H1 is resolved with a timezone-independent implementation, confirmed by direct code reading (no `Date` object remains in `formatDate`) and by fresh multi-timezone evidence at both the pure-function level and the full end-to-end browser-test level (see `verification.md`). L1 and L2 are also resolved as a byproduct of the rewrite. L3 remains an acceptable, previously-approved trade-off. No new findings were introduced by the correction. Verification may proceed.
