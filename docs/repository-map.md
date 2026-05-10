# Repository Map

This file explains where everything is located and what each tracked file is
for.

## Root

| Path | Purpose |
|------|---------|
| `README.md` | Front door for the repository |
| `docs/` | High-level documentation and navigation |

## Documentation

| Path | Purpose |
|------|---------|
| `docs/README.md` | Documentation index |
| `docs/current-setup.md` | Current topology and server responsibilities |
| `docs/service-catalog.md` | Service-by-service catalog |
| `docs/repository-map.md` | File-by-file guide |
| `docs/secrets-policy.md` | Safety advice for documenting without storing live values |
| `docs/operations.md` | Operational flows and dependencies |

## TrueNAS And Docker Stacks

| Path | Purpose |
|------|---------|
| `TrueNas/README.md` | TrueNAS role and stack overview |
| `TrueNas/capacitarr.md` | Capacitarr deployment, role, and safety notes |
| `TrueNas/jellyfin.md` | Jellyfin catalog app access and safety notes |
| `TrueNas/stacks/README.md` | Stack index for TrueNAS-hosted Compose files |
| `TrueNas/stacks/main-stack.yaml` | Servarr/media stack Compose file |
| `TrueNas/stacks/tools-stack.yaml` | Operational tools stack Compose file |
| `TrueNas/stacks/nginx-ddns.yaml` | Proxy and Cloudflare DDNS Compose file |
| `Portainer/stacks/README.md` | Portainer template index |
| `Portainer/stacks/main-stack.yaml` | Portainer-ready media stack template mirror |
| `Portainer/stacks/tools-stack.yaml` | Portainer-ready tools stack template mirror |
| `Portainer/stacks/nginx-ddns.yaml` | Portainer-ready proxy/DDNS stack template mirror |

## Infrastructure And Security

| Path | Purpose |
|------|---------|
| `Infrastructure/README.md` | Proxmox, TrueNAS, storage, and VM optimization notes |
| `Security/README.md` | Vault, Cloudflare, and Docker socket security boundaries |
| `Proxmox LXC/docker compose files/automation-docker-compose.yaml` | Legacy/example Automation LXC Compose file for Vault, n8n, and Tautulli |

## Automation

| Path | Purpose |
|------|---------|
| `Automation/README.md` | Automation overview and n8n workflow links |
| `Automation/n8n-mail-classifier/` | Mail ingestion, classification, cleanup, and notification docs |
| `Automation/n8n-mail-classifier/01-overview/` through `07-error-notifier/` | Step-by-step documentation for each n8n workflow stage |
| `Automation/n8n-mail-classifier/workflow-notes.md` | Import and adaptation notes for the workflow |
| `Automation/n8n-mail-classifier/workflow-visual.md` | Reader-friendly workflow diagram and control flow |

## Scripts

| Path | Purpose |
|------|---------|
| `Scripts/README.md` | Script index and operational overview |
| `Scripts/proxmox/` | Proxmox lifecycle and power-management scripts |
| `Scripts/proxmox/systemd/` | systemd unit examples for Proxmox notification scripts |
| `Scripts/lxc-automation/` | Automation LXC startup helpers and stack manifest |
| `Scripts/lxc-automation/systemd/` | systemd unit examples for the automation stack and Vault unseal helper |
| `Scripts/raspberry-pi/` | Legacy Raspberry Pi control-plane scripts |
| `Scripts/raspberry-pi/systemd/` | systemd unit examples for legacy Raspberry Pi services |
| `Scripts/gogu_bot.py` | Duplicate copy of the Raspberry Pi command bot |

## Notes

- Runtime-specific values are shown as placeholders or environment variable
  names.
- `Scripts/gogu_bot.py` and `Scripts/raspberry-pi/gogu_bot.py` currently contain
  the same command-bot implementation.
