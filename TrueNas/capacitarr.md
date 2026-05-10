# Capacitarr

Capacitarr is deployed in the TrueNAS media stack as the media library capacity
manager. It evaluates media from the Servarr ecosystem and connected media
analytics, then ranks cleanup candidates using scoring weights and custom rules.

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

## Compose Excerpt

This excerpt intentionally uses an environment variable for the JWT signing
secret. Do not commit the real value.

```yaml
services:
  capacitarr:
    image: ghcr.io/ghent/capacitarr:stable
    container_name: capacitarr
    environment:
      - PUID=568
      - PGID=568
      - TZ=Europe/Bucharest
      - JWT_SECRET=${CAPACITARR_JWT_SECRET:-}
    volumes:
      - /mnt/mainpool/configs/capacitarr:/config
    ports:
      - "2187:2187"
    restart: unless-stopped
```

## Integrations

Capacitarr is intended to connect to the existing media services without storing
live tokens in this repo.

| Integration | Purpose |
|-------------|---------|
| Sonarr | TV library metadata and delete actions |
| Radarr | Movie library metadata and delete actions |
| Plex | Watch state and library context |
| Tautulli | Plex watch history and play analytics |

API keys, Plex tokens, and service credentials belong in the live runtime
configuration only.

## Scoring Profile

The initial policy is watch-history focused: items should become meaningful
cleanup candidates only after they are old enough to have had a fair chance to
be watched.

| Factor | Starting weight |
|--------|-----------------|
| Play History | `10 / 10` |
| Last Played | `9 / 10` |
| Time in Library | `8 / 10` |
| File Size | `3 / 10` |
| Rating | `2 / 10` |
| Show Status | `1 / 10` |

Recommended custom rule:

```text
If an item was added less than 365 days ago:
  Always keep
```

If the rule builder uses dates instead of durations, use the matching date one
year before the configuration day and set the effect to `Always keep`.

## Safety Settings

Capacitarr can ask Sonarr and Radarr to delete media, so rollout should stay
conservative.

| Setting | Recommended starting state |
|---------|----------------------------|
| Execution mode | Dry-run or approval |
| Actual deletions | Off until audit results are reviewed |
| Collection deletion | Off unless every collection source is reviewed |
| Show-level deletion | Review carefully for Sonarr before enabling live deletion |

The audit log should be reviewed before moving from dry-run to approval, and
again before enabling actual deletions.

## Storage Permission Note

The config dataset must allow the app user to write the SQLite database:

```text
/mnt/mainpool/configs/capacitarr
```

The deployed dataset uses the TrueNAS `apps` user/group model for UID/GID
`568:568`. If Capacitarr reports `permission denied` for
`/config/capacitarr.db`, fix the dataset ACL before restarting the container.
