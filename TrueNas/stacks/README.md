# TrueNAS Stacks

These Compose files represent the Docker services hosted from the TrueNAS side
of the homelab.

| File | Purpose |
|------|---------|
| [main-stack.yaml](main-stack.yaml) | Servarr/media automation, VPN, downloads, tunnel, request services, and Watchtower |
| [nginx-ddns.yaml](nginx-ddns.yaml) | Nginx Proxy Manager and Cloudflare DDNS |

## Storage Convention

| Host path | Purpose |
|-----------|---------|
| `/mnt/mainpool/configs/<service>` | Persistent service configuration |
| `/mnt/mainpool/media` | Shared media dataset |

## Runtime Configuration

Runtime-specific values are left blank or represented by environment variable
names.

See [../../docs/service-catalog.md](../../docs/service-catalog.md) for the full
service table.
