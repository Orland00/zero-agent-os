# Architecture Shell

Zero is presented here as a public shell for an AI-assisted operating system.
Private queues, live tenants, credentials, and operational data are removed.

## Runtime Components

| Area | Shell |
|------|-------|
| Control plane | Cloudflare Worker + Hono |
| Database | Supabase Postgres for tasks, tenants, contacts, orders, approvals |
| Dashboard | Minimal operations UI |
| Messaging | Telegram webhook and command loop |
| Scheduler | Cron dispatcher for recurring work |
| CLI | Shell helpers for queue pull, heartbeat, approvals, and knowledge capture |
| AI | Intake, research, build, operator, critic, and digest agents |
| External APIs | Generic SaaS, billing, messaging, analytics, and data-provider boundaries |

## Data Flow

1. A task enters the queue from API, CLI, webhook, or scheduled job.
2. Intake classifies the task and assigns metadata.
3. Research/build agents prepare context, findings, diffs, or proposals.
4. Sensitive actions create approval requests.
5. Approved actions are executed by worker routes or CLI helpers.
6. Heartbeats and digests keep the operator aware of system health.

## Integration Boundaries

- Every external API call goes through a named route, tool, or script.
- Database writes are tied to task or approval records.
- Agent output is advisory until a deterministic executor acts.
- Destructive, billing, credential, and deployment actions require approval.
- Public artifacts are sanitized before leaving the private workspace.

## Removed From Public Snapshot

- Private queue data.
- Real connected services.
- Tenant identifiers.
- Live credentials.
- Private prompt packs and policy memory.
