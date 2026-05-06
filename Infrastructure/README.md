# Infrastructure

This folder documents the server platform: Proxmox, TrueNAS, storage, and VM
optimization notes.

For the full topology, start with [../docs/current-setup.md](../docs/current-setup.md).

## Proxmox VE Host

Proxmox is the physical host and hypervisor.

| Guest | Role | Notes |
|-------|------|-------|
| TrueNAS Scale VM | Storage and Docker host | Optimized for storage and app hosting |
| Plex VM | Media streaming | Uses NVIDIA GTX 1070 passthrough |
| Automation LXC | Vault, n8n, Tautulli | Runs automation and secret services |
| Client LXC | Nextcloud | Private cloud and shared family files |

## TrueNAS VM Optimization

| Setting | Current value |
|---------|---------------|
| CPU type | `host` for AES-NI passthrough |
| Memory | Fixed allocation, no ballooning |
| Disk controller | VirtIO SCSI |

## Plex VM Optimization

| Setting | Current value |
|---------|---------------|
| GPU passthrough | NVIDIA GTX 1070 |
| Guest drivers | Official NVIDIA drivers on Ubuntu VM |

## TrueNAS Scale

TrueNAS Scale acts as the NAS and Docker host. Portainer is deployed as a custom
app inside TrueNAS Scale and manages the tracked stacks.

### Storage Layout

| Path | Purpose |
|------|---------|
| `/mnt/mainpool` | Main ZFS pool |
| `/mnt/mainpool/media` | Media dataset and SMB share |
| `/mnt/mainpool/configs` | Persistent app configuration |

### App Permissions

| Setting | Value |
|---------|-------|
| PUID | `568` |
| PGID | `568` |

Most containers mount configuration from `/mnt/mainpool/configs/<service>`.

## Related Files

| Path | Purpose |
|------|---------|
| `../TrueNas/stacks/main-stack.yaml` | Media automation stack |
| `../TrueNas/stacks/nginx-ddns.yaml` | Reverse proxy and DDNS stack |
| `../Scripts/proxmox/` | Proxmox lifecycle notification scripts |
| `../Scripts/lxc-automation/` | Automation LXC boot helpers |
