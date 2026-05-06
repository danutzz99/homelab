# Operations

This page explains how the tracked pieces work together during normal
operations. It avoids live endpoints and credentials.

## Boot Flow

```text
Proxmox host boots
  |
  |-- notify-boot.sh waits briefly for network
  |-- attempts to notify n8n through the configured webhook
  `-- falls back to Discord if the n8n path fails

Automation LXC starts
  |
  |-- wait-for-nfs.sh runs before dependent services
  |-- confirms NAS-backed config path is present
  |-- Docker and services start after storage is ready
  `-- vault-unseal.sh waits for Vault and unseals it with injected secret values
```

Tracked files:

- `Scripts/proxmox/notify-boot.sh`
- `Scripts/lxc-automation/wait-for-nfs.sh`
- `Scripts/lxc-automation/vault-unseal.sh`

## Shutdown Flow

```text
Shutdown begins
  |
  |-- notify-shutdown.sh sends event to n8n
  `-- falls back to Discord if n8n is unavailable
```

Tracked file:

- `Scripts/proxmox/notify-shutdown.sh`

The Proxmox README documents the older conditional daily shutdown flow. That
older flow checks a skip flag and the Raspberry Pi before powering down.

External power notes document a replacement flow where Proxmox sets its own RTC
wake alarm before shutting down.

## RTC Power Cycle

```text
02:00 cron
  |
  |-- scheduled_poweroff_until_morning.sh
  |-- check /var/run/skip_shutdown_today
  |-- if skip flag exists: log, notify, clear flag, exit
  |-- if active: calculate morning wake time
  |-- set motherboard RTC wake alarm
  |-- send Discord notification
  `-- shut down Proxmox cleanly

Morning wake time
  |
  `-- motherboard RTC wakes Proxmox
```

Current status:

- The Raspberry Pi control plane is temporarily disabled.
- Automatic morning wake currently depends on the Proxmox RTC schedule.
- Manual remote wake needs an always-on external control plane before it can work
  while Proxmox is powered off.

Documented helper paths from external notes:

- `/usr/local/sbin/scheduled_poweroff_until_morning.sh`
- `/usr/local/bin/not-now`
- `/usr/local/bin/rtc-status`
- `/usr/local/bin/discord-power-notify`
- `/var/lib/homelab-power/last_power_action.env`
- `/var/log/scheduled_power_cycle.log`

The sanitized source files have not yet been promoted into `homelab/Scripts/`.

## Legacy Wake-On-LAN Flow

```text
Operator sends Discord command or API request
  |
  |-- Gogu bot handles Discord commands
  |-- Pi API can expose a POST /wol endpoint
  `-- Raspberry Pi sends Wake-on-LAN packet to Proxmox
```

Tracked files:

- `Scripts/raspberry-pi/gogu_bot.py`
- `Scripts/raspberry-pi/pi_server.py`

This flow is documented for reference, but the Raspberry Pi control plane is
temporarily disabled.

Sensitive values such as the Proxmox MAC address and Discord webhook are
represented as placeholders.

Current caveat:

- Automatic daily wake no longer needs the Pi if the RTC plan is live.
- Discord `!wake` still needs a bot process on an always-on machine, because a
  bot running on Proxmox is unavailable while Proxmox is powered off.

## Vault Recovery Flow

`vault-unseal.sh` waits for Vault to become reachable, checks whether it is
sealed, then runs the unseal command using an injected `VAULT_UNSEAL_KEY`.

It sends a Discord notification when:

- Vault was successfully unsealed.
- Vault did not become available after the retry window.

Do not put the unseal key, Vault token, or Discord webhook in the repository.

## Mail Classifier Flow

The n8n mail classifier is documented under
`Automation/n8n-mail-classifier/`.

```text
Schedule or manual webhook
  |
  |-- fetch Gmail labels
  |-- build labelMap
  |-- fetch candidate messages
  |-- classify each message
  |-- add target labels
  |-- remove stale/conflicting labels
  `-- send final Discord success notification
```

Optional companion workflows:

- Review notifier for messages that need manual attention.
- Error notifier for workflow-level failures.

Live-status caveat:

- `homelab/Automation/` documents the n8n mail classifier.
- Other external notes say n8n may be decommissioned.
- Verify the live service before relying on n8n webhook paths.

## Watchtower

Watchtower is part of the tracked Servarr/media stack on the TrueNAS Docker
environment.

Documented behavior:

- Runs on the TrueNAS Docker host.
- Uses the Docker socket.
- Runs every Monday at 11:00 in the server's configured timezone.
- Sends Discord notifications through a shoutrrr URL configured outside Git.
- Cleans up old images after updates.
- Includes stopped containers.
- Skips `ix*` containers.

Current status:

- Runtime status was reported as exited with code `0`.
- The repo keeps `WATCHTOWER_NOTIFICATION_URL` blank so no webhook is committed.

Operational risk:

- Docker socket access is powerful.
- Prefer label-based updates if only selected containers should auto-update.
- Rotate any webhook that was pasted during setup.

## Alerting Pattern

The repo uses a consistent notification pattern:

1. Try the primary automation path first when available.
2. Fall back to Discord for direct visibility.
3. Keep webhook values in environment variables.
4. Document the variable name, not the live value.

## Maintenance Notes

- Keep `TrueNas/stacks/` and `Portainer/stacks/` synchronized when service
  definitions change.
- If the duplicated Gogu bot files remain, update both copies together.
- If the Proxmox daily shutdown flow is important operationally, add a sanitized
  tracked script file for it rather than leaving it only as a README example.
