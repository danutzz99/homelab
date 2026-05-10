# Current Setup

This page describes the current homelab at a high level.

## Current Status Summary

| Area | Current state |
|------|---------------|
| Proxmox VE | Main host and current RTC power scheduler |
| TrueNAS Scale | Storage VM and Docker/Portainer host |
| Automation LXC | Vault, Tautulli, and HoneyAuth |
| n8n LXC | Dedicated workflow container; mail-classifier overview is tracked in `Automation/` |
| Raspberry Pi | Temporarily disabled legacy control plane |
| Automatic wake | Handled by Proxmox RTC schedule |
| Jellyfin | Deployed TrueNAS catalog app for media streaming |
| Capacitarr | Deployed media capacity manager in the TrueNAS media stack |
| Tools stack | Portainer stack for ComposeToolbox, Tracktor, Dockpeek, MediaManager, HarborGuard, and NextExplorer |
| Proxy/DDNS stack | Nginx Proxy Manager and Cloudflare DDNS |

## Topology

```text
Internet / external access
        |
        | Cloudflare Tunnel / proxied DNS
        v
TrueNAS Scale VM
        |
        | Portainer-managed Docker stacks and TrueNAS catalog apps
        v
Media, tools, proxy, DDNS, tunnel, and catalog app containers
```

## TrueNAS Scale VM

TrueNAS Scale provides the storage layer and hosts Portainer as a custom app.
Portainer talks to the local Docker socket and manages the Docker stacks tracked
in this repo. TrueNAS also hosts selected catalog apps directly, including
Jellyfin.

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

The Portainer-managed side is split into three Compose stacks:

| Stack | File | Responsibility |
|-------|------|----------------|
| Servarr/media | `TrueNas/stacks/main-stack.yaml` | VPN-routed downloads, media automation, requests, updates, and media capacity management |
| Tools | `TrueNas/stacks/tools-stack.yaml` | Operational dashboards, Docker visibility, file browsing, image vulnerability scans, and MediaManager |
| Proxy/DDNS | `TrueNas/stacks/nginx-ddns.yaml` | Nginx Proxy Manager and Cloudflare dynamic DNS updates |

## Media Stack

The media stack is defined in:

- `TrueNas/stacks/main-stack.yaml`
- `Portainer/stacks/main-stack.yaml`

qBittorrent does not publish its own ports because it shares Gluetun's network
namespace. The WebUI and torrent ports are published on Gluetun instead. This is
why Gluetun exposes `8080`, `6881/tcp`, and `6881/udp`.

## Tools Stack

The tools stack is defined in:

- `TrueNas/stacks/tools-stack.yaml`
- `Portainer/stacks/tools-stack.yaml`

| Service | Host port | Container port | Why |
|---------|-----------|----------------|-----|
| ComposeToolbox | `3000` | `3000` | Native app port |
| NextExplorer | `3001` | `3000` | Avoids conflict with ComposeToolbox |
| Tracktor | `3333` | `3000` | Avoids the other apps that listen on `3000` internally |
| Dockpeek | `3420` | `8000` | Keeps Docker visibility on a distinct admin port |
| MediaManager | `8000` | `8000` | Native app port |
| HarborGuard | `2998` | `8080` | Avoids qBittorrent WebUI on host port `8080` |

Dockpeek and HarborGuard mount `/var/run/docker.sock`. Any service with that
mount should be treated as an administrative Docker tool and kept behind trusted
network access.

## Proxy And DDNS Stack

The proxy/DDNS stack is defined in:

- `TrueNas/stacks/nginx-ddns.yaml`
- `Portainer/stacks/nginx-ddns.yaml`

| Purpose | Host port | Container port |
|---------|-----------|----------------|
| HTTP | `8081` | `80` |
| HTTPS | `8443` | `443` |
| Admin UI | `8181` | `81` |

Cloudflare DDNS does not publish a web port. It only needs its Cloudflare API
token and domain list from the runtime environment.
