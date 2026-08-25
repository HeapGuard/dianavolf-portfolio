#!/usr/bin/env python3
"""Local browser form for adding portfolio projects without a CMS."""

from __future__ import annotations

import json
import re
import shutil
import webbrowser
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


ROOT = Path(__file__).resolve().parent
HTML = ROOT / "project-manager.html"
DATA_FILE = ROOT / "src" / "data" / "user-projects.ts"
PUBLIC_PROJECTS = ROOT / "public" / "projects"
ALLOWED_THEMES = {"ink", "wine", "green", "pulse"}
ALLOWED_STATUSES = {"Учебный проект", "Концептуальный проект", "Коммерческий проект"}


def read_projects() -> list[dict]:
    text = DATA_FILE.read_text(encoding="utf-8") if DATA_FILE.exists() else ""
    match = re.search(r"=\s*(\[.*\])\s+as Project\[\]", text, re.DOTALL)
    return json.loads(match.group(1)) if match else []


def write_projects(projects: list[dict]) -> None:
    content = "import type { Project } from './projects'\n\n// This file is maintained by project_manager.py.\nexport const userProjects: Project[] = "
    DATA_FILE.write_text(content + json.dumps(projects, ensure_ascii=False, indent=2) + " as Project[]\n", encoding="utf-8")


def source_path(value: str) -> Path:
    path = Path(value.strip().strip('"')).expanduser()
    if not path.is_absolute(): path = ROOT / path
    path = path.resolve()
    if not path.is_file(): raise ValueError(f"Файл не найден: {value}")
    return path


def copy_asset(source: Path, target_dir: Path, name: str) -> str:
    suffix = source.suffix.lower()
    if suffix not in {".jpg", ".jpeg", ".png", ".webp", ".gif"}: raise ValueError(f"Неподдерживаемый формат: {source.name}")
    target = target_dir / f"{name}{suffix}"
    shutil.copy2(source, target)
    return f"/projects/{target_dir.name}/{target.name}"


def add_project(data: dict) -> dict:
    project_id = str(data.get("id", "")).strip().lower()
    if not re.fullmatch(r"[a-z0-9-]+", project_id): raise ValueError("ID: только латинские буквы, цифры и дефисы.")
    required = ("title", "subtitle", "year", "description", "cover")
    if any(not str(data.get(field, "")).strip() for field in required): raise ValueError("Заполните все обязательные поля.")
    if data.get("theme") not in ALLOWED_THEMES: raise ValueError("Неизвестная цветовая тема.")
    if data.get("status") not in ALLOWED_STATUSES: raise ValueError("Неизвестный статус проекта.")
    projects = read_projects()
    if any(item["id"] == project_id for item in projects): raise ValueError("Работа с таким ID уже существует.")
    target_dir = PUBLIC_PROJECTS / project_id
    if target_dir.exists(): raise ValueError("Папка такой работы уже есть. Выберите другой ID.")
    target_dir.mkdir(parents=True)
    try:
        cover = copy_asset(source_path(data["cover"]), target_dir, "cover")
        image_paths = [source_path(value) for value in data.get("images", [])]
        images = [cover] + [copy_asset(path, target_dir, f"image-{index:02d}") for index, path in enumerate(image_paths, 1)]
        project = {"id": project_id, "number": f"{len(projects) + 5:02d}", "title": data["title"].strip(), "subtitle": data["subtitle"].strip(), "year": str(data["year"]).strip(), "tags": data.get("tags", []), "description": data["description"].strip(), "cover": cover, "images": images, "theme": data["theme"], "status": data["status"], "brief": str(data.get("brief", "")).strip(), "role": str(data.get("role", "")).strip(), "deliverables": data.get("deliverables", []), "tools": data.get("tools", []), "result": str(data.get("result", "")).strip(), "featured": bool(data.get("featured", True))}
        projects.append(project); write_projects(projects)
        return project
    except Exception:
        shutil.rmtree(target_dir, ignore_errors=True)
        raise


class Handler(BaseHTTPRequestHandler):
    def log_message(self, format: str, *args: object) -> None: pass
    def send_json(self, status: int, data: dict) -> None:
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status); self.send_header("Content-Type", "application/json; charset=utf-8"); self.send_header("Content-Length", str(len(body))); self.end_headers(); self.wfile.write(body)
    def do_GET(self) -> None:
        if self.path != "/": self.send_error(HTTPStatus.NOT_FOUND); return
        body = HTML.read_bytes(); self.send_response(HTTPStatus.OK); self.send_header("Content-Type", "text/html; charset=utf-8"); self.send_header("Content-Length", str(len(body))); self.end_headers(); self.wfile.write(body)
    def do_POST(self) -> None:
        if self.path != "/api/projects": self.send_json(HTTPStatus.NOT_FOUND, {"error": "Не найдено"}); return
        try:
            length = int(self.headers.get("Content-Length", "0")); data = json.loads(self.rfile.read(length)); project = add_project(data); self.send_json(HTTPStatus.CREATED, {"number": project["number"]})
        except (ValueError, json.JSONDecodeError) as error: self.send_json(HTTPStatus.BAD_REQUEST, {"error": str(error)})
        except Exception: self.send_json(HTTPStatus.INTERNAL_SERVER_ERROR, {"error": "Не удалось сохранить работу. Проверьте пути к файлам."})


if __name__ == "__main__":
    address = "http://127.0.0.1:8765"
    print(f"Открываю {address}. Для остановки нажмите Ctrl+C.")
    webbrowser.open(address)
    ThreadingHTTPServer(("127.0.0.1", 8765), Handler).serve_forever()
