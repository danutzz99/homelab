#!/usr/bin/env python3
"""
=============================================================================
gogu_bot.py - Discord Bot for Homelab Control
=============================================================================

PURPOSE:
    Discord bot that provides command-line control of the homelab.
    Fetches its authentication token from Vault at startup.

LOCATION:
    /home/dan/gogu-bot/gogu_bot.py

COMMANDS:
    !wake             - Send Wake-on-LAN to the Proxmox host
    !status           - Check status of core services
    !shutdown         - Shut down the Proxmox host after confirmation
    !notnow           - Skip the scheduled shutdown for the current night
    !shutdown_status  - Show whether scheduled shutdown is active or skipped
    !banned           - List IPs currently blocked by the edge security layer
    !ncbans           - List active Nextcloud Fail2Ban bans

DEPENDENCIES:
    pip3 install discord.py requests

CONFIGURATION:
    VAULT_ADDR                Vault base URL
    VAULT_TOKEN               Vault access token
    DISCORD_TOKEN_SECRET_PATH Secret path containing the Discord bot token
    PROXMOX_HOST              Proxmox host or management address
    TAUTULLI_URL              Tautulli base URL
    TAUTULLI_API_KEY          Tautulli API key
    PROXMOX_TOKEN_ID          Proxmox API token identifier
    PROXMOX_TOKEN_SECRET      Proxmox API token secret
    CF_ZONE_ID                Cloudflare zone identifier
    CF_API_TOKEN              Cloudflare API token

=============================================================================
"""

import os
import subprocess

import discord
import requests
from discord.ext import commands

VAULT_ADDR = os.getenv("VAULT_ADDR", "<VAULT_ADDR>")
VAULT_TOKEN = os.getenv("VAULT_TOKEN")
DISCORD_TOKEN_SECRET_PATH = os.getenv("DISCORD_TOKEN_SECRET_PATH", "<VAULT_SECRET_PATH>")


def get_discord_token():
    """Fetch the Discord bot token from Vault or environment."""
    try:
        headers = {"X-Vault-Token": VAULT_TOKEN}
        response = requests.get(
            f"{VAULT_ADDR}/v1/{DISCORD_TOKEN_SECRET_PATH}",
            headers=headers,
            timeout=5,
        )
        if response.status_code == 200:
            return response.json()["data"]["data"]["token"]
    except Exception as exc:
        print(f"Failed to fetch token from Vault: {exc}")
    return os.environ.get("DISCORD_TOKEN")


TOKEN = get_discord_token()
if not TOKEN:
    raise ValueError("Could not retrieve Discord token")

intents = discord.Intents.default()
intents.message_content = True

bot = commands.Bot(command_prefix="!", intents=intents)
PROXMOX_HOST = os.getenv("PROXMOX_HOST", "<PROXMOX_HOST>")
PROXMOX_USER = os.getenv("PROXMOX_USER", "root")
SKIP_FLAG = "/var/run/skip_shutdown_today"
TAUTULLI_URL = os.getenv("TAUTULLI_URL", "<TAUTULLI_URL>")


@bot.event
async def on_ready():
    print(f"Logged in as {bot.user} (ID: {bot.user.id})")


@bot.command(name="wake")
async def wake(ctx):
    """Wake the Proxmox host via Wake-on-LAN."""
    try:
        result = subprocess.run(
            ["/usr/local/bin/arise"],
            capture_output=True,
            text=True,
            timeout=10,
        )
        if result.returncode == 0:
            await ctx.send("Wake-on-LAN sent to Proxmox.")
        else:
            await ctx.send(f"WOL failed: {result.stderr.strip()}")
    except Exception as exc:
        await ctx.send(f"Error: {exc}")


@bot.command(name="notnow")
async def not_now(ctx):
    """Skip tonight's scheduled shutdown."""
    try:
        result = subprocess.run(
            ["ssh", f"{PROXMOX_USER}@{PROXMOX_HOST}", "not-now"],
            capture_output=True,
            text=True,
            timeout=10,
        )
        if result.returncode == 0:
            await ctx.send(result.stdout.strip() or "Shutdown skipped.")
        else:
            await ctx.send(f"Failed: {result.stderr.strip()}")
    except Exception as exc:
        await ctx.send(f"Error: {exc}")


