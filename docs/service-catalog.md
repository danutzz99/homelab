# Service Catalog

This catalog lists the homelab components described in the repository.

## Infrastructure Services

| Service | Runs on | Role | Tracked in |
|---------|---------|------|------------|
| Proxmox VE | Host | Hypervisor for VMs and LXCs | `Infrastructure/README.md`, `Scripts/proxmox/` |
| TrueNAS Scale | VM | Storage and Docker host | `Infrastructure/README.md`, `TrueNas/` |
| Portainer | TrueNAS custom app | Docker stack management | `TrueNas/README.md`, `Portainer/stacks/` |
| Plex | VM | Media streaming from TrueNAS media storage with GPU support | `README.md`, `Infrastructure/README.md` |
| Jellyfin | TrueNAS catalog app | Media streaming from TrueNAS storage | `TrueNas/jellyfin.md` |
| Nextcloud | LXC | Private cloud and file sharing with database, cache, and ban protection | `docs/current-setup.md` |
| Vault | Automation LXC | Secret storage | `Security/README.md`, `Scripts/lxc-automation/` |
| HoneyAuth | Automation LXC | Lightweight auth gate and alerting for protected apps | `Security/README.md`, `Scripts/lxc-automation/` |
| n8n | Dedicated LXC | Workflow automation and mail-classifier documentation | `Automation/` |
| Tautulli | Automation LXC | Plex monitoring/status | `Scripts/lxc-automation/` |
| Raspberry Pi API | Raspberry Pi, temporarily disabled | Legacy health and Wake-on-LAN API | `Scripts/raspberry-pi/pi_server.py` |
| Gogu bot | Raspberry Pi, temporarily disabled | Legacy operator command interface | `Scripts/raspberry-pi/gogu_bot.py` |

## Media Stack

Defined in `TrueNas/stacks/main-stack.yaml` and mirrored in
`Portainer/stacks/main-stack.yaml`.

| Service | Image | Role | Ports |
|---------|-------|------|-------|
| `gluetun` | `qmcgaw/gluetun` | AirVPN WireGuard gateway | `8080`, `6881/tcp`, `6881/udp` |
| `deunhealth` | `qmcgaw/deunhealth` | Docker health watchdog | none exposed |
| `flaresolverr` | `ghcr.io/flaresolverr/flaresolverr:latest` | Indexer compatibility helper | `8191` |
| `qbittorrent` | `linuxserver/qbittorrent:latest` | Download client through Gluetun | Uses Gluetun network |
| `prowlarr` | `lscr.io/linuxserver/prowlarr:latest` | Indexer manager | `9696` |
| `sonarr` | `lscr.io/linuxserver/sonarr:latest` | TV automation | `8989` |
| `radarr` | `lscr.io/linuxserver/radarr:latest` | Movie automation | `7878` |
| `bazarr` | `lscr.io/linuxserver/bazarr:latest` | Subtitle automation | `6767` |
| `profilarr` | `santiagosayshey/profilarr:latest` | Profile sync | `6868` |
| `cloudflared` | `cloudflare/cloudflared:latest` | Cloudflare tunnel client | none exposed |
| `overseerr` | `lscr.io/linuxserver/overseerr:latest` | Media requests | `5055` |
| `capacitarr` | `ghcr.io/ghent/capacitarr:stable` | Media capacity manager with scoring, rules, and approval safety | `2187` |
| `watchtower` | `nickfedor/watchtower` | Scheduled container update checks in the Servarr/media stack | none exposed |

How the media stack fits together:

- Gluetun is the VPN gateway.
- qBittorrent shares Gluetun's network namespace, so its WebUI and torrent ports
  are published on Gluetun.
- Prowlarr coordinates indexers for Sonarr and Radarr.
- Sonarr and Radarr organize media requests and hand downloads to qBittorrent.
- Bazarr adds subtitle automation.
- Overseerr provides the request interface.
- Capacitarr helps decide what media can be cleaned up safely.
- Watchtower handles scheduled update checks for containers in this stack.

## Tools Stack

Defined in `TrueNas/stacks/tools-stack.yaml` and mirrored in
`Portainer/stacks/tools-stack.yaml`.

| Compose service | Container name | Image | Role | Ports |
|-----------------|----------------|-------|------|-------|
| `composetoolbox` | project-generated | `ghcr.io/bluegoosemedia/composetoolbox` | Browser-based helper for Compose stack work | `3000:3000` |
| `tracktor` | `tracktor` | `ghcr.io/javedh-dev/tracktor:latest` | Lightweight app/dashboard data service | `3333:3000` |
| `dockpeek` | `dockpeek` | `dockpeek/dockpeek:latest` | Docker container visibility through the Docker socket | `3420:8000` |
| `mediamanager` | `mediamanager` | `ghcr.io/maxdorninger/mediamanager/mediamanager:latest` | Media library manager and inspection UI | `8000:8000` |
| `db` | `mediamanager_postgres` | `postgres:17` | Database for MediaManager | none exposed |
| `hb` | project-generated | `ghcr.io/harborguard/harborguard:latest` | Docker image vulnerability scanner | `2998:8080` |
| `nextexplorer` | `nextexplorer` | `nxzai/explorer:latest` | File explorer for the main pool | `3001:3000` |

How the tools stack fits together:

- ComposeToolbox and NextExplorer both listen on container port `3000`, so
  NextExplorer is published on host port `3001`.
- Tracktor also listens on container port `3000`, so it is published on host
  port `3333`.
- HarborGuard listens on container port `8080`, but host port `8080` is already
  used by qBittorrent through Gluetun. It is published as `2998:8080`.
- MediaManager depends on the `db` service healthcheck before starting.
- MediaManager keeps app config and Postgres data in separate host folders so
  app-level permission fixes do not alter database ownership.
- Dockpeek and HarborGuard use the Docker socket, so they are administrative
  tools and should only be reachable from trusted networks.

## Proxy And DNS Stack

Defined in `TrueNas/stacks/nginx-ddns.yaml` and mirrored in
`Portainer/stacks/nginx-ddns.yaml`.

| Compose service | Container name | Image | Role | Ports |
|-----------------|----------------|-------|------|-------|
| `proxy` | `nginx-proxy-manager` | `jc21/nginx-proxy-manager:latest` | Reverse proxy and certificate UI | `8081:80`, `8443:443`, `8181:81` |
| `ddns` | `cloudflare-ddns` | `favonia/cloudflare-ddns:latest` | Dynamic DNS updater | none exposed |

Cloudflare DDNS is configured to run as user `568:568`, read-only, with all
capabilities dropped and `no-new-privileges` enabled.

## TrueNAS Catalog Apps

| App | Role | Ports | Tracked in |
|-----|------|-------|------------|
| Jellyfin | Media server and client streaming endpoint | `8096`, `8920` | `TrueNas/jellyfin.md` |

Jellyfin is managed by the TrueNAS Apps/catalog lifecycle, not by the custom
Portainer stack templates.
