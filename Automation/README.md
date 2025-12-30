# Automation & Scripts

## GitLab CI Pipeline

Weekly update pipeline for Proxmox host and Plex VM.

*   **Schedule**: Monday 11:00 AM
*   **Actions**: `apt update && apt upgrade -y && apt autoremove -y`
*   **Runner**: Installed on Proxmox host

## Active Scripts

### `pi-server.py`
*   **Location**: Raspberry Pi Zero
*   **Function**: Wake-on-LAN & uptime monitoring
