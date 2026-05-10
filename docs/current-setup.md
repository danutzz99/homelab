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
| Watchtower | Updater in the Servarr/media stack; can run on a configured schedule and may show `exited code 0` after a successful run |
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

Proxmox VE host
|-- TrueNAS Scale VM
|-- Plex VM
|-- Automation LXC: Vault, Tautulli, HoneyAuth
|-- n8n LXC: workflow automation
|-- Client LXC: Nextcloud
`-- RTC power automation: scheduled shutdown/wake

Raspberry Pi
`-- Temporarily disabled legacy control plane
```

## Proxmox Host

Proxmox VE is the physical host and hypervisor. The inspected host is running
Proxmox VE 9.x on Debian 13.

Tracked details:

- TrueNAS VM uses an AES-capable virtual CPU model.
- TrueNAS VM uses fixed memory allocation with no ballooning.
- TrueNAS VM uses a VirtIO SCSI controller.
- TrueNAS VM passes physical storage disks through to the guest.
- Plex VM uses QEMU guest agent support and NVIDIA GTX 1070 PCI passthrough.
- Proxmox lifecycle notifications are represented by scripts in
  `Scripts/proxmox/`.
- Service templates for those lifecycle scripts are in
  `Scripts/proxmox/systemd/`.
- The Nextcloud ban summary helper is tracked in `Scripts/proxmox/`.
- The current RTC-based power cycle lets Proxmox set its own motherboard wake
  alarm before shutting down.
- The current host has RTC helper scripts for scheduled shutdown, skip control,
  status, boot summary, and notifications.

Operational notes:

- A conditional daily shutdown flow is documented in
  `Scripts/proxmox/README.md`.
- The newer RTC plan replaces the Raspberry Pi dependency for the automatic
  daily shutdown/wake cycle.
- A host-local power command bot is present for power actions while Proxmox is
  running. It does not replace the need for an always-on external wake path when
  Proxmox is powered off.

## Plex VM

Plex runs in its own Ubuntu VM. Media is mounted from the TrueNAS media dataset,
and the NVIDIA GPU passed through from Proxmox is available inside the guest for
hardware-assisted media work.

The current Plex install is Snap-based, so service management differs from a
traditional package install.

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

The Docker stacks mount persistent configuration under
`/mnt/mainpool/configs/<service>` and shared media under `/mnt/mainpool/media`.

The Portainer-managed side is split into three Compose stacks:

| Stack | File | Responsibility |
|-------|------|----------------|
| Servarr/media | `TrueNas/stacks/main-stack.yaml` | VPN-routed downloads, media automation, requests, updates, and media capacity management |
| Tools | `TrueNas/stacks/tools-stack.yaml` | Operational dashboards, Docker visibility, file browsing, image vulnerability scans, and MediaManager |
| Proxy/DDNS | `TrueNas/stacks/nginx-ddns.yaml` | Nginx Proxy Manager and Cloudflare dynamic DNS updates |

The split keeps unrelated responsibilities apart. A media automation change does
not require redeploying the reverse proxy, and a tools update does not disturb
qBittorrent or the Servarr apps.

## TrueNAS Catalog Apps

Jellyfin is deployed from the TrueNAS catalog rather than the custom Portainer
stack templates.

Tracked catalog app:

| App | Role | Notes |
|-----|------|-------|
| Jellyfin | Media server | Uses the TrueNAS app lifecycle; document live credentials only in the runtime environment |

See [../TrueNas/jellyfin.md](../TrueNas/jellyfin.md) for Jellyfin access and
safety notes.

## Media Stack

The media stack is defined in:

- `TrueNas/stacks/main-stack.yaml`
- `Portainer/stacks/main-stack.yaml`

Main responsibilities:

- VPN-protected download traffic through Gluetun.
- qBittorrent routed through the Gluetun network namespace.
- Sonarr, Radarr, Prowlarr, Bazarr, Profilarr, and Overseerr for media
  automation.
- Capacitarr for watch-history-aware media capacity management.
- Flaresolverr for indexer compatibility.
- Cloudflared for outbound tunnel connectivity.
- Deunhealth for Docker health monitoring.
- Watchtower for scheduled container update checks in the Servarr/media stack.

How it works:

```text
Indexers and request apps
  |
  |-- Prowlarr, Sonarr, Radarr, Bazarr, Profilarr, Overseerr
  |
  v
qBittorrent
  |
  | network_mode: service:gluetun
  v
Gluetun AirVPN WireGuard tunnel
  |
  v
