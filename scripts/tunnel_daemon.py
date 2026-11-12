"""
TradeX Pro Persistent Tunnel Supervisor
Monitors the public tunnel and automatically restarts it with keepalive if it ever disconnects.
"""

import subprocess
import time
import sys
import os

def run_tunnel():
    cmd = [
        "ssh",
        "-o", "StrictHostKeyChecking=no",
        "-o", "ServerAliveInterval=15",
        "-o", "ServerAliveCountMax=3",
        "-R", "80:localhost:3000",
        "nokey@localhost.run"
    ]
    print("[Supervisor] Starting TradeX Pro persistent tunnel...", flush=True)
    while True:
        try:
            proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
            for line in proc.stdout:
                line_s = line.strip()
                if "tunneled with tls termination" in line_s or "lhr.life" in line_s:
                    print(f"[Supervisor] Active Public URL: {line_s}", flush=True)
            proc.wait()
            print("[Supervisor] Tunnel disconnected. Reconnecting in 3 seconds...", flush=True)
            time.sleep(3)
        except Exception as e:
            print(f"[Supervisor] Error: {e}. Retrying in 5 seconds...", flush=True)
            time.sleep(5)

if __name__ == "__main__":
    run_tunnel()
