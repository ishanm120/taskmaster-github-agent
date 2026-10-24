# Changelog

All notable changes to this project are documented in this file.

## [Unreleased]

### KAN-118 — Display existing due date on task cards (2026-10-09)

- **Added**: Task cards now always render a due-date element: tasks with a due date show it in a fixed, timezone-independent format (e.g. `25 Sep 2026`), and tasks without one show a neutral `"No Due Date"` fallback instead of omitting the element. (`frontend/src/components/TaskCard.jsx`)
- **Fixed**: `formatDate` no longer constructs a `Date` object or uses locale-dependent `toLocaleDateString`. It now parses the stored `YYYY-MM-DD` string's components directly via regex and looks up the month name from a fixed 3-letter table, eliminating a timezone-dependent off-by-one-day bug that previously showed the due date one calendar day earlier than stored in timezones behind UTC (e.g. `America/New_York`). (`frontend/src/components/TaskCard.jsx`)
- **Added**: Two new Playwright e2e tests covering the formatted-date display and the "No Due Date" fallback. (`e2e/tests/task_flow.spec.js`)
- **Fixed** (unrelated, pre-existing, test-only): Corrected a stale e2e test fixture assertion for the app header text (`"TaskMaster Pro"` → `"TaskMaster Pro-Github"`) to match already-committed production markup, which was blocking the entire e2e suite from running. No application behavior was changed. (`e2e/tests/task_flow.spec.js`)

This is a frontend-only, presentation-level change. No backend, database, API, or dependency changes were made. Existing task creation, editing, completion, filtering, and deletion behavior is unaffected (regression-verified via the pre-existing Playwright test suite, passing under default and multiple non-UTC timezones).
