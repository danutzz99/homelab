# Current Setup

This page describes the current homelab at a high level.

## Current Status Summary

| Area | Current state |
|------|---------------|
| Proxmox VE | Main host and current RTC power scheduler |
| TrueNAS Scale | Storage VM and Docker/Portainer host |
| Automation LXC | Vault, Tautulli, and n8n workflow material |
| n8n | Mail-classifier workflow overview |
| Raspberry Pi | Temporarily disabled legacy control plane |
| Automatic wake | Handled by Proxmox RTC schedule |
| Watchtower | Updater in the Servarr/media stack; can run on a configured schedule and may show `exited code 0` after a successful run |

## Topology

```text
Internet / external access
        |
        | Cloudflare Tunnel / proxied DNS
        v
TrueNAS Scale VM
        |
        | Portainer-managed Docker stacks
        v
Media, proxy, DDNS, and tunnel containers

Proxmox VE host
|-- TrueNAS Scale VM
|-- Plex VM
|-- Automation LXC: Vault, Tautulli, n8n workflow material
|-- Client LXC: Nextcloud
`-- RTC power automation: scheduled shutdown/wake

Raspberry Pi
`-- Temporarily disabled legacy control plane
```

## Proxmox Host

Proxmox VE is the physical host and hypervisor.

Tracked details:

- TrueNAS VM uses CPU type `host` for AES-NI passthrough.
- TrueNAS VM uses fixed memory allocation with no ballooning.
- TrueNAS VM uses a VirtIO SCSI controller.
- Plex VM has NVIDIA GTX 1070 PCI passthrough.
- Proxmox lifecycle notifications are represented by scripts in
  `Scripts/proxmox/`.
- Service templates for those lifecycle scripts are in
  `Scripts/proxmox/systemd/`.
- The Nextcloud ban summary helper is tracked in `Scripts/proxmox/`.
- The current RTC-based power cycle lets Proxmox set its own motherboard wake
  alarm before shutting down.

Operational notes:

- A conditional daily shutdown flow is documented in
  `Scripts/proxmox/README.md`.
- The newer RTC plan replaces the Raspberry Pi dependency for the automatic
  daily shutdown/wake cycle.

## TrueNAS Scale VM

TrueNAS Scale provides the storage layer and hosts Portainer as a custom app.

Tracked storage layout:

| Path | Purpose |
|------|---------|
| `/mnt/mainpool` | Main ZFS pool root |
| `/mnt/mainpool/media` | Shared media dataset |
| `/mnt/mainpool/configs` | Persistent app configuration dataset |

Tracked app user:

| Setting | Value |
|---------|-------|
| PUID | `568` |
| PGID | `568` |

The Docker stacks mount persistent configuration under
`/mnt/mainpool/configs/<service>` and shared media under `/mnt/mainpool/media`.

## Media Stack

The media stack is defined in:

- `TrueNas/stacks/main-stack.yaml`
- `Portainer/stacks/main-stack.yaml`

Main responsibilities:

- VPN-protected download traffic through Gluetun.
- qBittorrent routed through the Gluetun network namespace.
- Sonarr, Radarr, Prowlarr, Bazarr, Profilarr, and Overseerr for media
  automation.
- Flaresolverr for indexer compatibility.
- Cloudflared for outbound tunnel connectivity.
- Deunhealth for Docker health monitoring.
- Watchtower for scheduled container update checks in the Servarr/media stack.

Watchtower status:

- Defined in the tracked TrueNAS and Portainer media stack templates.
- Can be configured to run on a schedule.
- Configured to clean up old images and include stopped containers.
- Configured to skip `ix*` containers.
- May appear as `exited code 0` after a successful scheduled run.
- Notification settings are provided by the runtime environment.

## Proxy And DDNS Stack

The proxy/DDNS stack is defined in:

- `TrueNas/stacks/nginx-ddns.yaml`
- `Portainer/stacks/nginx-ddns.yaml`

Tracked services:

- Nginx Proxy Manager
- Cloudflare DDNS

External DNS values are supplied by the deployment environment.

## Automation LXC

The Automation LXC is documented as the place for Vault, Tautulli, and n8n
workflow material.

Tracked scripts:

- `Scripts/lxc-automation/wait-for-nfs.sh`
- `Scripts/lxc-automation/vault-unseal.sh`
- `Scripts/lxc-automation/automation-stack.yaml`
- `Scripts/lxc-automation/systemd/`

Responsibilities:

- Wait for NAS-backed mounts before dependent services start.
- Unseal Vault after boot using values injected from the deployment
  environment.
- Send success or failure notifications through the configured notification
  channel.
- Host n8n workflows, including the mail classifier documented under
  `Automation/n8n-mail-classifier/`.

The repo contains a general workflow map and supporting logic for the
mail-classifier flow.

## Nextcloud LXC

Nextcloud is documented as a client-facing LXC on the Proxmox host.

Tracked design:

- Storage is backed by two physical HDDs grouped through LVM on the host.
- Storage is passed into the LXC through bind mounts.
- Group Folders provides a shared workspace for family users.
- External access goes through the tunnel and reverse proxy.
- Brute-force protection and jail-based blocking are enabled.

## Raspberry Pi Control Plane

The Raspberry Pi was the low-power control plane for operational access. It is
currently treated as temporarily disabled, so it is not the active automatic wake
path.

Tracked files:

- `Scripts/raspberry-pi/gogu_bot.py`
- `Scripts/raspberry-pi/pi_server.py`
- `Scripts/raspberry-pi/arise.sh`
- `Scripts/raspberry-pi/systemd/`
- `Scripts/raspberry-pi-README.md`

Responsibilities:

- Previously woke the Proxmox host through Wake-on-LAN.
- Previously checked Proxmox, Vault, Tautulli, Pi, and security status.
- Previously provided operator commands for manual operations.
- Previously provided a small HTTP API for health checks and Wake-on-LAN.

Current power-control caveat:

- The automatic daily shutdown/wake cycle no longer depends on the Pi.
- The current automatic wake path is the Proxmox RTC schedule.
- A small power-only command bot can run while Proxmox is on.
- Manual remote wake still needs an always-on control host plus WOL, BMC, IPMI, or
  another external wake method.

## Where To Look First

- `TrueNas/stacks/` shows the Docker Compose layout.
- `Portainer/stacks/` mirrors the same stacks in a compact template style.
- `Scripts/` groups host, LXC, and Raspberry Pi helper areas.
- `Automation/n8n-mail-classifier/` explains the mail-classifier workflow.
- `Security/` explains the Vault role in the setup.
