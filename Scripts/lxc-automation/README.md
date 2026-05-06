# Automation LXC Scripts

This folder contains the startup helpers and service templates for the
Automation LXC.

## Files

| File | Purpose |
|------|---------|
| `wait-for-nfs.sh` | Waits for NAS-backed configuration storage before Docker services start |
| `vault-unseal.sh` | Completes the Vault recovery flow after boot |
| `automation-stack.yaml` | Example Automation LXC container stack for Vault, Tautulli, and HoneyAuth |
| `vault.hcl` | Vault server configuration used by the stack |
| `systemd/automation-stack.service` | Starts the Automation LXC stack after storage is ready |
| `systemd/vault-unseal.service` | Runs the Vault recovery helper after the stack is up |

## Startup Model

The Automation LXC waits for shared storage first, then starts its Docker stack,
then runs the Vault recovery helper. This keeps Vault, monitoring, and app
protection data from starting against empty or missing storage.
