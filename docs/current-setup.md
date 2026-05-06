# Current Setup

This page describes the current homelab as represented by the repository.
Sensitive values are intentionally omitted.

## Current Status Summary

| Area | Current state |
|------|---------------|
| Proxmox VE | Main host and current RTC power scheduler |
| TrueNAS Scale | Storage VM and Docker/Portainer host |
| Automation LXC | Vault, Tautulli, and documented n8n workflow location |
| n8n | Stored in repo as workflow docs/exports; verify live service state before changing schedules or webhooks |
| Raspberry Pi | Temporarily disabled legacy control plane |
| Automatic wake | Handled by Proxmox RTC schedule |
| Watchtower | Part of the Servarr/media stack; current runtime status noted as exited with code 0 |

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
|-- Automation LXC: Vault, Tautulli, n8n docs/status to verify
|-- Client LXC: Nextcloud
|-- Reactive Resume LXC: resume app and local Ollama, from external notes
`-- RTC power automation: scheduled shutdown/wake, from external notes

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
- External power notes document a newer RTC-based power cycle where Proxmox sets
  its own motherboard wake alarm before shutting down.

Operational notes:

- A conditional daily shutdown flow is documented in
  `Scripts/proxmox/README.md`.
- The daily shutdown script itself is described as existing on the host, but is
  not currently tracked as a standalone script file in this repository.
- The newer RTC plan replaces the Raspberry Pi dependency for the automatic
  daily shutdown/wake cycle, but the sanitized scripts are not yet copied into
  this repo.

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
- Scheduled for Monday at 11:00 in the server's configured timezone.
- Configured to clean up old images and include stopped containers.
- Configured to skip `ix*` containers.
- Current runtime status was reported as exited with code `0`.
- Notification URL is intentionally blank in Git; configure the live shoutrrr
  Discord URL outside the repo.

## Proxy And DDNS Stack

The proxy/DDNS stack is defined in:

- `TrueNas/stacks/nginx-ddns.yaml`
- `Portainer/stacks/nginx-ddns.yaml`

Tracked services:

- Nginx Proxy Manager
- Cloudflare DDNS

The Cloudflare API token and domain list are intentionally placeholders.

## Automation LXC

The Automation LXC is documented as the place for Vault, Tautulli, and n8n
workflow material.

Tracked scripts:

- `Scripts/lxc-automation/wait-for-nfs.sh`
- `Scripts/lxc-automation/vault-unseal.sh`

Responsibilities:

- Wait for NAS-backed mounts before dependent services start.
- Unseal Vault after boot using values injected from the deployment
  environment.
- Send success or failure notifications through a Discord webhook.
- Host n8n workflows, including the mail classifier documented under
  `Automation/n8n-mail-classifier/`.

Important live-status note:

- The `homelab` repo contains n8n workflow documentation and sanitized workflow
  exports.
- Other external references say n8n was decommissioned and that Vault/Tautulli
  remain in the Automation LXC.
- Treat n8n as "documented here, verify before assuming live."

## Nextcloud LXC

Nextcloud is documented as a client-facing LXC on the Proxmox host.

Tracked design:

- Storage is backed by two physical HDDs grouped through LVM on the host.
- Storage is passed into the LXC through bind mounts.
- Group Folders provides a shared workspace for family users.
- External access goes through the tunnel and reverse proxy.
- Brute-force protection and jail-based blocking are enabled.

No live usernames, domains, IP addresses, passwords, or mount UUIDs are tracked.

## Raspberry Pi Control Plane

The Raspberry Pi was the low-power control plane for operational access. It is
currently treated as temporarily disabled, so it is not the active automatic wake
path.

Tracked files:

- `Scripts/raspberry-pi/gogu_bot.py`
- `Scripts/raspberry-pi/pi_server.py`
- `Scripts/raspberry-pi-README.md`

Responsibilities:

- Previously woke the Proxmox host through Wake-on-LAN.
- Previously checked Proxmox, Vault, Tautulli, Pi, and security status.
- Previously provided Discord commands for manual operations.
- Previously provided a small HTTP API for health checks and Wake-on-LAN.

Current power-control caveat from external notes:

- The automatic daily shutdown/wake cycle no longer depends on the Pi.
- The current automatic wake path is the Proxmox RTC schedule.
- A small power-only Gogu bot is documented as running on Proxmox, so power
  commands work while Proxmox is on.
- Manual Discord wake still needs an always-on bot host plus WOL, BMC, IPMI, or
  another external wake method.

## Reactive Resume And Ollama

External application notes document Reactive Resume as deployed through a
Proxmox community-script LXC rather than through a Portainer Compose draft.

Documented shape:

- Reactive Resume listens on port `3000`.
- Ollama is installed inside the same LXC.
- Ollama remains local to the LXC and is reached through loopback.
- The first tested model is `qwen2.5:1.5b`.
- The local AI integration required an application allowlist/source patch in the
  notes.

This service is not yet represented by first-class files in the `homelab` repo.

## Source Of Truth Notes

- `TrueNas/stacks/` is the clearest Docker Compose representation.
- `Portainer/stacks/` mirrors the same stacks in a compact template style.
- `Scripts/gogu_bot.py` and `Scripts/raspberry-pi/gogu_bot.py` currently contain
  the same bot implementation. If the legacy Raspberry Pi control plane is
  enabled again, treat the Raspberry Pi path as the clearer operational location
  and keep duplicates synchronized if both remain.
- External power and application notes contain newer operational details for
  Reactive Resume, Ollama, and power scripts that should be promoted into
  sanitized tracked files when this repo is ready to become the only source of
  truth.
