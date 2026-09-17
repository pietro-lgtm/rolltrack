/** Renders an onboarding step's video: YouTube/Vimeo embed, mp4/webm file, or a placeholder. */

function toEmbedUrl(url: string): string | null {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  if (url.includes("youtube.com/embed/")) return url;

  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  if (url.includes("player.vimeo.com")) return url;

  // Accepts any Drive share link (file/d/<id>/view, /preview, or open?id=<id>)
  // and normalizes to Drive's embeddable player. The file must be shared as
  // "Anyone with the link" — private/restricted files render an access error.
  const drive = url.match(/drive\.google\.com\/(?:file\/d\/|open\?id=)([\w-]{10,})/);
  if (drive) return `https://drive.google.com/file/d/${drive[1]}/preview`;
  if (url.includes("drive.google.com/file/") && url.includes("/preview")) return url;

  return null;
}

function isVideoFile(url: string): boolean {
  return /\.(mp4|webm)($|\?)/i.test(url);
}

export function StepVideo({ url }: { url: string | null }) {
  if (!url) {
    return (
      <div className="flex aspect-video items-center justify-center border-2 border-ink bg-smoke">
        <span className="label-mono text-mid">video próximamente</span>
      </div>
    );
  }

  if (isVideoFile(url)) {
    return (
      <video
        controls
        className="aspect-video w-full border-2 border-ink bg-ink"
        src={url}
      />
    );
  }

  const embed = toEmbedUrl(url);
  if (embed) {
    return (
      <div className="aspect-video border-2 border-ink">
        <iframe
          src={embed}
          className="h-full w-full"
          title="Video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div className="flex aspect-video items-center justify-center border-2 border-ink bg-smoke">
      <span className="label-mono text-mid">video próximamente</span>
    </div>
  );
}
