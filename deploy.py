#!/usr/bin/env python3
"""Commit, push and deploy the main site release to dianavolf.ru.

Usage:
    python deploy.py "Обновить кейс Horror Movies"

The VPS connection details stay only in deploy.config.json (ignored by Git).
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
import time
from pathlib import Path


ROOT = Path(__file__).resolve().parent


def fail(message: str) -> None:
    print(f"\nОШИБКА: {message}", file=sys.stderr)
    raise SystemExit(1)


def run(command: list[str], *, cwd: Path = ROOT, input_bytes: bytes | None = None) -> None:
    print("+", subprocess.list2cmdline(command))
    result = subprocess.run(command, cwd=cwd, input=input_bytes, check=False)
    if result.returncode:
        fail(f"Команда завершилась с кодом {result.returncode}.")


def run_with_retry(command: list[str], *, attempts: int = 3, input_bytes: bytes | None = None) -> None:
    for attempt in range(1, attempts + 1):
        print("+", subprocess.list2cmdline(command), f"(попытка {attempt}/{attempts})")
        result = subprocess.run(command, cwd=ROOT, input=input_bytes, check=False)
        if result.returncode == 0:
            return
        if attempt < attempts:
            print("Соединение не удалось, повтор через 5 секунд…")
            time.sleep(5)
    fail("Не удалось подключиться к GitHub или VPS после трёх попыток.")


def output(command: list[str]) -> str:
    result = subprocess.run(command, cwd=ROOT, text=True, capture_output=True, check=False)
    if result.returncode:
        fail(result.stderr.strip() or "Не удалось выполнить проверку Git.")
    return result.stdout.strip()


def load_config(path: Path) -> dict[str, object]:
    try:
        config = json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        fail(f"Не найден конфиг: {path}. Создайте его по примеру ниже в README.")
    except json.JSONDecodeError as error:
        fail(f"Некорректный JSON в {path}: {error}")

    required = ("host", "user", "domain", "ssh_key_path")
    missing = [name for name in required if not config.get(name)]
    if missing:
        fail("В deploy.config.json отсутствуют поля: " + ", ".join(missing))
    return config


def git_commit_and_push(message: str) -> None:
    branch = output(["git", "branch", "--show-current"])
    if branch != "main":
        fail(f"Деплой разрешён только из main, сейчас активна ветка {branch!r}.")

    run(["git", "add", "-A"])
    staged = subprocess.run(["git", "diff", "--cached", "--quiet"], cwd=ROOT, check=False)
    if staged.returncode == 1:
        run(["git", "commit", "-m", message])
    elif staged.returncode != 0:
        fail("Не удалось проверить подготовленные изменения Git.")
    else:
        print("Нет новых изменений для коммита — продолжу с текущим main.")

    run_with_retry(["git", "push", "origin", "main"])
    ahead = output(["git", "log", "origin/main..HEAD", "--oneline"])
    if ahead:
        fail("Локальные коммиты не дошли до origin/main. Деплой остановлен.")


def build() -> Path:
    npm = shutil.which("npm.cmd") or shutil.which("npm")
    if npm is None:
        fail("Не найден npm. Установите Node.js.")
    run([npm, "run", "build"])
    dist = ROOT / "dist"
    if not (dist / "index.html").is_file():
        fail("Сборка не создала dist/index.html.")
    return dist


def deploy(dist: Path, config: dict[str, object]) -> None:
    host = str(config["host"])
    user = str(config["user"])
    domain = str(config["domain"]).lower()
    port = str(config.get("port", 22))
    web_root = str(config.get("remote_root", f"/var/www/{domain}"))
    service = str(config.get("caddy_service", "caddy-naive"))
    key_path = Path(str(config["ssh_key_path"])).expanduser()
    if not key_path.is_file():
        fail(f"Не найден SSH-ключ: {key_path}")

    release = dt.datetime.now(dt.timezone.utc).strftime("%Y%m%d%H%M%S")
    destination = f"{user}@{host}"
    ssh = ["ssh", "-o", "ConnectTimeout=15", "-p", port, "-i", str(key_path)]
    scp = ["scp", "-o", "ConnectTimeout=15", "-P", port, "-i", str(key_path)]
    remote_archive = f"/tmp/{domain}-{release}.tar.gz"

    with tempfile.TemporaryDirectory(prefix="dianavolf-deploy-") as temporary:
        archive = Path(temporary) / f"{release}.tar.gz"
        with tarfile.open(archive, "w:gz") as tar:
            for item in dist.iterdir():
                tar.add(item, arcname=item.name)

        run_with_retry(scp + [str(archive), f"{destination}:{remote_archive}"])
        remote_script = f'''#!/usr/bin/env bash
set -Eeuo pipefail

WEB_ROOT={web_root!r}
RELEASE={release!r}
ARCHIVE={remote_archive!r}
SERVICE={service!r}
TARGET="$WEB_ROOT/releases/$RELEASE"
PREVIOUS="$(readlink -f "$WEB_ROOT/current" 2>/dev/null || true)"

mkdir -p "$TARGET"
tar -xzf "$ARCHIVE" -C "$TARGET"
rm -f "$ARCHIVE"
chown -R www-data:www-data "$WEB_ROOT"
chmod -R u=rwX,g=rX,o=rX "$WEB_ROOT"
ln -sfn "$TARGET" "$WEB_ROOT/current"

if ! systemctl reload "$SERVICE"; then
  if [ -n "$PREVIOUS" ]; then
    ln -sfn "$PREVIOUS" "$WEB_ROOT/current"
    systemctl reload "$SERVICE" || true
  fi
  echo "Caddy reload failed; previous site release was restored." >&2
  exit 1
fi

test -f "$WEB_ROOT/current/index.html"
echo "Deployment complete: $(readlink -f "$WEB_ROOT/current")"
'''
        # Bytes preserve Unix newlines when Python runs on Windows.
        run_with_retry(ssh + [destination, "bash", "-s"], input_bytes=remote_script.encode("utf-8"))


def main() -> None:
    parser = argparse.ArgumentParser(description="Коммит, GitHub push и VPS-деплой dianavolf.ru")
    parser.add_argument("message", nargs="?", default="Обновить сайт", help="текст Git-коммита")
    parser.add_argument("--config", default="deploy.config.json", help="путь к локальному конфигу VPS")
    args = parser.parse_args()

    print("\n=== DIANA VOLF: DEPLOY ===")
    config = load_config((ROOT / args.config).resolve())
    git_commit_and_push(args.message)
    deploy(build(), config)
    print(f"\nГотово: https://{config['domain']}")


if __name__ == "__main__":
    main()
