# Architecture

## Inputs and Constraints
- Requirement: Jira KAN-119, recorded in [requirements.md](requirements.md), Approval `APPROVED`.
- Frontend-only change. Reuse the existing `task.due_date`; no backend, database, API, dependency, or unrelated behavior changes.
- Preserve task creation, editing, completion, filtering, and deletion flows.

## Proposed Approach
Extend the existing due-date presentation in `TaskCard` only. When `task.due_date` is present, display it in the existing task metadata row with the calendar icon and short-month date style. Interpret ISO date-only values as calendar dates, not timestamps, so timezone conversion cannot shift the displayed day. When absent, render the exact neutral text `No Due Date` in the same metadata style. Keep the existing task object and API flow unchanged.

## Components and Responsibilities
- `frontend/src/App.jsx`: fetches tasks and stores them without transforming due-date values.
- `frontend/src/components/TaskList.jsx`: passes each task object directly to its card.
- `frontend/src/components/TaskCard.jsx`: formats the existing `due_date` and renders either that date or `No Due Date` in `.task-meta`.
- `frontend/src/index.css`: existing `.task-date` style supplies the muted, inline metadata presentation; reuse it for both states.
- `frontend/src/services/api.js`: existing JSON task response path; no change required.

## Data Flow
`GET /api/tasks` returns task objects containing the existing `due_date`; `App` stores them, `TaskList` forwards each task, and `TaskCard` renders the date or missing-date fallback. No date data is written or mutated by this display path.

## Requirement Traceability
| Requirement | Design coverage |
| --- | --- |
| FR-001 / AC-001 | `TaskCard` displays a present `task.due_date` in task metadata. |
| FR-002 / AC-002 | Format date-only values as a readable short-month date, such as `25 Sep 2026`, without timezone day shifts. |
| FR-003 / AC-003 | Render exact text `No Due Date` when `task.due_date` is absent. |
| FR-004 / AC-004 | Reuse the existing `.task-meta` row, `.task-date` styling, and calendar icon. |
| FR-005 / AC-005 | Leave API calls, task state, and create/edit/complete/filter/delete handlers unchanged. |
| FR-006 / AC-006 | Extend the existing Playwright E2E coverage for a dated task and a task without a date; assert displayed date and fallback. |
| NFRs | None specified. |

## Error Handling and Relevant Security
- A missing due date is an expected state and is represented by `No Due Date`, not treated as an error.
- Task-fetch failures continue through the existing `App` warning-toast path; the display change adds no network or persistence behavior.
- Treat the date as display data only; do not introduce HTML injection, new input handling, or sensitive data.

## Dependencies and Trade-offs
- No new dependencies or API contract changes.
- A deterministic date-only formatting rule avoids timezone shifts while retaining the existing compact metadata presentation. Localized ordering is traded for the requirement's short-month example format.
- Use the existing Playwright suite for the required UI assertions; the frontend package has no component-test script or test dependency.

## Diagram
```mermaid
flowchart LR
    API[Existing tasks API] --> APP[App task state]
    APP --> LIST[TaskList]
    LIST --> CARD[TaskCard]
    CARD --> META[Date or No Due Date in task metadata]
```