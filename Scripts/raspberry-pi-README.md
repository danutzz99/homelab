# Raspberry Pi Automation

The Raspberry Pi acts as the low-power control plane for the homelab. It should
stay available even when the main server is powered down.

## Tracked Components

| File | Purpose |
|------|---------|
| `raspberry-pi/gogu_bot.py` | Discord bot for homelab commands |
| `raspberry-pi/pi_server.py` | Flask API for health checks and Wake-on-LAN |

## Gogu Bot

`gogu_bot.py` provides Discord commands for manual control and status checks.

| Command | Description |
|---------|-------------|
| `!wake` | Send Wake-on-LAN to the Proxmox host |
| `!status` | Report health for Vault, Tautulli, Proxmox, and Pi |
| `!shutdown` | Gracefully shut down the Proxmox host after confirmation |
| `!notnow` | Skip the scheduled shutdown for the current night |
| `!shutdown_status` | Check if auto-shutdown is active or skipped |
| `!banned` | List IPs currently blocked by the edge security layer |
| `!ncbans` | Report active Nextcloud Fail2Ban bans |

## Pi API

`pi_server.py` exposes:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/health` | `GET` | Basic liveness check |
| `/status` | `GET` | Pi status and Gogu bot process check |
| `/wol` | `POST` | Send Wake-on-LAN to the Proxmox host |

## Deployment Shape

The bot and API are intended to run as services on the Pi. Keep service files
sanitized if they are added to the repo later.

Example service shape:

```ini
[Unit]
Description=Gogu Discord Bot
After=network.target

[Service]
ExecStart=/usr/bin/python3 /home/<user>/gogu-bot/gogu_bot.py
Restart=always
User=<user>

[Install]
WantedBy=multi-user.target
```

## Sensitive Values

Keep these outside Git:

- Discord bot token.
- Discord webhook URL.
- Proxmox host address.
- Proxmox MAC address.
- Cloudflare API token and zone ID.
- Proxmox API token secret.
- Vault token and secret paths that reveal live structure.
