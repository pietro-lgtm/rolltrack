/** Turn a stored video URL into something we can render: an mp4/webm/mov file
 * or a YouTube/Vimeo embed iframe src. */
export type EmbedSpec =
  | { kind: "video"; src: string }
  | { kind: "iframe"; src: string };

export function resolveEmbed(url: string): EmbedSpec {
  const youtube = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/,
  );
  if (youtube) {
    return { kind: "iframe", src: `https://www.youtube.com/embed/${youtube[1]}` };
  }

  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) {
    return { kind: "iframe", src: `https://player.vimeo.com/video/${vimeo[1]}` };
  }

  if (/\.(mp4|webm|mov)(\?.*)?$/i.test(url)) {
    return { kind: "video", src: url };
  }

  // Fallback: assume it's already an embeddable URL.
  return { kind: "iframe", src: url };
}
