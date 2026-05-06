# Portainer Stack Templates

These files are compact Portainer-oriented stack templates. They mirror the
TrueNAS stack definitions and should be kept synchronized with
`../../TrueNas/stacks/`.

| File | Purpose | Mirror |
|------|---------|--------|
| [main-stack.yaml](main-stack.yaml) | Servarr/media automation stack, including Watchtower | `../../TrueNas/stacks/main-stack.yaml` |
| [nginx-ddns.yaml](nginx-ddns.yaml) | Nginx Proxy Manager and Cloudflare DDNS | `../../TrueNas/stacks/nginx-ddns.yaml` |

## Secret Convention

Sensitive values are placeholders only. Fill live values in Portainer, Vault, or
the runtime environment, not in Git.

See [../../docs/secrets-policy.md](../../docs/secrets-policy.md).
