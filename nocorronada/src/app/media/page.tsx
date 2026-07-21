import type { Metadata } from "next";
import Image from "next/image";
import { media, type MediaItem } from "@/data/media";
import { SectionLabel, GhostLink, VoltLink } from "@/components/ui";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Media — fotos y videos",
  description:
    "El archivo de NO CORRO NADA: fotos y videos de las corridas del club de running en San José, Costa Rica. Lo que pasa en el club, documentado.",
};

/** Local mirror of FilmBlock's URL parsing — do NOT import FilmBlock. */
function embedUrl(raw: string): { kind: "iframe" | "mp4"; src: string } | null {
  if (!raw) return null;
  const yt =
    raw.match(/youtu\.be\/([\w-]{6,})/) ||
    raw.match(/youtube\.com\/(?:watch\?v=|shorts\/|embed\/)([\w-]{6,})/);
  if (yt)
    return { kind: "iframe", src: `https://www.youtube-nocookie.com/embed/${yt[1]}` };
  const vimeo = raw.match(/vimeo\.com\/(\d{6,})/);
  if (vimeo) return { kind: "iframe", src: `https://player.vimeo.com/video/${vimeo[1]}` };
  if (raw.endsWith(".mp4")) return { kind: "mp4", src: raw };
  return null;
}

function VideoCell({ item }: { item: MediaItem }) {
  const video = embedUrl(item.src);
  return (
    <figure className="border hairline bg-asphalt">
      <div className="relative aspect-video w-full bg-black">
        {video?.kind === "iframe" ? (
          <iframe
            src={video.src}
            title={item.caption ?? "Video NCN"}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : video?.kind === "mp4" ? (
          <video
            src={video.src}
            controls
            playsInline
            className="absolute inset-0 h-full w-full"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="label-mono text-muted">Video no disponible</span>
          </div>
        )}
      </div>
      {(item.caption || item.tag) && (
        <figcaption className="flex flex-wrap items-center justify-between gap-3 border-t hairline px-4 py-3">
          {item.caption && (
            <span className="label-mono text-ink">{item.caption}</span>
          )}
          {item.tag && <span className="label-mono text-muted">{item.tag}</span>}
        </figcaption>
      )}
    </figure>
  );
}

function ImageCell({ item }: { item: MediaItem }) {
  return (
    <figure className="border hairline bg-asphalt">
      <div className="relative aspect-[4/3] w-full bg-black">
        <Image
          src={item.src}
          alt={item.caption ?? "Foto NCN"}
          fill
          sizes="(min-width: 640px) 33vw, 50vw"
          className="object-cover"
        />
        {item.tag && (
          <span className="label-mono absolute left-0 top-0 bg-black/85 px-3 py-2 text-volt">
            {item.tag}
          </span>
        )}
      </div>
      {item.caption && (
        <figcaption className="label-mono border-t hairline px-3 py-3 text-muted">
          {item.caption}
        </figcaption>
      )}
    </figure>
  );
}

export default function MediaPage() {
  const videos = media.filter((m) => m.type === "video");
  const images = media.filter((m) => m.type === "image");
  const isEmpty = media.length === 0;

  return (
    <>
      {/* Header */}
      <section className="border-b hairline">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <SectionLabel>El archivo</SectionLabel>
          <h1 className="display mt-4 text-6xl sm:text-8xl">Media</h1>
          <p className="mt-6 max-w-xl text-muted">
            Fotos y videos de las corridas. Lo que pasa en el club, documentado.
          </p>
        </div>
      </section>

      {isEmpty ? (
        /* Empty state — this is what ships until media[] is filled. */
        <section>
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
            <div className="border hairline bg-asphalt p-8 text-center sm:p-16">
              <p className="display text-4xl leading-[0.95] sm:text-6xl">
                El archivo abre pronto
              </p>
              <p className="label-mono mt-6 text-muted">
                Mientras tanto: todo está en Instagram.
              </p>
              <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
                <GhostLink href={site.social.instagram} external>
                  Ver en Instagram ↗
                </GhostLink>
                <VoltLink href="/unite">Unite al club</VoltLink>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <>
          {/* Videos — full/half width rows above the photo grid */}
          {videos.length > 0 && (
            <section className="border-b hairline">
              <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
                <SectionLabel>Videos</SectionLabel>
                <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {videos.map((item, i) => (
                    <VideoCell key={`${item.src}-${i}`} item={item} />
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Photos — responsive grid */}
          {images.length > 0 && (
            <section>
              <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
                <SectionLabel>Fotos</SectionLabel>
                <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {images.map((item, i) => (
                    <ImageCell key={`${item.src}-${i}`} item={item} />
                  ))}
                </div>
              </div>
            </section>
          )}
        </>
      )}
    </>
  );
}
