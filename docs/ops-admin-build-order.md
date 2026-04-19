# RaT Ops Admin build order

## Decisions now in code
- Immediate containment: basic gate on `/admin` and `/api/admin/*`
- Integration strategy: hybrid
  - read live OpenClaw session/runtime state now
  - normalize/persist later for history, failures, schedules, and actions

## Current run mapping
A dashboard `Run` currently maps to an OpenClaw session record.

Fields:
- `run.id` -> `sessionId || key`
- `project` -> inferred from session key / agent
- `agent_name` -> `agentId`
- `status` -> inferred from freshness + abortedLastRun
- `trigger_type` -> inferred from key (`cron`, chat/manual, api)
- `tokens/cost` -> derived from stored token counters

## Next implementation steps
1. Replace heuristic status mapping with real task/run primitives if OpenClaw exposes them directly.
2. Add normalized persistence for:
   - run history
   - failures
   - schedules
   - retries/cancels
   - artifacts
3. Replace basic auth gate with app auth and role model:
   - Admin
   - Operator
   - Viewer
   - ProjectOwner
4. Wire actions:
   - retry
   - cancel
   - run-now
5. Upgrade SSE stream from heartbeat snapshot to real event fanout.
