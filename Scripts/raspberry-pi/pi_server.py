#!/usr/bin/env python3
"""
=============================================================================
pi_server.py - Pi HTTP API Server
=============================================================================

PURPOSE:
    Provides a lightweight HTTP API for health checks and Wake-on-LAN control.
    Used by n8n workflows for automated health monitoring.

LOCATION: /home/dan/pi_server.py (on Raspberry Pi)

ENDPOINTS:
    GET  /health  - Simple "I am alive" check
    GET  /status  - Full status including Gogu bot process
    POST /wol     - Trigger Wake-on-LAN and notify Discord

DEPENDENCIES:
    pip3 install flask

CONFIGURATION:
    Replace <PROXMOX_MAC> with actual MAC address
    Replace <DISCORD_WEBHOOK_URL> with webhook URL

=============================================================================
"""

from flask import Flask, jsonify, request
import subprocess
import os
from datetime import datetime

app = Flask(__name__)

# Configuration - Replace with actual values
PROXMOX_MAC = "<PROXMOX_MAC_ADDRESS>"
DISCORD_WEBHOOK = "<DISCORD_WEBHOOK_URL>"

@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint - Returns basic status"""
    return jsonify({
        "status": "online",
        "hostname": os.uname().nodename,
        "timestamp": datetime.utcnow().isoformat()
    })

@app.route("/wol", methods=["POST"])
def wake_on_lan():
    """Trigger Wake-on-LAN for Proxmox and notify Discord"""
    try:
        result = subprocess.run(
            ["wakeonlan", PROXMOX_MAC],
            capture_output=True,
            text=True
        )
        
        # Notify Discord
        import urllib.request
        import json
        data = json.dumps({
            "embeds": [{
                "title": "🔆 Wake-on-LAN Triggered",
                "description": f"WOL packet sent to Proxmox ({PROXMOX_MAC})",
                "color": 16776960,
                "timestamp": datetime.utcnow().isoformat()
            }]
        }).encode()
        req = urllib.request.Request(
            DISCORD_WEBHOOK, 
            data=data, 
            headers={"Content-Type": "application/json"}
        )
        urllib.request.urlopen(req)
        
        return jsonify({"status": "success", "message": "WOL packet sent"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/status", methods=["GET"])
def status():
    """Full status including Gogu bot process check"""
    gogu_running = subprocess.run(
        ["pgrep", "-f", "gogu_bot.py"], 
        capture_output=True
    ).returncode == 0
    return jsonify({
        "pi_status": "online",
        "gogu_bot": "running" if gogu_running else "stopped",
        "timestamp": datetime.utcnow().isoformat()
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
