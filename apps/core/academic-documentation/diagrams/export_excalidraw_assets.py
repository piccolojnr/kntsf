from __future__ import annotations

import argparse
import json
import os
from pathlib import Path

from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parent
SCENE_DIR = ROOT / "scenes"
PNG_DIR = ROOT / "png"
SVG_DIR = ROOT / "svg"
TEMPLATE = Path(r"C:\Users\USER\projects\kntsf\.agents\skills\excalidraw-diagram-skill\references\render_template.html")
RENDER_URL = os.environ.get("EXCALIDRAW_RENDER_URL")


def bounds(elements: list[dict]) -> tuple[float, float, float, float]:
    min_x = min_y = float("inf")
    max_x = max_y = float("-inf")
    for el in elements:
        if el.get("isDeleted"):
            continue
        x = el.get("x", 0)
        y = el.get("y", 0)
        w = abs(el.get("width", 0))
        h = abs(el.get("height", 0))
        if el.get("type") in {"arrow", "line"} and el.get("points"):
            for px, py in el["points"]:
                min_x = min(min_x, x + px)
                min_y = min(min_y, y + py)
                max_x = max(max_x, x + px)
                max_y = max(max_y, y + py)
        else:
            min_x = min(min_x, x)
            min_y = min(min_y, y)
            max_x = max(max_x, x + w)
            max_y = max(max_y, y + h)
    if min_x == float("inf"):
        return 0, 0, 1200, 800
    return min_x, min_y, max_x, max_y


def export_all(scale: int = 2, max_width: int = 2200) -> None:
    PNG_DIR.mkdir(parents=True, exist_ok=True)
    SVG_DIR.mkdir(parents=True, exist_ok=True)
    scenes = sorted(SCENE_DIR.glob("*.excalidraw"))
    if not scenes:
        raise SystemExit(f"No .excalidraw files found in {SCENE_DIR}")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        for scene in scenes:
            data = json.loads(scene.read_text(encoding="utf-8"))
            min_x, min_y, max_x, max_y = bounds(data.get("elements", []))
            padding = 100
            diagram_w = max_x - min_x + padding * 2
            diagram_h = max_y - min_y + padding * 2
            page = browser.new_page(
                viewport={"width": min(int(diagram_w), max_width), "height": max(int(diagram_h), 650)},
                device_scale_factor=scale,
            )
            page.goto(RENDER_URL or TEMPLATE.as_uri())
            page.wait_for_function("window.__moduleReady === true", timeout=120000)
            result = page.evaluate("(diagram) => window.renderDiagram(diagram)", data)
            if not result or not result.get("success"):
                page.close()
                raise RuntimeError(f"Failed to render {scene.name}: {result}")
            page.wait_for_function("window.__renderComplete === true", timeout=15000)
            svg_el = page.query_selector("#root svg")
            if svg_el is None:
                page.close()
                raise RuntimeError(f"No SVG element rendered for {scene.name}")

            png_path = PNG_DIR / f"{scene.stem}.png"
            svg_path = SVG_DIR / f"{scene.stem}.svg"
            svg_el.screenshot(path=str(png_path))
            svg_markup = svg_el.evaluate("node => node.outerHTML")
            svg_path.write_text(svg_markup, encoding="utf-8")
            page.close()
            print(f"exported {scene.stem}")
        browser.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--scale", type=int, default=2)
    parser.add_argument("--width", type=int, default=2200)
    args = parser.parse_args()
    export_all(scale=args.scale, max_width=args.width)
