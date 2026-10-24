# Requirements

## Source
- Jira issue: KAN-118 — "Claude-Display existing due date on task cards"
- URL: https://ishanmittal120.atlassian.net/browse/KAN-118
- Project: Task-Manager (KAN), Issue type: Feature, Status: To Do, Priority: Medium
- Retrieved via Atlassian MCP tools on 2026-10-09. No attachments, no comments, no linked issues, no linked Confluence documentation were present on the issue.

## Objective
As a TaskMaster user, display a task's existing due date directly on its task card so that upcoming deadlines are visible without opening task details. Tasks without a due date must show a neutral fallback ("No Due Date") instead of blank/missing metadata.

## Functional Requirements
1. Each task card displays the task's existing due date when the due date value is available. (Source: AC-001)
2. The due date is displayed in a readable format, e.g. "25 Sep 2026". (Source: AC-002)
3. Tasks without a due date display the text "No Due Date" instead of omitting the metadata item. (Source: AC-003)
4. The due date display is visually consistent with the existing task card metadata (e.g. priority badge, category badge) in styling and placement. (Source: AC-004)
5. Existing task creation, editing, completion, filtering, and deletion continue to work without regression. (Source: AC-005)
6. Automated tests are added or updated to cover the due date display and the no-due-date fallback. (Source: AC-006)

## Non-Functional Requirements
- Scope: Frontend-only enhancement; no backend API or database changes. (Source: Jira issue business requirement notes)
- No new dependencies are to be introduced. (Source: Jira issue business requirement notes)
- Must reuse the existing due date field if available; must not invent a new field or API. (Source: Jira issue business requirement notes)
- Must not modify unrelated application behavior. (Source: Jira issue business requirement notes)
- Performance: None specified.
- Security: None specified.
- Accessibility: None specified.

## Dependencies and Constraints
- Depends on the existing task due date field already present in the application. A read-only repository check (for requirements clarification only, not a design decision) confirms a `due_date` field exists end-to-end today: SQLite schema (`backend/src/db.js`), task creation form (`frontend/src/components/TaskForm.jsx`), and task card rendering (`frontend/src/components/TaskCard.jsx`). This satisfies the issue's instruction that if no due date field existed, the agent must stop and raise an open question — no such stoppage is required.
- Note for the next stage (not a requirements decision): the current `TaskCard.jsx` already renders the due date when present (format: e.g. "Sep 25, 2026") but renders nothing when `task.due_date` is falsy, and the display format does not match the AC-002 example format ("25 Sep 2026"). Architecture/implementation will need to address the fallback text and the exact date format against AC-002 and AC-003.
- Constraint: changes must stay frontend-only, with no backend/API/database modifications and no new dependencies.
- Constraint: do not alter unrelated task card behavior (completion toggle, delete action, priority/category badges, etc.).

## Acceptance Criteria
- AC-001: Each task card displays its existing due date when available. (Source: KAN-118)
- AC-002: The due date is displayed in a readable format, e.g. 25 Sep 2026. (Source: KAN-118)
- AC-003: Tasks without a due date display "No Due Date". (Source: KAN-118)
- AC-004: The due date display is visually consistent with existing task card metadata. (Source: KAN-118)
- AC-005: Existing task creation, editing, completion, filtering, and deletion continue to work. (Source: KAN-118)
- AC-006: Add or update relevant automated tests for the due date display and fallback. (Source: KAN-118)

## Open Questions
None.

## Approval
APPROVED
