# Scripts & Automation

This directory documents the automation scripts deployed across the homelab infrastructure.

## 📁 Structure

```
Scripts/
├── proxmox/           # Proxmox host scripts
│   ├── notify-boot.sh
│   └── notify-shutdown.sh
├── lxc-automation/    # Automation LXC scripts
├── raspberry-pi/      # Raspberry Pi Service scripts
    ├── pi_server.py
    └── gogu_bot.py
```

## Proxmox Scripts

| Script | Trigger | Purpose |
|--------|---------|---------|
| `notify-boot.sh` | systemd on boot | Discord notification when Proxmox boots |
| `notify-shutdown.sh` | systemd on shutdown | Discord notification when Proxmox shuts down |

## Automation LXC Scripts

### `vault-unseal.sh`
> **Note:** The content of this script has been redacted for security purposes.
> **Purpose:** Automates the unsealing of HashiCorp Vault after a reboot. In a production environment, this logic handles the secure retrieval of unseal keys from a trusted external source or manual input.

### `wait-for-nfs.sh`
> **Note:** The content of this script has been redacted for security purposes.
> **Purpose:** Ensures that NFS mounts from the NAS are fully available before starting dependent services (like Docker containers).

## Proxmox Host Scripts

### `notify-boot.sh` & `notify-shutdown.sh`
> **Note:** The content of these scripts have been redacted for security purposes.
> **Purpose:** Sends webhook notifications to Discord upon system startup and shutdown events.

## Raspberry Pi Scripts

### `gogu_bot.py`
> **Note:** The content of this script has been redacted for security purposes.
> **Purpose:** A Python-based Discord bot that manages Wake-on-LAN and system status monitoring. Contains sensitive API endpoints and tokens in the live version found in our private repository.

| Script | Trigger | Purpose |
|--------|---------|---------|
| `pi_server.py` | systemd service | HTTP API for health checks and WOL |
| `gogu_bot.py` | systemd service | Discord bot for homelab control |

## Secrets

All scripts use environment variables for sensitive data:
- `${DISCORD_WEBHOOK}` - Discord webhook URL
- `${VAULT_UNSEAL_KEY}` - Vault unseal key
- `${WEBHOOK_URL}` - n8n webhook endpoints

Secrets are stored in **HashiCorp Vault** and injected during deployment.
