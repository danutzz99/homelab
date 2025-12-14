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

## 📂 Repository Structure

- **[TrueNas/](TrueNas)**: Media stack configurations
- **[Portainer/](Portainer)**: Stack templates
- **[Security/](Security)**: Vault documentation
- **[Infrastructure/](Infrastructure)**: Host settings
- **[Automation/](Automation)**: CI/CD & pipelines
- **[Scripts/](Scripts)**: System automation scripts

## 🛡️ Secrets

All credentials stored in **HashiCorp Vault**. No sensitive data in this repository.
