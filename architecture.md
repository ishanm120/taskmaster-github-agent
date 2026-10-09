# Architecture

## Inputs and Constraints
- Source: `requirements.md` (KAN-118), `## Approval: APPROVED`.
- Scope: Frontend-only. No backend/API/database changes. No new dependencies. Reuse the existing `due_date` field end-to-end (schema: `backend/src/db.js`; create/edit: `frontend/src/components/TaskForm.jsx`; render: `frontend/src/components/TaskCard.jsx`). No unrelated behavior changes (completion toggle, delete action, filtering, priority/category badges).
- Repository facts confirmed by inspection:
  - `backend/src/db.js` — `tasks.due_date TEXT`, nullable; all four seeded demo tasks currently have a due date set (none exercise the "no due date" case in seed data).
  - `frontend/src/components/TaskForm.jsx` — `<input type="date">` bound to `dueDate` state; submits `due_date: dueDate || null`, i.e. an ISO `YYYY-MM-DD` string or `null`.
  - `frontend/src/components/TaskCard.jsx` — currently renders `{task.due_date && <span className="task-date">...{formatDate(task.due_date)}</span>}`, i.e. the whole metadata item is omitted when `due_date` is falsy; `formatDate` uses `toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })`, which produces a locale- and browser-dependent string such as `"Sep 25, 2026"` — not the `"25 Sep 2026"` order required by AC-002, and not guaranteed consistent across browsers/locales since `undefined` defers to the user's system locale.
  - `frontend/src/index.css` — `.task-meta` is a flex row holding `.badge` variants (`.badge-high/-medium/-low`, `.badge-category`) and `.task-date`; `.task-date` is already styled as muted, inline-flex metadata (icon + text) matching the badges' placement or at least sitting consistently inside `.task-meta`.
  - No frontend unit-test framework or React testing library is installed in `frontend/package.json` (only `vite`/`@vitejs/plugin-react`); adding one would violate the "no new dependencies" constraint. A repository-level E2E suite already exists and is unaffected: `e2e/package.json` depends on `@playwright/test` (already installed), and `e2e/tests/task_flow.spec.js` exercises create/toggle/delete flows against the running app using class-based selectors (`.task-card`, `.task-title`, `.custom-checkbox`, `.delete-btn`), consistent with AC-005's regression scope.

## Proposed Approach
Make a small, localized change entirely inside `TaskCard.jsx` (plus no CSS changes needed, since the existing `.task-date` class already provides the badge-consistent styling):

1. **Always render the due-date metadata item.** Change the conditional `{task.due_date && <span className="task-date">...}` to render unconditionally, choosing the display text based on presence of `task.due_date`: the formatted date when present, the literal string `"No Due Date"` when absent/falsy. This satisfies AC-001 and AC-003 without introducing a new element, badge, or CSS class — the metadata item simply always appears instead of being conditionally omitted.
2. **Fix the date format to match AC-002 deterministically.** Replace `toLocaleDateString(undefined, {...})` with an explicit, locale-pinned call: `toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })`. Pinning to `'en-GB'` (rather than `undefined`) guarantees the day-month-year order and `"25 Sep 2026"` shape regardless of the browser's/user's system locale, which otherwise would non-deterministically reorder the string (e.g. `en-US` gives `month day, year`). This is a pure `Intl`/`Date` API change — no new dependency.
3. **Preserve existing defensive parsing.** Keep the existing `try/catch` around `new Date(dateStr)` so a malformed `due_date` value falls back to rendering the raw string rather than throwing, matching current (undocumented but reasonable) robustness; this is not a new behavior, just retained.
4. **Leave the icon (`Calendar`), wrapper markup, and `.task-date` CSS class untouched** so the item's visual treatment (muted color, inline icon, inline-flex layout, gap, placement inside `.task-meta` alongside the priority/category badges) is identical for both the date and the fallback text, directly satisfying AC-004 by construction (same class, same position, same markup shape — only the inner text/icon-adjacent string changes).
5. **No change to `TaskForm.jsx` or `backend/src/db.js`.** The `due_date` field, its storage shape, and the create/edit UI are untouched, per the NFR constraints and because requirements confirmed the field already exists end-to-end.
6. **Automated test coverage (AC-006) via the existing E2E suite**, not a new frontend unit-test dependency: extend `e2e/tests/task_flow.spec.js` (or add a sibling spec in `e2e/tests/`) using the already-installed `@playwright/test`, following the existing class-selector convention (`.task-card`, `.task-date`), to assert:
   - A task created via the form using `#task-duedate-input` (e.g. filled with a known date), or an existing seeded task with a known due date, shows the formatted date text in `"D MMM YYYY"` shape (e.g. match a regex like `/^\d{1,2} [A-Za-z]{3} \d{4}$/`, or the exact expected string for a known input) inside its card's `.task-date` element.
   - A task created without filling the due-date input shows the literal text `"No Due Date"` inside its card's `.task-date` element.
   - No regression to create/toggle-complete/filter/delete flows already covered by the existing spec (re-run as-is; no behavioral change expected).