@bot.command(name="shutdown_status")
async def shutdown_status(ctx):
    """Check whether tonight's shutdown is active or skipped."""
    try:
        result = subprocess.run(
            ["ssh", f"{PROXMOX_USER}@{PROXMOX_HOST}", f"test -f {SKIP_FLAG} && echo SKIP || echo ACTIVE"],
            capture_output=True,
            text=True,
            timeout=10,
        )
        state = result.stdout.strip()
        if state == "SKIP":
            await ctx.send("Tonight's shutdown is SKIPPED.")
        elif state == "ACTIVE":
            await ctx.send("Tonight's shutdown is ACTIVE.")
        else:
            await ctx.send(f"Unknown state: {result.stdout}")
    except Exception as exc:
        await ctx.send(f"Error: {exc}")


@bot.command(name="status")
async def status(ctx):
    """Trigger a manual health check of core services."""
    await ctx.send("Checking services...")
    results = []

    try:
        response = requests.get(f"{VAULT_ADDR}/v1/sys/health", timeout=5)
        if response.status_code == 200 and not response.json().get("sealed"):
            results.append("Vault: online and unsealed")
        else:
            results.append("Vault: sealed")
    except Exception:
        results.append("Vault: offline")

    try:
        response = requests.get(
            f"{TAUTULLI_URL}/api/v2?cmd=status&apikey={os.getenv('TAUTULLI_API_KEY')}",
            timeout=5,
        )
        results.append("Tautulli: online" if response.status_code == 200 else "Tautulli: offline")
    except Exception:
        results.append("Tautulli: offline")

    try:
        response = requests.get(
            f"https://{PROXMOX_HOST}:8006/api2/json/nodes",
            headers={
                "Authorization": (
                    f"PVEAPIToken={os.getenv('PROXMOX_TOKEN_ID')}={os.getenv('PROXMOX_TOKEN_SECRET')}"
                )
            },
            verify=False,
            timeout=5,
        )
        results.append("Proxmox: online" if response.status_code == 200 else "Proxmox: offline")
    except Exception:
        results.append("Proxmox: offline")

    results.append("Pi: online")
    await ctx.send("\n".join(results))


@bot.command(name="banned")
async def banned_ips(ctx):
    """List IPs blocked by the edge security layer."""
    zone_id = os.getenv("CF_ZONE_ID")
    api_token = os.getenv("CF_API_TOKEN")

    try:
        url = f"https://api.cloudflare.com/client/v4/zones/{zone_id}/firewall/access_rules/rules"
        headers = {"Authorization": f"Bearer {api_token}"}
        response = requests.get(url, headers=headers, timeout=10)
        data = response.json()

        if not data.get("success"):
            await ctx.send("Failed to fetch blocked IPs.")
            return

        bans = data.get("result", [])
        if not bans:
            await ctx.send("No IPs are currently blocked.")
            return

        lines = ["Blocked IPs", "```"]
        for ban in bans[:20]:
            ip = ban.get("configuration", {}).get("value", "N/A")
            date = ban.get("created_on", "")[:10]
            lines.append(f"{ip:<20} | {date}")
        lines.append(f"```\nTotal: {len(bans)} blocked")
        await ctx.send("\n".join(lines))
    except Exception as exc:
        await ctx.send(f"Error: {exc}")


@bot.command(name="ncbans")
async def nextcloud_bans(ctx):
    """List active Nextcloud Fail2Ban bans."""
    await ctx.send("Checking Nextcloud bans...")
    try:
        result = subprocess.run(
            ["ssh", f"{PROXMOX_USER}@{PROXMOX_HOST}", "/usr/local/bin/check_nc_bans.sh"],
            capture_output=True,
            text=True,
            timeout=15,
        )
        if result.returncode == 0:
            await ctx.send(result.stdout)
        else:
            await ctx.send(f"Failed to check bans: {result.stderr.strip()}")
    except Exception as exc:
        await ctx.send(f"Error: {exc}")


@bot.command(name="shutdown")
async def shutdown_proxmox(ctx):
    """Shut down the Proxmox host after confirmation."""
    await ctx.send("Are you sure? Reply `!confirm_shutdown` within 30 seconds.")

    def check(message):
        return message.author == ctx.author and message.content == "!confirm_shutdown"

    try:
        await bot.wait_for("message", check=check, timeout=30)
        await ctx.send("Shutting down Proxmox...")
        subprocess.run(
            ["ssh", f"{PROXMOX_USER}@{PROXMOX_HOST}", "shutdown -h now"],
            timeout=10,
        )
    except Exception:
        await ctx.send("Shutdown cancelled (timeout or wrong command).")


bot.run(TOKEN)
