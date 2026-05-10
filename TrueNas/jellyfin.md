# Jellyfin

Jellyfin is deployed from the TrueNAS catalog as a media server and streaming
endpoint. It is managed by the TrueNAS Apps lifecycle rather than the custom
Portainer stack templates.

## Status

| Item | Value |
|------|-------|
| Status | Deployed and online |
| Deployment path | TrueNAS catalog app |
| Role | Media server and streaming endpoint |
| Default HTTP port | `8096` |
| Default HTTPS port | `8920` |

## How It Fits

Jellyfin reads media from the TrueNAS storage side and serves it to local or
approved remote clients. It is separate from the Portainer media automation
stack, so app lifecycle actions happen through TrueNAS Apps rather than the
Compose templates in `TrueNas/stacks/`.

## Access

Local access uses the TrueNAS host address and the Jellyfin HTTP port:

```text
http://<truenas-host>:8096
```

Do not store real user passwords, API keys, or access tokens in this repository.

## API Keys

Create Jellyfin API keys from the Jellyfin dashboard only when an integration
needs one:

```text
Dashboard -> Advanced -> API Keys
```

Treat API keys like passwords and store live values outside the repo.
