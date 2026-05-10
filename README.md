# Homelab

This repository documents the current homelab layout, tracked Docker stacks,
automation workflows, and operational scripts. It is written so a new reader can
understand what runs on the server, why each piece exists, and how the services
connect.

Runtime-specific values are represented with placeholders or environment
variable names.

## Start Here

| Need | Open |
|------|------|
| Understand the whole server | [Current setup](docs/current-setup.md) |
| Find every tracked service | [Service catalog](docs/service-catalog.md) |
| Understand each folder and file | [Repository map](docs/repository-map.md) |
| Keep docs useful without leaking private values | [Secrets policy](docs/secrets-policy.md) |
| Follow boot, shutdown, Docker stack, Vault, and alert flows | [Operations](docs/operations.md) |

## Current Status At A Glance

| Area | Status | What to know first |
|------|--------|--------------------|
| Main host | Active | Proxmox VE runs the VMs, LXCs, and current RTC wake schedule |
| Storage and Docker | Active | TrueNAS Scale provides storage, Portainer-managed stacks, and catalog apps |
| Servarr/media stack | Active | Gluetun, qBittorrent, Servarr apps, Cloudflared, Overseerr, Capacitarr, and Watchtower |
| Tools stack | Active | ComposeToolbox, Tracktor, Dockpeek, MediaManager, HarborGuard, and NextExplorer |
| Proxy/DDNS stack | Active | Nginx Proxy Manager handles reverse proxy management; Cloudflare DDNS updates proxied DNS records |
| Jellyfin | Active | TrueNAS catalog app for media streaming |
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

## Important Boundaries

- `TrueNas/stacks/main-stack.yaml` is the Servarr/media automation stack.
- `TrueNas/stacks/tools-stack.yaml` is the operational tools stack.
- `TrueNas/stacks/nginx-ddns.yaml` is the reverse proxy and DDNS stack.
- `Portainer/stacks/` contains Portainer-ready templates that mirror the same
  services.
- `Automation/n8n-mail-classifier/` explains the mail-classifier workflow.
- `Scripts/` contains operational script areas for Proxmox, LXCs, and the
  Raspberry Pi control plane.

## Quick Mental Model

Proxmox runs the server layer. TrueNAS provides storage and runs three
Portainer-managed stack groups: the Servarr/media stack, the operational tools
stack, and the proxy/DDNS stack.

The media stack keeps downloads behind Gluetun, publishes qBittorrent through
that VPN container, and connects the Servarr apps to the shared media dataset.
The tools stack provides browser-based operations, file browsing, Docker
visibility, image vulnerability scanning, and MediaManager. The proxy/DDNS stack
handles Nginx Proxy Manager and Cloudflare DNS updates.

Watchtower belongs to the Servarr/media stack and can run on a configured
schedule, so an `exited code 0` status can mean the last scheduled run finished
cleanly. Vault, Tautulli, and HoneyAuth live in the Automation LXC, while n8n
runs from its own LXC. The Raspberry Pi control plane is temporarily disabled,
so the current automatic wake path is the Proxmox RTC schedule.
