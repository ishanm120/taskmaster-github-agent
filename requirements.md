# Requirements

## Source
- Source type: Jira issue (retrieved via Atlassian MCP tools)
- Jira ID: **KAN-117**
- Link: https://ishanmittal120.atlassian.net/browse/KAN-117
- Project: Task-Manager (KAN), Issue Type: Feature, Status: To Do, Priority: Medium
- Reporter/Assignee: Ishan Mittal
- Attachments: None found on the issue.
- Linked documentation: None found (no remote issue links; no Confluence links present on the issue). Confluence is optional per process and was not required here.
- Retrieved: 2026-09-29 via `getJiraIssue` (KAN-117) and `getJiraIssueRemoteIssueLinks` (KAN-117).

### Verbatim Jira Description (source of truth)
> As a TaskMaster user, I want to see a task's due date directly on its task card, so that I can identify upcoming deadlines without opening the task details. Business Requirement: Display the existing due date, if available, in the task card metadata area. Tasks without a due date should show a neutral fallback.
>
> AC-001: Each task card displays its existing due date when available.
> AC-002: The due date is displayed in a readable format, e.g. 25 Sep 2026.
> AC-003: Tasks without a due date display "No Due Date".
> AC-004: The due date display is visually consistent with existing task card metadata.
> AC-005: Existing task creation, editing, completion, filtering, and deletion continue to work.
> AC-006: Add or update relevant automated tests for the due date display and fallback.
>
> * Frontend-only enhancement.
> * Reuse the existing due date field, if available.
> * No backend API or database changes.
> * No new dependencies.
> * Do not modify unrelated application behavior.
> * If the existing task model has no due date field, document this as an open question and stop for clarification. Do not invent a new field or API.

## Objective
Display a task's existing due date on its task card so users can identify upcoming deadlines without opening task details, using the existing due date field. Tasks without a due date must show a neutral fallback ("No Due Date"). This is a frontend-only enhancement with no backend, database, or dependency changes, and must not disrupt existing task functionality.

## Functional Requirements
- **FR-001**: Each task card must display the task's existing due date when a due date value is present on the task. (Source: description, AC-001)
- **FR-002**: The displayed due date must use a readable format, e.g. "25 Sep 2026". (Source: AC-002)
- **FR-003**: Task cards for tasks without a due date must display the exact fallback text "No Due Date". (Source: description, AC-003)
- **FR-004**: The due date display must be visually consistent with the existing task card metadata styling (e.g. placement, typography, spacing conventions already used for other metadata on the card). (Source: AC-004)
- **FR-005**: The change must be implemented using the existing due date field on the task model; no new field, API, or backend/database change may be introduced. (Source: description constraints)
- **FR-006**: Existing task creation, editing, completion, filtering, and deletion behavior must continue to function unchanged. (Source: AC-005)
- **FR-007**: Relevant automated tests must be added or updated to cover the due date display and the "No Due Date" fallback. (Source: AC-006)

## Non-Functional Requirements
None specified. The Jira source does not state explicit performance, security, accessibility, localization, or scalability requirements for this feature. (Constraints that are non-functional in character — frontend-only, no new dependencies, no backend/API changes — are captured under Dependencies and Constraints below since they are scope/implementation constraints rather than quality attributes.)

## Dependencies and Constraints
- **Frontend-only enhancement**: no backend API or database changes are in scope. (Source: description)
- **Reuse existing due date field**: the task data model already contains a due date field (confirmed present as `due_date` in the repository's task schema/API/UI — `backend/src/db.js`, `backend/src/app.js`, `frontend/src/components/TaskForm.jsx`, `frontend/src/components/TaskCard.jsx`, `frontend/src/components/FilterBar.jsx`), so the Jira ticket's own stop-condition ("if the existing task model has no due date field, stop for clarification") does not apply. This repository check was performed only to resolve that explicit Jira instruction, not to determine feature completeness or implementation approach.
- **No new dependencies** may be introduced to implement this feature. (Source: description)
- **No unrelated behavior changes**: existing task creation, editing, completion, filtering, and deletion must be preserved as-is. (Source: AC-005, description)
- Confluence/linked documentation: none found; not a blocker since Confluence is optional context.

## Acceptance Criteria
- **AC-001**: Each task card displays its existing due date when available. → Traces to FR-001. (Source: Jira description, verbatim)
- **AC-002**: The due date is displayed in a readable format, e.g. 25 Sep 2026. → Traces to FR-002. (Source: Jira description, verbatim)
- **AC-003**: Tasks without a due date display "No Due Date". → Traces to FR-003. (Source: Jira description, verbatim)
- **AC-004**: The due date display is visually consistent with existing task card metadata. → Traces to FR-004. (Source: Jira description, verbatim)
- **AC-005**: Existing task creation, editing, completion, filtering, and deletion continue to work. → Traces to FR-006. (Source: Jira description, verbatim)
- **AC-006**: Add or update relevant automated tests for the due date display and fallback. → Traces to FR-007. (Source: Jira description, verbatim)

## Open Questions
- **OQ-001**: The Jira description gives only one example format ("25 Sep 2026") and does not specify whether the format should be locale-aware/user-configurable or a fixed format, and whether it should differ from any date formatting already used elsewhere in the app (e.g. for consistency with other displayed dates, if any exist). Needs confirmation before final format is locked in architecture/design.
- **OQ-002**: The Jira description does not specify whether task cards should visually distinguish overdue due dates (e.g. highlighting/color) from upcoming ones. AC-004 only requires visual consistency with existing metadata styling, which implies a single neutral style, but this is not explicitly confirmed either way.
- **OQ-003**: The Jira description does not specify exact placement of the due date within the "task card metadata area" relative to other existing metadata (e.g. priority, category) when a due date is present. AC-004's "visually consistent" requirement does not fully resolve ordering/placement.

## Approval
APPROVED
