# Secrets Policy

This repository should explain the homelab without exposing operational secrets.

## Safe To Commit

These details are useful because they explain the shape of the setup:

| Good to include | Why |
|-----------------|-----|
| Service names | Helps readers know what runs where |
| Container image names | Shows what software each stack uses |
| Component roles | Explains why a service exists |
| Generic paths | Shows the storage pattern without exposing private values |
| Required local ports | Explains service wiring |
| Environment variable names | Shows what configuration exists without showing values |
| Empty placeholders | Makes templates reusable and safe |

## Do Not Commit

Never commit live values for:

- Cloudflare API tokens, tunnel tokens, account IDs, zone IDs, or real domain
  lists.
- AirVPN or WireGuard private keys, preshared keys, assigned addresses, or
  provider config.
- Vault tokens, unseal keys, root tokens, recovery keys, or secret path contents.
- Webhook URLs or notification endpoints with real IDs or secrets.
- App passwords, database passwords, passphrases, cookies, or session values.
- Bootstrap credentials such as default admin usernames when paired with a real
  password or token.
- Dockpeek usernames/passwords or other Docker admin tool credentials.
- Public IP addresses, private IP addresses, MAC addresses, hostnames, or SSH
  usernames if they identify the live environment.
- Exact timezone or locale values when they reveal the operator's location.

## Documentation Pattern

Use environment variable names and placeholders:

```yaml
environment:
  - TUNNEL_TOKEN=${CLOUDFLARED_TUNNEL_TOKEN:-}
  - CLOUDFLARE_API_TOKEN=${CLOUDFLARE_API_TOKEN:-}
  - TZ=${HOMELAB_TIMEZONE:-}
  - POSTGRES_PASSWORD=${MEDIAMANAGER_POSTGRES_PASSWORD:-}
```

Avoid examples that include real domains, IPs, tokens, keys, or passwords.

## Before Adding A File

1. Replace live tokens, keys, and passwords with empty values or placeholders.
2. Replace domains, IPs, MACs, UUIDs, disk IDs, machine IDs, and location-like
   values such as exact timezones with generic wording or placeholders.
3. Replace local workstation paths with repo-relative or generic paths.
4. Keep only the variable names needed to explain how deployment works.
