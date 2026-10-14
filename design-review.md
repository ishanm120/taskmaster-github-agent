# Design Review

## Scope
Reviewed the approved KAN-119 frontend-only enhancement against `requirements.md` and the relevant task rendering, API, styling, form, and E2E surfaces. No implementation or verification was performed in this stage.

## Coverage and Compatibility
- The existing task-card metadata path already receives `task.due_date`; the proposed change is localized to its rendering and does not require an API or schema change.
- The existing `.task-date` style and calendar icon provide visual consistency. Using that same metadata location for `No Due Date` preserves the card layout and communicates the requested empty state.
- Existing form and task actions remain untouched. The current E2E suite is the available automated UI-test surface; there is no frontend component-test setup.
- The inspected frontend path exposes creation, completion, filtering, and deletion, but no task-edit UI. This display-only design does not change task mutation behavior; preservation of any edit workflow outside these components is not assessable from the inspected surface.
- Missing dates are handled explicitly. Fetch errors continue to use the existing app-level warning path. No new security-sensitive input or persistence path is introduced.

## Findings
- **HIGH — None.** No blocking architecture or requirement-coverage gap found.
- **MEDIUM — Date-only timezone/locale formatting risk.** The current `TaskCard` formatter constructs a JavaScript `Date` from the stored value and delegates ordering to the runtime locale; date-only ISO values may display on the previous day in some timezones. **Action:** addressed in the architecture by treating the value as a calendar date and formatting the short-month date without timestamp conversion.
- **LOW — No frontend unit-test harness.** `frontend/package.json` has no component-test script or test dependency. **Action:** use the existing Playwright E2E suite to cover both a present due date and the `No Due Date` state, without adding a dependency.

## Decisions and Follow-ups
- Keep the feature in `TaskCard`; do not modify API, database, task mutation handlers, or form behavior.
- During implementation, add the two due-date display assertions to the existing E2E coverage and verify the existing task workflows remain unaffected.
- Do not add an edit workflow as part of KAN-119; confirm with the requirement owner only if edit behavior is expected to exist in this frontend but is missing from the current inspected surface.
- Tests were not run because this task is limited to Architecture and Design Review.

## Status
No unresolved HIGH findings. The MEDIUM formatting risk has a specific design resolution; the LOW test-harness limitation has an existing test path. Architecture and Design Review are complete; ready for Developer Planning.