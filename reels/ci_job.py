#!/usr/bin/env python3
"""Run a reel job on a machine with open internet (GitHub Actions).

Job file (reels/jobs/<name>.json):
    {"sources": {"lula_a": "https://www.youtube.com/watch?v=..."},
     "spec": "specs/lula-gana.json"}          # optional; omit to only fetch + preview

For every source: downloads to reels/sources/<key>.mp4 (best <=1080p), writes
reels/out/<key>.info.json (title, channel, duration, size) and reels/out/<key>.sheet.jpg,
a contact sheet with one timestamped frame every 2s so shots can be picked without the video.
If "spec" is set and passes `reel.py check`, renders it with --frames.
"""

import json
import os
import subprocess
import sys

from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "sources")
OUT = os.path.join(HERE, "out")


def sh(cmd):
    print("+", " ".join(cmd), flush=True)
    subprocess.run(cmd, check=True)


def fetch(key, url):
    path = os.path.join(SRC, f"{key}.mp4")
    if not os.path.exists(path):
        cmd = ["yt-dlp", "-f", "bv*[height<=1080]+ba/b[height<=1080]/b", "--merge-output-format", "mp4",
               "-o", path, "--write-info-json", "--no-playlist"]
        if os.environ.get("YT_COOKIES_FILE"):
            cmd += ["--cookies", os.environ["YT_COOKIES_FILE"]]
        try:
            sh(cmd + [url])
        except subprocess.CalledProcessError:
            if not os.environ.get("YT_COOKIES_FILE"):
                print("::error::Download failed. YouTube blocks datacenter IPs without a signed-in session: add a "
                      "Netscape-format cookies.txt as the repo secret YT_COOKIES (see reels/README.md).")
            raise
    raw = os.path.join(SRC, f"{key}.info.json")
    meta = json.load(open(raw)) if os.path.exists(raw) else {}
    info = {k: meta.get(k) for k in ("id", "title", "channel", "uploader", "upload_date", "duration",
                                     "width", "height", "webpage_url", "license")}
    with open(os.path.join(OUT, f"{key}.info.json"), "w") as fh:
        json.dump(info, fh, ensure_ascii=False, indent=2)
    return path, info


def contact_sheet(key, path, duration, every=2.0, cols=6, tile_w=320):
    tmp = os.path.join(OUT, f".{key}_frames")
    os.makedirs(tmp, exist_ok=True)
    sh(["ffmpeg", "-loglevel", "error", "-y", "-i", path, "-vf", f"fps=1/{every},scale={tile_w}:-2",
        os.path.join(tmp, "%04d.jpg")])
    frames = sorted(os.listdir(tmp))
    if not frames:
        return
    first = Image.open(os.path.join(tmp, frames[0]))
    tw, th = first.size
    rows = (len(frames) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * tw, rows * (th + 28)), "white")
    d = ImageDraw.Draw(sheet)
    try:
        f = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 18)
    except OSError:
        f = ImageFont.load_default()
    for i, name in enumerate(frames):
        x, y = (i % cols) * tw, (i // cols) * (th + 28)
        sheet.paste(Image.open(os.path.join(tmp, name)), (x, y + 28))
        t = i * every
        d.text((x + 6, y + 4), f"{int(t // 60)}:{t % 60:04.1f}", font=f, fill="black")
    sheet.save(os.path.join(OUT, f"{key}.sheet.jpg"), quality=80)
    for name in frames:
        os.remove(os.path.join(tmp, name))
    os.rmdir(tmp)


def main(job_path):
    os.makedirs(SRC, exist_ok=True)
    os.makedirs(OUT, exist_ok=True)
    job = json.load(open(job_path))
    for key, url in job.get("sources", {}).items():
        path, info = fetch(key, url)
        print(f"{key}: {info.get('title')!r} by {info.get('channel')} "
              f"{info.get('width')}x{info.get('height')} {info.get('duration')}s", flush=True)
        contact_sheet(key, path, info.get("duration") or 0)
    if job.get("spec"):
        spec = os.path.join(HERE, job["spec"])
        sh([sys.executable, os.path.join(HERE, "reel.py"), "render", spec, "--frames"])


if __name__ == "__main__":
    main(sys.argv[1])
