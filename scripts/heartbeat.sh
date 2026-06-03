#!/usr/bin/env bash
# Record a heartbeat for a service so the dashboard can show liveness.
# Usage: heartbeat.sh <service> <status:ok|warn|down> [message]
set -euo pipefail

ENV_FILE="${AGENT_OS_ENV:-$HOME/.config/agent-os/.env}"
[ -f "$ENV_FILE" ] || { echo "missing $ENV_FILE"; exit 1; }
set -a; source "$ENV_FILE"; set +a

SVC="${1:?Usage: heartbeat.sh <service> <status> [message]}"
ST="${2:?need status: ok|warn|down}"
MSG="${3:-}"
NOW=$(date -u +%Y-%m-%dT%H:%M:%SZ)

PAYLOAD=$(jq -n --arg s "$SVC" --arg st "$ST" --arg m "$MSG" --arg now "$NOW" \
  '{service:$s, status:$st, message:($m | select(length>0)), last_beat_at:$now}')

curl -fsS -X POST "$SUPABASE_URL/rest/v1/health_checks" \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d "$PAYLOAD" \
  | jq -r '.[0] | "beat " + .service + " " + .status'
