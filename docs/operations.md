# Operations

This page explains how the main pieces work together during normal operations.

## Boot Flow

```text
Proxmox host boots
  |
  |-- notify-boot.sh waits briefly for network
  |-- attempts to notify the automation endpoint
  `-- uses the fallback alert path if the primary path fails

Automation LXC starts
  |
  |-- wait-for-nfs.sh runs before dependent services
  |-- confirms NAS-backed config path is present
  |-- Docker and services start after storage is ready
  `-- vault-unseal.sh waits for Vault and completes the recovery flow
```

Tracked files:

- `Scripts/proxmox/notify-boot.sh`
- `Scripts/proxmox/systemd/proxmox-boot-notify.service`
- `Scripts/lxc-automation/wait-for-nfs.sh`
- `Scripts/lxc-automation/systemd/automation-stack.service`
- `Scripts/lxc-automation/vault-unseal.sh`
- `Scripts/lxc-automation/systemd/vault-unseal.service`

## Shutdown Flow

```text
Shutdown begins
  |
  |-- notify-shutdown.sh sends event to the automation endpoint
  `-- uses the fallback alert path if the primary path is unavailable
```

Tracked file:

- `Scripts/proxmox/notify-shutdown.sh`
- `Scripts/proxmox/systemd/proxmox-shutdown-notify.service`

The Proxmox README documents the older conditional daily shutdown flow. That
older flow checks a skip flag and the Raspberry Pi before powering down.

The current RTC flow replaces that dependency by letting Proxmox set its own
wake alarm before shutting down.

## RTC Power Cycle

```text
Scheduled power cycle
  |
  |-- check whether shutdown should be skipped
  |-- if skip is active: log, notify, clear skip, exit
  |-- if active: calculate next wake time
  |-- set motherboard RTC wake alarm
  |-- send notification
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

## Legacy Wake-On-LAN Flow

```text
Operator sends command or API request
  |
  |-- command bot handles operator commands
  |-- Pi API can expose a POST /wol endpoint
  `-- Raspberry Pi sends Wake-on-LAN packet to Proxmox
```

Tracked files:

- `Scripts/raspberry-pi/gogu_bot.py`
- `Scripts/raspberry-pi/pi_server.py`
- `Scripts/raspberry-pi/arise.sh`
- `Scripts/raspberry-pi/systemd/`

This flow is documented for reference, but the Raspberry Pi control plane is
temporarily disabled.

Current caveat:

- Automatic daily wake no longer needs the Pi when the RTC plan is active.
- Manual remote wake still needs a bot process on an always-on machine, because a
  bot running on Proxmox is unavailable while Proxmox is powered off.

## Vault Recovery Flow

`vault-unseal.sh` waits for Vault to become reachable, checks whether it is
sealed, then completes the unseal flow using values provided by the runtime
environment.

It sends a notification when:

- Vault was successfully unsealed.
- Vault did not become available after the retry window.

## Mail Classifier Flow

The n8n mail classifier is documented under
`Automation/n8n-mail-classifier/`.

```text
Schedule or manual trigger
  |
  |-- fetch mail labels
  |-- build labelMap
  |-- fetch candidate messages
  |-- classify each message
  |-- add target labels
  |-- remove stale/conflicting labels
  `-- send final success notification
```

Optional companion workflows:

- Review notifier for messages that need manual attention.
- Error notifier for workflow-level failures.

This section explains the workflow behavior at a high level.

## Watchtower

Watchtower is part of the tracked Servarr/media stack on the TrueNAS Docker
environment.

Documented behavior:

- Runs on the TrueNAS Docker host.
- Uses the Docker socket.
- Can be configured to run on a schedule.
- Sends notifications through runtime configuration.
- Cleans up old images after updates.
- Includes stopped containers.
- Skips `ix*` containers.

Current status:

- Watchtower may appear as `exited code 0` after a successful scheduled run.
- Notification settings are provided by the runtime environment.

Good practice:

- Docker socket access is powerful.
- Prefer label-based updates if only selected containers should auto-update.
- Rotate tokens and notification endpoints from time to time, especially after
  access changes.

## Alerting Pattern

The repo uses a consistent notification pattern:

1. Try the primary automation path first when available.
2. Use the fallback alert path for direct visibility.
3. Keep notification values in environment variables.
4. Document the variable name, not the configured value.

## Maintenance Notes

- Keep `TrueNas/stacks/` and `Portainer/stacks/` synchronized when service
  definitions change.
- If the duplicated Gogu bot files remain, update both copies together.
- Keep the Proxmox power-cycle overview aligned with the current RTC behavior.
