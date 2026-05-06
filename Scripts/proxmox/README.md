# Proxmox Host Scripts

This folder describes scripts that run directly on the Proxmox host. They are
used for lifecycle visibility and power-management behavior.

## Tracked Scripts

| Script | Purpose |
|--------|---------|
| `notify-boot.sh` | Sends a startup notification when Proxmox comes online |
| `notify-shutdown.sh` | Sends a shutdown notification before Proxmox goes offline |
| `check_nc_bans.sh` | Summarizes active Nextcloud Fail2Ban blocks for the command bot |

## Notification Flow

The notification flow is simple:

1. Proxmox starts or begins shutting down.
2. The script tries the primary automation notification path.
3. If that path is unavailable, it uses the fallback alert path.
4. The operator still gets visibility into the host lifecycle event.

Notification endpoints are provided by the runtime environment.

## Power Management

The older documented shutdown model depended on the Raspberry Pi being available
before the host powered off. That protected manual Wake-on-LAN access, because
the Pi was the always-on control point.

The newer model moves automatic wake to Proxmox RTC:

- Proxmox prepares the next wake event before shutting down.
- The motherboard RTC wakes the server in the morning.
- The Raspberry Pi is no longer required for the automatic daily wake cycle.
- Manual remote wake still needs an always-on control point if Proxmox is off.

## Service Manifests

The `systemd/` folder contains service templates for running the boot and
shutdown notification scripts from systemd.
