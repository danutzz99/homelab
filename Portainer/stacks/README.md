# Portainer Stack Templates

These files are compact Portainer-oriented stack templates. They mirror the
TrueNAS stack definitions and should be kept synchronized with
`../../TrueNas/stacks/`.

| File | Purpose | Mirror |
|------|---------|--------|
| [main-stack.yaml](main-stack.yaml) | Servarr/media automation stack, including Watchtower | `../../TrueNas/stacks/main-stack.yaml` |
| [nginx-ddns.yaml](nginx-ddns.yaml) | Nginx Proxy Manager and Cloudflare DDNS | `../../TrueNas/stacks/nginx-ddns.yaml` |

## Runtime Configuration

Deployment-specific values are left blank in the templates and filled in through
Portainer, Vault, or the runtime environment.

See [../../docs/secrets-policy.md](../../docs/secrets-policy.md) for safe
documentation guidance.
