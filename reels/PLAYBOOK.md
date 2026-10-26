# No Pasa Nada — News Reel Playbook & Template

How we turn a source clip (or b-roll) into a 20–40s vertical reel in the No Pasa Nada style, and how
to run the template in this folder that does it. Rules first, then the machine.

---

## Style guide

| | |
|---|---|
| Type | **Arial Bold / Helvetica Bold** (Liberation Sans, Arial-metric, is bundled as fallback in `fonts/`) |
| Colour | Black on white. Accents are rare and **red** (`#E10600`) |
| Wordmark | `(•) NO PASA NADA`, small |
| Language | Spanish on screen |

Two layouts, both taken from the references:

- **`overlay`** — HQ-style. Full-bleed 9:16 video, a **white band** with big black headline, a small
  **red label pill** on its top edge (our version of HQ's green "MUST WATCH"), small deck line under it.
  Wordmark chip top right. Best for footage that carries the story (crowds, events).
- **`editorial`** — Impact-style Gen-Z white space. White page, wordmark top centre, big black headline,
  video **framed** in the middle, deck/beats underneath. Best for explainers and policy stories.

Mark red accents in copy with asterisks: `"Lula gana la *segunda vuelta*"`.

---

## Part 0 — Rights. Before anything else

Republishing someone else's video is only lawful on a specific basis. Establish it before processing and
write it down — the renderer refuses a spec without one.

| Basis (`rights.basis`) | Example |
|---|---|
| `government` | Sitting official speaking in an official capacity (US federal — public domain) |
| `own` | We shot it |
| `licensed` | Wire service, agency, stock we pay for |
| `permission` | The uploader said yes, in writing |
| `fair_use` | Short excerpt for news reporting or commentary, **attributed**. Fact-specific, not a blanket licence |

- **Newsworthy ≠ free to use.** The news value is in our reporting, not their footage.
- **Public-domain speech ≠ public-domain broadcast.** A network's graphics and watermark stay theirs —
  crop them out (a face-centred 9:16 crop of 16:9 usually does).
- **Fair use needs the footage to serve the story it shows.** Election-night crowds under a workweek story
  implies those people celebrated that law — weak basis and misleading. With `fair_use`, the renderer also
  requires an on-screen `credit`.
- Unclear basis → ask before downloading. Faster than a retraction.

## Part 1 — Cut to what the title promises

The source clip ran 72s; only 21s were about the stated subject. Rendering all of it makes the title a lie.
Read the transcript, find where the topic starts and ends, cut everything else.

- **Hook in the first 1–2 seconds** — a claim, a number, a contradiction, a stake. Never setup.
- **Body that pays off.**
- **Quick out.** Land on the punch and stop.
- **Length 20–40s.** Shorter and complete beats longer and rich.
- **Title card:** summarise, don't sell past the content. On political or contested material use a real
  quote from the clip. Three lines: small setup, subject large (accent), short quote.

## Part 2 — Restore the audio before transcribing

Source at −32.6 LUFS with crosstalk → ~40 phantom segments of the same two words. Restored to −15.8 LUFS →
clean transcript first pass. Quiet, noisy audio makes models invent things.

**Hallucination loop:** identical confidence across consecutive segments, short phrases cycling. If it
persists after restoring, check the raw file for genuinely duplicated material before blaming the model.

## Part 3 — Subtitles

- **One word at a time**, ~104px on a 1080-wide frame, black on a white box. No stacking, no collisions.
- **Timing a translation:** spread each line's words across its span weighted by character count.
  Within a line the boundaries are estimated, not measured — not lip-accurate.
- **Translate faithfully.** Render what was said, flag ambiguity for a human ("she gave me her Nobel
  Prize" vs. she dedicated it — that distinction is a story). Machine-assisted ≠ certified: on political or
  legal content, a native speaker reads it before posting.

## Part 4 — Framing and the title card

- **Crop** 9:16 centred on the detected face.
- **Watch the upscale.** 720p → 405px crop blown to 1080 = 2.67×, visibly soft. 1080p = 1.78×, fine.
  Ask for the best source available.
- **Measure, don't guess, where the card goes.** Measure the face band across the whole cut, then use
  the larger clear lane — above the head or below the chin. Never a fixed position.
- **Auto-fit type.** Text that doesn't wrap overflows instead of shrinking. Measure each line; shrink only
  the ones beyond ~88% of frame width.

## Part 5 — The two-phase workflow

```
prep    → download, restore audio, transcribe           automatic
  ↓
HUMAN   → pick the on-topic span, write the lines,      deliberately not automated
          choose the title, confirm the rights basis
  ↓
render  → cut, reframe, card, beats, subtitles, master  automatic
```

A script can't tell when the subject changed — that judgement is the difference between a reel and a
false headline.

## Part 6 — Limits to state out loud

- Sub-1080p sources are soft after the crop; no fixing it in post.
- Word timing inside a line is estimated.
- Translation is machine-assisted; get a native read.
- Transcripts hallucinate on bad audio — restore first, check for loops after.
- WhatsApp recompresses and caps media at 16 MB. Send the real file via a link.

---

## The template

```
reels/
  reel.py          fetch / restore / transcribe / check / render
  ci_job.py        URL → sources + contact sheets (+ render) on GitHub Actions
  specs/*.json     one story each (the HUMAN step)
  jobs/*.json      download/render requests for Actions
  fonts/           Liberation Sans (SIL OFL)
  out/             renders, frame sheets (git-ignored locally)
```

### Commands (local, needs ffmpeg + `pip install pillow opencv-python-headless`)

```bash
python3 reels/reel.py fetch URL --name clip_a      # yt-dlp, best ≥1080p; warns if sub-1080
python3 reels/reel.py restore in.mp4               # denoise + loudnorm to −16 LUFS
python3 reels/reel.py transcribe in.restored.wav   # faster-whisper + loop check
python3 reels/reel.py check specs/lula-gana.json   # validate rights, timings, files
python3 reels/reel.py render specs/lula-gana.json --frames
```

### Spec format

```json
{
  "rights": {"basis": "fair_use", "note": "who, what, which excerpt"},
  "layout": "overlay",
  "credit": "Imágenes: <canal>",
  "audio": "none",
  "clips": [{"src": "../sources/clip_a.mp4", "in": 12.0, "out": 17.0, "focus_x": 0.5}],
  "card":  {"kicker": "Brasil", "title": "Lula gana la *segunda vuelta*",
            "deck": "51,76% frente al 48,24%…", "start": 0, "end": 9},
  "beats": [{"text": "Perdió la primera vuelta. *Ganó la segunda.*", "start": 9, "end": 15}],
  "lines": [{"start": 0.4, "end": 2.9, "text": "translated line for single-word subs"}]
}
```

- `audio: "none"` renders silent — music gets added in Instagram. `"source"` keeps clip audio at −16 LUFS.
- `focus_x` (0–1) overrides the face-centred crop for a clip; `push_in` (default 0.04) sets the slow zoom.
- `editorial` layout takes an optional top-level `headline` that stays on screen throughout.
- Use `lines` (auto-distributed) or `words` (explicit timings) for single-word subtitles; omit for b-roll.

### What render does automatically

Face-centred 9:16 crop with upscale warning · face-band measurement → clear-lane card placement ·
per-line type fitting to 88% width · single-word subtitles · fade-in/out on cards and beats ·
1080×1920, h264 high, CRF 19, 30 fps, faststart · optional style-frame sheet (`--frames`).

---

## Rendering from a URL (GitHub Actions)

The Claude cloud environment can't reach YouTube, so downloading and rendering run on GitHub's servers.

1. Push `reels/jobs/<name>.json`:
   ```json
   {"sources": {"clip_a": "https://www.youtube.com/watch?v=..."}, "spec": "specs/lula-gana.json"}
   ```
   Omit `spec` to fetch and preview first.
2. The `reel` workflow downloads each source and commits back to the branch:
   `reels/out/<key>.info.json` (title, channel — use it for `credit`), `reels/out/<key>.sheet.jpg`
   (one timestamped frame every 2s, for picking shots), and with `spec` the rendered mp4 + frame sheet.
3. Re-running a job: change anything in the job file (e.g. bump `"run"`) and push.

### `YT_COOKIES` secret (required for YouTube)

YouTube answers datacenter IPs with *"Sign in to confirm you're not a bot"*. The runner needs a
signed-in session:

1. Sign in to YouTube in Chrome — **use a secondary Google account**.
2. Install **"Get cookies.txt LOCALLY"**, open youtube.com, export (Netscape format).
3. https://github.com/pietro-lgtm/rolltrack/settings/secrets/actions → **New repository secret** →
   name `YT_COOKIES`, paste the whole file.

Cookies expire; when the bot message comes back, re-export.

---

## Tooling security review (Oct 2026)

Cloned from official orgs, latest commits, reviewed before use.

| Repo | Verdict |
|---|---|
| `bradautomates/claude-video` (/watch) | Clean. Read every script. Network only to the transcription provider you choose (Groq/OpenAI/Gemini) with your own key; SessionStart hook is an advisory setup check. Note: reads API keys from a `.env` in the working directory. |
| `browser-use/video-use` | Clean. Only network call is ElevenLabs Scribe with your key. |
| `yt-dlp/yt-dlp` | Clean, standard hatchling build, no install hooks. |
| `remotion-dev/remotion`, `heygen-com/hyperframes` | Install-time scripts only configure git hooks. Too large for a line-by-line audit; provenance + lifecycle scripts checked. |
| `FFmpeg/FFmpeg` | Official source; the template uses the system/apt ffmpeg. |

Third-party ffmpeg binaries downloaded at CI time were deliberately **not** used.

---

## Status

- **Lula run-off reel** (`specs/lula-gana.json`, overlay layout): copy drafted, rights recorded as fair use,
  waiting on the `YT_COOKIES` secret so the runner can download
  `l9uXeg__BM8` and `asINtZH9vAI`. Then: pick shots from the contact sheets, fill `credit`, render.
- **40-hour workweek** (`specs/jornada-40h.json`, editorial layout): alternative draft; not recommended with
  this footage (see Part 0).
- Figures: TSE count at 99.77% (51.76% / 48.24%). Swap in the final official numbers before posting.

## Quick reference

| Target | |
|---|---|
| Length | 20–40s |
| Hook | First 1–2 seconds |
| Loudness | −16 LUFS (or silent for IG music) |
| Output | 1080×1920, h264 high, CRF 19, 30 fps |
| Subtitles | Single word, ~104px, black on white |
| Card | ~9–10s hold, measured clear lane |
| Type | Arial/Helvetica Bold, black on white, red accents |
| Source | 1080p or better |
