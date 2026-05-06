#!/bin/bash
# =============================================================================
# arise.sh - Wake The Proxmox Host
# =============================================================================

TARGET_MAC="${PROXMOX_MAC_ADDRESS:-<PROXMOX_MAC_ADDRESS>}"

echo "[$(date)] Sending Wake-on-LAN packet"
wakeonlan "$TARGET_MAC"
