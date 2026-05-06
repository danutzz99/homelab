# Proxmox Host Scripts

Scripts in this folder run directly on the Proxmox host for lifecycle
notifications. A daily shutdown flow is also documented here, but its standalone
script is not currently tracked in the repo.

## Tracked Scripts

| Script | Trigger | Purpose |
|--------|---------|---------|
| `notify-boot.sh` | System boot | Send a boot notification to n8n, with Discord fallback |
| `notify-shutdown.sh` | System shutdown | Send a shutdown notification to n8n, with Discord fallback |

## Notification Flow

```text
System event
  |
  |-- call configured n8n webhook
  |
  |-- if webhook succeeds:
  |     `-- event is handled by automation
  |
  `-- if webhook fails:
        `-- send direct Discord fallback alert
```

Required runtime values:

- `N8N_WEBHOOK_URL` or equivalent webhook placeholder.
- `DISCORD_WEBHOOK` for fallback alerts.

Do not commit live webhook URLs.

## Documented Daily Shutdown Flow

The README documents this operational flow even though the script is not tracked
as a separate file:

```text
02:00 scheduled shutdown check
  |
  |-- skip flag exists at /var/run/skip_shutdown_today?
  |     `-- yes: remove flag and skip shutdown
  |
  |-- Raspberry Pi reachable?
  |     |-- yes: proceed with host shutdown
  |     `-- no: abort shutdown and attempt recovery
```

The reason for this guard is simple: the Raspberry Pi is responsible for
Wake-on-LAN. If the Pi is unavailable when Proxmox powers off, remote wake-up may
not be available.

## Sanitized Script Example

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
  echo "$(date '+%F %T') - Pi is online. Proceeding with shutdown." >> "$LOG"
  /sbin/shutdown -h now
else
  echo "$(date '+%F %T') - Pi is unreachable. Aborting shutdown." >> "$LOG"
  ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no "$PI_USER@$PI_IP" "sudo reboot" >> "$LOG" 2>&1
  exit 1
fi
```

## Repository Gap

If this shutdown behavior is live and important, add a sanitized
`daily_shutdown.sh` file and matching systemd/cron notes so the repo becomes the
source of truth.
