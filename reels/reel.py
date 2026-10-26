#!/usr/bin/env python3
"""No Pasa Nada reel template.

Two-phase workflow (see PLAYBOOK.md, Part 5):

    prep    fetch / restore / transcribe          -> automatic
    HUMAN   pick the span, write the copy, title  -> specs/<story>.json
    render  cut, reframe, card, beats, subtitles  -> automatic

Commands:
    python3 reel.py fetch URL [--name NAME]      download best source (>=1080p preferred)
    python3 reel.py restore IN [OUT]             denoise + normalise to -16 LUFS
    python3 reel.py transcribe IN                whisper transcript + hallucination-loop check
    python3 reel.py check SPEC                   validate a spec without rendering
    python3 reel.py render SPEC [--frames]       render 1080x1920 h264; --frames also dumps style frames

Requires ffmpeg on PATH and Pillow + opencv-python-headless. yt-dlp and
faster-whisper are only needed for fetch / transcribe.
"""

import argparse
import json
import os
import re
import shutil
import statistics
import subprocess
import sys
import tempfile

from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))

# ---------------------------------------------------------------- style guide
W, H, FPS = 1080, 1920, 30
INK = (0, 0, 0)
PAPER = (255, 255, 255)
RED = (225, 6, 0)
SAFE_W = int(W * 0.88)          # auto-fit limit (Part 4)
MARGIN = (W - SAFE_W) // 2
SAFE_TOP = int(H * 0.10)        # clear of the IG top bar
SAFE_BOTTOM = int(H * 0.80)     # clear of the IG caption / buttons
SUB_Y = int(H * 0.74)           # single-word subtitle line (centre)
SUB_SIZE = 104
RIGHTS_BASES = {"government", "own", "licensed", "permission", "fair_use"}

BOLD_FONTS = [
    "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
    "/Library/Fonts/Arial Bold.ttf",
    "C:/Windows/Fonts/arialbd.ttf",
    "/usr/share/fonts/truetype/msttcorefonts/Arial_Bold.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",  # Arial-metric clone
    os.path.join(HERE, "fonts", "LiberationSans-Bold.ttf"),
]
REGULAR_FONTS = [
    "/System/Library/Fonts/Supplemental/Arial.ttf",
    "/Library/Fonts/Arial.ttf",
    "C:/Windows/Fonts/arial.ttf",
    "/usr/share/fonts/truetype/msttcorefonts/Arial.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
    os.path.join(HERE, "fonts", "LiberationSans-Regular.ttf"),
]


def find_font(candidates):
    for path in candidates:
        if os.path.exists(path):
            return path
    sys.exit("No Arial / Helvetica / Liberation Sans font found; install one of: " + ", ".join(candidates))


FONT_BOLD = find_font(BOLD_FONTS)
FONT_REGULAR = find_font(REGULAR_FONTS)
_font_cache = {}


def font(size, bold=True):
    key = (size, bold)
    if key not in _font_cache:
        _font_cache[key] = ImageFont.truetype(FONT_BOLD if bold else FONT_REGULAR, size)
    return _font_cache[key]


# ---------------------------------------------------------------- utilities
def run(cmd, quiet=True):
    proc = subprocess.run(cmd, capture_output=True, text=True)
    if proc.returncode != 0:
        sys.stderr.write(proc.stderr[-3000:])
        sys.exit(f"command failed: {' '.join(cmd[:6])} ...")
    if not quiet:
        sys.stderr.write(proc.stderr)
    return proc


def probe(path):
    out = run(["ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", path]).stdout
    info = json.loads(out)
    video = next(s for s in info["streams"] if s["codec_type"] == "video")
    has_audio = any(s["codec_type"] == "audio" for s in info["streams"])
    return int(video["width"]), int(video["height"]), float(info["format"]["duration"]), has_audio


def warn(msg):
    print(f"  ! {msg}")


