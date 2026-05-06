# External Notes Audit

This is a sanitized summary of external notes reviewed while improving the
`homelab` repo. It intentionally avoids local paths, private folder names,
domains, IP addresses, MAC addresses, tokens, webhook URLs, credentials, serial
numbers, and account names.

Use this file as a reminder of what still needs to be promoted into the repo,
not as a place to store private source material.

## Coverage

The review included:

- The tracked `homelab` repository.
- External power-management notes.
- External application notes for services that are not first-class repo files
  yet.
- External storage and historical service notes.
- Private reference notes that must remain outside this repo.

Only high-level, redacted conclusions belong here.

## Important Findings

### Proxmox RTC Power Plan

External power notes describe a newer power setup:

- The automatic daily shutdown/wake cycle no longer depends on the Raspberry Pi.
- Proxmox sets a motherboard RTC wake alarm before shutting down.
- A skip flag can prevent the next scheduled shutdown.
- A small power-only command bot can run on Proxmox while Proxmox is on.
- Manual Discord wake still requires an always-on bot host plus WOL, BMC, IPMI,
  or another external wake method.

Recommended repo follow-up:

- Promote sanitized RTC scripts into `homelab/Scripts/proxmox/`.
- Add the power-only bot under a clear Proxmox power-control folder if it is
  live.
- Keep older Pi-dependent daily shutdown docs marked as legacy.

### Watchtower

External application notes describe Watchtower as added to the TrueNAS Docker
environment:

- Weekly schedule: Monday 11:00 in the server's configured timezone.
- Docker socket access.
- Discord notification support through an external secret value.
- Manual run documented as working.

Recommended repo follow-up:

- Add a sanitized Watchtower service to the relevant stack file if it is live.
- Prefer label-based updates if auto-updating every container is too broad.

### Reactive Resume And Ollama

External application notes describe Reactive Resume as deployed in a Proxmox LXC,
not through the tracked Portainer stack files.

Documented shape:

- Reactive Resume runs on port `3000`.
- Ollama runs inside the same LXC.
- Ollama is kept loopback-only.
- The first working model documented is `qwen2.5:1.5b`.
- Local AI support needed an allowlist/source patch in the documented setup.

Recommended repo follow-up:

- Add a sanitized `ReactiveResume/` or `Apps/reactive-resume/` section if this is
  now a permanent service.
- Keep any Compose draft labeled as alternate or historical unless it is live.

### n8n Status Conflict

The notes have conflicting n8n evidence:

- The repo documents the n8n mail classifier and manual Discord-triggered runs.
- External notes describe n8n as decommissioned while Vault and Tautulli remain.

Recommended repo follow-up:

- Verify the live Automation LXC before calling n8n active.
- Keep the mail-classifier docs as reference unless the service is confirmed.

### Nextcloud Storage And HDD Notes

External storage notes describe SMART findings and Nextcloud storage
architecture.

Safe high-level takeaways:

- Nextcloud storage is documented as host-managed storage bind-mounted into the
  LXC.
- The main Nextcloud data volume is documented as LVM across multiple disks, not
  redundancy.
- A separate HDD was evaluated for separate external-storage use rather than
  merging into the existing LVM.

Recommended repo follow-up:

- Add a sanitized storage-risk page if these disk decisions remain important.
- Avoid documenting serials, UUIDs, private IPs, live mount identifiers, and
  exact device identities in public-safe docs.

### Vaultwarden

External historical notes contain a Vaultwarden deployment draft and
troubleshooting notes.

Takeaways:

- The notes are a historical deployment attempt/draft.
- The safer direction described there is to keep Vaultwarden data and database
  paths separate if using a catalog app.
- A simpler one-container Compose draft exists for a low-friction deployment.

Recommended repo follow-up:

- Do not list Vaultwarden as current unless it is confirmed live.

### HoneyAuth

External experimental notes include a HoneyAuth concept:

- Flask-based auth gatekeeper.
- Nginx `auth_request` integration concept.
- Discord alerting and optional Cloudflare blocking.

Recommended repo follow-up:

- Keep HoneyAuth marked planned/experimental unless deployed.
- Review the code carefully before using it, especially default secrets, password
  logging behavior, and Cloudflare-ban behavior.

## Sensitive Areas

The external notes include private operational values. Do not paste their raw
contents into docs. Use placeholders and environment variable names instead.

Never commit:

- Local machine paths or private folder names.
- Credential folders or credential file names.
- Secret tokens, webhook URLs, passwords, API keys, or private keys.
- Real domains, private IP addresses, MAC addresses, UUIDs, serial numbers, or
  account names.
- Raw exports that may contain embedded webhook or OAuth references.

## Recommended Cleanup Path

1. Keep `homelab/` as the clean documentation source.
2. Promote only sanitized, current content from external notes.
3. Keep private references outside the public repo path.
4. Decide whether n8n is active, historical, or decommissioned.
5. Decide whether Watchtower and Reactive Resume should become first-class
   tracked services in `homelab/`.
