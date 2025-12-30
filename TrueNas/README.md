# TrueNAS Docker Stacks

**Portainer** runs as a **Custom App** on TrueNAS Scale, managing these stacks.

## Main Media Stack (`main-stack.yaml`)

| Service | Role |
|---------|------|
| **Gluetun** | VPN Gateway (WireGuard/AirVPN) |
| **qBittorrent** | Download client (routes through Gluetun) |
| **Sonarr** | TV automation |
| **Radarr** | Movie automation |
| **Prowlarr** | Indexer manager |
| **Flaresolverr** | Cloudflare bypass for indexers |
| **Bazarr** | Subtitles |
| **Profilarr** | Profile sync |
| **Cloudflared** | Cloudflare Tunnel |
| **Overseerr** | Media requests |

## Nginx Stack (`nginx-ddns.yaml`)

| Service | Role |
|---------|------|
| **Nginx Proxy Manager** | Reverse proxy |
| **Cloudflare DDNS** | Dynamic DNS updates |

## Secrets

All sensitive values stored in **HashiCorp Vault**.
