# Changelog

All notable changes to this project are documented in this file.

## [Unreleased]

### KAN-117 — Display existing due date on task cards (2026-09-29)

- **Added**: Task cards now display the task's existing due date in a fixed, readable format (e.g. `25 Sep 2026`), replacing the previous locale-dependent formatting. (`frontend/src/components/TaskCard.jsx`)
- **Added**: Tasks without a due date now display a neutral `"No Due Date"` fallback on the card, instead of omitting the due-date element entirely. (`frontend/src/components/TaskCard.jsx`)
- **Added**: Two new Playwright e2e tests covering the formatted-date display and the "No Due Date" fallback. (`e2e/tests/task_flow.spec.js`)
- **Fixed** (unrelated, test-only): Corrected a stale e2e test fixture assertion for the app header text (`"TaskMaster Pro"` → `"TaskMaster Pro-Github"`) to match already-committed production markup. No application behavior was changed. (`e2e/tests/task_flow.spec.js`)

This is a frontend-only, presentation-level change. No backend, database, API, or dependency changes were made. Existing task creation, editing, completion, filtering, and deletion behavior is unaffected (regression-verified via the pre-existing Playwright test suite).
