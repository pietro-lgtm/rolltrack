# Archival explainer animation — frame-by-frame recreation study

A study of the archival/collage explainer style (after the @hex_creatives reel
"why the dollar says In God We Trust"), rebuilt from scratch as a deterministic
frame renderer. Every frame of the 61-second, 9:16 piece is a pure function of
time, so any instant can be rendered, inspected and compared against the style
spec.

## What's here

- `renderer.html` — the whole animation. Open in a browser (`?t=12.5` renders
  that instant; arrow keys scrub). Canvas is 1080×1920.
- `dump.js` — Playwright harness: `node dump.js contact` (one frame per beat),
  `node dump.js times 1.5 3.2`, `node dump.js all 30 outdir` (every frame).
- `beatsheet.md` — the 20-beat script/image/move/caption table, with sources
  and fact checks.
- `assets/` — public-domain scans (1957 $1 silver certificate, US Capitol,
  1963 crowd) + EB Garamond. `cert_reverse_nomotto.jpg` is a digital
  recreation of the pre-1957 motto-less reverse, labeled as such.

To produce a video:

```
node dump.js all 30 allframes
ffmpeg -framerate 30 -i allframes/f_%05d.jpg -c:v libx264 -crf 18 -pix_fmt yuv420p study.mp4
```

## Techniques implemented (the "grammar" of the style)

| Technique | Where |
|---|---|
| Ken Burns push-in on every plate | all photo beats |
| Hero pull-out (cutout lifts, tilts to straight, bg blurs) | 56.6s |
| Word-by-word caption reveal (fade + blur), cards ≤ 4 words | throughout |
| Yellow-box key phrases, square corners, tight padding | motto, dates |
| Red box for the antagonist | "the Soviet Union" |
| Emphasis stacks (one big yellow serif word + small connectives) | why / 1954 / 1957 |
| Write-on typed text on the object | motto appearing on the bill |
| Animated highlighter swipe on a document | newspaper clipping |
| Hard sliding panel wipes + blur dissolves | scene transitions |
| Pale-fog composite backgrounds (20–40% layers) | abstract lines |
| Circle-masked place inset, tilted print inserts | "in Washington" |
| Glint sweep, soft flash, rim light | hook + finale |
| Film grain, lifted blacks, vignette, haze | global grade |

## Notes from the audit loop

Rendered a contact sheet per beat, inspected at full size, fixed, repeated:

1. Zoom math: a landscape bill cover-fitted into a 9:16 frame is already ~2.35×
   magnified — scene zooms must be specified relative to that, or you overshoot
   wildly.
2. Annotation marks must switch color with the plate: white rings vanish on
   pale paper; use dark "pencil" ink on paper, white on photos.
3. Captions drawn to the main canvas leak over scene buffers during panel
   wipes — every drawing helper has to take the scene's context.
4. A 5-word card violates the spec and reads off-center while words are still
   unrevealed; split at phrase breaks instead.
5. Gradients created before a canvas translate land in the wrong space —
   build glints in local coordinates.
