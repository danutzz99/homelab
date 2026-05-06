#!/bin/bash
# =============================================================================
# notify-boot.sh - Proxmox Boot Notification
# =============================================================================

WEBHOOK_URL="${N8N_WEBHOOK_URL:-<WEBHOOK_URL>}"
ALERT_FALLBACK="${ALERT_WEBHOOK_URL:-${DISCORD_WEBHOOK}}"

sleep 30

if curl -sf -X POST "$WEBHOOK_URL" -H "Content-Type: application/json" \
   -d "{\"event\":\"boot\",\"host\":\"$(hostname)\",\"time\":\"$(date -Iseconds)\"}"; then
    echo "[$(date)] n8n notified of boot"
else
    curl -s -H "Content-Type: application/json" \
        -d "{\"embeds\":[{\"title\":\"Proxmox Booted\",\"description\":\"System is online\",\"color\":5763719}]}" \
        "$ALERT_FALLBACK"
fi
