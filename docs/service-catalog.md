# Service Catalog

This catalog lists the services represented in the repository. It is based only
on tracked files and sanitized documentation.

## Infrastructure Services

| Service | Runs on | Role | Tracked in |
|---------|---------|------|------------|
| Proxmox VE | Host | Hypervisor for VMs and LXCs | `Infrastructure/README.md`, `Scripts/proxmox/` |
| TrueNAS Scale | VM | Storage and Docker host | `Infrastructure/README.md`, `TrueNas/` |
| Portainer | TrueNAS custom app | Docker stack management | `TrueNas/README.md`, `Portainer/stacks/` |
| Plex | VM | Media streaming | `README.md`, `Infrastructure/README.md` |
| Nextcloud | LXC | Private cloud and file sharing | `README.md`, `docs/current-setup.md` |
| Vault | Automation LXC | Secret storage | `Security/README.md`, `Scripts/lxc-automation/` |
| n8n | Automation LXC, historical/verify | Workflow documentation and older mail automation | `Automation/` |
| Tautulli | Automation LXC | Plex monitoring/status | `Scripts/raspberry-pi/gogu_bot.py` |
| Raspberry Pi API | Raspberry Pi, temporarily disabled | Legacy health and Wake-on-LAN API | `Scripts/raspberry-pi/pi_server.py` |
| Gogu bot | Raspberry Pi, temporarily disabled | Legacy Discord command interface | `Scripts/raspberry-pi/gogu_bot.py` |
| Gogu power bot | Proxmox host, from external notes | Power-only Discord commands while Proxmox is on | External notes, not tracked here |
| Reactive Resume | Proxmox LXC, from external notes | Resume app | External notes, not tracked here |
| Ollama | Reactive Resume LXC, from external notes | Local AI backend for Reactive Resume | External notes, not tracked here |

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

Sensitive values are represented as empty placeholders in the Compose files.

Watchtower note:

- Watchtower is included in the tracked TrueNAS and Portainer media stack
  templates.
- Schedule: Monday 11:00 in the server's configured timezone.
- Current runtime status was reported as exited with code `0`.
- `WATCHTOWER_NOTIFICATION_URL` is intentionally blank in Git. Store the live
  shoutrrr Discord URL outside the repository.

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
| `discord-classifier-review.json` | Optional review notification workflow |
| `discord-error-notifier.json` | Error notification workflow |
| `workflow-canvas.svg` | Static visual workflow map |

Main workflow behavior:

1. Starts every 3 hours at minute `:01` or through a manual webhook.
2. Fetches Gmail labels.
3. Builds a label lookup map.
4. Fetches candidate messages.
5. Runs each message through classifier logic.
6. Adds target labels.
7. Removes stale or conflicting labels.
8. Sends one success notification to Discord.

Live-status caveat:

- The workflow docs are useful and sanitized.
- External notes describe n8n as decommissioned while keeping Vault and
  Tautulli in the Automation LXC.
- Verify live n8n status before scheduling changes or relying on webhooks.

## Externally Documented Services

These services are documented in external notes but are not fully represented in
the `homelab` repo yet.

| Service | Source | Status in this repo |
|---------|--------|---------------------|
| Proxmox RTC power cycle | External power notes | Mentioned in docs, scripts not copied |
| Gogu power bot | External power notes | Mentioned in docs, service not copied |
| Reactive Resume | External application notes | Mentioned in docs, LXC deployment not tracked |
| Ollama for Reactive Resume | External application notes | Mentioned in docs, LXC setup not tracked |
| Vaultwarden draft | External historical notes | Historical draft, not included as current service |
| HoneyAuth | External experimental notes | Planned/experimental, not current deployment |

## Operational Scripts

| Script | Runs on | Purpose |
|--------|---------|---------|
| `Scripts/proxmox/notify-boot.sh` | Proxmox host | Notify n8n or Discord after boot |
| `Scripts/proxmox/notify-shutdown.sh` | Proxmox host | Notify n8n or Discord during shutdown |
| `Scripts/lxc-automation/wait-for-nfs.sh` | Automation LXC | Wait for NAS-backed mounts before services |
| `Scripts/lxc-automation/vault-unseal.sh` | Automation LXC | Unseal Vault after startup |
| `Scripts/raspberry-pi/pi_server.py` | Raspberry Pi, temporarily disabled | Legacy Flask health and Wake-on-LAN API |
| `Scripts/raspberry-pi/gogu_bot.py` | Raspberry Pi, temporarily disabled | Legacy Discord bot for control and monitoring |

`Scripts/gogu_bot.py` duplicates the Raspberry Pi bot implementation. Keep this
in mind when changing bot behavior.