## Components and Responsibilities
- **`TaskCard.jsx` (modified)** — Sole component touched. Responsible for: (a) deciding the due-date display string (formatted date or `"No Due Date"` fallback), (b) rendering it inside the existing `.task-date` span alongside the `Calendar` icon, unconditionally. No new props, no new state, no new child components.
- **`TaskForm.jsx` (unchanged)** — Continues to own due-date input/edit; already supplies `due_date` as `YYYY-MM-DD` or `null`. No changes required or made.
- **`backend/src/db.js` / API (unchanged)** — Continues to own persistence and the `due_date` column; no schema/API changes.
- **`frontend/src/index.css` (unchanged)** — `.task-meta` / `.badge*` / `.task-date` rules already provide the visual consistency required by AC-004; reused as-is.
- **`e2e/tests/task_flow.spec.js` (extended)** — Owns automated verification of the due-date display and fallback (AC-006) and continues to own regression coverage for create/toggle/filter/delete (AC-005).

## Data Flow
1. Backend returns a task object (via existing `GET /tasks`-style endpoint, unchanged) with `due_date` as either an ISO date string or `null`.
2. The parent task-list component (unchanged) passes each `task` object to `TaskCard` as a prop (unchanged interface).
3. Inside `TaskCard`, the due-date branch evaluates `task.due_date`:
   - Truthy → `formatDate(task.due_date)` → `Date` parse → `toLocaleDateString('en-GB', {...})` → string like `"25 Sep 2026"`.
   - Falsy → literal `"No Due Date"`.
4. The resulting string is rendered inside the same `<span className="task-date"><Calendar size={12} />{text}</span>` markup, in the same position within `.task-meta`, for every task card, every render — no change to re-render triggers, event handlers, or parent state.

## Requirement Traceability
| Requirement | Behavior / Component |
|---|---|
| FR1 / AC-001 — show due date when present | `TaskCard.jsx`: unconditional `.task-date` render; truthy branch shows formatted date |
| FR2 / AC-002 — readable format e.g. "25 Sep 2026" | `TaskCard.jsx`: `formatDate` uses `toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })` |
| FR3 / AC-003 — "No Due Date" fallback | `TaskCard.jsx`: falsy branch renders literal `"No Due Date"` instead of omitting the item |
| FR4 / AC-004 — visual consistency with existing metadata | Reuse of unchanged `.task-date` CSS class/position within `.task-meta`, same markup shape as `.badge*` siblings |
| FR5 / AC-005 — no regression to create/edit/complete/filter/delete | No changes to `TaskForm.jsx`, event handlers, backend, or other markup in `TaskCard.jsx`; existing `e2e/tests/task_flow.spec.js` flows re-run unmodified |
| FR6 / AC-006 — automated tests added/updated | New/extended assertions in `e2e/tests/task_flow.spec.js` (Playwright, already a dependency) covering formatted-date and fallback cases |
| NFR — frontend-only | Only `TaskCard.jsx` (and test spec) touched; no backend/API/db changes |
| NFR — no new dependencies | Uses built-in `Date`/`Intl` API and already-installed `@playwright/test`; no `package.json` changes in `frontend` or `e2e` |
| NFR — reuse existing `due_date` field | No new field, prop, or API introduced; same `task.due_date` value consumed |
| NFR — no unrelated behavior changes | Checkbox, delete button, description, title, badges, and other `TaskCard.jsx` markup left byte-for-byte unchanged |

