# Safety Advice

This page is only general advice for keeping the repo useful, readable, and
safe to share.

## Good Repo Content

These details are useful because they explain the shape of the setup:

| Good to include | Why |
|-----------------|-----|
| Service names | Helps readers know what runs where |
| Container image names | Shows what software each stack uses |
| Component roles | Explains why a service exists |
| Generic paths | Shows the storage pattern without exposing a private machine |
| Public documentation links | Helps future maintenance |
| Required local ports | Explains service wiring |
| Environment variable names | Shows what configuration exists without showing values |
| Empty placeholders | Makes templates reusable and safe |

Examples:

```yaml
environment:
  TUNNEL_TOKEN: ""
  CLOUDFLARE_API_TOKEN: ""
```

```text
The service reads its webhook URL from the runtime environment.
```

```text
Persistent app data lives under `/mnt/mainpool/configs/<service>`.
```

## Keep Out Of The Repo

These values belong only in the live environment:

| Keep out | Examples |
|----------|----------|
| Tokens and API keys | Cloudflare, Discord, Vault, Proxmox, Tautulli |
| Webhook URLs | Notification endpoints with real IDs or secrets |
| Authentication values | Passwords, passphrases, cookies, session secrets |
| VPN credentials | WireGuard private keys, preshared keys, assigned addresses |
| OAuth values | Refresh tokens, client secrets, credential IDs or names |
| Live network identifiers | Public/private IPs, MAC addresses, hostnames, SSH usernames |
| Hardware identifiers | Disk serials, machine IDs, UUIDs |
| Personal paths | Usernames, workstation names, local drive paths |

## Safe Writing Pattern

When documenting an integration, describe what the value does and where the live
system reads it from.

Good:

```text
Watchtower can send notifications through a runtime-provided notification URL.
```

```text
Vault recovery values are supplied by the deployment environment.
```

Avoid:

```text
Watchtower sends to <full-live-webhook-url>.
Vault unseal key is <live-key>.
The server is at <live-ip-or-domain>.
```

## Before Adding A File

Use this quick check before committing a new script, stack, workflow export, or
note:

1. Replace live tokens, keys, and passwords with empty values or placeholders.
2. Replace domains, IPs, MACs, UUIDs, disk IDs, and machine IDs with generic
   wording.
3. Replace local workstation paths with repo-relative or generic paths.
4. Keep only the variable names needed to explain how deployment works.
5. If a detail only helps troubleshoot one inspection session, put it in the
   local dated notes instead of the main repo docs.

## Maintenance Tip

As a routine good practice, rotate tokens, webhooks, and API keys from time to
time, especially after access changes or when replacing an integration.
