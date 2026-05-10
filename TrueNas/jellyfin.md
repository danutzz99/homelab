# Jellyfin

Jellyfin is deployed from the TrueNAS catalog as an additional media server. It
is managed by the TrueNAS Apps lifecycle rather than the custom Portainer stack
templates.

## Status

| Item | Value |
|------|-------|
| Status | Deployed and online |
| Deployment path | TrueNAS catalog app |
| Role | Media server and streaming endpoint |
| Default HTTP port | `8096` |
| Default HTTPS port | `8920` |

## Access

Local access uses the TrueNAS host address and the Jellyfin HTTP port:

```text
http://<truenas-host>:8096
```

Do not store real user passwords, API keys, or live access tokens in this
repository.

## API Key

Create Jellyfin API keys from the Jellyfin dashboard only when an integration
needs one:

```text
Dashboard -> Advanced -> API Keys
```

Treat API keys like passwords.

## Notes

- Jellyfin's local discovery traffic is for local networks only.
- If a TrueNAS catalog update changes app ports or routing, update this document
  with placeholders only.
