#!/bin/bash
# =============================================================================
# wait-for-nfs.sh - Wait for NFS Mounts Before Services
# =============================================================================
# Location: /root/wait-for-nfs.sh (on <AUTOMATION_LXC>)
# Trigger: systemd service before docker.service
# =============================================================================

MAX_ATTEMPTS=60
SLEEP_INTERVAL=10

echo "[$(date)] Waiting for NFS mounts..."

for i in $(seq 1 $MAX_ATTEMPTS); do
    # Try to mount all NFS
    mount -a 2>/dev/null
    
    # Check if vault config exists (indicator NFS is mounted)
    if [ -f /mnt/configs/vault/config/vault.hcl ]; then
        echo "[$(date)] NFS mounts ready! (attempt $i)"
        exit 0
    fi
    
    echo "[$(date)] NFS not ready, waiting... (attempt $i/$MAX_ATTEMPTS)"
    sleep $SLEEP_INTERVAL
done

echo "[$(date)] ERROR: NFS mounts failed after $MAX_ATTEMPTS attempts"
exit 1
