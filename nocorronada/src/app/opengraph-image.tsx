import { ImageResponse } from "next/og";
import { site } from "@/config/site";

export const alt =
  "NO CORRO NADA — otro club de correr, siempre gratis. San José, Costa Rica, domingos 8:00 AM.";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

const BLACK = "#0a0a0a";
const INK = "#e7e7e2";
const MUTED = "#8f8f88";
const VOLT = "#c6ff00";

/** Finish-line checker strip built from solid squares (no gradients → robust in Satori). */
function Checker() {
  const cell = 12;
  const count = Math.ceil(size.width / cell);
  return (
    <div style={{ display: "flex", width: "100%", height: cell }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            width: cell,
            height: cell,
            backgroundColor: i % 2 === 0 ? VOLT : BLACK,
          }}
        />
      ))}
    </div>
  );
}

/** Static OG / Twitter card for the whole site. Typography + finish-line motif only. */
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: BLACK,
          color: INK,
        }}
      >
        <Checker />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "0 72px",
            flex: 1,
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontSize: 34,
              letterSpacing: 8,
              color: MUTED,
              textTransform: "uppercase",
              marginBottom: 20,
            }}
          >
            No Pasa Nada · Run Club
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 150,
              fontWeight: 900,
              lineHeight: 0.9,
              letterSpacing: -6,
              color: VOLT,
              textTransform: "uppercase",
            }}
          >
            NO CORRO NADA
          </div>
          <div
            style={{
              fontSize: 40,
              color: INK,
              marginTop: 28,
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            {site.tagline}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 72px 44px",
            fontSize: 27,
            letterSpacing: 4,
            color: MUTED,
            textTransform: "uppercase",
          }}
        >
          <div style={{ display: "flex" }}>San José, Costa Rica</div>
          <div style={{ display: "flex", color: VOLT }}>Domingos 8:00 AM</div>
        </div>

        <Checker />
      </div>
    ),
    {
      ...size,
    },
  );
}
