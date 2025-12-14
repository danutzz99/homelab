#!/bin/bash
# notify-shutdown.sh - Proxmox Shutdown Notification
# Location: /root/notify-shutdown.sh
# Secrets: DISCORD_WEBHOOK, WEBHOOK_URL from Vault

WEBHOOK_URL="${WEBHOOK_URL}"
DISCORD_FALLBACK="${DISCORD_WEBHOOK}"

if curl -sf -m 5 -X POST "$WEBHOOK_URL" -H "Content-Type: application/json" \
   -d "{\"event\":\"shutdown\",\"host\":\"$(hostname)\",\"time\":\"$(date -Iseconds)\"}"; then
    echo "n8n notified"
else
    curl -s -m 5 -H "Content-Type: application/json" \
        -d "{\"embeds\":[{\"title\":\"🌙 Proxmox Shutting Down\",\"color\":15105570}]}" \
        "$DISCORD_FALLBACK"
fi
