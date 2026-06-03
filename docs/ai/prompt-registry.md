# Prompt Registry

Public prompt shells only. Runtime prompts are assembled from task context,
operator policy, and the minimum data needed for the job.

| Prompt | Purpose | Gate |
|--------|---------|------|
| `intake.classify.v1` | Turn raw requests into typed tasks | None |
| `research.brief.v1` | Produce source-backed briefs | Source required |
| `builder.plan.v1` | Convert task into implementation plan | Review required |
| `operator.digest.v1` | Summarize queue and heartbeat state | None |
| `critic.shipcheck.v1` | Decide whether work is ready | Human can override |

## Routing Policy

- Classification uses fast models.
- Research and planning use stronger reasoning models.
- Ship checks run with low temperature and explicit failure criteria.
- Sensitive action prompts are never allowed to self-approve.
