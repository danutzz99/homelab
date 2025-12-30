#!/usr/bin/env python3
"""
=============================================================================
gogu_bot.py - Discord Bot for Homelab Control
=============================================================================

PURPOSE:
    Discord bot that provides command-line control of the homelab.
    Fetches its authentication token from HashiCorp Vault for security.

LOCATION: /home/dan/gogu-bot/gogu_bot.py (on Raspberry Pi)

COMMANDS:
    !wake           - Send Wake-on-LAN to Proxmox
    !status         - Check status of all services
    !shutdown       - Shutdown Proxmox (requires confirmation)
    !notnow         - Skip tonight's scheduled shutdown
    !shutdown_status - Show if shutdown is active or skipped
    !banned         - List IPs banned by HoneyAuth via Cloudflare
    !ncbans         - List IPs blocked by Nextcloud Fail2Ban + Usernames

DEPENDENCIES:
    pip3 install discord.py requests

VAULT INTEGRATION:
    Token stored at: homelab/apis/discord-bot
    Bot fetches token at startup using Vault API

CONFIGURATION:
    Replace <VAULT_ADDR> with Vault URL
    Replace <VAULT_TOKEN> with Vault access token
    Replace <API_KEYS> with actual API keys

=============================================================================
"""

import subprocess
import os
import requests
import discord
from discord.ext import commands

# Vault Configuration - Replace with actual values
VAULT_ADDR = "<VAULT_ADDR>"
VAULT_TOKEN = os.getenv('VAULT_TOKEN') # Redacted for Repo

def get_discord_token():
    """Fetch Discord bot token from Vault"""
    try:
        headers = {"X-Vault-Token": VAULT_TOKEN}
        resp = requests.get(
            f"{VAULT_ADDR}/v1/homelab/data/apis/discord-bot", 
            headers=headers, 
            timeout=5
        )
        if resp.status_code == 200:
            return resp.json()["data"]["data"]["token"]
    except Exception as e:
        print(f"Failed to fetch token from Vault: {e}")
    return os.environ.get("DISCORD_TOKEN")

TOKEN = get_discord_token()
if not TOKEN:
    raise ValueError("Could not retrieve Discord token")

intents = discord.Intents.default()
intents.message_content = True

bot = commands.Bot(command_prefix="!", intents=intents)
PROXMOX_HOST = "<PROXMOX_IP>"
PROXMOX_USER = "root"
SKIP_FLAG = "/var/run/skip_shutdown_today"

@bot.event
async def on_ready():
    print(f"Logged in as {bot.user} (ID: {bot.user.id})")

@bot.command(name="wake")
async def wake(ctx):
    """Wake Proxmox via WOL."""
    try:
        result = subprocess.run(
            ["/usr/local/bin/arise"], 
            capture_output=True, 
            text=True, 
            timeout=10
        )
        if result.returncode == 0:
            await ctx.send("✅ Sent Wake-on-LAN to Proxmox.")
        else:
            await ctx.send(f"⚠️ WOL failed: {result.stderr.strip()}")
    except Exception as e:
        await ctx.send(f"⚠️ Error: {e}")

@bot.command(name="notnow")
async def not_now(ctx):
    """Skip tonight's 02:00 shutdown."""
    try:
        result = subprocess.run(
            ["ssh", f"{PROXMOX_USER}@{PROXMOX_HOST}", "not-now"], 
            capture_output=True, 
            text=True, 
            timeout=10
        )
        if result.returncode == 0:
            await ctx.send(f"✅ {result.stdout.strip() or 'Shutdown skipped.'}")
        else:
            await ctx.send(f"⚠️ Failed: {result.stderr.strip()}")
    except Exception as e:
        await ctx.send(f"⚠️ Error: {e}")

@bot.command(name="shutdown_status")
async def shutdown_status(ctx):
    """Check if tonight's shutdown is active/skipped."""
    try:
        result = subprocess.run(
            ["ssh", f"{PROXMOX_USER}@{PROXMOX_HOST}", 
             f"test -f {SKIP_FLAG} && echo SKIP || echo ACTIVE"], 
            capture_output=True, 
            text=True, 
            timeout=10
        )
        state = result.stdout.strip()
        if state == "SKIP":
            await ctx.send("🟡 Tonight's shutdown is **SKIPPED**.")
        elif state == "ACTIVE":
            await ctx.send("🟢 Tonight's shutdown is **ACTIVE**.")
        else:
            await ctx.send(f"⚠️ Unknown state: {result.stdout}")
    except Exception as e:
        await ctx.send(f"⚠️ Error: {e}")

