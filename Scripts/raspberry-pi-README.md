# Raspberry Pi Automation

The Raspberry Pi was the low-power control plane for the homelab. It is
currently treated as temporarily disabled because the automatic wake path has
moved to Proxmox RTC.

## Tracked Components

| File | Purpose |
|------|---------|
| `raspberry-pi/gogu_bot.py` | Operator command logic for homelab control |
| `raspberry-pi/pi_server.py` | Small HTTP API for health and Wake-on-LAN behavior |
| `raspberry-pi/arise.sh` | Wake-on-LAN helper used by the command bot |
| `raspberry-pi/systemd/` | Service templates for the control API and command bot |

## Role In The Homelab

When active, the Raspberry Pi provides an always-on control point outside the
main Proxmox host. That matters because a bot running only on Proxmox cannot
wake Proxmox while the host is powered off.

The tracked scripts cover:

- Manual wake behavior.
- Basic status and health reporting.
- Operator-facing control.
- A small local API used by the control workflow.

## Current Status

- The Raspberry Pi control plane is temporarily disabled.
- Automatic daily wake no longer depends on the Pi.
- Manual remote wake would need an always-on control point again.

## Runtime Configuration

The Pi scripts rely on runtime configuration such as bot access, wake targets,
API access, and Vault access. Those values are provided by the runtime
environment when the Pi control plane is active.
