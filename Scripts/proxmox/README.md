# Proxmox Host Scripts

Scripts that run directly on the Proxmox host for lifecycle notifications and power management.

## Components

| Script | Trigger | Purpose |
|--------|---------|---------|
| `notify-boot.sh` | System boot | Sends a notification when Proxmox comes online |
| `notify-shutdown.sh` | System shutdown | Sends a notification before Proxmox goes offline |
| `daily_shutdown.sh` | Cron at 02:00 | Conditional shutdown that checks Raspberry Pi availability first |

## Directory Structure

```text
proxmox/
|-- scripts/
|   |-- notify-boot.sh       # Boot notification script
|   |-- notify-shutdown.sh   # Shutdown notification script
|   `-- daily_shutdown.sh    # Conditional shutdown script
`-- systemd/
    |-- proxmox-boot-notify.service
    `-- proxmox-shutdown-notify.service
```

## Conditional Shutdown

Location: `/usr/local/sbin/daily_shutdown.sh`
Cron: `0 2 * * *`

### Logic Flow

```text
02:00 -> Script starts
  |
  |-- Is the skip flag present? (/var/run/skip_shutdown_today)
  |     `-- Yes -> Skip shutdown, remove flag, exit
  |
  |-- Is the Raspberry Pi reachable?
  |     |-- Yes -> Proceed with shutdown
  |     `-- No  -> Abort shutdown and attempt recovery
  |
  `-- If the Pi is unreachable, attempt an SSH reboot as a best-effort recovery step
```

### Why This Exists

The Raspberry Pi is responsible for Wake-on-LAN automation. If the Pi is offline when the server shuts down, remote wake-up is no longer available. This guard prevents that scenario.

### Script Example

```bash
#!/bin/bash
FLAG="/var/run/skip_shutdown_today"
LOG="/var/log/daily_shutdown.log"
PI_IP="<PI_IP>"
PI_USER="<PI_USER>"

if [ -f "$FLAG" ]; then
  echo "$(date '+%F %T') - Shutdown skipped due to flag $FLAG" >> "$LOG"
  rm -f "$FLAG"
  exit 0
fi

if ping -c 3 "$PI_IP" > /dev/null 2>&1; then
  echo "$(date '+%F %T') - Pi ($PI_IP) is online. Proceeding with shutdown." >> "$LOG"
  /sbin/shutdown -h now
else
  echo "$(date '+%F %T') - Pi ($PI_IP) is unreachable. Aborting shutdown." >> "$LOG"
  ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no "$PI_USER@$PI_IP" "sudo reboot" >> "$LOG" 2>&1
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

```text
System boot
  -> short startup delay
  -> try automation endpoint
  -> if that fails, use the fallback Discord alert path
  -> notification sent
```
