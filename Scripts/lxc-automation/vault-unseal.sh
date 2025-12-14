#!/bin/bash
# vault-unseal.sh - Vault Auto-Unseal
# Location: /root/vault-unseal.sh (LXC 101)
# Secrets: VAULT_UNSEAL_KEY, DISCORD_WEBHOOK from Vault

VAULT_ADDR="http://127.0.0.1:8200"
UNSEAL_KEY="${VAULT_UNSEAL_KEY}"
DISCORD_WEBHOOK="${DISCORD_WEBHOOK}"

send_discord() {
    curl -s -H "Content-Type: application/json" \
        -d "{\"embeds\":[{\"title\":\"🔐 Vault Status\",\"description\":\"$1\",\"color\":$2}]}" \
        "$DISCORD_WEBHOOK" > /dev/null
}

for i in $(seq 1 60); do
    STATUS=$(docker exec -e VAULT_ADDR=$VAULT_ADDR vault vault status -format=json 2>/dev/null)
    
    if echo "$STATUS" | grep -q "sealed.*true"; then
        docker exec -e VAULT_ADDR=$VAULT_ADDR vault vault operator unseal "$UNSEAL_KEY"
        sleep 2
        if docker exec -e VAULT_ADDR=$VAULT_ADDR vault vault status 2>/dev/null | grep -q "Sealed.*false"; then
            send_discord "✅ Vault unsealed" 5763719
            exit 0
        fi
    elif echo "$STATUS" | grep -q "sealed.*false"; then
        exit 0
    fi
    sleep 5
done

send_discord "❌ Vault unseal FAILED" 15158332
exit 1
