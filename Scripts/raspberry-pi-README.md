# Raspberry Pi Automation Scripts

## `gogu_bot.py`
A custom Discord bot running on a Raspberry Pi Zero to control and monitor the homelab infrastructure.

### Features
- **Wake-on-LAN:** Wakes up the main Proxmox host via `!wake`.
- **Shutdown Management:** Can trigger valid shutdowns (`!shutdown`) or skip scheduled auto-shutdowns (`!notnow`).
- **Health Checks:** Monitors status of Proxmox, Vault, and Tautulli via `!status`.
- **Security Monitoring:** Checks Nextcloud Fail2Ban jails for intruders via `!ncbans`.

### Commands Reference
| Command | Description |
|---------|-------------|
| `!wake` | Send Magic Packet to Proxmox Host |
| `!status` | Report health status of all critical services |
| `!shutdown` | Gracefully shutdown host (requires confirmation) |
| `!notnow` | Set flag to skip tonight's cron-scheduled shutdown |
| `!shutdown_status` | Check if auto-shutdown is active or skipped |
| `!banned` | List IPs currently banned by HoneyAuth (Cloudflare WAF) |
| `!ncbans` | Report IPs and Usernames currently banned by Nextcloud |

### Deployment
Deployed as a systemd service:
```ini
[Unit]
Description=Gogu Discord Bot
After=network.target

[Service]
ExecStart=/usr/bin/python3 /home/dan/gogu-bot/gogu_bot.py
Restart=always
User=dan

[Install]
WantedBy=multi-user.target
```

## `pi_server.py`
A lightweight Flask API that exposes local Pi functionality (like WOL) to other internal services (e.g., n8n workflows).
