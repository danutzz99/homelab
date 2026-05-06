#!/bin/bash
# =============================================================================
# check_nc_bans.sh - Summarize Active Nextcloud Fail2Ban Blocks
# =============================================================================

NEXTCLOUD_LXC_ID="${NEXTCLOUD_LXC_ID:-<NEXTCLOUD_LXC_ID>}"
NEXTCLOUD_LOG="${NEXTCLOUD_LOG:-/mnt/ncdata/data/nextcloud.log}"

BANNED_IPS=$(pct exec "$NEXTCLOUD_LXC_ID" -- fail2ban-client status nextcloud | sed -n 's/.*Banned IP list://p' | xargs)

if [ -z "$BANNED_IPS" ]; then
    echo "No IPs are currently banned."
    exit 0
fi

printf "%-16s | %-15s | %s\n" "IP Address" "Username" "Date"
echo "-----------------+-----------------+---------------------"

for IP in $BANNED_IPS; do
    LOG_ENTRY=$(pct exec "$NEXTCLOUD_LXC_ID" -- grep "Login failed.*$IP" "$NEXTCLOUD_LOG" | tail -n 1)

    if [ -n "$LOG_ENTRY" ]; then
        USER=$(echo "$LOG_ENTRY" | sed -n "s/.*Login failed: '\([^']*\)'.*/\1/p")
        DATE=$(echo "$LOG_ENTRY" | sed -n 's/.*"time":"\([^"]\+\)".*/\1/p' | cut -d'.' -f1 | sed 's/T/ /')
    else
        USER="Unknown"
        DATE="Log rotated?"
    fi

    printf "%-16s | %-15s | %s\n" "$IP" "$USER" "$DATE"
done
