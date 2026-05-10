# Operations

This page explains how the main pieces work together during normal operations.

## Boot Flow

```text
Proxmox host boots
  |
  |-- notify-boot.sh waits briefly for network
  |-- attempts to notify the automation endpoint
  `-- uses the fallback alert path if the primary path fails

Automation LXC starts
  |
  |-- wait-for-nfs.sh runs before dependent services
  |-- confirms NAS-backed config path is present
  |-- Docker starts Vault, Tautulli, and HoneyAuth after storage is ready
  `-- vault-unseal.sh waits for Vault and completes the recovery flow

n8n LXC starts
  |
  `-- systemd starts the Node-based n8n service with runtime settings from the LXC

TrueNAS Docker side starts
  |
  |-- Portainer manages the Compose stacks
  |-- Servarr/media stack starts media automation and VPN-routed downloads
  |-- Tools stack starts operational dashboards and scanners
  `-- Proxy/DDNS stack starts reverse proxy and DNS update services
```

## TrueNAS Docker Stack Flow

```text
TrueNAS Scale
  |
  |-- Servarr/media stack
  |     |-- Gluetun creates the AirVPN WireGuard network path
  |     |-- qBittorrent shares Gluetun's network namespace
  |     |-- Servarr apps organize and request media
  |     |-- Capacitarr evaluates media cleanup candidates
  |     `-- Watchtower checks container updates on schedule
  |
  |-- Tools stack
  |     |-- ComposeToolbox supports stack editing
  |     |-- Dockpeek reads Docker state
  |     |-- HarborGuard scans Docker images
  |     |-- MediaManager uses Postgres and the media dataset
  |     `-- NextExplorer browses the main pool
  |
  `-- Proxy/DDNS stack
        |-- Nginx Proxy Manager provides proxy and certificate management
        `-- Cloudflare DDNS updates DNS records
```

The stack split is operationally useful because each responsibility area can be
redeployed without touching the others. It also makes Docker-socket tools easier
to identify and protect.

## RTC Power Cycle

The Raspberry Pi control plane is temporarily disabled. Automatic morning wake
currently depends on the Proxmox RTC schedule.

## Vault Recovery Flow

`vault-unseal.sh` waits for Vault to become reachable, checks whether it is
sealed, then completes the unseal flow using values provided by the runtime
environment.

## Watchtower

Watchtower is part of the tracked Servarr/media stack on the TrueNAS Docker
environment. It uses the Docker socket, can run on a schedule, cleans up old
images after updates, includes stopped containers, and skips `ix*` containers.

Watchtower may appear as `exited code 0` after a successful scheduled run.

## Maintenance Notes

- Keep `TrueNas/stacks/` and `Portainer/stacks/` synchronized when service
  definitions change.
- Treat Dockpeek, HarborGuard, Watchtower, and Deunhealth as privileged
  operational tools because they mount the Docker socket.
- Keep the Proxmox power-cycle overview aligned with the current RTC behavior.
