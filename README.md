# Homelab

This repository documents the current homelab layout, tracked Docker stacks,
automation workflows, and operational scripts. It is written so a new reader can
understand the setup quickly.

Runtime-specific values are represented with placeholders or environment
variable names.

## Start Here

| Need | Open |
|------|------|
| Understand the whole server | [Current setup](docs/current-setup.md) |
| Find every tracked service | [Service catalog](docs/service-catalog.md) |
| Understand each folder and file | [Repository map](docs/repository-map.md) |
| Check what must never be committed | [Secrets policy](docs/secrets-policy.md) |
| Follow boot, shutdown, Vault, and alert flows | [Operations](docs/operations.md) |

## Current Status At A Glance

| Area | Status | What to know first |
|------|--------|--------------------|
| Main host | Active | Proxmox VE runs the VMs, LXCs, and current RTC wake schedule |
| Storage and Docker | Active | TrueNAS Scale provides storage and hosts Portainer-managed stacks |
| Servarr/media stack | Active | Media automation stack includes Gluetun, qBittorrent, Servarr apps, Cloudflared, Overseerr, and Watchtower |
| Watchtower | Configurable schedule | Container updater in the Servarr/media stack; it may show `exited code 0` after a successful scheduled run |
| Automation LXC | Active | Vault, Tautulli, and n8n workflow material are documented here |
| Raspberry Pi control plane | Temporarily disabled | Older Wake-on-LAN, health check, and operator-control path |
| Automatic wake | Active through RTC | Current morning wake is handled by Proxmox RTC, not the Raspberry Pi |

## Current Architecture

| Layer | Component | Current role |
|-------|-----------|--------------|
| Hypervisor | Proxmox VE | Runs the homelab VMs and LXCs |
| NAS VM | TrueNAS Scale | Hosts storage and Docker/Portainer-managed stacks |
| Media VM | Plex | Media streaming with GPU passthrough |
| Automation LXC | Vault, n8n, Tautulli | Secrets, workflows, monitoring, and notifications |
| Client LXC | Nextcloud | Private cloud and family file sharing |
| Raspberry Pi | Temporarily disabled | Older Wake-on-LAN, health check, and operator command plane |
| Proxmox host | RTC power automation | Current scheduled shutdown and morning wake path |

## Repository Layout

```text
homelab/
|-- docs/                    # Start-here documentation and service catalog
|-- Automation/              # n8n workflow docs and workflow exports
|-- Infrastructure/          # Proxmox, TrueNAS, storage, and VM notes
|-- Portainer/               # Portainer stack templates
|-- Scripts/                 # Operational scripts for Proxmox, LXC, and Pi
|-- Security/                # Vault, Cloudflare, and security notes
`-- TrueNas/                 # TrueNAS app and stack documentation
```

## Important Boundaries

- `TrueNas/stacks/` contains the main Docker Compose stack definitions used by
  the TrueNAS/Portainer side of the setup.
- `Portainer/stacks/` contains compact Portainer-oriented stack templates that
  mirror the same services.
- `Automation/n8n-mail-classifier/` explains the mail-classifier workflow.
- `Scripts/` contains operational script areas for Proxmox, LXCs, and the
  Raspberry Pi control plane.

## Secrets

Configuration values belong in the runtime environment. The repo keeps the
documentation focused on structure, responsibilities, and placeholders.

See [docs/secrets-policy.md](docs/secrets-policy.md) for the detailed
placeholder convention.

## Quick Mental Model

Proxmox runs the server layer. TrueNAS provides storage and runs the media/proxy
containers through Portainer. Watchtower belongs to the Servarr/media stack and
can run on a configured schedule, so an `exited code 0` status can mean the last
scheduled run finished cleanly. Vault stores automation secrets in the
Automation LXC, alongside the documented n8n workflow material. The Raspberry Pi
control plane is temporarily disabled, so the current automatic wake path is the
Proxmox RTC schedule. Manual remote wake would need an always-on control host
before it can work independently of Proxmox.
