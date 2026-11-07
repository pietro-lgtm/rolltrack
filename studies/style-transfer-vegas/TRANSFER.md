# "Every Single Day" — style transfer, not copy

Applies the metamorphosis loop's **abstract ideas** to a text about Las Vegas —
consumption as novelty in a society of daily consumption; sin as participation,
not defiance. Deliberately none of the source's surface: different palette
(neon amber / ink / paper vs cobalt cut-paper), different geometry (parametric
line-art vs sprites), different motion vocabulary (printing, stamping, sliding,
hard cuts vs morph-zooms), different subject (a taking hand vs a running horse).

## The borrowed ideas and their new carriers

| Abstract idea (from the loop) | Carrier here |
|---|---|
| One constant subject through transforming containers | a hand that takes, on a 36-frame cycle, never stopping |
| The subject holds while the world leaves | the neon frame, sign and audience exit; the taking continues |
| Examination/annotation of the subject | a receipt prints a line per take — transgression gets itemized |
| Scale as argument + one-becomes-many | hard cut: the act is one cell in an endless identical grid ("EVERY SINGLE DAY") |
| Zoom into a node = a world | one cell becomes a room: window, table, flipping calendar |
| Counterchange (meaning flips with the ground) | glowing gold hand on black = spectacle/sin; the same gesture ink-black on a white form = administration — each take now lands an approval stamp |
| Containment → … → re-containment, seamless loop | the marquee slides back, the sign re-ignites, the loop closes |
| Exact repetition as thesis | the 15 s loop plays twice, identically: the second viewing is the desensitization the text describes |

The counterchange carries the essay's final turn: the identical gesture reads
as outlaw against one ground and as bureaucrat against the other — "no longer
a courageous act of defiance against the system, but actively participating
in it."

## Files
- `renderer3.html` — deterministic 1080×1080 canvas renderer, 24 fps,
  360-frame loop ×2 (`?t=` seeks, arrows scrub)
- `dump3.js` — Playwright harness (`frames <n…>`, `all`)

Video: `node dump3.js all && ffmpeg -framerate 24 -i frames/f_%04d.jpg -c:v libx264 -crf 18 -pix_fmt yuv420p out.mp4`
