# Security

This folder documents the security services and boundaries for the homelab.

Use [../docs/secrets-policy.md](../docs/secrets-policy.md) for the repo's safe
documentation advice.

## HashiCorp Vault

Vault runs on the Automation LXC and stores runtime secrets for services.

Documented secret layout:

| Path pattern | Purpose |
|--------------|---------|
| `homelab/apps/<app-name>` | Application credentials |
| `homelab/config/<scope>` | Shared configuration values |

Tracked helper:

- `../Scripts/lxc-automation/vault-unseal.sh`

The helper expects required values to be provided by the deployment environment.

## Cloudflare

Cloudflare is used for external access and DNS-related automation.

Tracked components:

| Component | Role |
|-----------|------|
| Cloudflare Tunnel | Outbound tunnel for external access |
| Cloudflare Proxy | Proxied DNS records |
| Cloudflare DDNS | Dynamic DNS updates from the Docker stack |

Tracked placeholders:

- `CLOUDFLARED_TUNNEL_TOKEN` for the `TUNNEL_TOKEN` value consumed by Cloudflared
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_DDNS_DOMAINS`

## HoneyAuth

HoneyAuth runs in the Automation LXC as a lightweight application gate for
protected services. It can sit in front of selected apps through the reverse
proxy auth-request pattern.

Role:

- Check whether a request already has a valid authentication cookie.
- Send unauthenticated users to a login page.
- Alert on invalid login attempts.
- Optionally request edge-level blocks through the configured provider API.

Runtime values such as users, password hashes, session keys, allowed networks,
notification endpoints, and API tokens are provided by the deployment
environment.

## Docker Socket Boundary

Some TrueNAS-hosted containers mount the Docker socket so they can inspect or
manage Docker state.

Tracked Docker-socket services:

| Service | Why it needs Docker visibility |
|---------|--------------------------------|
| Dockpeek | Shows Docker/container state in the Tools stack |
| HarborGuard | Scans Docker images and reports vulnerability information |
| Watchtower | Checks and recreates containers during update runs |
| Deunhealth | Watches container health and can support restart behavior |

Access to these tools should be treated as administrative access to the Docker
host. Keep them on trusted networks, protect their credentials, and avoid
exposing them directly to the public internet.

## HoneyAuth

HoneyAuth runs in the Automation LXC as a lightweight application gate for
protected services. It can sit in front of selected apps through the reverse
proxy auth-request pattern.

Role:

- Check whether a request already has a valid authentication cookie.
- Send unauthenticated users to a login page.
- Alert on invalid login attempts.
- Optionally request edge-level blocks through the configured provider API.

Runtime values such as users, password hashes, session keys, allowed networks,
notification endpoints, and API tokens are provided by the deployment
environment.

## Edge And Application Protection

Documented protections include:

- Tunnel and reverse proxy for external access.
- Fail2Ban-style jail blocking for Nextcloud.
- Notification alerting for operational visibility.
- Strong passwords and two-factor authentication for user-facing services.
- Docker-socket tools separated into clearly documented operational stacks.