# ---------------------------------------------------------------- prep
def cmd_fetch(args):
    if not shutil.which("yt-dlp"):
        sys.exit("yt-dlp not installed (pip install yt-dlp)")
    print("PART 0: you must already have a rights basis for this source. Record it in the spec's \"rights\".")
    name = args.name or "%(id)s"
    out = os.path.join(HERE, "sources", f"{name}.%(ext)s")
    run(["yt-dlp", "-f", "bv*[height>=1080]+ba/bv*+ba/b", "--merge-output-format", "mp4",
         "-o", out, args.url], quiet=False)
    for f in sorted(os.listdir(os.path.join(HERE, "sources"))):
        if f.endswith(".mp4"):
            w, h, d, _ = probe(os.path.join(HERE, "sources", f))
            flag = "" if min(w, h) >= 1080 else "  <- below 1080p, the 9:16 crop will be soft"
            print(f"  sources/{f}: {w}x{h}, {d:.1f}s{flag}")


def loudness(path):
    proc = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", path, "-af", "ebur128", "-f", "null", "-"],
                          capture_output=True, text=True)
    found = re.findall(r"I:\s+(-?[\d.]+) LUFS", proc.stderr)
    return float(found[-1]) if found else None


def cmd_restore(args):
    out = args.out or re.sub(r"(\.\w+)$", r".restored.wav", args.input)
    before = loudness(args.input)
    run(["ffmpeg", "-y", "-i", args.input, "-vn", "-ac", "1", "-ar", "48000", "-af",
         "highpass=f=80,lowpass=f=12000,afftdn=nf=-25,"
         "acompressor=threshold=-24dB:ratio=3:attack=5:release=120,loudnorm=I=-16:TP=-1.5:LRA=11", out])
    print(f"restored -> {out}  ({before} LUFS -> {loudness(out)} LUFS)")


def cmd_transcribe(args):
    try:
        from faster_whisper import WhisperModel
    except ImportError:
        sys.exit("faster-whisper not installed (pip install faster-whisper)")
    lufs = loudness(args.input)
    if lufs is not None and lufs < -24:
        warn(f"input is {lufs:.1f} LUFS. Run `restore` first; quiet audio makes the model hallucinate.")
    model = WhisperModel(args.model, compute_type="int8")
    segments, info = model.transcribe(args.input, word_timestamps=True, vad_filter=True)
    rows = [{"start": round(s.start, 2), "end": round(s.end, 2), "text": s.text.strip(),
             "logprob": round(s.avg_logprob, 3)} for s in segments]
    # Hallucination loop: the same short phrase cycling with near-zero durations or identical confidence.
    loops, run_len = 0, 1
    for a, b in zip(rows, rows[1:]):
        same = a["text"].lower() == b["text"].lower() or a["logprob"] == b["logprob"]
        run_len = run_len + 1 if same else 1
        if run_len == 3:
            loops += 1
    out = re.sub(r"(\.\w+)$", r".transcript.json", args.input)
    with open(out, "w") as fh:
        json.dump({"language": info.language, "segments": rows}, fh, ensure_ascii=False, indent=2)
    for r in rows:
        print(f"{r['start']:7.2f}-{r['end']:7.2f}  {r['text']}")
    print(f"-> {out}")
    if loops:
        warn(f"{loops} possible hallucination loop(s). Restore the audio; if it persists, check the raw file "
             "for genuinely duplicated material before blaming the model.")


# ---------------------------------------------------------------- spec
def load_spec(path):
    with open(path) as fh:
        spec = json.load(fh)
    base = os.path.dirname(os.path.abspath(path))
    spec["_base"] = base
    spec.setdefault("layout", "overlay")
    spec.setdefault("brand", "NO PASA NADA")
    spec.setdefault("audio", "none")
    spec.setdefault("push_in", 0.04)
    spec.setdefault("beats", [])
    spec.setdefault("words", [])
    spec.setdefault("output", os.path.join("..", "out", os.path.splitext(os.path.basename(path))[0] + ".mp4"))
    for c in spec["clips"]:
        c["path"] = c["src"] if os.path.isabs(c["src"]) else os.path.normpath(os.path.join(base, c["src"]))
    return spec


