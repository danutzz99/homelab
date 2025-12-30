#!/bin/bash
# =============================================================================
# notify-shutdown.sh - Proxmox Shutdown Notification
# =============================================================================
# Location: /root/notify-shutdown.sh (on Proxmox host)
# Trigger: systemd service on shutdown
# =============================================================================

# Secrets - Inject from Vault during deployment:
WEBHOOK_URL="${N8N_WEBHOOK_URL:-<WEBHOOK_URL>}"
DISCORD_FALLBACK="${DISCORD_WEBHOOK}"

# Try n8n first (short timeout since shutting down)
if curl -sf -m 5 -X POST "$WEBHOOK_URL" -H "Content-Type: application/json" \
   -d "{\"event\":\"shutdown\",\"host\":\"$(hostname)\",\"time\":\"$(date -Iseconds)\"}"; then
    echo "[$(date)] n8n notified of shutdown"
else
    # Fallback to Discord directly
    curl -s -m 5 -H "Content-Type: application/json" \
        -d "{\"embeds\":[{\"title\":\"🌙 Proxmox Shutting Down\",\"description\":\"System going offline\",\"color\":15105570}]}" \
        "$DISCORD_FALLBACK"
fi
