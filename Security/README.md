# Security

This folder documents the security services and boundaries for the homelab.

Read [../docs/secrets-policy.md](../docs/secrets-policy.md) before adding new
configuration examples.

## HashiCorp Vault

Vault runs on the Automation LXC and is the intended place for live secrets.

Documented secret layout:

| Path pattern | Purpose |
|--------------|---------|
| `homelab/apps/<app-name>` | Application credentials |
| `homelab/config/<scope>` | Shared configuration values |

Tracked helper:

- `../Scripts/lxc-automation/vault-unseal.sh`

The helper expects secret material to be injected at deployment time. Do not add
Vault tokens, unseal keys, recovery keys, or live secret values to the repo.

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

## Edge And Application Protection

Documented protections include:

- Tunnel and reverse proxy for external access.
- Fail2Ban-style jail blocking for Nextcloud.
- Discord alerting for operational visibility.
- Strong passwords and two-factor authentication for user-facing services.

## Planned Components

| Component | Status | Notes |
|-----------|--------|-------|
| HoneyAuth | Planned | Custom gatekeeper with honeypot behavior. Not currently deployed. |

## Redaction Rule

When documenting security behavior, include what the value is used for, where it
is injected, and which service consumes it. Do not include the value itself.
