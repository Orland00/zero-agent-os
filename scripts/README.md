# Agent-ops scripts

Small, dependency-light CLI helpers (bash + `curl` + `jq`) that drive the
operational loop against the Supabase backend behind `../agent-os/`. They are
how an autonomous agent or a human operator interacts with the same control
plane from a terminal.

| Script | What it does |
|--------|--------------|
| `kb-add.sh` | Add a kanban card (`title`, optional `tenant`) |
| `heartbeat.sh` | Record a service liveness beat (`service status [message]`) |
| `inv-pull-queue.sh` | Pull queued investigations for a worker to process |
| `request-approval.sh` | Queue a human approval and poll until decided |

## Setup

Each script reads connection details from an env file (no secrets are committed):

```bash
mkdir -p ~/.config/agent-os
cat > ~/.config/agent-os/.env <<'EOF'
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=...
SUPABASE_KEY=...        # server-side key, for privileged writes
EOF
chmod +x *.sh
```

Override the location with `AGENT_OS_ENV=/path/to/.env`.

The approval flow (`request-approval.sh`) is the interesting one: an agent about
to do something sensitive queues a request and blocks until a human marks it
approved or rejected — a simple human-in-the-loop gate built on a single table.
