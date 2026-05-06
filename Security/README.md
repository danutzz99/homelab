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

- `TUNNEL_TOKEN`
- `CLOUDFLARE_API_TOKEN`
- `DOMAINS`

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
