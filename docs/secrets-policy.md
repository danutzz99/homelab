# Secrets Policy

This repository should explain the homelab without exposing operational secrets.

## Safe To Commit

These are safe when they are placeholders, environment variable names, or generic
examples:

- Service names.
- Container image names.
- Internal role descriptions.
- Generic paths such as `/mnt/mainpool/configs/<service>`.
- Public documentation links.
- Port mappings already required to understand local service wiring.
- Environment variable names such as `DISCORD_WEBHOOK` or `VAULT_ADDR`.
- Placeholder values such as `<VAULT_ADDR>`, `<PROXMOX_HOST>`, and empty Compose
  values like `TUNNEL_TOKEN=`.

## Do Not Commit

Never commit live values for:

- Discord bot tokens or webhook URLs.
- Cloudflare API tokens, tunnel tokens, zone IDs, account IDs, or real domain
  lists.
- WireGuard private keys, preshared keys, assigned addresses, or provider config.
- Vault tokens, unseal keys, root tokens, recovery keys, or secret path contents.
- Proxmox API token secrets.
- Tautulli API keys.
- mail provider credential IDs, credential names, refresh tokens, or OAuth client
  secrets.
- Public IP addresses, private IP addresses, MAC addresses, hostnames, or SSH
  usernames if they identify the live environment.
- Passwords, passphrases, backup encryption keys, database credentials, and
  cookie/session values.

## Documentation Pattern

Use this pattern when documenting sensitive integrations:

```text
The service reads `<SECRET_NAME>` from the deployment environment.
The live value is stored outside the repository, usually in Vault or the runtime
environment.
```

Good examples:

```yaml
environment:
  - TUNNEL_TOKEN=
  - CLOUDFLARE_API_TOKEN=
```

```bash
DISCORD_WEBHOOK="${DISCORD_WEBHOOK}"
VAULT_ADDR="<VAULT_ADDR>"
```

Avoid examples like:

```text
<discord-webhook-url-with-real-id-and-secret>
<real-domain>
<live-ip-address>
```

## Before Adding A File

1. Replace live identifiers with placeholders.
2. Replace domain names with `<domain>` or `<n8n-domain>`.
3. Replace IPs and MAC addresses with placeholders.
4. Replace user-specific paths with `<user>` when possible.
5. Keep only the environment variable names needed to understand deployment.

## Current Repo State

The tracked stack and workflow files use placeholders or environment variable
names for sensitive values. Keep that convention.

## General Maintenance

As a routine good practice, rotate tokens, webhooks, and API keys from time to
time, especially after access changes or when replacing an integration.
