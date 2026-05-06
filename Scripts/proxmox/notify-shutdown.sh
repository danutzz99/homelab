#!/bin/bash
# =============================================================================
# notify-shutdown.sh - Proxmox Shutdown Notification
# =============================================================================

WEBHOOK_URL="${N8N_WEBHOOK_URL:-<WEBHOOK_URL>}"
ALERT_FALLBACK="${ALERT_WEBHOOK_URL:-${DISCORD_WEBHOOK}}"

if curl -sf -m 5 -X POST "$WEBHOOK_URL" -H "Content-Type: application/json" \
   -d "{\"event\":\"shutdown\",\"host\":\"$(hostname)\",\"time\":\"$(date -Iseconds)\"}"; then
    echo "[$(date)] n8n notified of shutdown"
else
    curl -s -m 5 -H "Content-Type: application/json" \
        -d "{\"embeds\":[{\"title\":\"Proxmox Shutting Down\",\"description\":\"System going offline\",\"color\":15105570}]}" \
        "$ALERT_FALLBACK"
fi
