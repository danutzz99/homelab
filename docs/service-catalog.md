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
| Nextcloud | LXC | Private cloud and file sharing with database, cache, and ban protection | `README.md`, `docs/current-setup.md` |
| Vault | Automation LXC | Secret storage | `Security/README.md`, `Scripts/lxc-automation/` |
| HoneyAuth | Automation LXC | Lightweight auth gate and honeypot-style alerting for protected apps | `Security/README.md`, `Scripts/lxc-automation/` |
| n8n | Dedicated LXC | Workflow automation and mail-classifier documentation | `Automation/` |
| Tautulli | Automation LXC | Plex monitoring/status | `Scripts/lxc-automation/` |
| Raspberry Pi API | Raspberry Pi, temporarily disabled | Legacy health and Wake-on-LAN API | `Scripts/raspberry-pi/pi_server.py` |
| Gogu bot | Raspberry Pi, temporarily disabled | Legacy operator command interface | `Scripts/raspberry-pi/gogu_bot.py` |
| Power command bot | Proxmox host | Host-local power commands while Proxmox is running | `docs/current-setup.md`, `docs/operations.md` |

Note: the n8n and Nextcloud LXCs were created with
[Proxmox VE Community Scripts](https://community-scripts.org/), a
community-maintained helper-script library for Proxmox LXC and VM setup.

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

Shared media stack paths:

| Host path | Container path | Used by |
|-----------|----------------|---------|
| `/mnt/mainpool/configs/<service>` | `/config` or service config path | App configuration |
| `/mnt/mainpool/media` | `/media` | Media apps and qBittorrent |
| `/mnt/mainpool/configs/cloudflared` | `/etc/cloudflared` | Cloudflared |
| `/var/run/docker.sock` | `/var/run/docker.sock` | Deunhealth |

Compose files use placeholders where each installation provides its own values.

Watchtower note:

- Watchtower is included in the tracked TrueNAS and Portainer media stack
  templates.
- It can be configured to run on a schedule.
- It may appear as `exited code 0` after a successful scheduled run.
- Notification settings are provided by the runtime environment.

Capacitarr note:

- Capacitarr is documented in [TrueNas/capacitarr.md](../TrueNas/capacitarr.md).
- It should remain in dry-run or approval-oriented operation until scoring and
  keep/delete rules have been reviewed against real audit results.
- Runtime API keys, Plex tokens, and the JWT secret stay outside the repo.

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

| Service | Image | Role | Ports |
|---------|-------|------|-------|
| `composetoolbox` | `ghcr.io/bluegoosemedia/composetoolbox` | Browser-based helper for Compose stack work | `3000:3000` |
| `tracktor` | `ghcr.io/javedh-dev/tracktor:latest` | Lightweight app/dashboard data service | `3333:3000` |
| `dockpeek` | `dockpeek/dockpeek:latest` | Docker container visibility through the Docker socket | `3420:8000` |
| `mediamanager` | `ghcr.io/maxdorninger/mediamanager/mediamanager:latest` | Media library manager and inspection UI | `8000:8000` |
| `mediamanager_postgres` | `postgres:17` | Database for MediaManager | none exposed |
| `hb` | `ghcr.io/harborguard/harborguard:latest` | Docker image vulnerability scanner | `2998:8080` |
| `nextexplorer` | `nxzai/explorer:latest` | File explorer for the main pool | `3001:3000` |

Tools stack paths:

| Host path | Container path | Used by |
|-----------|----------------|---------|
| `./composetoolbox/data` | `/app/data` | ComposeToolbox |
| `/mnt/mainpool/configs/tracktor` | `/data` | Tracktor |
| `/mnt/mainpool/configs/mediamanager/app` | `/app/config` | MediaManager app config |
| `/mnt/mainpool/configs/mediamanager/images` | `/data/images` | MediaManager generated image/cache data |
| `/mnt/mainpool/configs/mediamanager/postgres` | `/var/lib/postgresql/data` | MediaManager Postgres |
| `/mnt/mainpool/configs/nextexplorer/config` | `/config` | NextExplorer config |
| `./cache` | `/cache` | NextExplorer cache |
| `/mnt/mainpool` | `/mnt/mainpool` | NextExplorer file browsing |
| `/var/run/docker.sock` | `/var/run/docker.sock` | Dockpeek and HarborGuard |

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

## TrueNAS Catalog Apps

| App | Role | Ports | Tracked in |
|-----|------|-------|------------|
| Jellyfin | Media server and client streaming endpoint | `8096`, `8920` | `TrueNas/jellyfin.md` |

Jellyfin is managed by the TrueNAS Apps/catalog lifecycle, not by the custom
Portainer stack templates.

## Proxy And DNS Stack

Defined in `TrueNas/stacks/nginx-ddns.yaml` and mirrored in
`Portainer/stacks/nginx-ddns.yaml`.

| Service | Image | Role | Ports |
|---------|-------|------|-------|
| `nginx-proxy-manager` | `jc21/nginx-proxy-manager:latest` | Reverse proxy and certificate UI | `8081:80`, `8443:443`, `8181:81` |
| `cloudflare-ddns` | `favonia/cloudflare-ddns:latest` | Dynamic DNS updater | none exposed |

Cloudflare DDNS is configured to run as user `568:568`, read-only, with all
capabilities dropped and `no-new-privileges` enabled.

How the proxy/DDNS stack fits together:

- Nginx Proxy Manager provides the reverse proxy UI and certificate management.
- It uses custom host ports: `8081` for HTTP, `8443` for HTTPS, and `8181` for
  the admin UI.
- Cloudflare DDNS updates DNS records through a runtime-provided Cloudflare API
  token and domain list.
- DDNS has no published port because it only needs outbound access to
  Cloudflare.

## n8n Mail Classifier

Defined under `Automation/n8n-mail-classifier/`.

Tracked workflow files:

| File | Purpose |
|------|---------|
| `mail-classifier-workflow.json` | Main n8n workflow skeleton |
| `mail-classifier-logic.js` | JavaScript classifier implementation |
| `review-notifier-workflow.json` | Optional review notification workflow |
| `error-notifier-workflow.json` | Error notification workflow |
| `workflow-canvas.svg` | Static visual workflow map |

Main workflow behavior:

1. Starts from a configured schedule or a manual trigger.
2. Fetches mail labels.
3. Builds a label lookup map.
4. Fetches candidate messages.
5. Runs each message through classifier logic.
6. Adds target labels.
7. Removes stale or conflicting labels.
8. Sends one success notification.

This section explains the workflow shape at a high level.

## Operational Scripts

| Script | Runs on | Purpose |
|--------|---------|---------|
| `Scripts/proxmox/notify-boot.sh` | Proxmox host | Notify the automation or alert path after boot |
| `Scripts/proxmox/notify-shutdown.sh` | Proxmox host | Notify the automation or alert path during shutdown |
| `Scripts/proxmox/check_nc_bans.sh` | Proxmox host | Summarize active Nextcloud Fail2Ban blocks |
| `Scripts/lxc-automation/wait-for-nfs.sh` | Automation LXC | Wait for NAS-backed mounts before services |
| `Scripts/lxc-automation/vault-unseal.sh` | Automation LXC | Unseal Vault after startup |
| `Scripts/lxc-automation/automation-stack.yaml` | Automation LXC | Vault, Tautulli, and HoneyAuth stack shape |
| `Scripts/lxc-automation/systemd/` | Automation LXC | Startup service templates |
| `Scripts/raspberry-pi/arise.sh` | Raspberry Pi, temporarily disabled | Wake-on-LAN helper |
| `Scripts/raspberry-pi/systemd/` | Raspberry Pi, temporarily disabled | Control-plane service templates |
| `Scripts/raspberry-pi/pi_server.py` | Raspberry Pi, temporarily disabled | Legacy Flask health and Wake-on-LAN API |
| `Scripts/raspberry-pi/gogu_bot.py` | Raspberry Pi, temporarily disabled | Legacy command bot for control and monitoring |

`Scripts/gogu_bot.py` duplicates the Raspberry Pi bot implementation. Keep this
in mind when changing bot behavior.
