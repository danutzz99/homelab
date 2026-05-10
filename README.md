# Homelab

This repository documents the current homelab layout, tracked Docker stacks,
automation workflows, and operational scripts. It is written so a new reader can
understand the setup quickly.

Runtime-specific values are represented with placeholders or environment
variable names.

## Start Here

[![Overview](https://img.shields.io/badge/Overview-Current_Setup-334155?style=for-the-badge)](docs/current-setup.md)
[![Services](https://img.shields.io/badge/Services-Catalog-0f766e?style=for-the-badge)](docs/service-catalog.md)
[![Map](https://img.shields.io/badge/Repo-Map-64748b?style=for-the-badge)](docs/repository-map.md)
[![Operations](https://img.shields.io/badge/Ops-Boot_and_Power-7c3aed?style=for-the-badge)](docs/operations.md)
[![Safety](https://img.shields.io/badge/Security-Safety_Advice-be123c?style=for-the-badge)](docs/secrets-policy.md)

[![Proxmox](https://img.shields.io/badge/Proxmox-Host-e57000?style=for-the-badge&logo=proxmox&logoColor=white)](docs/current-setup.md#proxmox-host)
[![TrueNAS](https://img.shields.io/badge/TrueNAS-Storage-0095d5?style=for-the-badge&logo=truenas&logoColor=white)](docs/current-setup.md#truenas-scale-vm)
[![Plex](https://img.shields.io/badge/Plex-Media-e5a00d?style=for-the-badge&logo=plex&logoColor=black)](Infrastructure/README.md#plex-vm-optimization)
[![Jellyfin](https://img.shields.io/badge/Jellyfin-Media_Server-00a4dc?style=for-the-badge&logo=jellyfin&logoColor=white)](TrueNas/jellyfin.md)
[![Capacitarr](https://img.shields.io/badge/Capacitarr-Capacity_Manager-7c3aed?style=for-the-badge)](TrueNas/capacitarr.md)
[![Portainer](https://img.shields.io/badge/Portainer-Stacks-13bef9?style=for-the-badge&logo=portainer&logoColor=white)](Portainer/stacks/README.md)
[![Nextcloud](https://img.shields.io/badge/Nextcloud-Cloud-0082c9?style=for-the-badge&logo=nextcloud&logoColor=white)](docs/current-setup.md#nextcloud-lxc)
[![n8n](https://img.shields.io/badge/n8n-Automation-ea4b71?style=for-the-badge&logo=n8n&logoColor=white)](docs/current-setup.md#n8n-lxc)
[![Vault](https://img.shields.io/badge/Vault-Secrets-000000?style=for-the-badge&logo=vault&logoColor=white)](Security/README.md#hashicorp-vault)
[![Cloudflare](https://img.shields.io/badge/Cloudflare-Tunnel_DDNS-f38020?style=for-the-badge&logo=cloudflare&logoColor=white)](Security/README.md#cloudflare)

| Need | Open |
|------|------|
| Understand the whole server | [Current setup](docs/current-setup.md) |
| Find every tracked service | [Service catalog](docs/service-catalog.md) |
| Understand each folder and file | [Repository map](docs/repository-map.md) |
| Keep docs useful without leaking private values | [Safety advice](docs/secrets-policy.md) |
| Follow boot, shutdown, Docker stack, Vault, and alert flows | [Operations](docs/operations.md) |

## Useful Outside References

| Resource | Why it is useful |
|----------|------------------|
| [Proxmox VE Community Scripts](https://community-scripts.org/) | Community-maintained helper scripts for creating and configuring common Proxmox LXCs and VMs |
| [Servers@Home Wiki](https://wiki.serversatho.me/) | Practical ideas and instructions for common Docker apps and TrueNAS Scale setups |

## Useful Outside References

| Resource | Why it is useful |
|----------|------------------|
| [Proxmox VE Community Scripts](https://community-scripts.org/) | Community-maintained helper scripts for creating and configuring common Proxmox LXCs and VMs |
| [Servers@Home Wiki](https://wiki.serversatho.me/) | Practical ideas and instructions for common Docker apps and TrueNAS Scale setups |

## Current Status At A Glance

| Area | Status | What to know first |
|------|--------|--------------------|
| Main host | Active | Proxmox VE runs the VMs, LXCs, and current RTC wake schedule |
| Storage and Docker | Active | TrueNAS Scale provides storage, Portainer-managed stacks, and catalog apps |
| Servarr/media stack | Active | Media automation stack includes Gluetun, qBittorrent, Servarr apps, Cloudflared, Overseerr, Capacitarr, and Watchtower |
| Tools stack | Active | Operational tools include ComposeToolbox, Tracktor, Dockpeek, MediaManager, HarborGuard, and NextExplorer |
| Proxy/DDNS stack | Active | Nginx Proxy Manager handles reverse proxy management; Cloudflare DDNS updates proxied DNS records |
| Jellyfin | Active | TrueNAS catalog app for media streaming |
| Watchtower | Configurable schedule | Container updater in the Servarr/media stack; it may show `exited code 0` after a successful scheduled run |
| Automation LXC | Active | Vault, Tautulli, and HoneyAuth are documented here |
| n8n LXC | Active | Dedicated workflow container; mail-classifier material is documented in `Automation/` |
| Raspberry Pi control plane | Temporarily disabled | Older Wake-on-LAN, health check, and operator-control path |
| Automatic wake | Active through RTC | Current morning wake is handled by Proxmox RTC, not the Raspberry Pi |

## Current Architecture

| Layer | Component | Current role |
|-------|-----------|--------------|
| Hypervisor | Proxmox VE | Runs the homelab VMs and LXCs |
| NAS VM | TrueNAS Scale | Hosts storage, Docker/Portainer-managed stacks, and catalog apps |
| Media VM | Plex | Media streaming with GPU passthrough |
| Automation LXC | Vault, Tautulli, HoneyAuth | Secrets, monitoring, and lightweight app protection |
| n8n LXC | n8n | Workflow automation |
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
- `TrueNas/stacks/main-stack.yaml` is the Servarr/media automation stack.
- `TrueNas/stacks/tools-stack.yaml` is the operational tools stack.
- `TrueNas/stacks/nginx-ddns.yaml` is the reverse proxy and DDNS stack.
- `Portainer/stacks/` contains Portainer-ready templates that mirror the same
  services.
- `Automation/n8n-mail-classifier/` explains the mail-classifier workflow.
- `Scripts/` contains operational script areas for Proxmox, LXCs, and the
  Raspberry Pi control plane.

## Safe Documentation

Configuration values belong in the runtime environment. The repo keeps the
documentation focused on structure, responsibilities, and placeholders.

See [docs/secrets-policy.md](docs/secrets-policy.md) for practical advice on
what belongs in the repo and what stays in the live environment.

## Quick Mental Model

Proxmox runs the server layer. TrueNAS provides storage and runs three
Portainer-managed stack groups: the Servarr/media stack, the operational tools
stack, and the proxy/DDNS stack. The media stack keeps downloads behind Gluetun,
publishes qBittorrent through that VPN container, and connects the Servarr apps
to the shared media dataset. The tools stack provides browser-based operations,
file browsing, Docker visibility, image scanning, and MediaManager. The
proxy/DDNS stack handles Nginx Proxy Manager and Cloudflare DNS updates.
Capacitarr watches the media library from the TrueNAS side and keeps cleanup
decisions gated by scoring, rules, and safety settings. Watchtower belongs to
the Servarr/media stack and can run on a configured schedule, so an `exited code
0` status can mean the last scheduled run finished cleanly. Vault, Tautulli, and
HoneyAuth live in the Automation LXC, while n8n runs from its own LXC. The
Raspberry Pi control plane is temporarily disabled, so the current automatic
wake path is the Proxmox RTC schedule.
