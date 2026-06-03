#!/usr/bin/env bash
# Add a kanban card from the CLI.
# Usage: kb-add.sh "title" [tenant]
set -euo pipefail

ENV_FILE="${AGENT_OS_ENV:-$HOME/.config/agent-os/.env}"
[ -f "$ENV_FILE" ] || { echo "missing $ENV_FILE"; exit 1; }
set -a; source "$ENV_FILE"; set +a

TITLE="${1:-}"
TENANT="${2:-default}"
[ -z "$TITLE" ] && { echo "Usage: kb-add.sh \"title\" [tenant]"; exit 1; }

BODY=$(jq -n --arg t "$TITLE" --arg b "$TENANT" \
  '{title: $t, tenant: $b, status: "todo", assignee: "owner", priority: "med"}')

curl -fsS -X POST "$SUPABASE_URL/rest/v1/kanban_cards" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d "$BODY" \
  | jq -r '.[0] | "ok " + .id + " | " + .title'
