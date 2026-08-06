/** Turn a stored video URL into something we can render: an mp4/webm/mov file,
 * a YouTube/Vimeo/Drive embed iframe src, or (for platforms that block iframe
 * embedding — Instagram, LinkedIn, TikTok, X/Facebook) an external link to
 * open instead of trying and failing to embed it inline. */
export type EmbedSpec =
  | { kind: "video"; src: string }
  | { kind: "iframe"; src: string }
  | { kind: "external"; src: string };

export function resolveEmbed(url: string): EmbedSpec {
  const youtube = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/,
  );
  if (youtube) {
    return { kind: "iframe", src: `https://www.youtube.com/embed/${youtube[1]}` };
  }

  // Matches any vimeo.com URL shape (bare ID, /video/ID, /manage/videos/ID,
  // /channels/x/ID, ...) by pulling the trailing numeric ID out of the path —
  // Vimeo IDs are always 6+ digits. The /manage/... studio URL people copy
  // from their own dashboard isn't public, but the same ID always resolves
  // on the public player regardless of which URL shape it was copied from.
  const vimeo = url.match(/vimeo\.com\/(?:[^?]*\/)?(\d{6,})/);
  if (vimeo) {
    return { kind: "iframe", src: `https://player.vimeo.com/video/${vimeo[1]}` };
  }

  // Accepts any Drive share link (file/d/<id>/view, /preview, or open?id=<id>)
  // and normalizes to Drive's embeddable player. The file must be shared as
  // "Anyone with the link" — private/restricted files render an access error.
  const drive = url.match(/drive\.google\.com\/(?:file\/d\/|open\?id=)([\w-]{10,})/);
  if (drive) {
    return { kind: "iframe", src: `https://drive.google.com/file/d/${drive[1]}/preview` };
  }

  if (/\.(mp4|webm|mov)(\?.*)?$/i.test(url)) {
    return { kind: "video", src: url };
  }

  // Everything else (Instagram, LinkedIn, TikTok, X, Facebook, ...) sets
  // X-Frame-Options/CSP blocking iframe embedding — attempting it renders
  // that platform's own broken/login page inside the frame, not the post.
  // Link out instead of pretending it's embeddable.
  return { kind: "external", src: url };
}
