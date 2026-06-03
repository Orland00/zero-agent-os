#!/usr/bin/env bash
# Pull queued investigations for an autonomous worker to process (e.g. nightly).
set -euo pipefail

ENV_FILE="${AGENT_OS_ENV:-$HOME/.config/agent-os/.env}"
[ -f "$ENV_FILE" ] || { echo "missing $ENV_FILE"; exit 1; }
set -a; source "$ENV_FILE"; set +a

curl -fsS "$SUPABASE_URL/rest/v1/investigations?status=eq.queued&order=created_at.asc&select=*" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  | jq '.'
