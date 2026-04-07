# Homelab Documentation

## System Architecture

| Node | Component | Role |
|------|-----------|------|
| **Host** | Proxmox VE | Hypervisor |
| **NAS VM** | TrueNAS Scale | Storage and Docker host |
| **Media VM** | Plex | Media streaming |
| **Auth LXC** | Vault, n8n, Tautulli | Automation services |
| **Client LXC** | Nextcloud | Private cloud and file sharing |

## Repository Structure

- **[TrueNas/](TrueNas)**: Media stack configurations
- **[Portainer/](Portainer)**: Stack definitions
- **[Security/](Security)**: Vault and security documentation
- **[Infrastructure/](Infrastructure)**: Host settings and platform notes
- **[Automation/](Automation)**: CI/CD, workflow definitions, and n8n notes
- **[Scripts/](Scripts)**: Operational automation scripts

## Secrets

Credentials are injected at deployment time and are not stored in this repository.

## Nextcloud Deployment

Deployed as an LXC on the Proxmox host.

### Storage Strategy

- Two physical HDDs provide the storage layer.
- Storage is grouped through LVM on the host.
- The mounted storage is passed into the LXC through bind mounts.
- This keeps direct disk performance while preserving container flexibility.

### Shared Environment

- The Group Folders app provides a shared workspace for family users.
- A root-level shared folder is visible to the intended user group.
- Read, write, delete, and share permissions are managed through the admin group.

### Security Hardening

- External access is routed through a tunnel and reverse proxy.
- Brute-force protection and jail-based blocking are enabled.
- Operational alerts are sent through the Discord bot.
- Strong passwords and two-factor authentication are enforced.
