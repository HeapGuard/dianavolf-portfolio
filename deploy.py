#!/usr/bin/env python3
"""Deploy the built portfolio to a VPS through OpenSSH.

Run: python deploy.py --config deploy.config.json
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import shutil
import subprocess
import sys
import tarfile
import tempfile
from pathlib import Path


ROOT = Path(__file__).resolve().parent


def fail(message: str) -> None:
    print(f"ERROR: {message}", file=sys.stderr)
    raise SystemExit(1)


def run(command: list[str], *, input_text: str | None = None) -> None:
    print("+", " ".join(command))
    try:
        # Passing text to a Windows subprocess converts LF to CRLF. Remote bash
        # must receive its script with Unix LF line endings.
        if input_text is None:
            subprocess.run(command, text=True, check=True)
        else:
            subprocess.run(command, input=input_text.replace("\r", "").encode("utf-8"), check=True)
    except FileNotFoundError:
        fail(f"Команда не найдена: {command[0]}. Установите OpenSSH Client и Node.js.")
    except subprocess.CalledProcessError as error:
        fail(f"Команда завершилась с ошибкой ({error.returncode}). Деплой остановлен.")


def load_config(path: Path) -> dict:
    try:
        config = json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        fail(f"Не найден конфиг: {path}")
    except json.JSONDecodeError as error:
        fail(f"Некорректный JSON в {path}: {error}")

    required = ("host", "user", "domain", "email")
    absent = [key for key in required if not config.get(key)]
    if absent:
        fail("В конфиге обязательны поля: " + ", ".join(absent))
    if any(char.isspace() for char in str(config["domain"])):
        fail("В поле domain не должно быть пробелов.")
    return config


def main() -> None:
    parser = argparse.ArgumentParser(description="Деплой статического сайта на VPS")
    parser.add_argument("--config", default="deploy.config.json", help="путь к JSON-конфигу")
    parser.add_argument("--skip-build", action="store_true", help="не запускать npm run build")
    args = parser.parse_args()

    if shutil.which("ssh") is None or shutil.which("scp") is None:
        fail("Нужен OpenSSH Client (команды ssh и scp).")

    config = load_config(Path(args.config).resolve())
    domain = str(config["domain"]).lower()
    host = str(config["host"])
    user = str(config["user"])
    email = str(config["email"])
    port = int(config.get("port", 22))
    key_path = config.get("ssh_key_path")
    include_www = bool(config.get("include_www", False))
    remote_root = str(config.get("remote_root", f"/var/www/{domain}"))
    web_server = str(config.get("web_server", "auto")).lower()
    caddy_config = str(config.get("caddy_config", "/etc/caddy-naive/Caddyfile"))
    caddy_binary = str(config.get("caddy_binary", "/usr/local/bin/caddy-naive"))
    if web_server not in {"auto", "caddy", "nginx"}:
        fail("web_server может быть только auto, caddy или nginx.")

    if not args.skip_build:
        # Windows resolves npm in PowerShell as npm.ps1, while subprocess needs
        # the executable wrapper explicitly.
        npm = shutil.which("npm.cmd") or shutil.which("npm")
        if npm is None:
            fail("Не найдена команда npm. Установите Node.js или передайте --skip-build.")
        run([npm, "run", "build"])

    dist = ROOT / "dist"
    if not dist.is_dir() or not any(dist.iterdir()):
        fail("Папка dist пуста. Выполните npm run build или уберите --skip-build.")

    release = dt.datetime.now(dt.timezone.utc).strftime("%Y%m%d%H%M%S")
    with tempfile.TemporaryDirectory(prefix="dianavolf-deploy-") as temporary_dir:
        archive = Path(temporary_dir) / f"{release}.tar.gz"
        with tarfile.open(archive, "w:gz") as tar:
            for item in dist.iterdir():
                tar.add(item, arcname=item.name)

        ssh_base = ["ssh", "-p", str(port)]
        scp_base = ["scp", "-P", str(port)]
        if key_path:
            resolved_key = Path(str(key_path)).expanduser()
            if not resolved_key.is_file():
                fail(f"Не найден SSH-ключ: {resolved_key}")
            ssh_base += ["-i", str(resolved_key)]
            scp_base += ["-i", str(resolved_key)]

        destination = f"{user}@{host}"
        remote_archive = f"/tmp/{domain}-{release}.tar.gz"
        run(scp_base + [str(archive), f"{destination}:{remote_archive}"])

        domains = f"{domain} www.{domain}" if include_www else domain
        remote_script = r'''#!/usr/bin/env bash
set -Eeuo pipefail

DOMAIN="$1"
EMAIL="$2"
WEB_ROOT="$3"
RELEASE="$4"
ARCHIVE="$5"
DOMAINS="$6"
WEB_SERVER="$7"
CADDY_CONFIG="$8"
CADDY_BINARY="$9"

as_root() {
  if [ "$(id -u)" -eq 0 ]; then "$@"; else sudo -n "$@"; fi
}

RELEASES="$WEB_ROOT/releases"
TARGET="$RELEASES/$RELEASE"
NGINX_CONF="/etc/nginx/sites-available/$DOMAIN"

# The only files changed by this script are under $WEB_ROOT and the selected web-server config.
as_root mkdir -p "$TARGET"
as_root tar -xzf "$ARCHIVE" -C "$TARGET"
as_root rm -f "$ARCHIVE"
as_root chown -R www-data:www-data "$WEB_ROOT"
as_root chmod -R u=rwX,g=rX,o=rX "$WEB_ROOT"
as_root ln -sfn "$TARGET" "$WEB_ROOT/current"

if [ "$WEB_SERVER" = "auto" ]; then
  if pgrep -f '[c]addy-naive' >/dev/null; then WEB_SERVER="caddy"; else WEB_SERVER="nginx"; fi
fi

if [ "$WEB_SERVER" = "caddy" ]; then
  if [ ! -f "$CADDY_CONFIG" ] || [ ! -x "$CADDY_BINARY" ]; then
    echo "Caddy config or binary not found. Configure caddy_config and caddy_binary." >&2
    exit 1
  fi
  MARKER_BEGIN="# BEGIN managed site: $DOMAIN"
  MARKER_END="# END managed site: $DOMAIN"
  TEMP_CONFIG="$(mktemp)"
  BACKUP_CONFIG="${CADDY_CONFIG}.before-${RELEASE}"
  awk -v start="$MARKER_BEGIN" -v end="$MARKER_END" '
    $0 == start { skip=1; next }
    $0 == end { skip=0; next }
    !skip { print }
  ' "$CADDY_CONFIG" > "$TEMP_CONFIG"
  cat >> "$TEMP_CONFIG" <<EOF

$MARKER_BEGIN
$DOMAIN {
    root * $WEB_ROOT/current
    try_files {path} /index.html
    file_server
}
$MARKER_END
EOF
  as_root cp "$CADDY_CONFIG" "$BACKUP_CONFIG"
  as_root tee "$CADDY_CONFIG" < "$TEMP_CONFIG" >/dev/null
  rm -f "$TEMP_CONFIG"
  if ! as_root "$CADDY_BINARY" validate --config "$CADDY_CONFIG" --adapter caddyfile; then
    as_root cp "$BACKUP_CONFIG" "$CADDY_CONFIG"
    echo "Caddy config validation failed; previous configuration restored." >&2
    exit 1
  fi
  if ! as_root "$CADDY_BINARY" reload --config "$CADDY_CONFIG" --adapter caddyfile; then
    # Some hardened Caddy/NaiveProxy installations deliberately disable the
    # admin API. Their systemd unit reloads Caddy gracefully with SIGUSR1.
    if ! as_root systemctl reload caddy-naive; then
      as_root cp "$BACKUP_CONFIG" "$CADDY_CONFIG"
      echo "Caddy reload failed; previous configuration restored on disk." >&2
      exit 1
    fi
  fi
  echo "Deployment complete (Caddy): https://$DOMAIN"
  exit 0
fi

# Nginx is used only where no Caddy-based web front-end is detected.
as_root apt-get update
as_root env DEBIAN_FRONTEND=noninteractive apt-get install -y nginx certbot python3-certbot-nginx

as_root tee "$NGINX_CONF" >/dev/null <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAINS;

    root $WEB_ROOT/current;
    index index.html;
    charset utf-8;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location = /favicon.svg { access_log off; log_not_found off; }
}
EOF
as_root ln -sfn "$NGINX_CONF" "/etc/nginx/sites-enabled/$DOMAIN"
as_root nginx -t
as_root systemctl reload nginx

# DNS must already point to this VPS; Certbot only changes this site's Nginx config.
CERTBOT_ARGS=(--nginx --non-interactive --agree-tos --email "$EMAIL" --redirect)
for name in $DOMAINS; do CERTBOT_ARGS+=(-d "$name"); done
as_root certbot "${CERTBOT_ARGS[@]}"
as_root nginx -t
as_root systemctl reload nginx

echo "Deployment complete: https://$DOMAIN"
'''
        run(
            ssh_base
            + [
                destination, "bash", "-s", "--", domain, email, remote_root, release, remote_archive, domains,
                web_server, caddy_config, caddy_binary,
            ],
            # The repository uses CRLF on Windows; a Linux shell treats the
            # trailing \r in "set -o pipefail" as part of the option name.
            input_text=remote_script,
        )

    print(f"\nГотово: https://{domain}")


if __name__ == "__main__":
    main()