Internet
```

qBittorrent does not publish its own ports because it shares Gluetun's network
namespace. The WebUI and torrent ports are published on Gluetun instead. This is
why Gluetun exposes `8080`, `6881/tcp`, and `6881/udp`.

Watchtower status:

- Defined in the tracked TrueNAS and Portainer media stack templates.
- Can be configured to run on a schedule.
- Configured to clean up old images and include stopped containers.
- Configured to skip `ix*` containers.
- May appear as `exited code 0` after a successful scheduled run.
- Notification settings are provided by the runtime environment.

## Tools Stack

The tools stack is defined in:

- `TrueNas/stacks/tools-stack.yaml`
- `Portainer/stacks/tools-stack.yaml`

Main responsibilities:

- ComposeToolbox provides a browser-based helper for Compose stack work.
- Tracktor stores its data under `/mnt/mainpool/configs/tracktor`.
- Dockpeek reads Docker state through the Docker socket.
- MediaManager manages and inspects media data with a separate Postgres
  database.
- HarborGuard scans Docker images for vulnerability information.
- NextExplorer provides a file-explorer view over `/mnt/mainpool`.

Service ports:

| Service | Host port | Container port | Why |
|---------|-----------|----------------|-----|
| ComposeToolbox | `3000` | `3000` | Native app port |
| NextExplorer | `3001` | `3000` | Avoids conflict with ComposeToolbox |
| Tracktor | `3333` | `3000` | Avoids the other apps that listen on `3000` internally |
| Dockpeek | `3420` | `8000` | Keeps Docker visibility on a distinct admin port |
| MediaManager | `8000` | `8000` | Native app port |
| HarborGuard | `2998` | `8080` | Avoids qBittorrent WebUI on host port `8080` |

MediaManager uses separate host folders for app config, generated image/cache
data, and Postgres data. This prevents the app container from changing
Postgres-owned files while fixing permissions inside its own config directory.

Dockpeek and HarborGuard mount `/var/run/docker.sock`. Any service with that
mount should be treated as an administrative Docker tool and kept behind trusted
network access.

## Proxy And DDNS Stack

The proxy/DDNS stack is defined in:

- `TrueNas/stacks/nginx-ddns.yaml`
- `Portainer/stacks/nginx-ddns.yaml`

Tracked services:

- Nginx Proxy Manager
- Cloudflare DDNS

External DNS values are supplied by the deployment environment.

Nginx Proxy Manager listens on custom host ports:

| Purpose | Host port | Container port |
|---------|-----------|----------------|
| HTTP | `8081` | `80` |
| HTTPS | `8443` | `443` |
| Admin UI | `8181` | `81` |

Cloudflare DDNS does not publish a web port. It only needs its Cloudflare API
token and domain list from the runtime environment.

## Automation LXC

The Automation LXC runs shared Docker services that depend on NAS-backed
configuration storage. Vault stores secrets, Tautulli provides media monitoring,
and HoneyAuth provides lightweight app protection.

Tracked scripts:

- `Scripts/lxc-automation/wait-for-nfs.sh`
- `Scripts/lxc-automation/vault-unseal.sh`
- `Scripts/lxc-automation/automation-stack.yaml`
- `Scripts/lxc-automation/systemd/`

Responsibilities:

- Wait for NAS-backed mounts before dependent services start.
- Run Vault, Tautulli, and HoneyAuth after storage is ready.
- Unseal Vault after boot using values injected from the deployment
  environment.
- Send success or failure notifications through the configured notification
  channel.

## Community Scripts LXCs

The dedicated n8n LXC and Nextcloud LXC were created with
[Proxmox VE Community Scripts](https://community-scripts.org/). Community
Scripts is a community-maintained helper-script library for Proxmox that can
create and configure LXCs or VMs for common self-hosted applications.

## n8n LXC

n8n runs as a dedicated workflow LXC. It starts through systemd as a Node-based
n8n service, with runtime settings supplied by an environment file on the LXC.

The repo contains a general workflow map and supporting logic for the
mail-classifier flow under `Automation/n8n-mail-classifier/`. Runtime
credentials, endpoint values, and active workflow state stay in the live n8n
environment.

## Nextcloud LXC

Nextcloud runs as a client-facing NextCloudPi-style LXC on the Proxmox host.
Apache serves the app, MariaDB stores application metadata, Redis supports
caching and file locking, and Fail2Ban watches for abusive login behavior.

Tracked design:

- Storage is backed by two physical HDDs grouped through LVM on the host.
- Storage is passed into the LXC through bind mounts.
- The LXC is unprivileged and uses nesting/keyctl features.
- The LXC has access to local device helpers used by its deployment.
- Group Folders provides a shared workspace for family users.
- External storage, two-factor, preview generation, brute-force protection, and
  push notification helpers are part of the current app shape.
- External access goes through the tunnel and reverse proxy.
- Brute-force protection and jail-based blocking are enabled.

## Raspberry Pi Control Plane

The Raspberry Pi was the low-power control plane for operational access. It is
currently treated as temporarily disabled, so it is not the active automatic wake
path.

Tracked files:

- `Scripts/raspberry-pi/gogu_bot.py`
- `Scripts/raspberry-pi/pi_server.py`
- `Scripts/raspberry-pi/arise.sh`
- `Scripts/raspberry-pi/systemd/`
- `Scripts/raspberry-pi-README.md`

Responsibilities:

- Previously woke the Proxmox host through Wake-on-LAN.
- Previously checked Proxmox, Vault, Tautulli, Pi, and security status.
- Previously provided operator commands for manual operations.
- Previously provided a small HTTP API for health checks and Wake-on-LAN.

Current power-control caveat:

- The automatic daily shutdown/wake cycle no longer depends on the Pi.
- The current automatic wake path is the Proxmox RTC schedule.
- A small power-only command bot can run while Proxmox is on.
- Manual remote wake still needs an always-on control host plus WOL, BMC, IPMI, or
  another external wake method.

## Where To Look First

- `TrueNas/stacks/` shows the Docker Compose layout.
- `Portainer/stacks/` mirrors the same stacks as Portainer-ready templates.
- `Scripts/` groups host, LXC, and Raspberry Pi helper areas.
- `Automation/n8n-mail-classifier/` explains the mail-classifier workflow.
- `Security/` explains the Vault role in the setup.
