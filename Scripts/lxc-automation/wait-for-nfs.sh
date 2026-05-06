#!/bin/bash
# =============================================================================
# wait-for-nfs.sh - Wait for NFS Mounts Before Services
# =============================================================================

MAX_ATTEMPTS=60
SLEEP_INTERVAL=10
NFS_READY_FILE="${NFS_READY_FILE:-/mnt/configs/vault/config/vault.hcl}"

echo "[$(date)] Waiting for NFS mounts..."

for i in $(seq 1 $MAX_ATTEMPTS); do
    # Try to mount all NFS
    mount -a 2>/dev/null
    
    # Check for a file that should only exist once storage is mounted.
    if [ -f "$NFS_READY_FILE" ]; then
        echo "[$(date)] NFS mounts ready! (attempt $i)"
        exit 0
    fi
    
    echo "[$(date)] NFS not ready, waiting... (attempt $i/$MAX_ATTEMPTS)"
    sleep $SLEEP_INTERVAL
done

echo "[$(date)] ERROR: NFS mounts failed after $MAX_ATTEMPTS attempts"
exit 1
