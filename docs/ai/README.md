# AI Operations

Zero is structured as an agent operating system: autonomous work is allowed to
draft, inspect, classify, summarize, and propose actions, while sensitive writes
remain gated by explicit approval.

This public snapshot contains the shell of that system. It does not contain
private prompts, customer context, private queues, real credentials, or live
operational data.

## AI Surface

- Intake classifier: turns raw opportunities into scored tasks.
- Research agent: collects source-backed findings and open questions.
- Builder agent: prepares implementation plans and diffs.
- Operator agent: monitors heartbeat, queue state, and approval requests.
- Critic agent: checks whether work is shippable or needs another pass.
- Archivist agent: turns completed work into reusable knowledge.
- Agent topology: `docs/ai/agent-topology.md`.

## Control Plane

The Worker in `agent-os/` exposes the API, webhook, cron, and dashboard shell.
The scripts under `scripts/` are designed for agent workflows:

- `request-approval.sh`: stop before sensitive actions.
- `heartbeat.sh`: report liveness.
- `inv-pull-queue.sh`: pull work items.
- `kb-add.sh`: add knowledge base notes.

## Guardrails

- Every agent action must be attributable to a task.
- Deployment, credential, billing, and destructive database actions require
  human approval.
- Private context is summarized before it becomes task memory.
- Public artifacts are sanitized before publication.
