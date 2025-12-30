#!/bin/bash
# =============================================================================
# notify-boot.sh - Proxmox Boot Notification
# =============================================================================
# Location: /root/notify-boot.sh (on Proxmox host)
# Trigger: systemd service on boot
# =============================================================================

# Secrets - Inject from Vault during deployment:
WEBHOOK_URL="${N8N_WEBHOOK_URL:-<WEBHOOK_URL>}"
DISCORD_FALLBACK="${DISCORD_WEBHOOK}"

sleep 30  # Wait for network

# Try n8n first
if curl -sf -X POST "$WEBHOOK_URL" -H "Content-Type: application/json" \
   -d "{\"event\":\"boot\",\"host\":\"$(hostname)\",\"time\":\"$(date -Iseconds)\"}"; then
    echo "[$(date)] n8n notified of boot"
else
    # Fallback to Discord directly
    curl -s -H "Content-Type: application/json" \
        -d "{\"embeds\":[{\"title\":\"🖥️ Proxmox Booted\",\"description\":\"System is online\",\"color\":5763719}]}" \
        "$DISCORD_FALLBACK"
fi
