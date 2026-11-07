# Metamorphosis loop — frame-by-frame recreation study

Source: instagram.com/reel/DbvuGW6Mjtv — a ~30 s square cut-paper metamorphosis
loop. **Private study only.** The horse run-cycle sprites, head profile and
continent shapes in `sprites/` are extracted/traced from the source frames for
learning purposes — do not publish or reuse them outside this study.

## What the analysis found

- The video is a **356-frame (14.83 s, 24 fps) loop played exactly twice**
  (frame n vs n+356: IoU 0.99).
- One white **Muybridge-style run cycle (~32 drawings, ~1.3 s)** is the constant;
  everything around it transforms. The gallop has a ~50 px vertical bob that
  must be preserved per-pose, not averaged away.
- Palette: cobalt `rgb(74,106,247)`, flat white, near-black, ground green
  `rgb(44,104,48)`, plus a small sun dot stepping through
  red → amber → yellow → orange → pink.
- Texture: mottled paper fills that "boil" every 1–2 frames; sparse white
  sparkle on the black field; rough mask edges do the boil for free.

## The loop's scene grammar (frames @24 fps)

| Frames | Scene | Transition device |
|---|---|---|
| 0–36 | horse inside blue head profile (thought) | hold |
| 36–49 | head slides off right | subject stays, container leaves |
| 49–83 | dashed circle flies in, locks around horse, zoom until it passes the frame | containment → zoom-past |
| 84 | **hard cut** to far view | scale shock |
| 84–135 | node grows, 6 dashed spokes, satellite circles each with mini horse | one becomes many |
| 135–149 | zoom back into the node | the node becomes a world |
| 148–176 | landscape fades up inside it (sky, ground, color-cycling sun) | fade-in-place |
| 176–196 | ground drops out fast, horse exits left, sky fills frame | camera climbs |
| 196–216 | sky shrinks to a disc on black | the sky becomes a planet |
| 216–244 | continents fade in, slow drift | reveal |
| 244–272 | giant horse crosses in front: **black over the globe, invisible on black, revealed white once clear** (counterchange) while the globe pans off right | figure/ground flip |
| 272–312 | glowing white horse, light-burst streaks, settles | energy → calm |
| 296–312 | head slides back in from the right, glow dies to flat white | re-containment, loop closes |

## What's here

- `renderer2.html` — the whole loop as a deterministic canvas renderer
  (720×720; `?t=` seeks; arrows scrub by frame).
- `dump2.js` — Playwright harness (`frames <n…>` for A/B against source frame
  numbers, `all` for the full 712-frame dump).
- `sprites/` — 32 extracted run-cycle poses + per-pose offsets
  (`horse_cycle.js`), head profile mask, continents mask.

Video: `node dump2.js all && ffmpeg -framerate 24 -i mineall/f_%04d.jpg -c:v libx264 -crf 18 -pix_fmt yuv420p out.mp4`

## What the A/B iterations caught (4 passes)

1. Run-cycle **phase** must be anchored to the frames the sprites came from, or
   every pose comparison fails even when the cycle is right.
2. The node is born small and grows; spokes grow together, satellites pop
   staggered — staggering the spokes instead reads wrong immediately.
3. The counterchange flip is temporal, not positional: the horse stays
   black-on-black until it clears the globe, then the whole figure is revealed
   white — revealing it early reads as a ghost.
4. Nested canvas draws must multiply the caller's `globalAlpha`, not overwrite
   it (the glow pass was blasting through fade-ins).
5. Paper blotches: many small faint blobs read as risograph texture; few large
   ones read as stains. Deep cobalt sits darker than intuition suggests.
6. The source's horizon exits in ~7 frames while the horse lingers 6 more —
   holding the subject while the world leaves is most of what makes the morphs
   feel intentional.