def validate(spec):
    errors = []
    rights = spec.get("rights") or {}
    if rights.get("basis") not in RIGHTS_BASES:
        errors.append(f"rights.basis must be one of {sorted(RIGHTS_BASES)} (PLAYBOOK Part 0). "
                      "Newsworthy is not a basis.")
    elif not rights.get("note"):
        errors.append("rights.note: write down what the basis is (who, what licence, which excerpt).")
    elif rights["basis"] == "fair_use" and "TBD" in (spec.get("credit") or "TBD"):
        errors.append("fair use needs attribution: set \"credit\" to the source channel(s).")
    if spec["layout"] not in ("overlay", "editorial"):
        errors.append("layout must be 'overlay' or 'editorial'")
    total = 0.0
    for i, c in enumerate(spec["clips"]):
        if not os.path.exists(c["path"]):
            errors.append(f"clips[{i}]: {c['src']} not found")
            continue
        w, h, d, _ = probe(c["path"])
        if c["out"] > d + 0.05 or c["in"] < 0 or c["out"] <= c["in"]:
            errors.append(f"clips[{i}]: in/out {c['in']}-{c['out']} outside source length {d:.2f}s")
        total += c["out"] - c["in"]
    spec["_duration"] = total
    if not 20 <= total <= 40:
        warn(f"cut is {total:.1f}s; reels land best at 20-40s")
    timed = ([spec["card"]] if spec.get("card") else []) + spec["beats"]
    for t in timed:
        if t["end"] > total + 0.01:
            errors.append(f"'{t.get('title') or t.get('text')}' ends at {t['end']}s, after the cut ({total:.1f}s)")
    if spec.get("card") and spec["card"]["start"] > 0.5:
        warn("card starts after 0.5s; the hook has to land in the first 1-2 seconds")
    return errors


# ---------------------------------------------------------------- typography
def parse_rich(text):
    """'Brasil *reduce* la jornada' -> [(word, is_accent), ...]; \\n kept as a hard break token."""
    tokens = []
    for part in re.split(r"(\*[^*]+\*)", text):
        accent = part.startswith("*") and part.endswith("*")
        part = part.strip("*") if accent else part
        for chunk in re.split(r"(\n)", part):
            if chunk == "\n":
                tokens.append(("\n", False))
            else:
                tokens.extend((w, accent) for w in chunk.split())
    return tokens


def text_w(s, f):
    return f.getlength(s)


def wrap(tokens, size, max_w, bold=True):
    f = font(size, bold)
    lines, line = [], []
    for word, accent in tokens:
        if word == "\n":
            lines.append(line)
            line = []
            continue
        trial = " ".join(w for w, _ in line + [(word, accent)])
        if line and text_w(trial, f) > max_w:
            lines.append(line)
            line = []
        line.append((word, accent))
    if line:
        lines.append(line)
    return lines


def fit_lines(lines, size, max_w, bold=True):
    """Part 4: measure each line; shrink only the ones that overflow the safe width."""
    fitted = []
    for line in lines:
        s = size
        while s > 24 and text_w(" ".join(w for w, _ in line), font(s, bold)) > max_w:
            s -= 2
        fitted.append((line, s))
    return fitted


def block_height(fitted, leading=1.08):
    return int(sum(s * leading for _, s in fitted))


def draw_lines(draw, fitted, x0, y, max_w, color=INK, align="center", bold=True, leading=1.08):
    for line, s in fitted:
        f = font(s, bold)
        space = text_w(" ", f)
        line_w = sum(text_w(w, f) for w, _ in line) + space * (len(line) - 1)
        x = x0 + (max_w - line_w) / 2 if align == "center" else x0
        ascent = f.getmetrics()[0]
        for w, accent in line:
            draw.text((x, y + s * leading - ascent - s * 0.08), w, font=f, fill=RED if accent else color)
            x += text_w(w, f) + space
        y += s * leading
    return y


def pill(draw, text, cx, y, size=34, fill=RED, color=PAPER):
    f = font(size)
    tw = text_w(text, f)
    pad_x, pad_y = size * 0.55, size * 0.32
    box = (cx - tw / 2 - pad_x, y, cx + tw / 2 + pad_x, y + size + pad_y * 2)
    draw.rounded_rectangle(box, radius=6, fill=fill)
    draw.text((cx, y + pad_y + size / 2), text, font=f, fill=color, anchor="mm")
    return box[3]


