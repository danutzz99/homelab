# Scripts

This directory contains the operational script areas for the homelab.

## Structure

| Area | Purpose |
|------|---------|
| `proxmox/` | Host lifecycle notifications and power-management notes |
| `lxc-automation/` | Automation LXC startup helpers, stack manifest, and service templates |
| `raspberry-pi/` | Legacy Raspberry Pi control-plane scripts |
| `gogu_bot.py` | Duplicate copy of the Raspberry Pi bot kept for reference |

## Proxmox Host Scripts

The Proxmox scripts provide lifecycle visibility. They are intended to send a
notification when the host starts or stops, using the automation path first and a
fallback alert path if the primary path is unavailable.

The Proxmox folder also includes service templates for those lifecycle scripts
and a Nextcloud ban summary helper used by the operator command bot.

The newer power model uses Proxmox RTC wake for the automatic morning wake path.
The older Pi-dependent shutdown flow is kept as historical context.

## Automation LXC Scripts

The Automation LXC scripts coordinate startup dependencies:

- `wait-for-nfs.sh` waits for NAS-backed storage before dependent services start.
- `vault-unseal.sh` handles the Vault recovery flow after reboot using values
  provided by the runtime environment.
- `automation-stack.yaml` shows the Vault, Tautulli, and HoneyAuth container
  stack shape.
- `vault.hcl` shows the Vault server configuration.
- `systemd/` contains service templates for stack startup and Vault recovery.

## Raspberry Pi Scripts

The Raspberry Pi scripts describe the legacy low-power control plane. That plane
is currently treated as temporarily disabled, but the code remains useful as a
reference for manual wake, health, and operator-control behavior.

The Raspberry Pi folder also includes the wake helper and service templates for
the local control API and command bot.

## Runtime Configuration

Script behavior depends on runtime configuration such as notification channels,
service endpoints, and host identifiers. Those values are provided by the
runtime environment.
