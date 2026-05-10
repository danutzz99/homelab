# TrueNAS

TrueNAS Scale is the NAS VM and the Docker hosting layer for the media,
operations tools, proxy, and DDNS stacks.

For the full server map, see [../docs/current-setup.md](../docs/current-setup.md).

## Role

| Responsibility | Details |
|----------------|---------|
| Storage | ZFS pool and datasets under `/mnt/mainpool` |
| Docker host | Portainer runs as a custom app on TrueNAS Scale |
| Media data | Shared media dataset at `/mnt/mainpool/media` |
| App config | Persistent config dataset at `/mnt/mainpool/configs` |

## Management Model

TrueNAS provides the storage and Docker runtime. Portainer runs as a TrueNAS
custom app and uses the local Docker socket to manage the repo-defined stacks.
The stacks keep long-lived app data under `/mnt/mainpool/configs/<service>` and
media data under `/mnt/mainpool/media`.

Some apps are installed through the TrueNAS catalog instead of the custom
Portainer stacks. Those apps are documented separately when their lifecycle is
managed by TrueNAS Apps.

The Docker side is split into focused stacks:

- The Servarr stack handles media automation and download routing.
- The Tools stack handles operational dashboards, file browsing, vulnerability
  scanning, and media library inspection.
- The Proxy/DDNS stack handles reverse proxy management and Cloudflare DNS
  updates.

## Stacks

| Stack | File | Purpose |
|-------|------|---------|
| Media stack | [stacks/main-stack.yaml](stacks/main-stack.yaml) | VPN, downloads, indexers, media automation, capacity management, tunnel, requests, updates |
| Tools stack | [stacks/tools-stack.yaml](stacks/tools-stack.yaml) | Portainer-side tools, dashboards, file explorer, vulnerability scanning, and MediaManager |
| Proxy/DDNS stack | [stacks/nginx-ddns.yaml](stacks/nginx-ddns.yaml) | Nginx Proxy Manager and Cloudflare DDNS |

## Catalog Apps

| App | Document | Purpose |
|-----|----------|---------|
| Jellyfin | [jellyfin.md](jellyfin.md) | Media streaming from the TrueNAS side |

## Media Stack Services

| Service | Role |
|---------|------|
| Gluetun | VPN gateway using AirVPN/WireGuard |
| qBittorrent | Download client routed through Gluetun |
| Prowlarr | Indexer manager |
| Sonarr | TV automation |
| Radarr | Movie automation |
| Bazarr | Subtitle automation |
| Profilarr | Profile synchronization |
| Flaresolverr | Indexer compatibility helper |
| Cloudflared | Cloudflare Tunnel client |
| Overseerr | Media requests |
| Capacitarr | Media library capacity management and cleanup scoring |
| Deunhealth | Docker health monitoring |
| Watchtower | Scheduled container update checks |

See [capacitarr.md](capacitarr.md) for the Capacitarr deployment notes,
compose excerpt, and safety settings.

## Tools Stack Services

| Service | Role |
|---------|------|
| ComposeToolbox | Browser-based Compose helper for stack work |
| Tracktor | Lightweight app/dashboard data stored under `/mnt/mainpool/configs/tracktor` |
| Dockpeek | Docker container visibility through the Docker socket |
| MediaManager | Media library management and inspection |
| MediaManager Postgres | Database for MediaManager |
| HarborGuard | Docker image vulnerability scanning and security reporting |
| NextExplorer | File explorer for browsing `/mnt/mainpool` |

The Tools stack uses host ports that avoid conflicts with the media stack and
with each other. For example, ComposeToolbox uses `3000:3000`, while
NextExplorer uses `3001:3000` because it also listens on container port `3000`.

Dockpeek and HarborGuard mount `/var/run/docker.sock`. That gives them powerful
visibility into Docker and should be treated as administrative access.

## Proxy/DDNS Services

| Service | Role |
|---------|------|
| Nginx Proxy Manager | Reverse proxy and certificate management |
| Cloudflare DDNS | Dynamic DNS updater |

## Secrets

The stack files intentionally contain placeholders or empty values for secrets.
Live values should be injected through Portainer, Vault, or the runtime
environment.

See [../docs/secrets-policy.md](../docs/secrets-policy.md) for safe
documentation guidance.
