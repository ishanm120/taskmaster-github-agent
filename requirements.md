# Requirements

## Source
- Source type: Jira issue
- Issue ID: KAN-119
- Summary: Claude-Display existing due date on task cards
- Status: To Do
- Priority: Medium
- Source: https://ishanmittal120.atlassian.net/browse/KAN-119
- Description and acceptance criteria retrieved from the Jira issue.

## Objective
As a TaskMaster user, I want to see a task's due date directly on its task card, so that I can identify upcoming deadlines without opening the task details.

## Functional Requirements
- FR-001: For each task with an existing due date, display that due date in the task card metadata area.
- FR-002: Display available due dates in a readable date format; Jira gives `25 Sep 2026` as an example.
- FR-003: For a task without a due date, display the neutral fallback text `No Due Date`.
- FR-004: Keep the due-date display visually consistent with existing task-card metadata.
- FR-005: Preserve existing task creation, editing, completion, filtering, and deletion behavior.
- FR-006: Add or update automated tests for displaying a due date and the no-due-date fallback.

## Non-Functional Requirements
None specified.

## Dependencies and Constraints
- Frontend-only enhancement; no backend API or database changes.
- Reuse the existing due-date field; do not introduce a new field or API.
- Repository context check confirmed a `due_date` column in the existing task schema: [backend/src/db.js](backend/src/db.js).
- No new dependencies.
- Do not modify unrelated application behavior.
- If the existing task model does not have a due-date field, stop and request clarification rather than inventing a field or API. The field is present in the current schema, so this condition is not blocking.

## Acceptance Criteria
- AC-001: Each task card displays its existing due date when available. (FR-001)
- AC-002: The due date is displayed in a readable format, e.g. `25 Sep 2026`. (FR-002)
- AC-003: Tasks without a due date display `No Due Date`. (FR-003)
- AC-004: The due date display is visually consistent with existing task card metadata. (FR-004)
- AC-005: Existing task creation, editing, completion, filtering, and deletion continue to work. (FR-005)
- AC-006: Relevant automated tests cover due-date display and fallback behavior. (FR-006)

## Open Questions
None.

## Approval
APPROVED
