# Capacitarr

Capacitarr is part of the TrueNAS Servarr/media stack. It helps manage media
library capacity by scoring cleanup candidates instead of blindly deleting
files.

## Status

| Item | Value |
|------|-------|
| Status | Deployed |
| Stack | `TrueNas/stacks/main-stack.yaml` |
| Container | `capacitarr` |
| Image | `ghcr.io/ghent/capacitarr:stable` |
| Port | `2187` |
| Config path | `/mnt/mainpool/configs/capacitarr` |
| App user | `PUID=568`, `PGID=568` |

## How It Fits

Capacitarr works alongside the media automation stack:

- Sonarr and Radarr provide media-library context.
- Plex and Tautulli can provide watch-history context.
- Capacitarr uses rules and scoring to decide which items are good cleanup
  candidates.

The important design goal is safety: cleanup decisions should be reviewable and
based on real usage, not only file age or size.

## Compose Shape

```yaml
services:
  capacitarr:
    image: ghcr.io/ghent/capacitarr:stable
    container_name: capacitarr
    environment:
      - TZ=${HOMELAB_TIMEZONE:-}
      - PUID=568
      - PGID=568
      - JWT_SECRET=${CAPACITARR_JWT_SECRET:-}
    restart: unless-stopped
    ports:
      - "2187:2187"
    volumes:
      - /mnt/mainpool/configs/capacitarr:/config
```

## Safety Notes

- Keep the real `CAPACITARR_JWT_SECRET` outside the repo.
- Keep live Plex, Tautulli, Sonarr, and Radarr tokens outside the repo.
- Use dry-run or approval mode until the scoring output has been reviewed.
- Do not enable deletion until the rules are trusted.

## Storage Permission Note

The config dataset must be writable by the app user:

```text
/mnt/mainpool/configs/capacitarr
```

If Capacitarr reports a SQLite or config write error, check TrueNAS dataset ACLs
for UID/GID `568:568`.
