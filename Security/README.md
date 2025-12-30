# Security Architecture

## 🔐 HashiCorp Vault

Runs on the Automation LXC. Stores all sensitive credentials.

### Secret Paths
*   `homelab/apps/<app-name>`: Application credentials
*   `homelab/config/<scope>`: Shared configuration

## 🍯 HoneyAuth (Gatekeeper) - *Planned*

Custom authentication gateway with honeypot capabilities. **Not yet deployed.**

## 🛡️ Network

*   **Cloudflare Tunnel**: Secure outbound tunnel for external access
*   **Cloudflare Proxy**: All DNS records proxied
