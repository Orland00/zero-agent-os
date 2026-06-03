# Zero — an Agent Operating System

A small, opinionated framework for running multiple automated businesses from a
single control plane. Zero is two things working together:

1. **A venture-operating framework** — how to evaluate, research, build, and
   improve projects so each one compounds into reusable assets instead of
   one-off work. See [`operating-system/`](./operating-system/).
2. **The tooling that runs it** — a single Cloudflare Worker (Hono + Supabase +
   Telegram) plus CLI helpers for a kanban / investigation / approval loop. See
   [`agent-os/`](./agent-os/) and [`scripts/`](./scripts/).

> This is a **public, neutral demo** distilled from a private internal system.
> It carries no real client data, no credentials, and no business specifics —
> the multi-tenant handlers have been reduced to generic examples so the
> architecture and conventions are visible without exposing anything private.

## What it demonstrates

- **One Worker, many tenants.** A single Hono app routes API traffic, Telegram
  webhooks, scheduled jobs, and an ops dashboard. Adding a business is adding a
  handler, not a new deployment.
- **Security posture.** Bearer auth on `/api/*`, signature-verified webhooks,
  a KV-backed per-IP rate limiter, RLS-on Postgres accessed only via the
  service_role key server-side. Secrets live in `wrangler secret` / `.dev.vars`
  and are never committed.
- **Human-in-the-loop.** `scripts/request-approval.sh` lets an autonomous agent
  pause for a yes/no before sensitive actions — a gate built on one table.
- **Cron as a dispatcher.** A single `scheduled()` handler fans out to jobs by
  cron expression (session expiry, digests, …).

## Layout

```
operating-system/   the framework docs (philosophy, decision rules, triage)
agent-os/           the Cloudflare Worker (Hono) — API, webhooks, cron, dashboard
scripts/            bash CLI helpers for the kanban / approval / heartbeat loop
```

## Running the worker

```bash
cd agent-os
npm install
cp .dev.vars.example .dev.vars   # fill in your own Supabase + Telegram values
npm run dev
```

`npm run typecheck` type-checks the worker. Deploy with `npm run deploy`
(`wrangler`) once you have set the secrets listed in `wrangler.toml`.

## License

Source-available for portfolio / review purposes. Not licensed for
redistribution or commercial reuse.
