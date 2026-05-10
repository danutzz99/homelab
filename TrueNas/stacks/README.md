# TrueNAS Stacks

These Compose files represent the Docker services hosted from the TrueNAS side
of the homelab.

| File | Purpose |
|------|---------|
| [main-stack.yaml](main-stack.yaml) | Servarr/media automation, Capacitarr, VPN, downloads, tunnel, request services, and Watchtower |
| [tools-stack.yaml](tools-stack.yaml) | ComposeToolbox, Tracktor, Dockpeek, MediaManager, HarborGuard, and NextExplorer |
| [nginx-ddns.yaml](nginx-ddns.yaml) | Nginx Proxy Manager and Cloudflare DDNS |

## Storage Convention

| Host path | Purpose |
|-----------|---------|
| `/mnt/mainpool/configs/<service>` | Persistent service configuration |
| `/mnt/mainpool/media` | Shared media dataset |
| `/mnt/mainpool` | Root dataset exposed to selected file-management tools |

## Stack Model

The stacks are separated by responsibility:

- `main-stack.yaml` is for media automation and VPN-protected downloads.
- `tools-stack.yaml` is for operational tools and inspection dashboards.
- `nginx-ddns.yaml` is for edge routing and DNS automation.

This split keeps Docker-socket tools out of the regular media automation stack
and makes each responsibility area easier to redeploy independently.

## Runtime Configuration

Runtime-specific values are left blank or represented by environment variable
names.

| Variable | Used by |
|----------|---------|
| `AIRVPN_WIREGUARD_PRIVATE_KEY` | Gluetun |
| `AIRVPN_WIREGUARD_PRESHARED_KEY` | Gluetun |
| `AIRVPN_WIREGUARD_ADDRESSES` | Gluetun |
| `AIRVPN_FORWARDED_PORTS` | Gluetun firewall input ports |
| `QBITTORRENT_TORRENTING_PORT` | qBittorrent |
| `HOMELAB_TIMEZONE` | Container `TZ` values |
| `CLOUDFLARED_TUNNEL_TOKEN` | Cloudflared |
| `WATCHTOWER_NOTIFICATIONS_HOSTNAME` | Watchtower notification hostname label |
| `WATCHTOWER_NOTIFICATION_URL` | Watchtower notifications |
| `CAPACITARR_JWT_SECRET` | Capacitarr |
| `DOCKPEEK_SECRET_KEY` | Dockpeek |
| `DOCKPEEK_USERNAME` | Dockpeek |
| `DOCKPEEK_PASSWORD` | Dockpeek |
| `DOCKPEEK_DOCKER_HOST_NAME` | Dockpeek display name for the Docker host |
| `MEDIAMANAGER_POSTGRES_PASSWORD` | MediaManager Postgres and app config |
| `CLOUDFLARE_API_TOKEN` | Cloudflare DDNS |
| `CLOUDFLARE_DDNS_DOMAINS` | Cloudflare DDNS |

See [../../docs/service-catalog.md](../../docs/service-catalog.md) for the full
service table.
