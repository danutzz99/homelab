# TrueNAS

TrueNAS Scale is the NAS VM and the Docker hosting layer for the media and
proxy/DDNS stacks.

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

## Stacks

| Stack | File | Purpose |
|-------|------|---------|
| Media stack | [stacks/main-stack.yaml](stacks/main-stack.yaml) | VPN, downloads, indexers, media automation, tunnel, requests, updates |
| Proxy/DDNS stack | [stacks/nginx-ddns.yaml](stacks/nginx-ddns.yaml) | Nginx Proxy Manager and Cloudflare DDNS |

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
| Deunhealth | Docker health monitoring |
| Watchtower | Scheduled container update checks |

## Proxy/DDNS Services

| Service | Role |
|---------|------|
| Nginx Proxy Manager | Reverse proxy and certificate management |
| Cloudflare DDNS | Dynamic DNS updater |

## Secrets

The stack files intentionally contain placeholders or empty values for secrets.
Live values should be injected through Portainer, Vault, or the runtime
environment.

See [../docs/secrets-policy.md](../docs/secrets-policy.md).
