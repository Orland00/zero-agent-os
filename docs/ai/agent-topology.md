# Agent Topology

Public shell for the operating-system agents.

| Agent | Responsibility | Output |
|-------|----------------|--------|
| Intake Agent | Classifies new work and assigns task type | Task record |
| Research Agent | Produces source-backed findings | Brief |
| Builder Agent | Converts approved work into implementation steps | Plan or diff |
| Operator Agent | Watches heartbeats, approvals, and queues | Digest |
| Critic Agent | Reviews readiness, risk, and test gaps | Ship check |
| Archivist Agent | Distills completed work into reusable knowledge | KB note |

## Rules

- Agents are task-scoped.
- Sensitive actions create approval records.
- Private context is summarized before becoming durable memory.
- A critic pass can block shipping until verification exists.
