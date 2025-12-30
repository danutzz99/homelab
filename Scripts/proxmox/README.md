# Proxmox Host Scripts

Scripts that run directly on the Proxmox VE host (pve) for system notifications and power management.

## Components

| Script | Trigger | Purpose |
|--------|---------|---------|
| notify-boot.sh | System boot | Sends notification when Proxmox comes online |
| notify-shutdown.sh | System shutdown | Sends notification before Proxmox goes offline |
| daily_shutdown.sh | Cron (02:00) | Conditional shutdown - checks Pi availability first |

## Directory Structure

```
proxmox/
├── scripts/
│   ├── notify-boot.sh       # Boot notification script
│   ├── notify-shutdown.sh   # Shutdown notification script
│   └── daily_shutdown.sh    # Conditional shutdown script
└── systemd/
    ├── proxmox-boot-notify.service
    └── proxmox-shutdown-notify.service
```

## Conditional Shutdown (daily_shutdown.sh)

**Location**: `/usr/local/sbin/daily_shutdown.sh`
**Cron**: `0 2 * * *` (every day at 02:00)

### Logic Flow

```
02:00 AM → Script runs
    │
    ├── Is skip flag set? (/var/run/skip_shutdown_today)
    │   └── Yes → Skip shutdown, remove flag, exit
    │
    ├── Is Pi reachable?
    │   ├── Yes → Proceed with shutdown
    │   └── No → ABORT (server stays on)
    │
    └── If Pi unreachable, attempt SSH reboot (best effort)
```

### Why This Exists

The Raspberry Pi sends Wake-on-LAN to start the server. If the Pi is offline when the server shuts down, it cannot be woken remotely. This script prevents that scenario.

### Script Template

```bash
#!/bin/bash
FLAG="/var/run/skip_shutdown_today"
LOG="/var/log/daily_shutdown.log"
PI_IP="<PI_IP>"
PI_USER="<PI_USER>"

# 1. Check Manual Flag (set by !notnow command)
if [ -f "$FLAG" ]; then
  echo "$(date '+%F %T') - Shutdown skipped due to flag $FLAG" >> "$LOG"
  rm -f "$FLAG"
  exit 0
fi

# 2. Check Raspberry Pi Availability
if ping -c 3 $PI_IP > /dev/null 2>&1; then
  echo "$(date '+%F %T') - Pi ($PI_IP) is ONLINE. Proceeding with shutdown." >> "$LOG"
  /sbin/shutdown -h now
else
  echo "$(date '+%F %T') - CRITICAL: Pi ($PI_IP) is UNREACHABLE. Aborting shutdown." >> "$LOG"
  ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no $PI_USER@$PI_IP "sudo reboot" >> "$LOG" 2>&1
  exit 1
fi
```

## Installation

1. Copy scripts:
   ```bash
   cp scripts/* /root/
   chmod +x /root/notify-*.sh
   ```

2. Copy and enable services:
   ```bash
   cp systemd/* /etc/systemd/system/
   systemctl daemon-reload
   systemctl enable proxmox-boot-notify proxmox-shutdown-notify
   ```

## Notification Flow

```
System Boot
    ↓
30s delay (network stabilization)
    ↓
Try n8n webhook → If fail → Discord fallback
    ↓
Notification sent
```
