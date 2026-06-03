#!/usr/bin/env bash
# Request a human approval and poll until it is decided (or timeout).
# Lets an autonomous agent pause for a yes/no before a sensitive action.
# Usage: request-approval.sh <action> '<payload-json>' [timeout_seconds]
set -euo pipefail

ENV_FILE="${AGENT_OS_ENV:-$HOME/.config/agent-os/.env}"
[ -f "$ENV_FILE" ] || { echo "missing $ENV_FILE"; exit 1; }
set -a; source "$ENV_FILE"; set +a

ACT="${1:?Usage: request-approval.sh <action> <payload> [timeout]}"
PL="${2:-{}}"
TIMEOUT="${3:-3600}"

REQ=$(jq -n --arg a "$ACT" --argjson p "$PL" --arg by "${USER:-cli}" \
  '{action:$a, payload:$p, requested_by:$by, status:"pending"}')

ID=$(curl -fsS -X POST "$SUPABASE_URL/rest/v1/approvals" \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d "$REQ" | jq -r '.[0].id')

echo "queued $ID — waiting up to ${TIMEOUT}s"

ELAPSED=0
while [ $ELAPSED -lt "$TIMEOUT" ]; do
  STATUS=$(curl -fsS "$SUPABASE_URL/rest/v1/approvals?id=eq.$ID&select=status" \
    -H "apikey: $SUPABASE_ANON_KEY" \
    -H "Authorization: Bearer $SUPABASE_ANON_KEY" | jq -r '.[0].status')
  if [ "$STATUS" != "pending" ]; then echo "$STATUS"; exit 0; fi
  sleep 10; ELAPSED=$((ELAPSED+10))
done

echo "timeout"; exit 2
