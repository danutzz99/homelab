# Scripts & Automation

This directory documents the automation scripts deployed across the homelab infrastructure.

## 📁 Structure

```
Scripts/
├── proxmox/           # Proxmox host scripts
│   ├── notify-boot.sh
│   └── notify-shutdown.sh
├── lxc-automation/    # LXC 101 scripts
│   ├── vault-unseal.sh
│   └── wait-for-nfs.sh
└── raspberry-pi/      # Pi Zero scripts
    ├── pi_server.py
    └── gogu_bot.py
```

## Proxmox Scripts

| Script | Trigger | Purpose |
|--------|---------|---------|
| `notify-boot.sh` | systemd on boot | Discord notification when Proxmox boots |
| `notify-shutdown.sh` | systemd on shutdown | Discord notification when Proxmox shuts down |

## LXC 101 Scripts

| Script | Trigger | Purpose |
|--------|---------|---------|
| `vault-unseal.sh` | systemd after docker | Auto-unseal Vault after container restart |
| `wait-for-nfs.sh` | systemd before docker | Wait for NFS mounts before starting services |

## Raspberry Pi Scripts

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
