# Repository Map

This file explains where everything lives and what each tracked file is for.

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
| `docs/workspace-audit.md` | Sanitized summary of external notes |
| `docs/secrets-policy.md` | Safe documentation and redaction rules |
| `docs/operations.md` | Operational flows and dependencies |

## Infrastructure

| Path | Purpose |
|------|---------|
| `Infrastructure/README.md` | Proxmox, TrueNAS, storage, and VM optimization notes |
| `Security/README.md` | Vault, Cloudflare, and planned security components |

## TrueNAS And Docker Stacks

| Path | Purpose |
|------|---------|
| `TrueNas/README.md` | TrueNAS role and stack overview |
| `TrueNas/stacks/README.md` | Stack index for TrueNAS-hosted Compose files |
| `TrueNas/stacks/main-stack.yaml` | Expanded media stack Compose file |
| `TrueNas/stacks/nginx-ddns.yaml` | Proxy and Cloudflare DDNS Compose file |
| `Portainer/stacks/README.md` | Portainer template index |
| `Portainer/stacks/main-stack.yaml` | Compact media stack template mirror |
| `Portainer/stacks/nginx-ddns.yaml` | Compact proxy/DDNS stack template mirror |

## Automation

| Path | Purpose |
|------|---------|
| `Automation/README.md` | Automation overview and n8n workflow links |
| `Automation/n8n-mail-classifier/README.md` | Mail-classifier workflow hub |
| `Automation/n8n-mail-classifier/workflow-visual.md` | Visual explanation with Mermaid diagrams |
| `Automation/n8n-mail-classifier/workflow-notes.md` | Workflow behavior notes and next upgrade ideas |
| `Automation/n8n-mail-classifier/workflow-canvas.svg` | Static canvas-style workflow diagram |
| `Automation/n8n-mail-classifier/mail-classifier-workflow.json` | Sanitized n8n main workflow export |
| `Automation/n8n-mail-classifier/mail-classifier-logic.js` | Classifier logic used by the workflow |
| `Automation/n8n-mail-classifier/discord-classifier-review.json` | Optional review notification workflow |
| `Automation/n8n-mail-classifier/discord-error-notifier.json` | Workflow-level error notification workflow |

## Mail Classifier Explanation Pages

| Path | Purpose |
|------|---------|
| `Automation/n8n-mail-classifier/01-overview/README.md` | End-to-end workflow overview |
| `Automation/n8n-mail-classifier/02-label-map/README.md` | Gmail label map and input preparation |
| `Automation/n8n-mail-classifier/03-classifier/README.md` | JavaScript classifier decision model |
| `Automation/n8n-mail-classifier/04-label-cleanup/README.md` | Stale-label cleanup behavior |
| `Automation/n8n-mail-classifier/05-success-notification/README.md` | End-of-run success notification |
| `Automation/n8n-mail-classifier/06-review-notifier/README.md` | Optional Discord review branch |
| `Automation/n8n-mail-classifier/07-error-notifier/README.md` | Error notification workflow |

## Scripts

| Path | Purpose |
|------|---------|
| `Scripts/README.md` | Script index and operational overview |
| `Scripts/gogu_bot.py` | Duplicate copy of the Raspberry Pi Discord bot |
| `Scripts/raspberry-pi-README.md` | Raspberry Pi deployment and command reference |
| `Scripts/raspberry-pi/gogu_bot.py` | Raspberry Pi Discord bot |
| `Scripts/raspberry-pi/pi_server.py` | Raspberry Pi Flask API |
| `Scripts/lxc-automation/wait-for-nfs.sh` | Waits for NAS-backed mounts before dependent services |
| `Scripts/lxc-automation/vault-unseal.sh` | Vault boot unseal helper |
| `Scripts/proxmox/README.md` | Proxmox host script notes |
| `Scripts/proxmox/notify-boot.sh` | Boot notification script |
| `Scripts/proxmox/notify-shutdown.sh` | Shutdown notification script |

## Known Documentation Gaps

- The Proxmox daily shutdown script is documented but not tracked as a separate
  file.
- Service unit files referenced by the Proxmox README are documented but not
  tracked.
- `Scripts/gogu_bot.py` and `Scripts/raspberry-pi/gogu_bot.py` are duplicates.
- Some live deployment details are intentionally absent because they would expose
  sensitive data.
- External notes document RTC power automation, Watchtower, Reactive Resume, and
  Ollama, but sanitized source files have not been promoted into this repo yet.

## External Notes Reviewed

These supporting notes were reviewed without recording local paths or private
folder names in the repo:

| Area | What the notes helped clarify |
|------|-------------------------------|
| Power automation | RTC-based shutdown/wake flow and power-only command bot |
| Application updates | Watchtower behavior and promotion gap |
| Resume app | Reactive Resume and local Ollama deployment shape |
| Storage | Nextcloud storage model and disk-risk notes |
| Historical services | Vaultwarden draft, HoneyAuth experiment, and old n8n iterations |
