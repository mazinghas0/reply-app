import { ImageResponse } from "next/og";

export const alt = "리플라이 — 상사 카톡에 10분째 멈춰 있다면, AI가 대신 고민해 드릴게요";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* 배경 장식 원 */}
        <div
          style={{
            position: "absolute",
            top: -80,
            right: -80,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "rgba(45, 212, 191, 0.08)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -120,
            left: -60,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "rgba(45, 212, 191, 0.05)",
            display: "flex",
          }}
        />

        {/* 말풍선 아이콘 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 88,
            height: 88,
            borderRadius: 24,
            background: "linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)",
            marginBottom: 32,
            fontSize: 44,
          }}
        >
          💬
        </div>

        {/* 서비스명 */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: "#f8fafc",
            letterSpacing: "-2px",
            marginBottom: 16,
            display: "flex",
          }}
        >
          리플라이
        </div>

        {/* 서브 카피 */}
        <div
          style={{
            fontSize: 32,
            color: "#94a3b8",
            textAlign: "center",
            maxWidth: 800,
            lineHeight: 1.5,
            display: "flex",
          }}
        >
          상사 카톡에 10분째 멈춰 있다면, AI가 대신 고민해 드릴게요
        </div>

        {/* 기능 태그 */}
        <div
          style={{
            display: "flex",
            gap: 16,
            marginTop: 40,
          }}
        >
          {["답장 만들기", "답장 검토", "말투 다듬기"].map((label) => (
            <div
              key={label}
              style={{
                padding: "10px 24px",
                borderRadius: 999,
                background: "rgba(45, 212, 191, 0.15)",
                color: "#2dd4bf",
                fontSize: 22,
                fontWeight: 600,
                display: "flex",
              }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* 하단 URL */}
        <div
          style={{
            position: "absolute",
            bottom: 32,
            fontSize: 20,
            color: "#475569",
            display: "flex",
          }}
        >
          aireply.co.kr
        </div>
      </div>
    ),
    { ...size }
  );
}
