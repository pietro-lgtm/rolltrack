import { getContent } from "@/lib/content";

function embedUrl(raw: string): { kind: "iframe" | "mp4"; src: string } | null {
  if (!raw) return null;
  const yt =
    raw.match(/youtu\.be\/([\w-]{6,})/) ||
    raw.match(/youtube\.com\/(?:watch\?v=|shorts\/|embed\/)([\w-]{6,})/);
  if (yt) return { kind: "iframe", src: `https://www.youtube-nocookie.com/embed/${yt[1]}` };
  const vimeo = raw.match(/vimeo\.com\/(\d{6,})/);
  if (vimeo) return { kind: "iframe", src: `https://player.vimeo.com/video/${vimeo[1]}` };
  if (raw.endsWith(".mp4")) return { kind: "mp4", src: raw };
  return null;
}

/**
 * Featured film player. Reads content (code default + /admin override) —
 * while videoUrl is empty it renders the "PRONTO" teaser.
 */
export async function FilmBlock() {
  const { film } = await getContent();
  const video = embedUrl(film.videoUrl);

  return (
    <div className="border hairline bg-asphalt">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b hairline px-6 py-4 sm:px-8">
        <p className="label-mono text-muted">{film.subtitle}</p>
        <p className="label-mono text-volt">CINE NCN</p>
      </div>

      {video ? (
        <div className="relative aspect-video w-full bg-black">
          {video.kind === "iframe" ? (
            <iframe
              src={video.src}
              title={film.title}
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video
              src={video.src}
              controls
              playsInline
              className="absolute inset-0 h-full w-full"
            />
          )}
        </div>
      ) : (
        <div className="flex aspect-video w-full flex-col items-center justify-center gap-4 bg-black px-6 text-center">
          <p className="display text-4xl sm:text-6xl">{film.title}</p>
          <p className="label-mono text-muted">Pronto · aquí mismo</p>
        </div>
      )}
    </div>
  );
}
