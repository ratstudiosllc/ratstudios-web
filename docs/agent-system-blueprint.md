# RaT Studios Agent System Blueprint

## Purpose
Build a reliable multi-agent operating model for bugs, execution, and QA, with the admin dashboard reflecting real issue state.

## Roles

### 1. Orchestrator
Single user-facing coordinator.
- Intake requests
- Route work
- Resolve conflicts
- Summarize outcomes
- Maintain final accountability

### 2. Bugs & Issues Manager
Owns issue hygiene.
- Create and number issues
- Assign project, priority, status
- Maintain current state and next step
- Sync dashboard and markdown export
- Flag stale or blocked issues

### 3. Execution Agent
Owns implementation.
- Investigate root cause
- Change code/config/migrations
- Deploy fixes
- Report commits and blockers

### 4. QA / Verification Agent
Owns validation.
- Reproduce before/after
- Verify deployed behavior
- Check regressions
- Return pass/fail with notes

## Communication Model
Hub-and-spoke.
- User -> Orchestrator
- Orchestrator -> specialist agent
- Specialist -> Orchestrator
- Orchestrator -> next specialist or user

Agents do not independently mutate each other’s state.

## Source of Truth
- Supabase table(s) as canonical issue store
- Admin dashboard reads/writes DB
- `bugs and issues.md` is generated or synced from DB, not primary

## Recommended Core Tables

### issues
- id
- number
- title
- project
- priority
- status
- identified_at
- summary
- current_state
- next_step
- owner_agent
- committed
- pushed
- deployed
- verified
- commits
- created_at
- updated_at
- resolved_at

### issue_events
- id
- issue_id
- event_type
- actor
- body
- metadata jsonb
- created_at

### issue_verifications
- id
- issue_id
- verified
- environment
- notes
- created_at

## Status Lifecycle
- new
- triaged
- in_progress
- blocked
- ready_for_qa
- resolved
- deferred

## Resolution Rule
Resolved only when:
- implemented
- deployed
- verified
- tracker updated

## Dashboard Requirements
- issue list with filters for project, priority, status, owner, blocked, ready for QA
- detail drawer with event timeline
- current state and next step visible
- timestamps in Mountain time
- issue numbers as primary references

## Workflow A: New Bug
1. Bugs agent creates issue
2. Orchestrator routes to execution if needed
3. Execution fixes and reports
4. QA verifies
5. Bugs agent closes or reopens

## Workflow B: Fix Existing Issue
1. Orchestrator loads issue by number
2. Execution agent works
3. QA verifies
4. Bugs agent updates state

## Workflow C: Backlog Review
1. Bugs agent scans for stale, blocked, or unverifed issues
2. Orchestrator reprioritizes
3. Execution consumes top queue

## Build Order
1. DB schema
2. Admin dashboard fields + filters + detail panel
3. Bugs agent prompt/spec
4. Execution agent prompt/spec
5. QA agent prompt/spec
6. Markdown export/sync