def brand_bug(draw, brand, cx, y, size=30, color=INK, ring=INK):
    """'(•) NO PASA NADA' wordmark, as on the feed posts."""
    f = font(size)
    tw = text_w(brand, f)
    r = size * 0.42
    x = cx - (tw + r * 2 + 12) / 2
    draw.ellipse((x, y + size / 2 - r, x + 2 * r, y + size / 2 + r), outline=ring, width=3)
    draw.ellipse((x + r * 0.55, y + size / 2 - r * 0.45, x + r * 1.45, y + size / 2 + r * 0.45), fill=RED)
    draw.text((x + 2 * r + 12, y + size / 2), brand, font=f, fill=color, anchor="lm")


# ---------------------------------------------------------------- framing
def detect_faces(path, t0, t1, crop):
    """Face boxes (y0, y1) as fractions of output height, sampled every 0.5s inside [t0, t1]."""
    import cv2
    cascade = cv2.CascadeClassifier(os.path.join(cv2.data.haarcascades, "haarcascade_frontalface_default.xml"))
    cap = cv2.VideoCapture(path)
    found, xs = [], []
    t = t0
    while t < t1:
        cap.set(cv2.CAP_PROP_POS_MSEC, t * 1000)
        ok, frame = cap.read()
        t += 0.5
        if not ok:
            continue
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        min_side = max(40, frame.shape[0] // 12)
        for (x, y, w, h) in cascade.detectMultiScale(gray, 1.1, 6, minSize=(min_side, min_side)):
            xs.append((x + w / 2) / frame.shape[1])
            if crop:
                cx, cy, cw, ch = crop
                # extend the box down to the chin/neck and up to the hairline
                found.append(((y - 0.25 * h - cy) / ch, (y + 1.2 * h - cy) / ch))
    cap.release()
    return found, xs


def solve_crop(sw, sh, box_w, box_h, focus_x):
    aspect = box_w / box_h
    if sw / sh > aspect:
        ch, cw = sh, int(round(sh * aspect / 2)) * 2
    else:
        cw, ch = sw, int(round(sw / aspect / 2)) * 2
    cx = int(min(max(focus_x * sw - cw / 2, 0), sw - cw))
    cy = (sh - ch) // 2
    return cx, cy, cw, ch


# ---------------------------------------------------------------- layouts
def editorial_geometry(spec):
    """Impact-style page: wordmark, headline, framed video, deck. Returns the video box and text zones."""
    title = spec.get("headline") or spec["card"]["title"]
    fitted = fit_lines(wrap(parse_rich(title), 88, SAFE_W), 88, SAFE_W)
    head_top = 230
    head_bottom = head_top + block_height(fitted)
    box_top = head_bottom + 50
    box_w = SAFE_W
    box_h = min(int(box_w * 1.15), 1470 - box_top) // 2 * 2
    return {"title": fitted, "head_top": head_top, "box": (MARGIN, box_top, box_w, box_h),
            "deck_top": box_top + box_h + 44}


def card_overlay_image(card, lane, spec, layout_geo=None):
    """Full-frame RGBA PNG for one timed element."""
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    if spec["layout"] == "editorial":
        y = layout_geo["deck_top"]
        if card.get("kicker"):
            y = pill(d, card["kicker"].upper(), W / 2, y, size=30) + 22
        text = card.get("deck") or card.get("text", "")
        fitted = fit_lines(wrap(parse_rich(text), card.get("size", 46), SAFE_W - 40), card.get("size", 46),
                           SAFE_W - 40)
        draw_lines(d, fitted, MARGIN + 20, y, SAFE_W - 40)
        return img, None

    # HQ-style band on the video: red kicker pill, white band, black headline, small deck.
    is_card = "title" in card
    size = card.get("size", 92 if is_card else 64)
    fitted = fit_lines(wrap(parse_rich(card.get("title") or card.get("text")), size, SAFE_W), size, SAFE_W)
    deck = []
    if card.get("deck"):
        deck = fit_lines(wrap(parse_rich(card["deck"]), 36, SAFE_W - 60, bold=False), 36, SAFE_W - 60, bold=False)
    pad = 44
    kicker_h = 62 if card.get("kicker") else 0
    band_h = pad + block_height(fitted, 1.02) + (24 + block_height(deck, 1.25) if deck else 0) + pad
    total_h = band_h + kicker_h / 2
    lo, hi = lane
    top = int(lo + max(0, (hi - lo - total_h) / 2) + kicker_h / 2)
    if hi - lo < total_h:
        warn(f"'{(card.get('title') or card.get('text'))[:30]}' ({total_h:.0f}px) does not fit the clear lane "
             f"({hi - lo:.0f}px); it will cover part of the face band")
    d.rectangle((0, top, W, top + band_h), fill=PAPER + (255,))
    y = draw_lines(d, fitted, MARGIN, top + pad, SAFE_W, leading=1.02)
    if deck:
        draw_lines(d, deck, MARGIN + 30, y + 24, SAFE_W - 60, bold=False, leading=1.25)
    if card.get("kicker"):
        pill(d, card["kicker"].upper(), W / 2, top - kicker_h / 2, size=32)
    return img, (top - kicker_h / 2, top + band_h)


def chrome_image(spec, layout_geo):
    """Always-on layer: page + headline for editorial, wordmark for overlay."""
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    if spec["layout"] == "editorial":
        brand_bug(d, spec["brand"], W / 2, 140, size=30)
        draw_lines(d, layout_geo["title"], MARGIN, layout_geo["head_top"], SAFE_W)
        x, y, bw, bh = layout_geo["box"]
        if spec.get("credit"):
            d.text((W / 2, y + bh + 14), spec["credit"], font=font(20, bold=False), fill=(90, 90, 90), anchor="mt")
    else:
        # small white wordmark chip, top right (HQ puts its logo there)
        f = font(26)
        tw = text_w(spec["brand"], f)
        x1, y0 = W - 56, 150
        d.rounded_rectangle((x1 - tw - 70, y0, x1, y0 + 50), radius=25, fill=PAPER + (235,))
        brand_bug(d, spec["brand"], x1 - (tw + 46) / 2 - 12, y0 + 10, size=26)
        if spec.get("credit"):
            d.text((W - 56, H * 0.82), spec["credit"], font=font(22, bold=False), fill=(255, 255, 255, 200),
                   anchor="rt", stroke_width=2, stroke_fill=(0, 0, 0, 120))
    return img


def choose_lane(face_bands):
    """Part 4: measure the face band across the whole cut, then use the larger clear lane."""
    limit_bottom = SUB_Y - SUB_SIZE if face_bands is not None and face_bands[2] else SAFE_BOTTOM
    if not face_bands or face_bands[0] is None:
        return (int(H * 0.52), limit_bottom), "no faces detected; default lower lane"
    f0, f1, _ = face_bands
    above = (SAFE_TOP + 70, int(f0 * H) - 20)
    below = (int(f1 * H) + 20, limit_bottom)
    lane = max(above, below, key=lambda l: l[1] - l[0])
    return lane, f"face band {f0:.3f}-{f1:.3f} of frame height -> lane {lane[0]}-{lane[1]}px"


# ---------------------------------------------------------------- subtitles
def distribute_words(lines):
    """Part 3: spread each translated line's words over its span, weighted by character count."""
    words = []
    for ln in lines:
        toks = ln["text"].split()
        total = sum(len(t) for t in toks) or 1
        t = ln["start"]
        for tok in toks:
            dur = (ln["end"] - ln["start"]) * len(tok) / total
            words.append({"start": round(t, 3), "end": round(t + dur, 3), "text": tok})
            t += dur
    return words


def ass_time(t):
    cs = int(round(t * 100))
    return f"{cs // 360000}:{cs // 6000 % 60:02d}:{cs // 100 % 60:02d}.{cs % 100:02d}"


def write_ass(words, path, family):
    head = f"""[Script Info]
ScriptType: v4.00+
PlayResX: {W}
PlayResY: {H}
WrapStyle: 2

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Word,{family},{SUB_SIZE},&H00000000,&H00000000,&H00FFFFFF,&H00FFFFFF,-1,0,0,0,100,100,0,0,3,14,0,5,0,0,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    with open(path, "w") as fh:
        fh.write(head)
        for w in words:
            fh.write(f"Dialogue: 0,{ass_time(w['start'])},{ass_time(w['end'])},Word,,0,0,0,,"
                     f"{{\\pos({W // 2},{SUB_Y})}}{w['text']}\n")


# ---------------------------------------------------------------- render
def cmd_check(args):
    spec = load_spec(args.spec)
    errors = validate(spec)
    for e in errors:
        print(f"  x {e}")
    print("spec OK" if not errors else f"{len(errors)} problem(s)")
    return spec, errors


def cmd_render(args):
    spec, errors = cmd_check(args)
    if errors:
        sys.exit(1)
    D = spec["_duration"]
    keep_audio = spec["audio"] == "source"
    tmp = tempfile.mkdtemp(prefix="reel_")
    geo = editorial_geometry(spec) if spec["layout"] == "editorial" else None
    bx, by, bw, bh = geo["box"] if geo else (0, 0, W, H)

    # 1. cut + reframe each clip, measuring faces on the way
    segs, bands, t_out = [], [], 0.0
    for i, c in enumerate(spec["clips"]):
        sw, sh, _, has_audio = probe(c["path"])
        _, xs = detect_faces(c["path"], c["in"], c["out"], None) if "focus_x" not in c else ([], [])
        focus = c.get("focus_x", statistics.median(xs) if xs else 0.5)
        crop = solve_crop(sw, sh, bw, bh, focus)
        faces, _ = detect_faces(c["path"], c["in"], c["out"], crop)
        if faces:
            bands.append((min(f[0] for f in faces), max(f[1] for f in faces)))
        up = bw / crop[2]
        note = f"focus {focus:.2f}" + (" (face)" if xs and "focus_x" not in c else "")
        print(f"  clip {i}: {os.path.basename(c['path'])} {c['in']}-{c['out']}s  crop {crop[2]}x{crop[3]} "
              f"-> {bw}x{bh}  x{up:.2f}  {note}")
        if up > 2.0:
            warn(f"clip {i} is upscaled x{up:.2f}; it will look soft. Ask for a 1080p+ source.")
        dur = c["out"] - c["in"]
        z = c.get("push_in", spec["push_in"])
        vf = (f"crop={crop[2]}:{crop[3]}:{crop[0]}:{crop[1]},"
              f"scale=w='trunc({bw}*(1+{z}*t/{dur})/2)*2':h=-2:eval=frame:flags=lanczos,"
              f"crop={bw}:{bh},setsar=1,fps={FPS},format=yuv420p")
        seg = os.path.join(tmp, f"seg{i:02d}.mp4")
        cmd = ["ffmpeg", "-y", "-ss", str(c["in"]), "-t", str(dur), "-i", c["path"]]
        if keep_audio and not has_audio:
            cmd += ["-f", "lavfi", "-t", str(dur), "-i", "anullsrc=r=48000:cl=stereo"]
        cmd += ["-vf", vf, "-c:v", "libx264", "-crf", "14", "-preset", "fast"]
        cmd += (["-map", "0:v", "-map", "1:a" if not has_audio else "0:a", "-c:a", "aac", "-ar", "48000", "-ac", "2",
                 "-b:a", "256k", "-shortest"] if keep_audio else ["-an"])
        run(cmd + [seg])
        segs.append(seg)
        t_out += dur

    lst = os.path.join(tmp, "list.txt")
    with open(lst, "w") as fh:
        fh.writelines(f"file '{s}'\n" for s in segs)
    base = os.path.join(tmp, "base.mp4")
    run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", lst, "-c", "copy", base])

    # 2. place the card: measure the face band across the whole cut
    words = spec["words"] or (distribute_words(spec["lines"]) if spec.get("lines") else [])
    face_band = (min(b[0] for b in bands), max(b[1] for b in bands), bool(words)) if bands else (None, None, bool(words))
    lane, why = choose_lane(face_band)
    if spec["layout"] == "overlay":
        print(f"  card lane: {why}")

    layers = [("chrome", chrome_image(spec, geo), 0, D)]
    timed = ([spec["card"]] if spec.get("card") else []) + spec["beats"]
    for k, item in enumerate(timed):
        img, _ = card_overlay_image(item, lane, spec, geo)
        layers.append((f"t{k}", img, item["start"], item["end"]))

    # 3. composite
    inputs = ["-i", base]
    for name, img, _, _ in layers:
        p = os.path.join(tmp, f"{name}.png")
        img.save(p)
        inputs += ["-loop", "1", "-framerate", str(FPS), "-t", f"{D:.3f}", "-i", p]
    if spec["layout"] == "editorial":
        graph = [f"color=c=white:s={W}x{H}:r={FPS}:d={D:.3f}[bg]", f"[bg][0:v]overlay={bx}:{by}[v0]"]
    else:
        graph = ["[0:v]null[v0]"]
    for k, (name, _, a, b) in enumerate(layers, start=1):
        fade = "" if name == "chrome" else (
            f",fade=in:st={a}:d=0.25:alpha=1,fade=out:st={max(a, b - 0.2):.2f}:d=0.2:alpha=1")
        graph.append(f"[{k}:v]format=rgba{fade}[l{k}]")
        graph.append(f"[v{k - 1}][l{k}]overlay=0:0:enable='between(t,{a},{b})'[v{k}]")
    last = f"v{len(layers)}"
    if words:
        ass = os.path.join(tmp, "words.ass")
        write_ass(words, ass, font(10).getname()[0])
        graph.append(f"[{last}]subtitles='{ass}':fontsdir='{os.path.dirname(FONT_BOLD)}'[vs]")
        last = "vs"
    graph.append(f"[{last}]format=yuv420p[vout]")

    out = os.path.normpath(os.path.join(spec["_base"], spec["output"]))
    os.makedirs(os.path.dirname(out), exist_ok=True)
    cmd = ["ffmpeg", "-y"] + inputs + ["-filter_complex", ";".join(graph), "-map", "[vout]"]
    if keep_audio:
        cmd += ["-map", "0:a", "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-c:a", "aac", "-b:a", "192k", "-ar", "48000"]
    else:
        cmd += ["-an"]   # music gets added in Instagram
    cmd += ["-c:v", "libx264", "-profile:v", "high", "-crf", "19", "-preset", "slow", "-r", str(FPS),
            "-t", f"{D:.3f}", "-movflags", "+faststart", out]
    run(cmd)
    w, h, d, _ = probe(out)
    print(f"-> {out}  {w}x{h}  {d:.2f}s  {os.path.getsize(out) / 1e6:.1f} MB")

    if args.frames:
        stops = sorted({0.6} | {round((t["start"] + t["end"]) / 2, 2) for t in timed})
        frames = []
        for t in stops:
            p = os.path.join(tmp, f"f{t}.png")
            run(["ffmpeg", "-y", "-ss", str(t), "-i", out, "-frames:v", "1", p])
            frames.append(Image.open(p).resize((W // 3, H // 3)))
        sheet = Image.new("RGB", (len(frames) * (W // 3 + 16) + 16, H // 3 + 32), (230, 230, 230))
        for k, fimg in enumerate(frames):
            sheet.paste(fimg, (16 + k * (W // 3 + 16), 16))
        sheet_path = re.sub(r"\.mp4$", ".frames.png", out)
        sheet.save(sheet_path)
        print(f"-> {sheet_path}")
    shutil.rmtree(tmp, ignore_errors=True)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    p = sub.add_parser("fetch"); p.add_argument("url"); p.add_argument("--name"); p.set_defaults(fn=cmd_fetch)
    p = sub.add_parser("restore"); p.add_argument("input"); p.add_argument("out", nargs="?"); p.set_defaults(fn=cmd_restore)
    p = sub.add_parser("transcribe"); p.add_argument("input"); p.add_argument("--model", default="large-v3")
    p.set_defaults(fn=cmd_transcribe)
    p = sub.add_parser("check"); p.add_argument("spec"); p.set_defaults(fn=cmd_check)
    p = sub.add_parser("render"); p.add_argument("spec"); p.add_argument("--frames", action="store_true")
    p.set_defaults(fn=cmd_render)
    args = ap.parse_args()
    args.fn(args)


if __name__ == "__main__":
    main()
