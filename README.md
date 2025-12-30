# 🏰 Homelab Documentation

<p align="center">
  <img src="https://img.shields.io/badge/Proxmox-LXC--Docker-orange?style=flat-square" alt="Environment">
  <img src="https://img.shields.io/badge/Secrets-Vault-green?style=flat-square" alt="Security">
</p>

## 🏗️ System Architecture

| Node | Component | Role |
|------|-----------|------|
| **Host** | Proxmox VE | Hypervisor |
| **NAS VM** | TrueNAS Scale | Storage & Docker Host |
| **Media VM** | Plex | Streaming (GPU) |
| **Auth LXC** | Vault, n8n, Tautulli | Automation |
| **Client LXC** | Nextcloud | Secure Cloud & Share |

## 📂 Repository Structure

- **[TrueNas/](TrueNas)**: Media stack configurations
- **[Portainer/](Portainer)**: Stack templates
- **[Security/](Security)**: Vault documentation
- **[Infrastructure/](Infrastructure)**: Host settings
- **[Automation/](Automation)**: CI/CD & pipelines
- **[Scripts/](Scripts)**: System automation scripts

## 🛡️ Secrets

All credentials stored in **HashiCorp Vault**. No sensitive data in this repository.

## ☁️ Nextcloud Deployment (Latest Addition)
**Deployed as LXC on Proxmox Host**

### 1. Storage Strategy (2 HDDs)
- **Physical Layer:** 2 Physical HDDs (Total 1.6TB) connected to Proxmox Host.
- **Volume Management:** configured as LVM Volume Group.
- **Passthrough:** Mounted on Host and passed to LXC via Bind Mount.
- **Benefit:** Direct hardware speed with container flexibility.

### 2. Shared Environment (Team Folders)
- Implemented **"Group Folders"** app to create a true shared environment.
- **Root Folder**: A root-level folder visible to all family users.
- **Permissions:** Full read/write/delete/share access for the `admin` group.
- **Result:** Bidirectional file visibility without quota consumption or complex sharing links.

### 3. Security Hardening
- **Access:** Exposed via Cloudflare Tunnel (safe mobile access) & Nginx Proxy Manager.
- **Protection:** Fail2Ban (Jail verified), Brute Force Protection enabled.
- **Monitoring:** Integrated custom Discord bot for real-time intrusion alerts.
- **Auth:** Strict Password Policy + 2FA enforced.
