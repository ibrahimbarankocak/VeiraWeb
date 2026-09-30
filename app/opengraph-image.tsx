import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #050907 0%, #0d2a1e 55%, #104a37 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 36 }}>
          <div
            style={{
              display: "flex",
              width: 84,
              height: 84,
              borderRadius: 20,
              background: "#286848",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="44" height="44" viewBox="0 0 24 24" fill="#d1f7e9">
              <path d="M13.5 2 4 13.5h6.2L9 22l10-12.2h-6.4L13.5 2Z" />
            </svg>
          </div>
          <div style={{ display: "flex", color: "#ffffff", fontSize: 64, fontWeight: 800 }}>veira</div>
        </div>
        <div style={{ display: "flex", color: "#3ddc97", fontSize: 44, fontWeight: 800, letterSpacing: -1 }}>
          EVERY RACE. EVERY SHOE. ONE LEAGUE.
        </div>
      </div>
    ),
    { ...size }
  );
}
