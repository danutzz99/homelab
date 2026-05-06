# Service Catalog

This catalog lists the homelab components described in the repository.

## Infrastructure Services

| Service | Runs on | Role | Tracked in |
|---------|---------|------|------------|
| Proxmox VE | Host | Hypervisor for VMs and LXCs | `Infrastructure/README.md`, `Scripts/proxmox/` |
| TrueNAS Scale | VM | Storage and Docker host | `Infrastructure/README.md`, `TrueNas/` |
| Portainer | TrueNAS custom app | Docker stack management | `TrueNas/README.md`, `Portainer/stacks/` |
| Plex | VM | Media streaming from TrueNAS media storage with GPU support | `README.md`, `Infrastructure/README.md` |
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

## Proxy And DNS Stack

Defined in `TrueNas/stacks/nginx-ddns.yaml` and mirrored in
`Portainer/stacks/nginx-ddns.yaml`.

| Service | Image | Role | Ports |
|---------|-------|------|-------|
| `nginx-proxy-manager` | `jc21/nginx-proxy-manager:latest` | Reverse proxy and certificate UI | `8081:80`, `8443:443`, `8181:81` |
| `cloudflare-ddns` | `favonia/cloudflare-ddns:latest` | Dynamic DNS updater | none exposed |

Cloudflare DDNS is configured to run as user `568:568`, read-only, with all
capabilities dropped and `no-new-privileges` enabled.

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
