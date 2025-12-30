# Infrastructure Configuration

## 🖥️ Proxmox VE (Host)

### VM Optimization (TrueNAS)
*   **CPU Type**: `host` (AES-NI passthrough)
*   **Memory**: Fixed allocation (no ballooning)
*   **Disk**: VirtIO SCSI controller

### VM Optimization (Plex)
*   **PCI Passthrough**: NVIDIA GTX 1070
*   **Drivers**: Official NVIDIA drivers (Ubuntu VM)

## 💾 TrueNAS Scale (NAS VM)

### Docker Management
*   **Portainer**: Deployed as a **Custom App** within TrueNAS Scale UI

### ZFS Layout
*   **Main Pool**: `/mnt/mainpool`
*   **Media Dataset**: `/mnt/mainpool/media` (SMB Share)
*   **Configs Dataset**: `/mnt/mainpool/configs`

### Permissions
*   **PUID/PGID**: `568:568` (Apps user)
