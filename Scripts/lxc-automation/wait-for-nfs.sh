#!/bin/bash
# wait-for-nfs.sh - Wait for NFS Mounts
# Location: /root/wait-for-nfs.sh (LXC 101)
# No secrets required

MAX_ATTEMPTS=60
SLEEP_INTERVAL=10

for i in $(seq 1 $MAX_ATTEMPTS); do
    mount -a 2>/dev/null
    if [ -f /mnt/configs/vault/config/vault.hcl ]; then
        echo "NFS ready"
        exit 0
    fi
    sleep $SLEEP_INTERVAL
done

echo "NFS mount failed"
exit 1
