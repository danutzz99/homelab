# Scripts

This directory contains operational scripts and script documentation for the
Proxmox host, Automation LXC, and Raspberry Pi control plane.

For operational flow diagrams, see [../docs/operations.md](../docs/operations.md).

## Structure

```text
Scripts/
|-- gogu_bot.py                 # Duplicate copy of the Raspberry Pi bot
|-- raspberry-pi-README.md      # Raspberry Pi deployment and command notes
|-- raspberry-pi/
|   |-- gogu_bot.py             # Discord bot for control and monitoring
|   `-- pi_server.py            # Flask health and Wake-on-LAN API
|-- lxc-automation/
|   |-- vault-unseal.sh         # Vault boot unseal helper
|   `-- wait-for-nfs.sh         # Wait for NAS-backed mounts
`-- proxmox/
    |-- README.md               # Proxmox script documentation
    |-- notify-boot.sh          # Boot notification script
    `-- notify-shutdown.sh      # Shutdown notification script
```

## Proxmox Host Scripts

| Script | Trigger | Purpose |
|--------|---------|---------|
| `proxmox/notify-boot.sh` | systemd on boot | Notify n8n, then Discord fallback |
| `proxmox/notify-shutdown.sh` | systemd on shutdown | Notify n8n, then Discord fallback |

`proxmox/README.md` also documents a daily conditional shutdown flow. That flow
is not currently tracked as a standalone script file.

## Automation LXC Scripts

| Script | Trigger | Purpose |
|--------|---------|---------|
| `lxc-automation/wait-for-nfs.sh` | before dependent services | Wait for NAS-backed config path |
| `lxc-automation/vault-unseal.sh` | after Docker/Vault startup | Unseal Vault with injected secret values |

## Raspberry Pi Scripts

| Script | Trigger | Purpose |
|--------|---------|---------|
| `raspberry-pi/gogu_bot.py` | systemd service | Discord bot for operator commands |
| `raspberry-pi/pi_server.py` | systemd or manual service | Flask API for `/health`, `/status`, and `/wol` |

## Gogu Bot Commands

| Command | Purpose |
|---------|---------|
| `!wake` | Send Wake-on-LAN to the Proxmox host |
| `!status` | Check Vault, Tautulli, Proxmox, and Pi status |
| `!shutdown` | Shut down Proxmox after confirmation |
| `!notnow` | Skip the scheduled shutdown for the current night |
| `!shutdown_status` | Show whether scheduled shutdown is active or skipped |
| `!banned` | List IPs blocked by the edge security layer |
| `!ncbans` | List active Nextcloud Fail2Ban bans |

## Configuration

Scripts use placeholders or environment variables for deployment-specific values.

Examples:

- `DISCORD_WEBHOOK`
- `VAULT_UNSEAL_KEY`
- `N8N_WEBHOOK_URL`
- `PROXMOX_HOST`
- `PROXMOX_TOKEN_SECRET`
- `CF_API_TOKEN`

Do not commit live values. See [../docs/secrets-policy.md](../docs/secrets-policy.md).
