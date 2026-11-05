#!/usr/bin/env bash
# Prepara un video para la web: versión horizontal (16:9) y vertical (9:16) + póster de cada una.
#
#   scripts/encode-video.sh <nombre> <horizontal.mp4> [vertical.mp4] [--audio]
#
# - Si no hay versión vertical, se recorta del centro de la horizontal.
# - Sin --audio se quita el sonido (videos de fondo). Con --audio se conserva (videos con botón de sonido).
# - Salida en public/media/: <nombre>-16x9.mp4, <nombre>-9x16.mp4, <nombre>-16x9.jpg, <nombre>-9x16.jpg
set -euo pipefail

name="${1:?nombre}"; land_src="${2:?video horizontal}"; port_src="${3:-}"; audio="${4:-}"
if [[ "$port_src" == "--audio" ]]; then audio="--audio"; port_src=""; fi
out="$(cd "$(dirname "$0")/.." && pwd)/public/media"
mkdir -p "$out"

if [[ "$audio" == "--audio" ]]; then a=(-c:a aac -b:a 128k -ac 2); else a=(-an); fi
v=(-c:v libx264 -preset slow -crf 26 -profile:v high -pix_fmt yuv420p -movflags +faststart -r 30)

# Horizontal 1920×1080 (recorta al centro si la proporción no es 16:9)
ffmpeg -y -loglevel error -i "$land_src" \
  -vf "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,setsar=1" \
  "${v[@]}" -maxrate 4M -bufsize 8M "${a[@]}" "$out/$name-16x9.mp4"

# Vertical 1080×1920
src="${port_src:-$land_src}"
ffmpeg -y -loglevel error -i "$src" \
  -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1" \
  "${v[@]}" -maxrate 3M -bufsize 6M "${a[@]}" "$out/$name-9x16.mp4"

# Pósteres (primer segundo)
for f in 16x9 9x16; do
  ffmpeg -y -loglevel error -ss 1 -i "$out/$name-$f.mp4" -frames:v 1 -q:v 4 "$out/$name-$f.jpg"
done

ls -lh "$out/$name"-*
