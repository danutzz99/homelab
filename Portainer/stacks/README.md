# Portainer Stack Templates

These files are Portainer-oriented stack templates. They mirror the TrueNAS
stack definitions and should be kept synchronized with `../../TrueNas/stacks/`.

| File | Purpose | Mirror |
|------|---------|--------|
| [main-stack.yaml](main-stack.yaml) | Servarr/media automation stack, including Watchtower and Capacitarr | `../../TrueNas/stacks/main-stack.yaml` |
| [tools-stack.yaml](tools-stack.yaml) | Operational tools, file explorer, vulnerability scanner, and MediaManager | `../../TrueNas/stacks/tools-stack.yaml` |
| [nginx-ddns.yaml](nginx-ddns.yaml) | Nginx Proxy Manager and Cloudflare DDNS | `../../TrueNas/stacks/nginx-ddns.yaml` |

## How The Stacks Are Used

Portainer deploys each stack as a separate Compose project:

- The media stack contains the automation chain and the VPN-routed download
  client.
- The tools stack contains admin-facing utilities and Docker-socket readers.
- The proxy/DDNS stack contains edge routing and DNS automation.

This makes the service groups easier to reason about and limits accidental
changes when only one area needs redeployment.

## Runtime Configuration

Deployment-specific values are left blank in the templates and filled in through
Portainer, Vault, or the runtime environment.

Important runtime variables include AirVPN WireGuard values for Gluetun,
Cloudflare values for Cloudflared/DDNS, Dockpeek credentials, the MediaManager
Postgres password, Watchtower notification URL, and the Capacitarr JWT secret.

See [../../docs/secrets-policy.md](../../docs/secrets-policy.md).
