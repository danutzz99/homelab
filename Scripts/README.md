# Scripts

This directory documents the operational scripts used across the homelab.

## Structure

```text
Scripts/
|-- proxmox/           # Proxmox host scripts
|   |-- notify-boot.sh
|   `-- notify-shutdown.sh
|-- lxc-automation/    # Automation LXC scripts
`-- raspberry-pi/      # Raspberry Pi service scripts
    |-- pi_server.py
    `-- gogu_bot.py
```

## Proxmox Host Scripts

| Script | Trigger | Purpose |
|--------|---------|---------|
| `notify-boot.sh` | systemd on boot | Sends a notification when Proxmox comes online |
| `notify-shutdown.sh` | systemd on shutdown | Sends a notification before Proxmox goes offline |

## Automation LXC Scripts

### `vault-unseal.sh`

Automates the Vault recovery flow after a reboot.

In practice, this script coordinates the unseal sequence and retrieves the required values from the automation environment.

### `wait-for-nfs.sh`

Ensures that NFS mounts from the NAS are fully available before starting dependent services such as Docker containers and scheduled jobs.

| Script | Trigger | Purpose |
|--------|---------|---------|
| `raspberry-pi/gogu_bot.py` | systemd service | Discord bot for operator commands |
| `raspberry-pi/pi_server.py` | systemd or manual service | Flask API for `/health`, `/status`, and `/wol` |

### `notify-boot.sh` and `notify-shutdown.sh`

These scripts send lifecycle notifications when the Proxmox host starts or stops.

The notification flow uses a primary automation endpoint with a fallback alert path so infrastructure events remain visible during maintenance windows.

| Command | Purpose |
|---------|---------|
| `!wake` | Send Wake-on-LAN to the Proxmox host |
| `!status` | Check Vault, Tautulli, Proxmox, and Pi status |
| `!shutdown` | Shut down Proxmox after confirmation |
| `!notnow` | Skip the scheduled shutdown for the current night |
| `!shutdown_status` | Show whether scheduled shutdown is active or skipped |
| `!banned` | List IPs blocked by the edge security layer |
| `!ncbans` | List active Nextcloud Fail2Ban bans |

### `gogu_bot.py`

A Python-based Discord bot that manages Wake-on-LAN, health checks, and operational commands for the homelab.

It acts as the operator-facing interface for manual actions such as power control, service checks, and selected automation triggers.

| Script | Trigger | Purpose |
|--------|---------|---------|
| `pi_server.py` | systemd service | HTTP API for health checks and Wake-on-LAN |
| `gogu_bot.py` | systemd service | Discord bot for homelab control |

Examples:

The live services use environment variables for deployment-specific values such as:

- `${DISCORD_WEBHOOK}`
- `${VAULT_UNSEAL_KEY}`
- `${WEBHOOK_URL}`

Sensitive values are injected at deployment time rather than stored in this repository.