## Error Handling and Relevant Security
- **Malformed/unparseable `due_date`:** `formatDate` keeps its existing `try/catch`; on a `Date` parse failure it returns the raw string rather than throwing, so a bad value degrades to showing the raw stored text instead of crashing the card or the list render.
- **Missing/null/empty-string `due_date`:** Treated uniformly as "absent" via the existing falsy check (`null`, `''`, `undefined` all route to the fallback), so no distinct handling is required for the different falsy shapes already possible from `TaskForm.jsx` (`due_date: dueDate || null`) or direct API data.
- **XSS/injection:** No new user-controlled rendering path is introduced; the due-date text is rendered via JSX child-text interpolation (`{text}`), which React escapes by default, same as the current implementation and the adjacent `.badge-category` text. No `dangerouslySetInnerHTML` or new HTML parsing is added.
- **No new secrets, tokens, or network calls** are introduced; this is a pure client-side render/formatting change with no new data source.

## Dependencies and Trade-offs
- **No new npm dependencies.** Uses the native `Date`/`Intl.DateTimeFormat` (via `toLocaleDateString`) already used by the current implementation, and the already-installed `@playwright/test` for AC-006 coverage.
- **Trade-off — locale pinning (`'en-GB'`) vs. user-locale formatting:** Pinning the locale guarantees the exact `"25 Sep 2026"` shape mandated by AC-002 for every user, at the cost of not adapting to a given user's own locale/date-format preference. Given AC-002 specifies one fixed example format and there is no stated internationalization requirement, deterministic/consistent formatting takes priority over locale adaptivity. This matches the existing codebase's lack of any i18n layer.
- **Trade-off — E2E-only automated coverage vs. unit tests:** Because `frontend/package.json` has no unit-test runner or component-testing library today, and adding one would violate the "no new dependencies" NFR, AC-006 is satisfied via the existing Playwright E2E suite rather than a new component-level unit test. This yields coverage at the user-visible/DOM level (sufficient to verify AC-001–AC-004 as rendered) but does not isolate `formatDate` as a pure function; this is accepted as the smallest repository-compatible option and is flagged in `design-review.md` as a documented trade-off, not a defect.
- **Trade-off — reusing `.task-date` for both states vs. a new "empty state" style:** Reusing the identical class/markup for the fallback text is the simplest way to satisfy AC-004 (visual consistency) and avoids any CSS changes; the trade-off is that "No Due Date" renders in the same muted/informational tone as a real date rather than a visually distinct "empty" indicator. Requirements do not call for a distinct empty-state treatment, so this is treated as correct, not a gap.

## Diagram
```mermaid
flowchart LR
    A[Task data<br/>task.due_date: string | null] --> B{TaskCard.jsx<br/>due_date truthy?}
    B -- yes --> C["formatDate()<br/>toLocaleDateString('en-GB', ...)<br/>→ '25 Sep 2026'"]
    B -- no --> D["literal 'No Due Date'"]
    C --> E[".task-date span<br/>(Calendar icon + text)<br/>inside .task-meta"]
    D --> E
    E --> F[Rendered task card<br/>alongside priority/category badges]
```
