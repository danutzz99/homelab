# Homelab

This repository documents the current homelab layout, the tracked Docker stacks,
the automation workflows, and the operational scripts used around the server.

The goal is to make the setup readable without storing secrets. Live credentials,
tokens, API keys, webhook URLs, private IPs, MAC addresses, domain names, and
provider-specific private values must stay outside this repository.

## Start Here

| Need | Open |
|------|------|
| Understand the whole server | [Current setup](docs/current-setup.md) |
| Find every tracked service | [Service catalog](docs/service-catalog.md) |
| Understand each folder and file | [Repository map](docs/repository-map.md) |
| Review external notes safely | [External notes audit](docs/workspace-audit.md) |
| Check what must never be committed | [Secrets policy](docs/secrets-policy.md) |
| Follow boot, shutdown, Vault, and alert flows | [Operations](docs/operations.md) |

## Current Status At A Glance

| Area | Status | What to know first |
|------|--------|--------------------|
| Main host | Active | Proxmox VE runs the VMs, LXCs, and current RTC wake schedule |
| Storage and Docker | Active | TrueNAS Scale provides storage and hosts Portainer-managed stacks |
| Automation LXC | Active, n8n status to verify | Vault and Tautulli are documented here; n8n workflow files live in this repo |
| Raspberry Pi control plane | Temporarily disabled | Older Wake-on-LAN, health check, and Discord control path |
| Automatic wake | Active through RTC | Current morning wake is handled by Proxmox RTC, not the Raspberry Pi |
| Watchtower | In Servarr stack | Scheduled container updater; current runtime status noted as exited with code 0 |
| Mentioned but not fully added | In progress | Reactive Resume, Ollama, and newer power scripts are known, but their clean config/script files are not in this repo yet |

## Current Architecture

| Layer | Component | Current role |
|-------|-----------|--------------|
| Hypervisor | Proxmox VE | Runs the homelab VMs and LXCs |
| NAS VM | TrueNAS Scale | Hosts storage and Docker/Portainer-managed stacks |
| Media VM | Plex | Media streaming with GPU passthrough |
| Automation LXC | Vault, n8n, Tautulli | Secrets, workflows, monitoring, and notifications |
| Client LXC | Nextcloud | Private cloud and family file sharing |
| Raspberry Pi | Temporarily disabled | Older Wake-on-LAN, health check, and operator command plane |
| Proxmox host | RTC power automation | Current scheduled shutdown and morning wake path |
| Proxmox LXC | Reactive Resume, Ollama | Resume app and local AI support from external notes |

## Repository Layout

```text
homelab/
|-- docs/                    # Start-here documentation and service catalog
|-- Automation/              # n8n workflow docs and workflow exports
|-- Infrastructure/          # Proxmox, TrueNAS, storage, and VM notes
|-- Portainer/               # Portainer stack templates
|-- Scripts/                 # Operational scripts for Proxmox, LXC, and Pi
|-- Security/                # Vault, Cloudflare, and security notes
`-- TrueNas/                 # TrueNAS app and stack documentation
```

## Important Boundaries

- `TrueNas/stacks/` contains the main Docker Compose stack definitions used by
  the TrueNAS/Portainer side of the setup.
- `Portainer/stacks/` contains compact Portainer-oriented stack templates that
  mirror the same services.
- `Automation/n8n-mail-classifier/` documents the mail-classifier workflow and
  includes sanitized n8n export files.
- `Scripts/` contains operational scripts and examples, not live service units
  for every server-side path mentioned in the docs.
- External notes include newer operational details that are not fully tracked in
  this repo yet. See [docs/workspace-audit.md](docs/workspace-audit.md).

## Secrets

This repo uses placeholders and environment variable names only. Examples:

- `TUNNEL_TOKEN`
- `CLOUDFLARE_API_TOKEN`
- `WIREGUARD_PRIVATE_KEY`
- `DISCORD_WEBHOOK`
- `VAULT_UNSEAL_KEY`
- `PROXMOX_TOKEN_SECRET`

See [docs/secrets-policy.md](docs/secrets-policy.md) before adding new files.

## Quick Mental Model

Proxmox runs the server layer. TrueNAS provides storage and runs the media/proxy
containers through Portainer. Vault stores secrets for automation in the
Automation LXC, alongside the documented n8n workflow files. The Raspberry Pi
control plane is temporarily disabled, so the current automatic wake path is the
Proxmox RTC schedule. Manual Discord wake would need an always-on command host
again before it can work independently of Proxmox.
