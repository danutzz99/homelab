#!/bin/bash
# =============================================================================
# vault-unseal.sh - Vault Auto-Unseal on Boot
# =============================================================================

VAULT_ADDR="<VAULT_ADDR>"
UNSEAL_KEY="${VAULT_UNSEAL_KEY}"
ALERT_WEBHOOK_URL="${ALERT_WEBHOOK_URL:-${DISCORD_WEBHOOK}}"

send_alert() {
    local message="$1"
    local color="$2"
    curl -s -H "Content-Type: application/json" \
        -d "{\"embeds\":[{\"title\":\"Vault Status\",\"description\":\"$message\",\"color\":$color,\"timestamp\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}]}" \
        "$ALERT_WEBHOOK_URL" > /dev/null
}

echo "[$(date)] Vault auto-unseal starting..."

for i in $(seq 1 60); do
    STATUS=$(docker exec -e VAULT_ADDR="$VAULT_ADDR" vault vault status -format=json 2>/dev/null)

    if echo "$STATUS" | grep -q "sealed.*true"; then
        echo "[$(date)] Vault is sealed, unsealing..."
        docker exec -e VAULT_ADDR="$VAULT_ADDR" vault vault operator unseal "$UNSEAL_KEY"
        sleep 2
        if docker exec -e VAULT_ADDR="$VAULT_ADDR" vault vault status 2>/dev/null | grep -q "Sealed.*false"; then
            echo "[$(date)] Vault successfully unsealed"
            send_alert "Vault has been automatically unsealed after system boot." 5763719
            exit 0
        fi
    elif echo "$STATUS" | grep -q "sealed.*false"; then
        echo "[$(date)] Vault is already unsealed"
        exit 0
    fi

    echo "[$(date)] Waiting for Vault... (attempt $i/60)"
    sleep 5
done

echo "[$(date)] ERROR: Vault did not become available"
send_alert "Failed to unseal Vault after boot. Manual intervention required." 15158332
exit 1
