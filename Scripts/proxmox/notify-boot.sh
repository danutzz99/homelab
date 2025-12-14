#!/bin/bash
# notify-boot.sh - Proxmox Boot Notification
# Location: /root/notify-boot.sh
# Secrets: DISCORD_WEBHOOK, WEBHOOK_URL from Vault

sleep 30  # Wait for network

WEBHOOK_URL="${WEBHOOK_URL}"
DISCORD_FALLBACK="${DISCORD_WEBHOOK}"

if curl -sf -X POST "$WEBHOOK_URL" -H "Content-Type: application/json" \
   -d "{\"event\":\"boot\",\"host\":\"$(hostname)\",\"time\":\"$(date -Iseconds)\"}"; then
    echo "n8n notified"
else
    curl -s -H "Content-Type: application/json" \
        -d "{\"embeds\":[{\"title\":\"🖥️ Proxmox Booted\",\"color\":5763719}]}" \
        "$DISCORD_FALLBACK"
fi