@bot.command(name="status")
async def status(ctx):
    """Trigger manual health check of all services."""
    await ctx.send("🔍 Checking services...")
    results = []
    
    # Check Vault
    try:
        r = requests.get(f"{VAULT_ADDR}/v1/sys/health", timeout=5)
        if r.status_code == 200 and not r.json().get("sealed"):
            results.append("🔐 Vault: ✅ Online (unsealed)")
        else:
            results.append("🔐 Vault: ⚠️ Sealed")
    except:
        results.append("🔐 Vault: ❌ Offline")
    
    # Check Tautulli
    try:
        r = requests.get(
            f"<TAUTULLI_URL>/api/v2?cmd=status&apikey={os.getenv('TAUTULLI_API_KEY')}", 
            timeout=5
        )
        results.append("📺 Tautulli: ✅ Online" if r.status_code == 200 
                      else "📺 Tautulli: ❌ Offline")
    except:
        results.append("📺 Tautulli: ❌ Offline")
    
    # Check Proxmox
    try:
        r = requests.get(
            f"https://{PROXMOX_HOST}:8006/api2/json/nodes", 
            headers={"Authorization": f"PVEAPIToken={os.getenv('PROXMOX_TOKEN_ID')}={os.getenv('PROXMOX_TOKEN_SECRET')}"}, 
            verify=False, 
            timeout=5
        )
        results.append("🖥️ Proxmox: ✅ Online" if r.status_code == 200 
                      else "🖥️ Proxmox: ❌ Offline")
    except:
        results.append("🖥️ Proxmox: ❌ Offline")
    
    # Check Pi (we are the Pi!)
    results.append("🍓 Pi: ✅ Online")
    
    await ctx.send("\n".join(results))

@bot.command(name="banned")
async def banned_ips(ctx):
    """List IPs banned by HoneyAuth via Cloudflare. (Redacted)"""
    # Sensitive IDs are injected via environment variables
    CF_ZONE_ID = os.getenv('CF_ZONE_ID')
    CF_API_TOKEN = os.getenv('CF_API_TOKEN')
    
    try:
        url = f"https://api.cloudflare.com/client/v4/zones/{CF_ZONE_ID}/firewall/access_rules/rules"
        headers = {"Authorization": f"Bearer {CF_API_TOKEN}"}
        resp = requests.get(url, headers=headers, timeout=10)
        data = resp.json()
        
        if not data.get("success"):
            await ctx.send("❌ Failed to fetch banned IPs.")
            return
        
        bans = data.get("result", [])
        if not bans:
            await ctx.send("🎉 No IPs currently banned.")
            return
        
        lines = ["🛡️ **Banned IPs**", "```"]
        for ban in bans[:20]:
            ip = ban.get("configuration", {}).get("value", "N/A")
            date = ban.get("created_on", "")[:10]
            lines.append(f"{ip:<20} | {date}")
        lines.append(f"```\nTotal: {len(bans)} blocked")
        
        await ctx.send("\n".join(lines))
    except Exception as e:
        await ctx.send(f"⚠️ Error: {e}")



@bot.command(name="ncbans")
async def nextcloud_bans(ctx):
    """List IPs banned by Nextcloud Fail2Ban and attempted username."""
    await ctx.send("🔍 Checking Nextcloud bans...")
    try:
        # Run the check script on Proxmox host
        result = subprocess.run(
            ["ssh", f"{PROXMOX_USER}@{PROXMOX_HOST}", "/usr/local/bin/check_nc_bans.sh"], 
            capture_output=True, 
            text=True, 
            timeout=15
        )
        if result.returncode == 0:
            # Script output is already formatted for Discord (contains ```)
            await ctx.send(result.stdout)
        else:
            await ctx.send(f"⚠️ Failed to check bans: {result.stderr.strip()}")
    except Exception as e:
        await ctx.send(f"⚠️ Error: {e}")

@bot.command(name="shutdown")
async def shutdown_proxmox(ctx):
    """Shutdown Proxmox host. USE WITH CAUTION!"""
    await ctx.send("⚠️ Are you sure? Reply `!confirm_shutdown` within 30 seconds.")
    
    def check(m):
        return m.author == ctx.author and m.content == "!confirm_shutdown"
    
    try:
        await bot.wait_for("message", check=check, timeout=30)
        await ctx.send("🛑 Shutting down Proxmox...")
        subprocess.run(
            ["ssh", f"{PROXMOX_USER}@{PROXMOX_HOST}", "shutdown -h now"], 
            timeout=10
        )
    except:
        await ctx.send("❌ Shutdown cancelled (timeout or wrong command).")

bot.run(TOKEN)
